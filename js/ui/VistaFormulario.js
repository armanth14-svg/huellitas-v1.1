// La vista del formulario: lee lo que escribió el usuario y muestra errores o el resultado.
// No valida ni calcula nada: eso es del dominio (responsabilidad única).
(function (exportar) {
  'use strict';

  class VistaFormulario {
    constructor(formulario, zonaMensaje) {
      this.formulario = formulario;
      this.zonaMensaje = zonaMensaje;
    }

    alEnviar(manejador) {
      this.formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        manejador(this.leer());
      });
    }

    leer() {
      const f = this.formulario.elements;
      return {
        nombre: f.nombre.value,
        especie: f.especie.value,
        edadMeses: f.edadMeses.value,
        pesoKg: f.pesoKg.value,
        tieneAntirrabica: f.tieneAntirrabica.checked,
        documentoDueno: f.documentoDueno.value,
        duenoEsEstudiante: f.duenoEsEstudiante.checked,
      };
    }

    limpiarErrores() {
      this.formulario.querySelectorAll('.error').forEach((e) => { e.textContent = ''; });
      this.formulario.querySelectorAll('.campo--invalido').forEach((e) => e.classList.remove('campo--invalido'));
      this.zonaMensaje.textContent = '';
      this.zonaMensaje.className = 'mensaje';
    }

    mostrarErrores(errores) {
      this.limpiarErrores();
      errores.forEach(({ campo, mensaje }) => {
        const zona = this.formulario.querySelector(`[data-error-de="${campo}"]`);
        if (zona) {
          zona.textContent = zona.textContent ? zona.textContent + ' ' + mensaje : mensaje;
          zona.closest('.campo').classList.add('campo--invalido');
        }
      });
      this.zonaMensaje.textContent = 'No se registró el ingreso. Corrija los datos marcados.';
      this.zonaMensaje.className = 'mensaje mensaje--error';
    }

    mostrarRegistrado(ingreso, formatoPesos) {
      this.limpiarErrores();
      this.zonaMensaje.textContent = `Ingreso ${ingreso.codigo} registrado: ${ingreso.nombre}. Tarifa por día: ${formatoPesos(ingreso.tarifaDia)}.`;
      this.zonaMensaje.className = 'mensaje mensaje--ok';
      this.formulario.reset();
    }
  }

  exportar('VistaFormulario', VistaFormulario);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
