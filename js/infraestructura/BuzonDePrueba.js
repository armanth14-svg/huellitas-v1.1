// Notificador de prueba (CU-R8): como no hay servidor, no se envían correos.
// Guarda los avisos de bloqueo en memoria para mostrarlos en el panel "Buzón de prueba".
// Cumple el contrato del notificador: enviarAvisoBloqueo({ para, asunto, fechaHora }).
(function (exportar) {
  'use strict';

  class BuzonDePrueba {
    constructor() {
      this.avisos = [];
    }

    enviarAvisoBloqueo({ para, asunto, fechaHora }) {
      this.avisos.push({ para, asunto, fechaHora });
    }

    listar() {
      return this.avisos.map((aviso) => ({ ...aviso }));
    }
  }

  exportar('BuzonDePrueba', BuzonDePrueba);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
