// Raíz de composición: el ÚNICO lugar donde se crean las piezas y se conectan entre sí.
// Si mañana cambia el repositorio o se agrega una regla, se toca este archivo y nada más.
(function () {
  'use strict';
  const G = window.Guarderia;

  const MINUTO = 60 * 1000;
  const formatoPesos = (valor) => '$' + valor.toLocaleString('es-CO');

  const validador = new G.ValidadorIngreso([
    new G.ReglaNombre(),
    new G.ReglaEspecie(G.ESPECIES),
    new G.ReglaEdad(),
    new G.ReglaPeso(G.ESPECIES),
    new G.ReglaVacuna(G.ESPECIES),
    new G.ReglaDocumento(),
  ]);

  // Sesión: reloj real, bloqueos guardados en localStorage y avisos en el "Buzón de prueba".
  const buzon = new G.BuzonDePrueba();
  const sesion = new G.ServicioSesion({
    empleados: G.EMPLEADOS,
    hash: G.hashSha256,
    reloj: { ahora: () => Date.now() },
    almacen: new G.AlmacenSeguridadLocal(),
    notificador: buzon,
    maxIntentos: 5,
    bloqueoMs: 15 * MINUTO,
    inactividadMs: 30 * MINUTO,
  });

  // El repositorio se crea una sola vez: los ingresos sobreviven a cerrar sesión y volver a entrar.
  const servicio = new G.ServicioIngresos({
    validador,
    calculadora: new G.CalculadoraTarifa(G.ESPECIES),
    estados: G.EstadoIngreso,
    repositorio: new G.RepositorioEnMemoria(),
    sesion,
  });

  const vistaSesion = new G.VistaSesion({
    formulario: document.getElementById('formulario-sesion'),
    zonaMensaje: document.getElementById('mensaje-sesion'),
    panelSesion: document.getElementById('panel-sesion'),
    panelSinPermiso: document.getElementById('panel-sin-permiso'),
    panelBuzon: document.getElementById('buzon-prueba'),
    listaBuzon: document.getElementById('lista-buzon'),
    empleadoConectado: document.getElementById('empleado-conectado'),
    botonCerrar: document.getElementById('cerrar-sesion'),
  });

  const contenido = document.querySelector('main.contenido');
  const plantilla = document.getElementById('plantilla-ingresos');

  // El formulario y la tabla solo existen en el documento mientras hay sesión (AD-R1).
  function mostrarIngresos() {
    contenido.appendChild(plantilla.content.cloneNode(true));

    const vistaFormulario = new G.VistaFormulario(
      document.getElementById('formulario-ingreso'),
      document.getElementById('mensaje-formulario'),
    );
    const vistaIngresos = new G.VistaIngresos(
      document.getElementById('cuerpo-ingresos'),
      document.getElementById('mensaje-ingresos'),
      formatoPesos,
    );

    vistaFormulario.alEnviar((datos) => {
      const resultado = servicio.registrar(datos);
      if (resultado.ok) {
        vistaFormulario.mostrarRegistrado(resultado.ingreso, formatoPesos);
        vistaIngresos.mostrar(servicio.listar());
      } else if (resultado.errores.length > 0) {
        vistaFormulario.mostrarErrores(resultado.errores);
      } else {
        revisarPantalla(); // sin errores de campo = "Sin permiso": la sesión venció entre dos revisiones
      }
    });

    vistaIngresos.alAccion((accion, codigo) => {
      const resultado = accion === 'llegada' ? servicio.registrarLlegada(codigo) : servicio.entregar(codigo);
      vistaIngresos.mostrarResultado({ ...resultado, mensaje: `${codigo}: ${resultado.mensaje}` });
      vistaIngresos.mostrar(servicio.listar());
    });

    vistaIngresos.mostrar(servicio.listar());
  }

  function quitarIngresos() {
    contenido.innerHTML = '';
  }

  function quitarHash() {
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {
      location.hash = '';
    }
  }

  // Pantalla actual: 'ninguna' | 'conectado' | 'login' | 'sinPermiso'. Solo se redibuja al cambiar,
  // para no borrar lo que la persona está escribiendo cada vez que se revisa el estado.
  let pantalla = 'ninguna';

  function revisarPantalla() {
    const empleado = sesion.empleadoActual(); // si venció la inactividad, aquí se cierra la sesión

    if (empleado) {
      if (pantalla !== 'conectado') {
        mostrarIngresos();
        vistaSesion.mostrarConectado(empleado);
        pantalla = 'conectado';
      }
      if (location.hash !== '#ingresos') {
        location.hash = '#ingresos';
      }
      return;
    }

    if (pantalla === 'conectado') {
      quitarIngresos();
      quitarHash();
      vistaSesion.mostrarDesconectado();
      vistaSesion.mostrarBuzon(buzon.listar());
      pantalla = 'login';
      return;
    }

    const destino = location.hash === '#ingresos' ? 'sinPermiso' : 'login';
    if (destino === pantalla) {
      return;
    }
    if (destino === 'sinPermiso') {
      vistaSesion.mostrarSinPermiso();
    } else {
      vistaSesion.mostrarDesconectado();
      vistaSesion.mostrarBuzon(buzon.listar());
    }
    pantalla = destino;
  }

  vistaSesion.alIniciar(async (correo, contrasena) => {
    try {
      const resultado = await sesion.iniciarSesion(correo, contrasena);
      vistaSesion.mostrarBuzon(buzon.listar());
      if (resultado.ok) {
        revisarPantalla();
      } else {
        vistaSesion.mostrarError(resultado.mensaje);
      }
    } catch (e) {
      vistaSesion.mostrarError('No se pudo iniciar sesión en este navegador.');
    }
  });

  vistaSesion.alCerrar(() => {
    sesion.cerrarSesion();
    revisarPantalla();
  });

  // Actividad = cualquier clic o tecla (CU-R9).
  document.addEventListener('click', () => sesion.registrarActividad());
  document.addEventListener('keydown', () => sesion.registrarActividad());

  window.addEventListener('hashchange', revisarPantalla);
  setInterval(revisarPantalla, 1000);

  revisarPantalla();
})();
