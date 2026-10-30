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
const hashSha256 = require('../js/infraestructura/hashSha256.js');
const ServicioSesion = require('../js/dominio/ServicioSesion.js');

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

test('hashSha256 de "abc" es el valor SHA-256 conocido', async () => {
  assert.strictEqual(
    await hashSha256('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
  );
});

// --- Inicio de sesión (SPEC 02) ---
// Empleados de prueba: la contraseña de Ana es 'clave-de-ana' y la de Luis 'clave-de-luis' (solo en las pruebas).
async function crearServicioSesion() {
  const sal = { ana: 'aa'.repeat(16), luis: 'bb'.repeat(16) };
  const empleados = [
    { correo: 'ana.torres@huellitas.co', nombre: 'Ana Torres', sal: sal.ana, hash: await hashSha256(sal.ana + 'clave-de-ana') },
    { correo: 'luis.gomez@huellitas.co', nombre: 'Luis Gómez', sal: sal.luis, hash: await hashSha256(sal.luis + 'clave-de-luis') },
  ];
  return new ServicioSesion({ empleados, hash: hashSha256 });
}

test('sesión: correo y contraseña correctos inician sesión', async () => {
  const sesion = await crearServicioSesion();
  const r = await sesion.iniciarSesion('ana.torres@huellitas.co', 'clave-de-ana');
  assert.deepStrictEqual(r, { ok: true, empleado: { correo: 'ana.torres@huellitas.co', nombre: 'Ana Torres' } });
  assert.strictEqual(sesion.haySesion(), true);
  assert.deepStrictEqual(sesion.empleadoActual(), { correo: 'ana.torres@huellitas.co', nombre: 'Ana Torres' });
});

test('sesión: el correo se recorta y se pasa a minúsculas', async () => {
  const sesion = await crearServicioSesion();
  const r = await sesion.iniciarSesion('  ANA.TORRES@Huellitas.co  ', 'clave-de-ana');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.empleado.correo, 'ana.torres@huellitas.co');
});

test('sesión: el empleado devuelto no trae sal ni hash', async () => {
  const sesion = await crearServicioSesion();
  const r = await sesion.iniciarSesion('ana.torres@huellitas.co', 'clave-de-ana');
  assert.deepStrictEqual(Object.keys(r.empleado).sort(), ['correo', 'nombre']);
  assert.deepStrictEqual(Object.keys(sesion.empleadoActual()).sort(), ['correo', 'nombre']);
});

test('sesión: correo o contraseña vacíos piden ambos datos', async () => {
  const sesion = await crearServicioSesion();
  const esperado = { ok: false, mensaje: 'Ingrese correo y contraseña.' };
  assert.deepStrictEqual(await sesion.iniciarSesion('', 'clave-de-ana'), esperado);
  assert.deepStrictEqual(await sesion.iniciarSesion('   ', 'clave-de-ana'), esperado);
  assert.deepStrictEqual(await sesion.iniciarSesion('ana.torres@huellitas.co', ''), esperado);
  assert.deepStrictEqual(await sesion.iniciarSesion(null, undefined), esperado);
  assert.deepStrictEqual(await sesion.iniciarSesion(123, 456), esperado);
  assert.strictEqual(sesion.haySesion(), false);
});

test('sesión: los vacíos se evalúan antes que el formato', async () => {
  const sesion = await crearServicioSesion();
  const r = await sesion.iniciarSesion('ana', '');
  assert.strictEqual(r.mensaje, 'Ingrese correo y contraseña.');
});

test('sesión: correo sin forma válida se rechaza', async () => {
  const sesion = await crearServicioSesion();
  for (const malo of ['ana', 'ana@huellitas', 'ana@@huellitas.co', '@huellitas.co', 'ana@.co', 'ana@huellitas.', 'ana@huellitas..co']) {
    const r = await sesion.iniciarSesion(malo, 'clave-de-ana');
    assert.deepStrictEqual(r, { ok: false, mensaje: 'El correo no tiene un formato válido.' }, malo);
  }
});

test('sesión: correo inexistente y contraseña incorrecta dan el mismo mensaje', async () => {
  const sesion = await crearServicioSesion();
  const inexistente = await sesion.iniciarSesion('nadie@huellitas.co', 'clave-de-ana');
  const incorrecta = await sesion.iniciarSesion('ana.torres@huellitas.co', 'otra-clave');
  assert.deepStrictEqual(inexistente, { ok: false, mensaje: 'Correo o contraseña incorrectos.' });
  assert.deepStrictEqual(incorrecta, inexistente);
  assert.strictEqual(sesion.haySesion(), false);
});

test('sesión: una contraseña de solo espacios es un intento normal', async () => {
  const sesion = await crearServicioSesion();
  const r = await sesion.iniciarSesion('ana.torres@huellitas.co', '   ');
  assert.strictEqual(r.mensaje, 'Correo o contraseña incorrectos.');
});

test('sesión: cerrar sesión deja sin empleado', async () => {
  const sesion = await crearServicioSesion();
  await sesion.iniciarSesion('ana.torres@huellitas.co', 'clave-de-ana');
  sesion.cerrarSesion();
  assert.strictEqual(sesion.haySesion(), false);
  assert.strictEqual(sesion.empleadoActual(), null);
});

test('sesión: un inicio exitoso reemplaza la sesión abierta', async () => {
  const sesion = await crearServicioSesion();
  await sesion.iniciarSesion('ana.torres@huellitas.co', 'clave-de-ana');
  await sesion.iniciarSesion('luis.gomez@huellitas.co', 'clave-de-luis');
  assert.strictEqual(sesion.empleadoActual().correo, 'luis.gomez@huellitas.co');
});
