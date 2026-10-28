// R4 — Peso en kilogramos, con un máximo que depende de la especie.
(function (exportar) {
  'use strict';

  class ReglaPeso {
    constructor(especies) {
      this.especies = especies;
    }

    validar(datos) {
      const texto = String(datos.pesoKg ?? '').trim();
      if (texto === '') {
        return [{ campo: 'pesoKg', mensaje: 'El peso es obligatorio.' }];
      }
      const peso = Number(texto);
      if (Number.isNaN(peso) || peso <= 0) {
        return [{ campo: 'pesoKg', mensaje: 'El peso debe ser un número mayor que 0.' }];
      }
      const especie = this.especies[datos.especie];
      if (especie && peso > especie.pesoMaximo) {
        return [{ campo: 'pesoKg', mensaje: `El peso máximo para ${datos.especie} es ${especie.pesoMaximo} kg.` }];
      }
      return [];
    }
  }

  exportar('ReglaPeso', ReglaPeso);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
