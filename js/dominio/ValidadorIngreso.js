// Junta todas las reglas. No conoce ninguna en particular: las recibe en el constructor.
// Para agregar una regla nueva no se modifica esta clase; se le pasa una regla más (abierto/cerrado).
(function (exportar) {
  'use strict';

  class ValidadorIngreso {
    constructor(reglas) {
      this.reglas = reglas;
    }

    validar(datos) {
      return this.reglas.flatMap((regla) => regla.validar(datos));
    }
  }

  exportar('ValidadorIngreso', ValidadorIngreso);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
