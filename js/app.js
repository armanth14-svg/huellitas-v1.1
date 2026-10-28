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
})();
