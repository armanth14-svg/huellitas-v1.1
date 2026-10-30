// Los casos de uso: registrar un ingreso, registrar la llegada, entregar la mascota.
// Depende de abstracciones que recibe por el constructor (validador, calculadora, estados, repositorio, sesion),
// no de clases concretas: por eso se puede probar con un repositorio en memoria.
// Sin sesión (AD-R1) ningún caso de uso responde: la guardia está aquí y no solo en la interfaz.
(function (exportar) {
  'use strict';

  class ServicioIngresos {
    constructor({ validador, calculadora, estados, repositorio, sesion }) {
      this.validador = validador;
      this.calculadora = calculadora;
      this.estados = estados;
      this.repositorio = repositorio;
      this.sesion = sesion;
    }

    sinPermiso() {
      return { ok: false, mensaje: 'Sin permiso', errores: [] };
    }

    registrar(datos) {
      if (!this.sesion.haySesion()) {
        return this.sinPermiso();
      }
      const errores = this.validador.validar(datos);
      if (errores.length > 0) {
        return { ok: false, errores };
      }
      const ingreso = {
        codigo: this.repositorio.siguienteCodigo(),
        nombre: datos.nombre.trim(),
        especie: datos.especie,
        edadMeses: Number(datos.edadMeses),
        pesoKg: Number(datos.pesoKg),
        documentoDueno: String(datos.documentoDueno).trim(),
        tarifaDia: this.calculadora.calcular(datos),
        estado: this.estados.inicial(),
      };
      this.repositorio.guardar(ingreso);
      return { ok: true, ingreso };
    }

    registrarLlegada(codigo) {
      if (!this.sesion.haySesion()) {
        return this.sinPermiso();
      }
      return this.cambiarEstado(codigo, this.estados.ACCIONES.LLEGADA);
    }

    entregar(codigo) {
      if (!this.sesion.haySesion()) {
        return this.sinPermiso();
      }
      return this.cambiarEstado(codigo, this.estados.ACCIONES.ENTREGAR);
    }

    listar() {
      if (!this.sesion.haySesion()) {
        return [];
      }
      return this.repositorio.listar();
    }

    cambiarEstado(codigo, accion) {
      const ingreso = this.repositorio.buscar(codigo);
      if (!ingreso) {
        return { ok: false, mensaje: `No existe el ingreso ${codigo}.` };
      }
      const resultado = this.estados.aplicar(ingreso.estado, accion);
      if (resultado.ok) {
        ingreso.estado = resultado.estado;
        this.repositorio.guardar(ingreso);
      }
      return resultado;
    }
  }

  exportar('ServicioIngresos', ServicioIngresos);
})(function (nombre, valor) {
  if (typeof module !== 'undefined' && module.exports) { module.exports = valor; }
  else { window.Guarderia = window.Guarderia || {}; window.Guarderia[nombre] = valor; }
});
