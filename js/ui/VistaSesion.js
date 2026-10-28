// La vista de la sesión: lee usuario y contraseña, muestra errores y alterna
// entre la pantalla de inicio de sesión y la aplicación.
// No decide quién puede entrar: eso es del dominio (ServicioSesion).
(function (exportar) {
  'use strict';

  class VistaSesion {
    constructor({ formulario, panel, zonaMensaje, etiquetaEmpleado, botonCerrar, contenido }) {
      this.formulario = formulario;
      this.panel = panel;
      this.zonaMensaje = zonaMensaje;
      this.etiquetaEmpleado = etiquetaEmpleado;
      this.botonCerrar = botonCerrar;
      this.contenido = contenido;
    }

    alIniciar(manejador) {
      this.formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const f = this.formulario.elements;
        manejador(f.usuario.value, f.contrasena.value);
      });
    }

    alCerrar(manejador) {
      this.botonCerrar.addEventListener('click', () => manejador());
    }

    mostrarError(mensaje) {
      this.zonaMensaje.textContent = mensaje;
      this.zonaMensaje.className = 'mensaje mensaje--error';
    }

    mostrarConectado(empleado) {
      this.limpiarMensaje();
      this.etiquetaEmpleado.textContent = empleado.nombre;
      this.panel.hidden = true;
      this.contenido.hidden = false;
      this.etiquetaEmpleado.hidden = false;
      this.botonCerrar.hidden = false;
    }

    mostrarDesconectado() {
      this.formulario.reset();
      this.limpiarMensaje();
      this.etiquetaEmpleado.textContent = '';
      this.contenido.hidden = true;
      this.etiquetaEmpleado.hidden = true;
      this.botonCerrar.hidden = true;
      this.panel.hidden = false;
    }

    limpiarMensaje() {
      this.zonaMensaje.textContent = '';
      this.zonaMensaje.className = 'mensaje';
    }
  }

  exportar('VistaSesion', VistaSesion);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
