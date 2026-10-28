// R7 — Tarifa por día. Solo calcula; no valida ni guarda nada (responsabilidad única).
(function (exportar) {
  'use strict';

  const PESO_RECARGO_KG = 30;
  const RECARGO = 0.20;
  const DESCUENTO_ESTUDIANTE = 0.10;

  class CalculadoraTarifa {
    constructor(especies) {
      this.especies = especies;
    }

    calcular(datos) {
      const base = this.especies[datos.especie].tarifaBase;
      const peso = Number(datos.pesoKg);
      let tarifa = base;
      if (peso > PESO_RECARGO_KG) {
        tarifa += base * RECARGO;
      }
      if (datos.duenoEsEstudiante) {
        tarifa -= base * DESCUENTO_ESTUDIANTE;
      }
      return Math.round(tarifa);
    }
  }

  exportar('CalculadoraTarifa', CalculadoraTarifa);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
