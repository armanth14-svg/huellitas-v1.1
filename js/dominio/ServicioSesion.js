// Inicio de sesión de empleados con correo y contraseña (CU-R2, CU-R7).
// Depende de abstracciones que recibe por el constructor (lista de empleados y función de hash),
// no del navegador ni de Web Crypto: por eso se puede probar en Node.
// La sesión vive solo en memoria; no se persiste.
(function (exportar) {
  'use strict';

  const MENSAJES = {
    VACIOS: 'Ingrese correo y contraseña.',
    FORMATO: 'El correo no tiene un formato válido.',
    INCORRECTOS: 'Correo o contraseña incorrectos.',
  };

  // Texto antes de la arroba, una sola arroba, dominio con al menos un punto y texto a ambos lados de cada punto.
  const FORMATO_CORREO = /^[^@]+@[^@.]+(\.[^@.]+)+$/;

  function esTextoVacio(valor) {
    return typeof valor !== 'string' || valor.length === 0;
  }

  class ServicioSesion {
    constructor({ empleados, hash }) {
      this.empleados = empleados;
      this.hash = hash;
      this.empleado = null;
    }

    async iniciarSesion(correo, contrasena) {
      const correoNormalizado = typeof correo === 'string' ? correo.trim().toLowerCase() : '';
      if (correoNormalizado.length === 0 || esTextoVacio(contrasena)) {
        return { ok: false, mensaje: MENSAJES.VACIOS };
      }
      if (!FORMATO_CORREO.test(correoNormalizado)) {
        return { ok: false, mensaje: MENSAJES.FORMATO };
      }

      const registrado = this.empleados.find((e) => e.correo === correoNormalizado);
      const hashIntento = registrado ? await this.hash(registrado.sal + contrasena) : null;
      if (!registrado || hashIntento !== registrado.hash) {
        return { ok: false, mensaje: MENSAJES.INCORRECTOS };
      }

      // Se devuelve el empleado de la lista (no lo escrito) y sin sal ni hash.
      this.empleado = { correo: registrado.correo, nombre: registrado.nombre };
      return { ok: true, empleado: { ...this.empleado } };
    }

    cerrarSesion() {
      this.empleado = null;
    }

    empleadoActual() {
      return this.empleado ? { ...this.empleado } : null;
    }

    haySesion() {
      return this.empleadoActual() !== null;
    }
  }

  exportar('ServicioSesion', ServicioSesion);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
