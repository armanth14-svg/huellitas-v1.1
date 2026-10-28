// R2 — Especie. Recibe la configuración de especies: no sabe cuáles existen hasta que se la pasan.
(function (exportar) {
  'use strict';

  class ReglaEspecie {
    constructor(especies) {
      this.especies = especies;
    }

    validar(datos) {
      if (!datos.especie) {
        return [{ campo: 'especie', mensaje: 'La especie es obligatoria.' }];
      }
      if (!Object.prototype.hasOwnProperty.call(this.especies, datos.especie)) {
        return [{ campo: 'especie', mensaje: 'La guardería no recibe esa especie.' }];
      }
      return [];
    }
  }

  exportar('ReglaEspecie', ReglaEspecie);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
