// Caso de uso de la sesión: iniciar sesión, cerrar sesión y saber quién está conectado (SPEC 01).
// Recibe la lista de empleados por el constructor (como las reglas reciben las especies).
// Todo vive en memoria: al recargar la página se reinician la sesión, los contadores y los bloqueos.
(function (exportar) {
  'use strict';

  const MENSAJES = {
    vacio: 'Ingrese usuario y contraseña.',
    incorrecto: 'Usuario o contraseña incorrectos.',
    bloqueado: 'Usuario bloqueado por demasiados intentos fallidos.',
  };

  class ServicioSesion {
    constructor({ empleados, maxIntentos = 3 }) {
      this.empleados = empleados;
      this.maxIntentos = maxIntentos;
      this.actual = null;
      this.fallos = {};
    }

    iniciarSesion(usuario, contrasena) {
      const clave = String(usuario).trim().toLowerCase();
      if (clave === '' || contrasena === '') {
        return { ok: false, mensaje: MENSAJES.vacio };
      }
      if (this.estaBloqueado(clave)) {
        return { ok: false, mensaje: MENSAJES.bloqueado };
      }

      const empleado = this.empleados.find((e) => e.usuario === clave);
      if (!empleado || empleado.contrasena !== contrasena) {
        this.fallos[clave] = (this.fallos[clave] || 0) + 1;
        return {
          ok: false,
          mensaje: this.estaBloqueado(clave) ? MENSAJES.bloqueado : MENSAJES.incorrecto,
        };
      }

      this.fallos[clave] = 0;
      this.actual = { usuario: empleado.usuario, nombre: empleado.nombre };
      return { ok: true, empleado: this.empleadoActual() };
    }

    cerrarSesion() {
      this.actual = null;
    }

    empleadoActual() {
      return this.actual ? { ...this.actual } : null;
    }

    estaBloqueado(clave) {
      return (this.fallos[clave] || 0) >= this.maxIntentos;
    }
  }

  exportar('ServicioSesion', ServicioSesion);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
