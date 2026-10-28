// Pruebas automáticas del EQUIPO DE DESARROLLO (nivel de componente).
// Se corren desde la carpeta del proyecto con:   node --test pruebas/
// No hace falta instalar nada: node --test viene con Node.
const test = require('node:test');
const assert = require('node:assert');

const ESPECIES = require('../js/dominio/especies.js');
const ReglaNombre = require('../js/dominio/reglas/ReglaNombre.js');
const ReglaEspecie = require('../js/dominio/reglas/ReglaEspecie.js');
const ReglaEdad = require('../js/dominio/reglas/ReglaEdad.js');
const ReglaPeso = require('../js/dominio/reglas/ReglaPeso.js');
const ReglaVacuna = require('../js/dominio/reglas/ReglaVacuna.js');
const ReglaDocumento = require('../js/dominio/reglas/ReglaDocumento.js');
const ValidadorIngreso = require('../js/dominio/ValidadorIngreso.js');
const CalculadoraTarifa = require('../js/dominio/CalculadoraTarifa.js');
const EstadoIngreso = require('../js/dominio/EstadoIngreso.js');
const ServicioIngresos = require('../js/dominio/ServicioIngresos.js');
const RepositorioEnMemoria = require('../js/infraestructura/RepositorioEnMemoria.js');

const valido = {
  nombre: 'Luna', especie: 'Perro', edadMeses: '24', pesoKg: '12',
  tieneAntirrabica: true, documentoDueno: '1052345678', duenoEsEstudiante: false,
};

test('nombre válido', () => {
  assert.deepStrictEqual(new ReglaNombre().validar(valido), []);
});

test('nombre vacío se rechaza', () => {
  assert.strictEqual(new ReglaNombre().validar({ ...valido, nombre: '' }).length, 1);
});

test('especie que no existe se rechaza', () => {
  assert.strictEqual(new ReglaEspecie(ESPECIES).validar({ ...valido, especie: 'Pez' }).length, 1);
});

test('edad de 24 meses es válida', () => {
  assert.deepStrictEqual(new ReglaEdad().validar(valido), []);
});

test('edad de 0 y de 300 meses se rechazan', () => {
  assert.strictEqual(new ReglaEdad().validar({ ...valido, edadMeses: '0' }).length, 1);
  assert.strictEqual(new ReglaEdad().validar({ ...valido, edadMeses: '300' }).length, 1);
});

test('perro de 12 kg es válido y de 90 kg se rechaza', () => {
  const regla = new ReglaPeso(ESPECIES);
  assert.deepStrictEqual(regla.validar(valido), []);
  assert.strictEqual(regla.validar({ ...valido, pesoKg: '90' }).length, 1);
});

test('perro de 24 meses sin antirrábica se rechaza', () => {
  assert.strictEqual(new ReglaVacuna(ESPECIES).validar({ ...valido, tieneAntirrabica: false }).length, 1);
});

test('conejo sin antirrábica se acepta', () => {
  assert.deepStrictEqual(new ReglaVacuna(ESPECIES).validar({ ...valido, especie: 'Conejo', pesoKg: '3', tieneAntirrabica: false }), []);
});

test('documento de 5 dígitos se rechaza', () => {
  assert.strictEqual(new ReglaDocumento().validar({ ...valido, documentoDueno: '12345' }).length, 1);
});

test('tarifa de un gato de 4 kg: $25.000', () => {
  assert.strictEqual(new CalculadoraTarifa(ESPECIES).calcular({ ...valido, especie: 'Gato', pesoKg: '4' }), 25000);
});

test('tarifa de un perro de 40 kg con dueño estudiante: $33.000', () => {
  assert.strictEqual(new CalculadoraTarifa(ESPECIES).calcular({ ...valido, pesoKg: '40', duenoEsEstudiante: true }), 33000);
});

test('un ingreso recorre Registrado → En guardería → Entregado', () => {
  let r = EstadoIngreso.aplicar(EstadoIngreso.inicial(), 'llegada');
  assert.strictEqual(r.estado, 'En guardería');
  r = EstadoIngreso.aplicar(r.estado, 'entregar');
  assert.strictEqual(r.estado, 'Entregado');
});

test('un ingreso entregado no vuelve a la guardería', () => {
  assert.strictEqual(EstadoIngreso.aplicar('Entregado', 'llegada').ok, false);
});

test('con datos inválidos el servicio no registra nada', () => {
  const repositorio = new RepositorioEnMemoria();
  const servicio = new ServicioIngresos({
    validador: new ValidadorIngreso([new ReglaNombre(), new ReglaEdad()]),
    calculadora: new CalculadoraTarifa(ESPECIES),
    estados: EstadoIngreso,
    repositorio,
  });
  const r = servicio.registrar({ ...valido, nombre: '' });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(repositorio.listar().length, 0);
});
