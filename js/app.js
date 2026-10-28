// Raíz de composición: el ÚNICO lugar donde se crean las piezas y se conectan entre sí.
// Si mañana cambia el repositorio o se agrega una regla, se toca este archivo y nada más.
(function () {
  'use strict';
  const G = window.Guarderia;

  const formatoPesos = (valor) => '$' + valor.toLocaleString('es-CO');

  const validador = new G.ValidadorIngreso([
    new G.ReglaNombre(),
    new G.ReglaEspecie(G.ESPECIES),
    new G.ReglaEdad(),
    new G.ReglaPeso(G.ESPECIES),
    new G.ReglaVacuna(G.ESPECIES),
    new G.ReglaDocumento(),
  ]);

  const servicio = new G.ServicioIngresos({
    validador,
    calculadora: new G.CalculadoraTarifa(G.ESPECIES),
    estados: G.EstadoIngreso,
    repositorio: new G.RepositorioEnMemoria(),
  });

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
    } else {
      vistaFormulario.mostrarErrores(resultado.errores);
    }
  });

  vistaIngresos.alAccion((accion, codigo) => {
    const resultado = accion === 'llegada' ? servicio.registrarLlegada(codigo) : servicio.entregar(codigo);
    vistaIngresos.mostrarResultado({ ...resultado, mensaje: `${codigo}: ${resultado.mensaje}` });
    vistaIngresos.mostrar(servicio.listar());
  });

  vistaIngresos.mostrar(servicio.listar());

  // Sesión: sin empleado conectado la página muestra solo el inicio de sesión.
  // Cerrar sesión no borra los ingresos, que viven en el repositorio en memoria.
  const sesion = new G.ServicioSesion({ empleados: G.EMPLEADOS, maxIntentos: 3 });
  const vistaSesion = new G.VistaSesion({
    formulario: document.getElementById('formulario-sesion'),
    panel: document.getElementById('panel-sesion'),
    zonaMensaje: document.getElementById('mensaje-sesion'),
    etiquetaEmpleado: document.getElementById('empleado-conectado'),
    botonCerrar: document.getElementById('cerrar-sesion'),
    contenido: document.querySelector('main.contenido'),
  });

  vistaSesion.alIniciar((usuario, contrasena) => {
    const resultado = sesion.iniciarSesion(usuario, contrasena);
    if (resultado.ok) {
      vistaSesion.mostrarConectado(resultado.empleado);
    } else {
      vistaSesion.mostrarError(resultado.mensaje);
    }
  });

  vistaSesion.alCerrar(() => {
    sesion.cerrarSesion();
    vistaSesion.mostrarDesconectado();
  });
})();
