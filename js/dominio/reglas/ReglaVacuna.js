// R5 — Vacuna antirrábica. Qué especies la necesitan lo dice la configuración, no esta clase.
(function (exportar) {
  'use strict';

  const EDAD_MINIMA_VACUNA = 4; // meses

  class ReglaVacuna {
    constructor(especies) {
      this.especies = especies;
    }

    validar(datos) {
      const especie = this.especies[datos.especie];
      const edad = Number(datos.edadMeses);
      if (!especie || !Number.isInteger(edad)) {
        return []; // de esos datos ya se quejan las reglas de especie y de edad
      }
      if (especie.requiereAntirrabica && edad >= EDAD_MINIMA_VACUNA && !datos.tieneAntirrabica) {
        return [{ campo: 'tieneAntirrabica', mensaje: `Un ${datos.especie.toLowerCase()} de ${EDAD_MINIMA_VACUNA} meses o más necesita la vacuna antirrábica vigente.` }];
      }
      return [];
    }
  }

  exportar('ReglaVacuna', ReglaVacuna);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
