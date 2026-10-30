// Guarda los fallos y bloqueos de inicio de sesión en localStorage (CU-R8), para que F5 no los quite.
// Si localStorage no está disponible o tiene datos corruptos, empieza con estado vacío;
// si no se puede escribir, sigue en memoria mientras la página esté abierta.
// La sesión NO se guarda aquí: vive en memoria dentro de ServicioSesion.
(function (exportar) {
  'use strict';

  const CLAVE = 'huellitas:seguridad:v1';

  function almacenamientoDelNavegador() {
    try {
      return globalThis.localStorage || null;
    } catch (e) {
      return null; // el acceso mismo puede lanzar error (datos del sitio bloqueados)
    }
  }

  class AlmacenSeguridadLocal {
    // `almacenamiento` se puede inyectar (con getItem/setItem) para probar sin navegador.
    constructor({ almacenamiento = almacenamientoDelNavegador() } = {}) {
      this.almacenamiento = almacenamiento;
      this.memoria = {};
      this.soloMemoria = almacenamiento === null;
    }

    leer() {
      if (this.soloMemoria) {
        return JSON.parse(JSON.stringify(this.memoria));
      }
      let texto;
      try {
        texto = this.almacenamiento.getItem(CLAVE);
      } catch (e) {
        this.soloMemoria = true;
        return JSON.parse(JSON.stringify(this.memoria));
      }
      if (texto === null || texto === undefined) {
        return {};
      }
      try {
        const estado = JSON.parse(texto);
        const esObjeto = estado !== null && typeof estado === 'object' && !Array.isArray(estado);
        return esObjeto ? estado : {};
      } catch (e) {
        return {}; // datos corruptos: se empieza de cero
      }
    }

    guardar(estado) {
      this.memoria = JSON.parse(JSON.stringify(estado));
      if (this.soloMemoria) {
        return;
      }
      try {
        this.almacenamiento.setItem(CLAVE, JSON.stringify(estado));
      } catch (e) {
        this.soloMemoria = true; // cuota llena o escritura bloqueada
      }
    }
  }

  AlmacenSeguridadLocal.CLAVE = CLAVE;

  exportar('AlmacenSeguridadLocal', AlmacenSeguridadLocal);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
