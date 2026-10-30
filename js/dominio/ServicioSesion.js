// Inicio de sesión de empleados con correo y contraseña (CU-R2, CU-R7, CU-R8, CU-R9).
// Depende de abstracciones que recibe por el constructor (empleados, hash, reloj, almacén y notificador),
// no del navegador ni de Web Crypto: por eso se puede probar en Node con reloj falso.
// La sesión vive solo en memoria; los fallos y bloqueos sí se guardan en el almacén.
(function (exportar) {
  'use strict';

  const MENSAJES = {
    VACIOS: 'Ingrese correo y contraseña.',
    FORMATO: 'El correo no tiene un formato válido.',
    INCORRECTOS: 'Correo o contraseña incorrectos.',
    BLOQUEADA: 'Cuenta bloqueada por demasiados intentos fallidos.',
  };

  // Texto antes de la arroba, una sola arroba, dominio con al menos un punto y texto a ambos lados de cada punto.
  const FORMATO_CORREO = /^[^@]+@[^@.]+(\.[^@.]+)+$/;

  function esTextoVacio(valor) {
    return typeof valor !== 'string' || valor.length === 0;
  }

  class ServicioSesion {
    constructor({ empleados, hash, reloj, almacen, notificador, maxIntentos, bloqueoMs, inactividadMs }) {
      this.empleados = empleados;
      this.hash = hash;
      this.reloj = reloj;
      this.almacen = almacen;
      this.notificador = notificador;
      this.maxIntentos = maxIntentos;
      this.bloqueoMs = bloqueoMs;
      this.inactividadMs = inactividadMs;
      this.empleado = null;
      this.ultimaActividad = null;
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

      // Desde aquí todo es síncrono: el estado se lee y se guarda sin que otro intento se cuele en medio.
      const ahora = this.reloj.ahora();
      const estado = this.leerEstado();
      const cuenta = estado[correoNormalizado] || { fallos: 0, bloqueadoHasta: null };

      if (cuenta.bloqueadoHasta !== null) {
        if (ahora < cuenta.bloqueadoHasta) {
          return { ok: false, mensaje: MENSAJES.BLOQUEADA };
        }
        // Bloqueo vencido: se borra y el contador vuelve a 0.
        delete estado[correoNormalizado];
        cuenta.fallos = 0;
        cuenta.bloqueadoHasta = null;
      }

      if (!registrado || hashIntento !== registrado.hash) {
        cuenta.fallos += 1;
        estado[correoNormalizado] = cuenta;
        if (cuenta.fallos < this.maxIntentos) {
          this.almacen.guardar(estado);
          return { ok: false, mensaje: MENSAJES.INCORRECTOS };
        }
        cuenta.bloqueadoHasta = ahora + this.bloqueoMs;
        this.almacen.guardar(estado);
        // El aviso va una sola vez (en el último fallo) y solo si el correo es de un empleado.
        if (registrado) {
          this.notificador.enviarAvisoBloqueo({
            para: registrado.correo,
            asunto: 'Aviso de bloqueo de cuenta',
            fechaHora: new Date(ahora).toISOString(),
          });
        }
        return { ok: false, mensaje: MENSAJES.BLOQUEADA };
      }

      delete estado[correoNormalizado];
      this.almacen.guardar(estado);

      // Se devuelve el empleado de la lista (no lo escrito) y sin sal ni hash.
      this.empleado = { correo: registrado.correo, nombre: registrado.nombre };
      this.ultimaActividad = ahora;
      return { ok: true, empleado: { ...this.empleado } };
    }

    leerEstado() {
      const estado = this.almacen.leer();
      return estado && typeof estado === 'object' ? estado : {};
    }

    cerrarSesion() {
      this.empleado = null;
      this.ultimaActividad = null;
    }

    // Si la sesión lleva inactividadMs o más sin actividad, se cierra aquí mismo (CU-R9).
    empleadoActual() {
      if (this.empleado && this.reloj.ahora() - this.ultimaActividad >= this.inactividadMs) {
        this.cerrarSesion();
      }
      return this.empleado ? { ...this.empleado } : null;
    }

    // Un clic o una tecla renuevan la sesión; una sesión ya vencida no revive.
    registrarActividad() {
      if (this.empleadoActual() !== null) {
        this.ultimaActividad = this.reloj.ahora();
      }
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
