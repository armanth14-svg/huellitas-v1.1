// La tabla de ingresos. Muestra siempre los dos botones: decidir si una acción se puede hacer
// no es trabajo de la interfaz, es de la tabla de transiciones del dominio.
(function (exportar) {
  'use strict';

  class VistaIngresos {
    constructor(cuerpoTabla, zonaMensaje, formatoPesos) {
      this.cuerpoTabla = cuerpoTabla;
      this.zonaMensaje = zonaMensaje;
      this.formatoPesos = formatoPesos;
    }

    alAccion(manejador) {
      this.cuerpoTabla.addEventListener('click', (evento) => {
        const boton = evento.target.closest('button[data-accion]');
        if (boton) {
          manejador(boton.dataset.accion, boton.dataset.codigo);
        }
      });
    }

    mostrar(ingresos) {
      if (ingresos.length === 0) {
        this.cuerpoTabla.innerHTML = '<tr><td colspan="6" class="vacio">Todavía no hay ingresos.</td></tr>';
        return;
      }
      this.cuerpoTabla.innerHTML = ingresos.map((i) => `
        <tr>
          <td>${i.codigo}</td>
          <td>${escapar(i.nombre)}</td>
          <td>${i.especie}</td>
          <td>${this.formatoPesos(i.tarifaDia)}</td>
          <td><span class="estado">${i.estado}</span></td>
          <td class="acciones">
            <button type="button" data-accion="llegada" data-codigo="${i.codigo}">Registrar llegada</button>
            <button type="button" data-accion="entregar" data-codigo="${i.codigo}">Entregar al dueño</button>
          </td>
        </tr>`).join('');
    }

    mostrarResultado(resultado) {
      this.zonaMensaje.textContent = resultado.mensaje;
      this.zonaMensaje.className = resultado.ok ? 'mensaje mensaje--ok' : 'mensaje mensaje--error';
    }
  }

  function escapar(texto) {
    return String(texto).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  exportar('VistaIngresos', VistaIngresos);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
