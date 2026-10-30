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
const AlmacenSeguridadLocal = require('../js/infraestructura/AlmacenSeguridadLocal.js');
const BuzonDePrueba = require('../js/infraestructura/BuzonDePrueba.js');

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
// Reloj, almacén y notificador falsos: las pruebas controlan el tiempo y ven lo que se guarda y se avisa.
async function crearEntornoSesion() {
  const sal = { ana: 'aa'.repeat(16), luis: 'bb'.repeat(16) };
  const empleados = [
    { correo: 'ana.torres@huellitas.co', nombre: 'Ana Torres', sal: sal.ana, hash: await hashSha256(sal.ana + 'clave-de-ana') },
    { correo: 'luis.gomez@huellitas.co', nombre: 'Luis Gómez', sal: sal.luis, hash: await hashSha256(sal.luis + 'clave-de-luis') },
  ];
  let ahora = Date.UTC(2026, 9, 30, 15, 4, 5);
  const reloj = { ahora: () => ahora, avanzar: (ms) => { ahora += ms; } };
  const almacen = { estado: {}, leer() { return this.estado; }, guardar(estado) { this.estado = estado; } };
  const notificador = { avisos: [], enviarAvisoBloqueo(aviso) { this.avisos.push(aviso); } };
  const sesion = new ServicioSesion({
    empleados, hash: hashSha256, reloj, almacen, notificador,
    maxIntentos: 5, bloqueoMs: 15 * 60 * 1000,
  });
  return { sesion, reloj, almacen, notificador, empleados };
}

async function crearServicioSesion() {
  return (await crearEntornoSesion()).sesion;
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

// --- Bloqueo por intentos fallidos (CU-R8) ---
const MINUTO = 60 * 1000;
const ANA = 'ana.torres@huellitas.co';
const LUIS = 'luis.gomez@huellitas.co';

async function fallar(sesion, correo, veces) {
  let ultimo;
  for (let i = 0; i < veces; i++) {
    ultimo = await sesion.iniciarSesion(correo, 'mala-clave');
  }
  return ultimo;
}

test('bloqueo: 4 fallos seguidos y luego la contraseña correcta, entra', async () => {
  const { sesion } = await crearEntornoSesion();
  const ultimo = await fallar(sesion, ANA, 4);
  assert.strictEqual(ultimo.mensaje, 'Correo o contraseña incorrectos.');
  const r = await sesion.iniciarSesion(ANA, 'clave-de-ana');
  assert.strictEqual(r.ok, true);
});

test('bloqueo: el 5.º fallo seguido bloquea la cuenta', async () => {
  const { sesion } = await crearEntornoSesion();
  const ultimo = await fallar(sesion, ANA, 5);
  assert.deepStrictEqual(ultimo, { ok: false, mensaje: 'Cuenta bloqueada por demasiados intentos fallidos.' });
});

test('bloqueo: con la cuenta bloqueada ni la contraseña correcta entra', async () => {
  const { sesion } = await crearEntornoSesion();
  await fallar(sesion, ANA, 5);
  const r = await sesion.iniciarSesion(ANA, 'clave-de-ana');
  assert.deepStrictEqual(r, { ok: false, mensaje: 'Cuenta bloqueada por demasiados intentos fallidos.' });
  assert.strictEqual(sesion.haySesion(), false);
});

test('bloqueo: a los 14:59 sigue bloqueada y a los 15:00 puede entrar', async () => {
  const { sesion, reloj } = await crearEntornoSesion();
  await fallar(sesion, ANA, 5);
  reloj.avanzar(15 * MINUTO - 1000);
  const antes = await sesion.iniciarSesion(ANA, 'clave-de-ana');
  assert.strictEqual(antes.mensaje, 'Cuenta bloqueada por demasiados intentos fallidos.');
  reloj.avanzar(1000);
  const despues = await sesion.iniciarSesion(ANA, 'clave-de-ana');
  assert.strictEqual(despues.ok, true);
});

test('bloqueo: vencido el bloqueo, el contador empieza de nuevo', async () => {
  const { sesion, reloj } = await crearEntornoSesion();
  await fallar(sesion, ANA, 5);
  reloj.avanzar(15 * MINUTO);
  const r = await fallar(sesion, ANA, 4);
  assert.strictEqual(r.mensaje, 'Correo o contraseña incorrectos.');
  const quinto = await sesion.iniciarSesion(ANA, 'mala-clave');
  assert.strictEqual(quinto.mensaje, 'Cuenta bloqueada por demasiados intentos fallidos.');
});

test('bloqueo: los intentos durante el bloqueo no lo alargan', async () => {
  const { sesion, reloj, almacen } = await crearEntornoSesion();
  await fallar(sesion, ANA, 5);
  const hasta = almacen.estado[ANA].bloqueadoHasta;
  reloj.avanzar(10 * MINUTO);
  await fallar(sesion, ANA, 3);
  assert.strictEqual(almacen.estado[ANA].bloqueadoHasta, hasta);
  reloj.avanzar(5 * MINUTO);
  const r = await sesion.iniciarSesion(ANA, 'clave-de-ana');
  assert.strictEqual(r.ok, true);
});

test('bloqueo: el aviso se envía una sola vez, con correo y fecha y hora', async () => {
  const { sesion, reloj, notificador } = await crearEntornoSesion();
  await fallar(sesion, ANA, 4);
  assert.strictEqual(notificador.avisos.length, 0);
  await fallar(sesion, ANA, 1);
  await fallar(sesion, ANA, 3);
  await sesion.iniciarSesion(ANA, 'clave-de-ana');
  assert.deepStrictEqual(notificador.avisos, [{
    para: ANA,
    asunto: 'Aviso de bloqueo de cuenta',
    fechaHora: new Date(reloj.ahora()).toISOString(),
  }]);
});

test('bloqueo: bloquear a una cuenta no afecta a las demás', async () => {
  const { sesion } = await crearEntornoSesion();
  await fallar(sesion, ANA, 5);
  const r = await sesion.iniciarSesion(LUIS, 'clave-de-luis');
  assert.strictEqual(r.ok, true);
});

test('bloqueo: los fallos de un correo no se mezclan con los de otro', async () => {
  const { sesion } = await crearEntornoSesion();
  await fallar(sesion, ANA, 3);
  await fallar(sesion, LUIS, 3);
  const r = await sesion.iniciarSesion(ANA, 'clave-de-ana');
  assert.strictEqual(r.ok, true);
});

test('bloqueo: un correo inexistente también cuenta, pero no envía aviso', async () => {
  const { sesion, notificador } = await crearEntornoSesion();
  const ultimo = await fallar(sesion, 'nadie@huellitas.co', 5);
  assert.strictEqual(ultimo.mensaje, 'Cuenta bloqueada por demasiados intentos fallidos.');
  assert.strictEqual(notificador.avisos.length, 0);
});

test('bloqueo: el correo se cuenta normalizado', async () => {
  const { sesion } = await crearEntornoSesion();
  await fallar(sesion, '  ANA.TORRES@huellitas.CO ', 3);
  const ultimo = await fallar(sesion, ANA, 2);
  assert.strictEqual(ultimo.mensaje, 'Cuenta bloqueada por demasiados intentos fallidos.');
});

test('bloqueo: formato inválido y campos vacíos no suman ni cortan la racha', async () => {
  const { sesion } = await crearEntornoSesion();
  await fallar(sesion, ANA, 2);
  await sesion.iniciarSesion('ana', 'mala-clave');
  await sesion.iniciarSesion(ANA, '');
  await sesion.iniciarSesion('', 'mala-clave');
  const r = await fallar(sesion, ANA, 2);
  assert.strictEqual(r.mensaje, 'Correo o contraseña incorrectos.');
  const quinto = await sesion.iniciarSesion(ANA, 'mala-clave');
  assert.strictEqual(quinto.mensaje, 'Cuenta bloqueada por demasiados intentos fallidos.');
});

test('bloqueo: los vacíos se avisan aun con la cuenta bloqueada', async () => {
  const { sesion } = await crearEntornoSesion();
  await fallar(sesion, ANA, 5);
  const r = await sesion.iniciarSesion(ANA, '');
  assert.strictEqual(r.mensaje, 'Ingrese correo y contraseña.');
});

test('bloqueo: un inicio exitoso pone el contador en 0', async () => {
  const { sesion } = await crearEntornoSesion();
  await fallar(sesion, ANA, 4);
  await sesion.iniciarSesion(ANA, 'clave-de-ana');
  const r = await fallar(sesion, ANA, 4);
  assert.strictEqual(r.mensaje, 'Correo o contraseña incorrectos.');
});

test('bloqueo: el estado persiste en el almacén y otro servicio lo respeta', async () => {
  const { sesion, almacen, reloj, empleados } = await crearEntornoSesion();
  await fallar(sesion, ANA, 5);
  const otro = new ServicioSesion({
    empleados, hash: hashSha256, reloj, almacen,
    notificador: { enviarAvisoBloqueo() {} }, maxIntentos: 5, bloqueoMs: 15 * MINUTO,
  });
  const r = await otro.iniciarSesion(ANA, 'clave-de-ana');
  assert.strictEqual(r.mensaje, 'Cuenta bloqueada por demasiados intentos fallidos.');
});

// --- Almacén de seguridad y buzón de prueba ---
function almacenamientoFalso(inicial) {
  const datos = new Map();
  if (inicial !== undefined) datos.set(AlmacenSeguridadLocal.CLAVE, inicial);
  return {
    datos,
    getItem: (clave) => (datos.has(clave) ? datos.get(clave) : null),
    setItem: (clave, valor) => { datos.set(clave, valor); },
  };
}

test('almacén: JSON corrupto devuelve estado vacío', () => {
  const almacen = new AlmacenSeguridadLocal({ almacenamiento: almacenamientoFalso('{esto no es json') });
  assert.deepStrictEqual(almacen.leer(), {});
});

test('almacén: un valor que no es objeto devuelve estado vacío', () => {
  for (const texto of ['null', '5', '"hola"', '[1,2]']) {
    const almacen = new AlmacenSeguridadLocal({ almacenamiento: almacenamientoFalso(texto) });
    assert.deepStrictEqual(almacen.leer(), {}, texto);
  }
});

test('almacén: sin nada guardado devuelve estado vacío', () => {
  const almacen = new AlmacenSeguridadLocal({ almacenamiento: almacenamientoFalso() });
  assert.deepStrictEqual(almacen.leer(), {});
});

test('almacén: lo guardado lo lee otro almacén sobre el mismo almacenamiento (como tras F5)', () => {
  const almacenamiento = almacenamientoFalso();
  const estado = { 'ana.torres@huellitas.co': { fallos: 5, bloqueadoHasta: 1793361600000 } };
  new AlmacenSeguridadLocal({ almacenamiento }).guardar(estado);
  assert.deepStrictEqual(new AlmacenSeguridadLocal({ almacenamiento }).leer(), estado);
  assert.ok(almacenamiento.datos.has('huellitas:seguridad:v1'));
});

test('almacén: sin localStorage sigue en memoria', () => {
  const almacen = new AlmacenSeguridadLocal({ almacenamiento: null });
  assert.deepStrictEqual(almacen.leer(), {});
  almacen.guardar({ 'x@y.co': { fallos: 2, bloqueadoHasta: null } });
  assert.deepStrictEqual(almacen.leer(), { 'x@y.co': { fallos: 2, bloqueadoHasta: null } });
});

test('almacén: si localStorage lanza error, sigue en memoria', () => {
  const roto = {
    getItem() { throw new Error('bloqueado'); },
    setItem() { throw new Error('bloqueado'); },
  };
  const almacen = new AlmacenSeguridadLocal({ almacenamiento: roto });
  assert.deepStrictEqual(almacen.leer(), {});
  almacen.guardar({ 'x@y.co': { fallos: 1, bloqueadoHasta: null } });
  assert.deepStrictEqual(almacen.leer(), { 'x@y.co': { fallos: 1, bloqueadoHasta: null } });
});

test('buzón: guarda los avisos y los lista como copias', () => {
  const buzon = new BuzonDePrueba();
  assert.deepStrictEqual(buzon.listar(), []);
  const aviso = { para: 'ana.torres@huellitas.co', asunto: 'Aviso de bloqueo de cuenta', fechaHora: '2026-10-30T15:04:05.000Z' };
  buzon.enviarAvisoBloqueo(aviso);
  assert.deepStrictEqual(buzon.listar(), [aviso]);
  buzon.listar()[0].para = 'otro@x.co';
  assert.strictEqual(buzon.listar()[0].para, 'ana.torres@huellitas.co');
});
