// R3 — Edad en meses.
(function (exportar) {
  'use strict';

  class ReglaEdad {
    validar(datos) {
      const texto = String(datos.edadMeses ?? '').trim();
      if (texto === '') {
        return [{ campo: 'edadMeses', mensaje: 'La edad es obligatoria.' }];
      }
      const edad = Number(texto);
      if (!Number.isInteger(edad)) {
        return [{ campo: 'edadMeses', mensaje: 'La edad debe ser un número entero de meses.' }];
      }
      if (edad < 2 || edad > 240) {
        return [{ campo: 'edadMeses', mensaje: 'La edad debe estar entre 2 y 240 meses.' }];
      }
      return [];
    }
  }

  exportar('ReglaEdad', ReglaEdad);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
