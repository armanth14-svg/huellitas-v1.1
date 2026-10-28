// Empleados de la guardería que pueden iniciar sesión (SPEC 01).
// Es DATO, no lógica: ServicioSesion la recibe por el constructor, igual que especies.js.
// Las contraseñas están en claro a propósito: es una app didáctica sin servidor.
(function (exportar) {
  'use strict';

  const EMPLEADOS = [
    { usuario: 'ana',  nombre: 'Ana Torres', contrasena: 'Huellitas2026' },
    { usuario: 'luis', nombre: 'Luis Gómez', contrasena: 'Guarderia#1' },
  ];

  exportar('EMPLEADOS', EMPLEADOS);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
