// R6 — Documento del dueño.
(function (exportar) {
  'use strict';

  class ReglaDocumento {
    validar(datos) {
      const documento = String(datos.documentoDueno ?? '').trim();
      if (documento === '') {
        return [{ campo: 'documentoDueno', mensaje: 'El documento del dueño es obligatorio.' }];
      }
      if (!/^[0-9]{6,10}$/.test(documento)) {
        return [{ campo: 'documentoDueno', mensaje: 'El documento debe tener solo dígitos, entre 6 y 10.' }];
      }
      return [];
    }
  }

  exportar('ReglaDocumento', ReglaDocumento);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
