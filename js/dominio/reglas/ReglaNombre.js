// R1 — Nombre de la mascota.
// Todas las reglas cumplen el mismo contrato: validar(datos) devuelve una lista de errores { campo, mensaje }.
// Una lista vacía significa que el dato es válido. (Responsabilidad única + sustitución de Liskov.)
(function (exportar) {
  'use strict';

  class ReglaNombre {
    validar(datos) {
      const nombre = (datos.nombre || '').trim();
      if (nombre === '') {
        return [{ campo: 'nombre', mensaje: 'El nombre es obligatorio.' }];
      }
      if (nombre.length < 2 || nombre.length > 30) {
        return [{ campo: 'nombre', mensaje: 'El nombre debe tener entre 2 y 30 caracteres.' }];
      }
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÜüÑñ ]+$/.test(nombre)) {
        return [{ campo: 'nombre', mensaje: 'El nombre solo puede tener letras y espacios.' }];
      }
      return [];
    }
  }

  exportar('ReglaNombre', ReglaNombre);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
