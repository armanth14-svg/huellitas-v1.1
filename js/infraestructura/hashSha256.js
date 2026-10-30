// Hash SHA-256 en hexadecimal minúscula, con Web Crypto (CU-R7).
// Es asíncrono porque crypto.subtle.digest devuelve una promesa.
// Funciona en el navegador y en Node 19 o superior (globalThis.crypto).
(function (exportar) {
  'use strict';

  async function hashSha256(texto) {
    const bytes = new TextEncoder().encode(texto);
    const resumen = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(resumen))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  exportar('hashSha256', hashSha256);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
