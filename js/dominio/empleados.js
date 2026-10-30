// Empleados autorizados a iniciar sesión (CU-R2, CU-R7).
// Es DATO, no lógica (igual que especies.js): ServicioSesion la recibe por el constructor.
// Solo se guarda sal y hash; ninguna contraseña en texto plano.
// hash = sha256(sal + contrasena) en hexadecimal minúscula. Las contraseñas las entrega el docente.
(function (exportar) {
  'use strict';

  const EMPLEADOS = [
    { correo: 'ana.torres@huellitas.co', nombre: 'Ana Torres', sal: '6e5fccd4de0d9e4225fa8ecbaca84762', hash: '3e04af8049f549223771f2ed3310d89e90c257501906e2dbd0ea48c3ac91c21a' },
    { correo: 'luis.gomez@huellitas.co', nombre: 'Luis Gómez', sal: '99993b865b5cb802d5e4f6238e4d5bc1', hash: '99537cd3784e93072f79b8072c04ce435a6b9af98809210446d48a58d6f7abdf' },
  ];

  exportar('EMPLEADOS', EMPLEADOS);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
