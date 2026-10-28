// Guarda los ingresos mientras la página esté abierta. Al recargar, se pierden (es a propósito:
// cada prueba empieza limpia). Cualquier otro repositorio con los mismos cuatro métodos sirve.
(function (exportar) {
  'use strict';

  class RepositorioEnMemoria {
    constructor() {
      this.ingresos = new Map();
      this.consecutivo = 0;
    }

    siguienteCodigo() {
      this.consecutivo += 1;
      return 'ING-' + String(this.consecutivo).padStart(3, '0');
    }

    guardar(ingreso) {
      this.ingresos.set(ingreso.codigo, { ...ingreso });
    }

    buscar(codigo) {
      const ingreso = this.ingresos.get(codigo);
      return ingreso ? { ...ingreso } : null;
    }

    listar() {
      return [...this.ingresos.values()].map((i) => ({ ...i }));
    }
  }

  exportar('RepositorioEnMemoria', RepositorioEnMemoria);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
