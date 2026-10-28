// R8 — Los estados de un ingreso y las transiciones permitidas.
// La tabla de transiciones es la única fuente de verdad: la interfaz no decide qué se puede hacer.
(function (exportar) {
  'use strict';

  const ESTADOS = {
    REGISTRADO: 'Registrado',
    EN_GUARDERIA: 'En guardería',
    ENTREGADO: 'Entregado',
  };

  const ACCIONES = {
    LLEGADA: 'llegada',
    ENTREGAR: 'entregar',
  };

  const TRANSICIONES = {
    [ESTADOS.REGISTRADO]:   { [ACCIONES.LLEGADA]: ESTADOS.EN_GUARDERIA },
    [ESTADOS.EN_GUARDERIA]: { [ACCIONES.ENTREGAR]: ESTADOS.ENTREGADO },
    [ESTADOS.ENTREGADO]:    {},
  };

  const EstadoIngreso = {
    ESTADOS,
    ACCIONES,

    inicial() {
      return ESTADOS.REGISTRADO;
    },

    aplicar(estadoActual, accion) {
      const destino = (TRANSICIONES[estadoActual] || {})[accion];
      if (!destino) {
        return { ok: false, estado: estadoActual, mensaje: `No se puede hacer «${accion}» cuando el ingreso está «${estadoActual}».` };
      }
      return { ok: true, estado: destino, mensaje: `El ingreso pasó a «${destino}».` };
    },
  };

  exportar('EstadoIngreso', EstadoIngreso);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
