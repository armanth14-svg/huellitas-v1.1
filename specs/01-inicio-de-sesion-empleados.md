# SPEC 01 — Inicio de sesión de empleados

> **Estado:** Borrador
> **Depende de:** —
> **Fecha:** 2026-10-28
> **Objetivo:** Que solo un empleado de la guardería que inicie sesión con usuario y contraseña pueda ver y usar el registro de ingresos.

## Por qué existe esta spec

Huellitas es una página estática sin servidor.
Por eso el control de acceso vive en el navegador y los usuarios están en el código fuente.
Es un control de acceso de la aplicación (requisito funcional que se puede probar), no seguridad real.

## Alcance

**Entra:**

- Pantalla de inicio de sesión con campos usuario y contraseña, visible al abrir `index.html`.
- Lista fija de empleados en `js/dominio/empleados.js`.
- Servicio de sesión en el dominio: iniciar sesión, cerrar sesión, empleado actual, contador de intentos fallidos.
- Bloqueo de un usuario tras 3 intentos fallidos seguidos.
- Mientras no haya sesión, el formulario y la tabla de ingresos están ocultos.
- Nombre del empleado conectado en el encabezado.
- Botón "Cerrar sesión".
- Pruebas unitarias del servicio de sesión en `pruebas/dominio.test.js`.
- Credenciales de ejemplo documentadas en `LEEME.md`.

**Fuera de alcance (para futuras specs):**

- Registrar qué empleado hizo cada ingreso, llegada o entrega (SPEC 02).
- Crear, editar o borrar empleados desde la interfaz.
- Contraseñas en hash.
- Persistir la sesión entre recargas (sessionStorage/localStorage).
- Expiración de la sesión por inactividad.
- Bloqueo temporal por tiempo o desbloqueo manual.
- Roles o permisos distintos por empleado.

## Modelo de datos

```js
// js/dominio/empleados.js — dato, no lógica (igual que especies.js)
const EMPLEADOS = [
  { usuario: 'ana',  nombre: 'Ana Torres', contrasena: 'Huellitas2026' },
  { usuario: 'luis', nombre: 'Luis Gómez', contrasena: 'Guarderia#1' },
];
```

```js
// js/dominio/ServicioSesion.js — estado interno (en memoria)
new ServicioSesion({ empleados: EMPLEADOS, maxIntentos: 3 });
// this.empleadoActual = null | { usuario, nombre }
// this.fallos = { [usuarioNormalizado]: numero }

// Contrato:
// iniciarSesion(usuario, contrasena) → { ok: true, empleado: { usuario, nombre } }
//                                     | { ok: false, mensaje }
// cerrarSesion()                     → void
// empleadoActual()                   → { usuario, nombre } | null
```

Convenciones:

- Usuario normalizado: `String(usuario).trim().toLowerCase()`.
- La contraseña se compara exacta: distingue mayúsculas y no se recorta.
- `empleado` devuelto nunca incluye la contraseña.

Mensajes exactos:

| Caso | Mensaje | ¿Cuenta como fallo? |
|---|---|---|
| Usuario o contraseña vacíos (tras recortar el usuario) | `Ingrese usuario y contraseña.` | No |
| Usuario inexistente o contraseña incorrecta (fallos 1 y 2) | `Usuario o contraseña incorrectos.` | Sí |
| Tercer fallo y cualquier intento posterior de ese usuario, aunque la contraseña sea correcta | `Usuario bloqueado por demasiados intentos fallidos.` | — |

Reglas del contador:

- Se cuenta por usuario normalizado, exista o no.
- Un inicio de sesión correcto antes de llegar a 3 pone el contador de ese usuario en 0.
- Los fallos de un usuario no afectan a otro.
- Al recargar la página todo se reinicia (sesión, contadores y bloqueos).

## Plan de implementación

1. Crear `js/dominio/empleados.js` con `EMPLEADOS` y el wrapper `exportar`. Agregar su `<script>` en `index.html` antes de los demás del dominio.
2. Crear `js/dominio/ServicioSesion.js` con `iniciarSesion`, `cerrarSesion` y `empleadoActual` según el contrato. Agregar su `<script>` en `index.html` tras `ServicioIngresos.js`.
3. Agregar en `pruebas/dominio.test.js` los `require` y pruebas del servicio: éxito, normalización del usuario, contraseña sensible a mayúsculas, vacíos, fallos 1–2, bloqueo en el 3.º, bloqueo con contraseña correcta, reinicio del contador tras éxito, independencia entre usuarios, cerrar sesión. `node --test` pasa.
4. En `index.html`: agregar `<section id="panel-sesion">` con `form#formulario-sesion` (inputs `#usuario`, `#contrasena` tipo password, botón "Iniciar sesión", `p#mensaje-sesion`). Agregar en el encabezado `span#empleado-conectado` y `button#cerrar-sesion`, ocultos. Poner `hidden` en `main.contenido`. Estilos mínimos en `css/estilos.css`.
5. Crear `js/ui/VistaSesion.js` (solo DOM): `alIniciar(manejador)`, `alCerrar(manejador)`, `mostrarError(mensaje)`, `mostrarConectado(empleado)`, `mostrarDesconectado()`. Agregar su `<script>` en `index.html` antes de `app.js`.
6. En `js/app.js`: crear `ServicioSesion` y `VistaSesion`, conectar iniciar/cerrar. Al iniciar con éxito: ocultar el panel de sesión, mostrar `main.contenido`, el nombre y el botón. Al cerrar: lo inverso, limpiar los campos de usuario y contraseña. Los ingresos en memoria no se borran al cerrar sesión.
7. Documentar en `LEEME.md` los dos usuarios de ejemplo y que al recargar hay que volver a iniciar sesión.

## Criterios de aceptación

- [ ] Al abrir `index.html` solo se ve la pantalla de inicio de sesión; el formulario y la tabla de ingresos no están visibles.
- [ ] `ana` / `Huellitas2026` inicia sesión y muestra "Ana Torres" en el encabezado.
- [ ] `  ANA  ` / `Huellitas2026` también inicia sesión.
- [ ] `ana` / `huellitas2026` es rechazado con `Usuario o contraseña incorrectos.`
- [ ] Un usuario inexistente es rechazado con el mismo mensaje que una contraseña incorrecta.
- [ ] Usuario o contraseña vacíos muestran `Ingrese usuario y contraseña.` y no suman al contador.
- [ ] El 3.er fallo seguido de un usuario muestra `Usuario bloqueado por demasiados intentos fallidos.`
- [ ] Tras el bloqueo, ese usuario no entra ni con la contraseña correcta.
- [ ] Bloquear a `ana` no impide que `luis` inicie sesión.
- [ ] Dos fallos seguidos de un inicio correcto dejan el contador en 0 (después hacen falta 3 fallos nuevos para bloquear).
- [ ] "Cerrar sesión" vuelve a la pantalla de inicio de sesión con los campos vacíos y oculta el formulario y la tabla.
- [ ] Tras cerrar sesión y volver a entrar, los ingresos registrados antes siguen en la tabla.
- [ ] Al recargar (F5) se vuelve a pedir inicio de sesión y los bloqueos desaparecen.
- [ ] `node --test` pasa, incluidas las pruebas nuevas de `ServicioSesion`.
- [ ] No hay errores en la consola del navegador.

## Decisiones

- **Sí:** lista fija en `js/dominio/empleados.js`, inyectada por constructor como `especies.js`. Encaja con la arquitectura y se prueba en Node.
- **No:** contraseñas en hash con Web Crypto. Vuelve el login asíncrono y complica las pruebas; no aporta seguridad real sin servidor.
- **No:** gestión de empleados desde la interfaz. Es otra funcionalidad completa.
- **Sí:** sesión solo en memoria. Coherente con los ingresos, que también se borran al recargar.
- **No:** sessionStorage. La sesión sobreviviría a F5 pero los ingresos no, lo que confunde.
- **Sí:** mensaje genérico para usuario inexistente y contraseña incorrecta. No revela qué usuarios existen.
- **Sí:** el contador también cuenta usuarios inexistentes. Así el bloqueo tampoco revela si el usuario existe.
- **Sí:** bloqueo tras 3 fallos seguidos, hasta recargar.
- **No:** bloqueo temporal. Introduce tiempo y obliga a inyectar un reloj.
- **Sí:** usuario sin distinguir mayúsculas y recortado; contraseña exacta.
- **Sí:** campos vacíos no cuentan como fallo. Es un error de captura, no un intento.
- **Sí:** cerrar sesión no borra los ingresos en memoria.
- **No:** autoría de los ingresos en esta spec. Cambia el modelo de ingresos; va en la SPEC 02.
- **No:** proteger `ServicioIngresos` contra llamadas sin sesión. Sin servidor, la protección es de interfaz; se acepta.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Las contraseñas se ven en el código fuente y en `LEEME.md` | Aceptado: es una app didáctica sin servidor. Documentado en "Por qué existe esta spec". |
| Recargar la página quita el bloqueo | Aceptado y documentado; el bloqueo persistente queda fuera de alcance. |
| Desde la consola del navegador se puede mostrar `main.contenido` sin iniciar sesión | Aceptado: el control es de la interfaz. |
| Cambiar el encabezado o `main` rompe las pruebas manuales existentes de la práctica | Los ids actuales del formulario y la tabla no cambian. |

## Lo que **no** está en esta spec

- Registro de qué empleado hizo cada ingreso (SPEC 02).
- Gestión de empleados desde la interfaz.
- Contraseñas en hash.
- Sesión persistente o con expiración.
- Bloqueo temporal o desbloqueo manual.
- Roles y permisos.
