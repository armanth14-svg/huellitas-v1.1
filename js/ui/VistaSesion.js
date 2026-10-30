// La vista de la sesión: formulario de inicio de sesión, encabezado con el empleado, "Sin permiso" y "Buzón de prueba".
// Solo toca el DOM: no decide quién entra ni cuándo se bloquea, eso es del dominio (responsabilidad única).
// Muestra y oculta paneles con el atributo hidden.
(function (exportar) {
  'use strict';

  class VistaSesion {
    constructor({ formulario, zonaMensaje, panelSesion, panelSinPermiso, panelBuzon, listaBuzon, empleadoConectado, botonCerrar }) {
      this.formulario = formulario;
      this.zonaMensaje = zonaMensaje;
      this.panelSesion = panelSesion;
      this.panelSinPermiso = panelSinPermiso;
      this.panelBuzon = panelBuzon;
      this.listaBuzon = listaBuzon;
      this.empleadoConectado = empleadoConectado;
      this.botonCerrar = botonCerrar;
    }

    alIniciar(manejador) {
      this.formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const f = this.formulario.elements;
        manejador(f.correo.value, f.contrasena.value);
      });
    }

    alCerrar(manejador) {
      this.botonCerrar.addEventListener('click', manejador);
    }

    mostrarError(mensaje) {
      this.zonaMensaje.textContent = mensaje;
      this.zonaMensaje.className = 'mensaje mensaje--error';
    }

    limpiarMensaje() {
      this.zonaMensaje.textContent = '';
      this.zonaMensaje.className = 'mensaje';
    }

    mostrarConectado(empleado) {
      this.limpiarMensaje();
      this.panelSesion.hidden = true;
      this.panelSinPermiso.hidden = true;
      this.panelBuzon.hidden = true;
      this.empleadoConectado.textContent = empleado.nombre;
      this.empleadoConectado.hidden = false;
      this.botonCerrar.hidden = false;
    }

    // Pantalla de inicio de sesión con campos y mensaje vacíos.
    mostrarDesconectado() {
      this.formulario.reset();
      this.limpiarMensaje();
      this.panelSesion.hidden = false;
      this.panelSinPermiso.hidden = true;
      this.panelBuzon.hidden = false;
      this.empleadoConectado.textContent = '';
      this.empleadoConectado.hidden = true;
      this.botonCerrar.hidden = true;
    }

    mostrarSinPermiso() {
      this.panelSesion.hidden = true;
      this.panelSinPermiso.hidden = false;
      this.panelBuzon.hidden = true;
      this.empleadoConectado.textContent = '';
      this.empleadoConectado.hidden = true;
      this.botonCerrar.hidden = true;
    }

    // `avisos`: [{ para, asunto, fechaHora }] con fechaHora en ISO.
    mostrarBuzon(avisos) {
      this.listaBuzon.textContent = '';
      avisos.forEach(({ para, asunto, fechaHora }) => {
        const item = document.createElement('li');
        const fecha = new Date(fechaHora).toLocaleString('es-CO');
        item.textContent = `${fecha} · ${asunto} · Para: ${para}`;
        this.listaBuzon.appendChild(item);
      });
    }
  }

  exportar('VistaSesion', VistaSesion);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
