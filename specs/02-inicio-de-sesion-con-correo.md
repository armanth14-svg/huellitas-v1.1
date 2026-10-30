# SPEC 02 — Inicio de sesión de empleados con correo

> **Estado:** Borrador
> **Depende de:** —
> **Reemplaza a:** SPEC 01 (queda Obsoleto)
> **Fecha:** 2026-10-30
> **Objetivo:** Que solo un empleado que inicie sesión con su correo y contraseña pueda ver y usar el registro de ingresos, cumpliendo CU-R2, CU-R7, CU-R8, CU-R9 y AD-R1.

## Por qué existe esta spec

La SPEC 01 fue revisada por cinco equipos y una persona (carpeta `hallazgos/`).
Todos encontraron que contradice las reglas del dueño: pedía usuario en vez de correo, bloqueaba con 3 fallos y sin tiempo, quitaba el bloqueo con F5, guardaba contraseñas en texto plano y dejaba fuera la inactividad y "Sin permiso".
La SPEC 01 nunca se implementó, así que esta spec la reemplaza completa en vez de parcharla.
Huellitas sigue sin servidor: el cifrado y la guardia protegen la aplicación, no son seguridad real.

## Alcance

**Entra:**

- CU-R2: inicio de sesión con correo y contraseña; el correo debe tener la forma `usuario@dominio.ext`.
- CU-R7: `js/dominio/empleados.js` guarda solo sal y hash SHA-256 de cada contraseña; ninguna contraseña en texto plano en el código ni en `LEEME.md`.
- CU-R8: bloqueo tras 5 fallos seguidos, durante 15 minutos; el bloqueo y el contador sobreviven a F5 (localStorage).
- CU-R8: aviso de bloqueo con fecha y hora a través de un notificador inyectado; en la app se ve en el panel "Buzón de prueba".
- CU-R9: la sesión se cierra sola tras 30 minutos sin actividad (clic o tecla).
- AD-R1: sin sesión, `index.html#ingresos` muestra la pantalla "Sin permiso"; el formulario y la tabla no se dibujan; `ServicioIngresos` rechaza toda llamada sin sesión.
- Nombre del empleado conectado y botón "Cerrar sesión" en el encabezado.
- Pruebas unitarias en `pruebas/dominio.test.js` con reloj, almacén y notificador falsos.
- `LEEME.md` con los correos de ejemplo, sin contraseñas.

**Fuera de alcance (para futuras specs):**

- Recuperar contraseña por correo (CU-R10) y enlace de un solo uso (CU-R11).
- Cambiar contraseña, su confirmación y longitud al crearla (CU-R3) y cierre de sesiones al cambiarla (CU-R12).
- Envío real de correos (no hay servidor).
- Registrar qué empleado hizo cada ingreso, llegada o entrega.
- Crear, editar o borrar empleados desde la interfaz.
- Persistir la sesión entre recargas.
- Sincronizar sesión o bloqueos entre pestañas en tiempo real.
- Roles o permisos distintos por empleado.

## Modelo de datos

```js
// js/dominio/empleados.js — dato, no lógica (igual que especies.js)
const EMPLEADOS = [
  { correo: 'ana.torres@huellitas.co', nombre: 'Ana Torres', sal: '<16 bytes hex>', hash: '<sha256 hex>' },
  { correo: 'luis.gomez@huellitas.co', nombre: 'Luis Gómez', sal: '<16 bytes hex>', hash: '<sha256 hex>' },
];
// hash = sha256(sal + contrasena) en hexadecimal minúscula.
// Las contraseñas de ejemplo tienen entre 8 y 20 caracteres (CU-R3) y se entregan fuera del repositorio.
```

```js
// js/dominio/ServicioSesion.js
new ServicioSesion({
  empleados: EMPLEADOS,
  hash,          // async (texto) → hex   (js/infraestructura/hashSha256.js)
  reloj,         // { ahora: () => milisegundos }
  almacen,       // { leer: () => estado, guardar: (estado) => void }
  notificador,   // { enviarAvisoBloqueo: ({ para, asunto, fechaHora }) => void }
  maxIntentos: 5,
  bloqueoMs: 15 * 60 * 1000,
  inactividadMs: 30 * 60 * 1000,
});

// Contrato:
// async iniciarSesion(correo, contrasena) → { ok: true, empleado: { correo, nombre } }
//                                          | { ok: false, mensaje }
// cerrarSesion()        → void
// empleadoActual()      → { correo, nombre } | null   (si venció la inactividad, cierra y devuelve null)
// haySesion()           → boolean                     (empleadoActual() !== null)
// registrarActividad()  → void                        (sin efecto si no hay sesión o ya venció)
```

```js
// Estado persistido — localStorage, clave 'huellitas:seguridad:v1'
{
  'ana.torres@huellitas.co': { fallos: 2, bloqueadoHasta: null },
  'x@y.co':                  { fallos: 5, bloqueadoHasta: 1793361600000 },
}
// La sesión NO se persiste: vive en memoria (empleado, ultimaActividad).
```

```js
// Aviso guardado por js/infraestructura/BuzonDePrueba.js (en memoria)
{ para: 'ana.torres@huellitas.co', asunto: 'Aviso de bloqueo de cuenta', fechaHora: '2026-10-30T15:04:05.000Z' }
```

Convenciones:

- Correo normalizado: `trim()` + minúsculas.
- Correo válido: texto antes de la arroba, una sola arroba, dominio con al menos un punto y texto a ambos lados de cada punto.
- Campo vacío: `null`, `undefined`, no texto, o texto de 0 caracteres (el correo, tras recortar).
- La contraseña no se recorta; una contraseña de solo espacios es un intento normal.
- `empleado` devuelto viene de la lista (no de lo escrito) y nunca trae `sal` ni `hash`.

Orden de evaluación de `iniciarSesion` y mensajes exactos:

| # | Caso | Mensaje | ¿Suma al contador? |
|---|---|---|---|
| 1 | Correo o contraseña vacíos (aunque la cuenta esté bloqueada) | `Ingrese correo y contraseña.` | No, ni corta la racha |
| 2 | Correo sin forma válida | `El correo no tiene un formato válido.` | No |
| 3 | Bloqueo vigente (`ahora < bloqueadoHasta`), aun con contraseña correcta | `Cuenta bloqueada por demasiados intentos fallidos.` | No; no alarga el bloqueo ni reenvía aviso |
| 4 | Bloqueo vencido (`ahora >= bloqueadoHasta`) | — se borra el bloqueo, contador a 0 y sigue al paso 5 | — |
| 5 | Correo inexistente o contraseña incorrecta, fallos 1 a 4 | `Correo o contraseña incorrectos.` | Sí |
| 6 | 5.º fallo seguido | `Cuenta bloqueada por demasiados intentos fallidos.` | Sí; fija `bloqueadoHasta = ahora + 15 min` |
| 7 | Correo y contraseña correctos | — `ok: true` | Contador a 0 |

Reglas del contador y la sesión:

- Se cuenta por correo normalizado, exista o no.
- El aviso se envía una sola vez, en el 5.º fallo, y solo si el correo es de un empleado.
- Fronteras: a los 14 min 59 s del bloqueo sigue bloqueada; a los 15 min 0 s ya puede entrar.
- Fronteras: a los 29 min 59 s sin actividad sigue conectada; a los 30 min 0 s se cierra.
- Un inicio exitoso con una sesión abierta la reemplaza.
- Si localStorage no está disponible o tiene datos corruptos, se empieza con estado vacío en memoria.

`ServicioIngresos` recibe además `sesion` (con `haySesion()`).
Sin sesión: `registrar`, `registrarLlegada` y `entregar` devuelven `{ ok: false, mensaje: 'Sin permiso', errores: [] }`, y `listar` devuelve `[]`.

Pantallas (una sola página):

| Situación | Se ve |
|---|---|
| Sin sesión y sin hash | Pantalla de inicio de sesión + panel "Buzón de prueba" |
| Sin sesión y hash `#ingresos` | Pantalla "Sin permiso" con el texto `Sin permiso. Inicie sesión para continuar.` y un enlace a la pantalla de inicio de sesión |
| Con sesión | Formulario y tabla de ingresos; hash `#ingresos`; nombre y "Cerrar sesión" en el encabezado |

## Plan de implementación

1. Crear `js/infraestructura/hashSha256.js` (función `async (texto) → hex` con `globalThis.crypto.subtle`). Agregar su `<script>` en `index.html`. Prueba: el hash de `'abc'` es el valor SHA-256 conocido.
2. Crear `js/dominio/empleados.js` con los dos empleados, cada uno con sal aleatoria y hash precalculado. Agregar su `<script>` antes de los demás del dominio.
3. Crear `js/dominio/ServicioSesion.js` con `iniciarSesion`, `cerrarSesion`, `empleadoActual` y `haySesion`: pasos 1, 2, 5 y 7 de la tabla, sin bloqueo todavía. Agregar su `<script>` tras `ServicioIngresos.js`. Pruebas de éxito, normalización, vacíos, formato, fallo genérico y que `empleado` no trae `sal` ni `hash`.
4. Agregar a `ServicioSesion` el contador, el bloqueo de 15 min y el notificador (pasos 3, 4 y 6) con reloj, almacén y notificador falsos en las pruebas. Pruebas de fronteras 4/5/6 fallos, 14:59/15:00, intentos durante el bloqueo, independencia entre correos y aviso único.
5. Crear `js/infraestructura/AlmacenSeguridadLocal.js` (`leer`/`guardar` sobre `huellitas:seguridad:v1`, con caída a memoria) y `js/infraestructura/BuzonDePrueba.js` (`enviarAvisoBloqueo`, `listar`). Agregar sus `<script>`. Prueba: un almacén con JSON corrupto devuelve estado vacío.
6. Agregar a `ServicioSesion` la inactividad: `registrarActividad` y vencimiento en `empleadoActual`. Pruebas de fronteras 29:59/30:00 y que `registrarActividad` no revive una sesión vencida.
7. Agregar la guardia `sesion` a `ServicioIngresos`. Actualizar la prueba existente que lo construye con `sesion: { haySesion: () => true }`. Pruebas nuevas: sin sesión cada caso de uso devuelve `Sin permiso` y `listar` devuelve `[]`. `node --test` pasa.
8. En `index.html`: pasar el contenido de `main.contenido` a un `<template id="plantilla-ingresos">` (mismos ids); agregar `section#panel-sesion` (`form#formulario-sesion`, `#correo` tipo email, `#contrasena` tipo password, `p#mensaje-sesion`), `section#panel-sin-permiso`, `section#buzon-prueba` y en el encabezado `span#empleado-conectado` y `button#cerrar-sesion`. Estilos mínimos en `css/estilos.css`.
9. Crear `js/ui/VistaSesion.js` (solo DOM): `alIniciar`, `alCerrar`, `mostrarError`, `limpiarMensaje`, `mostrarConectado`, `mostrarDesconectado`, `mostrarSinPermiso`, `mostrarBuzon`. Agregar su `<script>` antes de `app.js`.
10. En `js/app.js`: crear reloj, almacén, buzón, `ServicioSesion` y pasar `sesion` a `ServicioIngresos`. Al iniciar con éxito: clonar la plantilla en `main`, crear `VistaFormulario` y `VistaIngresos`, poner `#ingresos`. Al cerrar (botón o inactividad): vaciar `main`, limpiar campos y mensaje, quitar el hash. Escuchar `click` y `keydown` para `registrarActividad`, `hashchange` para "Sin permiso", y revisar `empleadoActual()` cada segundo.
11. Actualizar `LEEME.md`: correos de ejemplo sin contraseñas, que las contraseñas las entrega el docente, que se necesita Node 19 o superior para `node --test`, y que borrar los datos del sitio quita los bloqueos.

## Criterios de aceptación

- [ ] Al abrir `index.html` se ven la pantalla de inicio de sesión y el "Buzón de prueba"; el formulario y la tabla no existen en el documento (`document.getElementById('formulario-ingreso')` es `null`).
- [ ] Abrir `index.html#ingresos` sin sesión muestra `Sin permiso. Inicie sesión para continuar.`
- [ ] `ana.torres@huellitas.co` con su contraseña inicia sesión y muestra "Ana Torres" en el encabezado.
- [ ] `  ANA.TORRES@Huellitas.co  ` con su contraseña también inicia sesión y el empleado devuelto tiene correo `ana.torres@huellitas.co`.
- [ ] `ana` o `ana@huellitas` muestran `El correo no tiene un formato válido.` y no suman al contador.
- [ ] Correo o contraseña vacíos muestran `Ingrese correo y contraseña.`, aun con la cuenta bloqueada, y no suman.
- [ ] Un correo inexistente y una contraseña incorrecta muestran el mismo mensaje `Correo o contraseña incorrectos.`
- [ ] Con 4 fallos seguidos y luego la contraseña correcta, entra.
- [ ] El 5.º fallo seguido muestra `Cuenta bloqueada por demasiados intentos fallidos.` y aparece un único aviso en el "Buzón de prueba" con el correo y la fecha y hora.
- [ ] A los 14 min 59 s del bloqueo no entra con la contraseña correcta; a los 15 min 0 s sí entra (prueba con reloj falso).
- [ ] Los intentos durante el bloqueo no alargan el bloqueo ni crean otro aviso.
- [ ] Tras el bloqueo, recargar con F5 no lo quita.
- [ ] Bloquear a `ana.torres@huellitas.co` no impide que `luis.gomez@huellitas.co` inicie sesión.
- [ ] A los 29 min 59 s sin clic ni tecla la sesión sigue abierta; a los 30 min 0 s se cierra y se ve la pantalla de inicio de sesión con campos y mensaje vacíos (prueba con reloj falso).
- [ ] Sin sesión, `ServicioIngresos.registrar`, `registrarLlegada` y `entregar` devuelven `Sin permiso` y `listar` devuelve `[]`.
- [ ] "Cerrar sesión" quita el formulario y la tabla del documento y deja los campos y el mensaje vacíos.
- [ ] Tras cerrar sesión y volver a entrar, los ingresos registrados antes siguen en la tabla.
- [ ] Buscar `Huellitas2026` y `Guarderia#1` en el repositorio no da resultados fuera de `hallazgos/` y `specs/01-…`.
- [ ] `node --test` pasa, incluidas las pruebas nuevas.
- [ ] Tras recorrer en orden los criterios anteriores en el navegador, la consola no muestra errores.

## Decisiones

- **Sí:** correo como identificador (CU-R2). Lo señalaron los seis informes de hallazgos.
- **No:** nombre de usuario. Contradice CU-R2.
- **Sí:** la SPEC 02 reemplaza a la 01, que pasa a Obsoleto. La 01 nunca se implementó y se conserva como lo revisaron los equipos.
- **Sí:** SHA-256 con sal por empleado vía Web Crypto (CU-R7). Es nativo en navegador y en Node 19+, sin instalar nada.
- **No:** PBKDF2. Excesivo sin servidor y lento en pruebas.
- **No:** SHA-256 sin sal. Dos claves iguales darían el mismo hash.
- **Sí:** `iniciarSesion` es asíncrono. Lo exige Web Crypto.
- **Sí:** `LEEME.md` solo con correos; las contraseñas las entrega el docente.
- **Sí:** 5 fallos y 15 minutos con reloj inyectado (CU-R8). Permite probar las fronteras sin esperar.
- **Sí:** localStorage solo para fallos y bloqueos, con clave versionada `huellitas:seguridad:v1`. Así F5 no quita el bloqueo.
- **No:** persistir la sesión. Los ingresos se borran al recargar y una sesión que sobrevive confundiría.
- **Sí:** notificador inyectado y "Buzón de prueba" visible. Sin servidor no se envían correos, pero el aviso se puede verificar.
- **No:** solo `console.log`. Choca con el criterio de consola sin errores y obliga a abrirla.
- **Sí:** actividad = cualquier clic o tecla (CU-R9).
- **No:** contar solo acciones de negocio. Escribir un ingreso largo cerraría la sesión.
- **Sí:** ruta `#ingresos`, contenido en `<template>` y guardia en `ServicioIngresos` (AD-R1). Sin sesión el contenido no existe en el documento y el servicio no responde.
- **Sí:** reglas finas del Equipo 1 (hallazgos 7–13): vacíos primero, vacíos no suman ni cortan la racha, contraseña de espacios sí cuenta, empleado devuelto de la lista, nuevo inicio reemplaza la sesión.
- **Sí:** el contador cuenta correos inexistentes; el aviso solo va a correos de empleados. No revela qué correos existen y no hay a quién avisar.
- **No:** recuperación y cambio de contraseña (CU-R3 confirmación, CU-R10, CU-R11, CU-R12). Son un flujo completo aparte; van en otra spec.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `crypto.subtle` no disponible al abrir con `file://` en algún navegador | Chrome, Edge y Firefox tratan `file://` como contexto seguro. Si falla, el login muestra un error y se documenta en `LEEME.md`. |
| `node --test` en Node anterior a 19 no trae `globalThis.crypto` | `LEEME.md` pide Node 19 o superior. |
| Borrar los datos del sitio quita los bloqueos | Aceptado: límite de una página sin servidor. Documentado en `LEEME.md`. |
| El hash y la sal se ven en el código fuente | Aceptado: protege la contraseña en texto, no es seguridad real. Dicho en "Por qué existe esta spec". |
| Mover el contenido a `<template>` rompe las pruebas manuales de la práctica | Los ids del formulario y la tabla no cambian. |
| Cambiar el constructor de `ServicioIngresos` rompe la prueba existente | El paso 7 actualiza esa prueba en el mismo commit. |

## Lo que **no** está en esta spec

- Recuperar contraseña (CU-R10, CU-R11).
- Cambiar contraseña, su confirmación y el cierre de sesiones al cambiarla (CU-R3, CU-R12).
- Envío real de correos.
- Autoría de los ingresos.
- Gestión de empleados desde la interfaz.
- Sesión persistente o compartida entre pestañas.
- Roles y permisos.
