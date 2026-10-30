# Hallazgos del Equipo 2

**Spec revisado:** specs/01-inicio-de-sesion-empleados.md
**Integrantes:**
- Sebastian Daza 
- Juan Sebastian Rodriguez
- Juan Camilo Leal 
- Alex Duvan Hernandez
- Edwar Julian Cabra

## 1. Reglas que el spec omite, cambia o inventa

| Regla | Qué dice el spec | Qué debería decir |
|---|---|---|
| CU-R2 | El empleado entra con un «usuario» como ana o luis; no pide ni valida la forma de un correo | El correo tiene la forma usuario@dominio.ext: texto antes de la arroba, una sola arroba, un dominio con al menos un punto y texto a los dos lados del punto |
| CU-R8 (datos de entrada) | «Pantalla de inicio de sesión con campos usuario y contraseña» | Iniciar sesión con correo y contraseña |
| CU-R8 (número de intentos) | «Bloqueo de un usuario tras 3 intentos fallidos seguidos» (maxIntentos: 3) | Con 5 intentos fallidos seguidos la cuenta queda bloqueada |
| CU-R8 (duración del bloqueo) | «Bloqueo temporal por tiempo o desbloqueo manual» está fuera de alcance; el bloqueo no termina nunca mientras no se recargue la página | La cuenta queda bloqueada 15 minutos y después se puede volver a intentar |
| CU-R8 (correo de aviso) | No dice nada del correo de aviso | Al bloquear se envía un correo de aviso con fecha y hora; como Huellitas no tiene servidor, el spec debe decir cómo se cumple o declarar que no se cumple |
| CU-R9 | «Expiración de la sesión por inactividad» está fuera de alcance | La sesión se cierra sola tras 30 minutos sin actividad |
| CU-R7 | Las contraseñas están en texto plano en js/dominio/empleados.js y en LEEME.md; «Contraseñas en hash» está fuera de alcance | La contraseña se guarda cifrada y nunca se muestra ni se devuelve |
| CU-R3 | No define largo de contraseña ni confirmación | Contraseña de 8 a 20 caracteres, ambos incluidos; la confirmación debe coincidir |
| CU-R12 | No dice qué pasa con las sesiones al cambiar la contraseña | Al cambiar la contraseña se cierran todas las sesiones activas de ese usuario |
| CU-R10 | No existe «Recuperar contraseña» | El usuario escribe su correo; si está registrado recibe un enlace válido por 30 minutos; el mensaje en pantalla es el mismo exista o no el correo |
| CU-R11 | No existe la pantalla de nueva contraseña | El enlace lleva a nueva contraseña y confirmación con las reglas de CU-R3; cada enlace sirve una sola vez |
| AD-R1 | Sin sesión solo se ocultan el formulario y la tabla de ingresos; no hay pantalla «Sin permiso» | Quien escribe la dirección de una página sin haber iniciado sesión ve la pantalla «Sin permiso» |
| Ninguna regla (el spec lo inventa) | «Al recargar la página todo se reinicia (sesión, contadores y bloqueos)» | Ninguna regla lo pide y contradice CU-R8: recargar no debe quitar el bloqueo de 15 minutos |
| Ninguna regla (el spec lo inventa) | El usuario se compara sin mayúsculas y sin espacios, y los campos vacíos no cuentan como intento fallido | Preguntar al dueño: ninguna regla define si un intento con campos vacíos cuenta como fallido |

## 2. Casos de frontera

| Dato | Justo antes | Exacto | Justo después | ¿Lo dice el spec? |
|---|---|---|---|---|
| Intentos fallidos seguidos para bloquear (CU-R8: 5) | 4 fallos → no hay bloqueo y el siguiente intento con contraseña correcta entra | 5 fallos → cuenta bloqueada 15 min y correo de aviso | 6.º intento con contraseña correcta → sigue bloqueada, no entra | No: dice 3, no 5 |
| Intentos fallidos seguidos según el spec (3), para contrastar | 2 fallos → «Usuario o contraseña incorrectos.» | 3 fallos → «Usuario bloqueado por demasiados intentos fallidos.» | 4.º intento con contraseña correcta → bloqueado | Sí, pero con un valor distinto al de la regla |
| Contador tras un inicio exitoso (CU-R8) | 4 fallos, éxito y 4 fallos más → no se bloquea porque el contador se reinició | 4 fallos, éxito y 5 fallos más → se bloquea en el 5.º de la segunda tanda | 4 fallos, éxito, 5 fallos y un intento más → sigue bloqueada | Parcial: dice que reinicia, pero con el límite de 3 |
| Duración del bloqueo (CU-R8: 15 min) | 14 min 59 s después del bloqueo → sigue bloqueada | 15 min 00 s → el bloqueo ya se cumplió y puede intentar (la regla no precisa el instante exacto; el spec debe decirlo) | 15 min 01 s → puede iniciar sesión con la contraseña correcta | No: el bloqueo no tiene tiempo |
| Inactividad de la sesión (CU-R9: 30 min) | 29 min 59 s sin actividad → la sesión sigue abierta | 30 min 00 s → la sesión se cierra (la regla no precisa el instante exacto; el spec debe decirlo) | 30 min 01 s → sesión cerrada y se ve el inicio de sesión | No: la expiración está fuera de alcance |
| Largo mínimo de contraseña (CU-R3: 8) | 7 caracteres → rechazada | 8 caracteres → aceptada | 9 caracteres → aceptada | No |
| Largo máximo de contraseña (CU-R3: 20) | 19 caracteres → aceptada | 20 caracteres → aceptada | 21 caracteres → rechazada | No |
| Vigencia del enlace de recuperación (CU-R10: 30 min) | 29 min 59 s → el enlace permite cambiar la contraseña | 30 min 00 s → el enlace vence (la regla no precisa el instante exacto; el spec debe decirlo) | 30 min 01 s → enlace vencido, no permite cambiar | No: el spec no tiene recuperación |
| Usos del enlace de recuperación (CU-R11: una sola vez) | Enlace sin usar → permite cambiar la contraseña | 1.er uso → la contraseña cambia | 2.º uso del mismo enlace → rechazado | No |
| Cantidad de arrobas en el correo (CU-R2: una sola) | ana.huellitas.co (0 arrobas) → inválido | ana@huellitas.co (1 arroba) → válido | ana@@huellitas.co (2 arrobas) → inválido | No: acepta ana como usuario |
| Puntos en el dominio del correo (CU-R2: al menos uno) | ana@huellitas (0 puntos) → inválido | ana@huellitas.co (1 punto) → válido | ana@mail.huellitas.co (2 puntos) → válido | No |

## 3. Hallazgos

Tipos: Ambigua · Le falta información · Se contradice · No se puede verificar

| # | Frase del spec | Tipo | Caso que lo demuestra | Cambio propuesto |
|---|---|---|---|---|
| 1 | «Bloqueo de un usuario tras 3 intentos fallidos seguidos» | Se contradice (CU-R8) | El usuario ana falla 3 veces y escribe bien la contraseña en el 4.º intento: el spec la bloquea; la regla dice que todavía no está bloqueada y debe entrar | «Bloqueo de un usuario tras 5 intentos fallidos seguidos» (maxIntentos: 5) |
| 2 | «Tercer fallo y cualquier intento posterior de ese usuario, aunque la contraseña sea correcta» y «Bloqueo temporal por tiempo o desbloqueo manual» (fuera de alcance) | Se contradice (CU-R8) | Cuenta bloqueada: a los 15 min 01 s, con la contraseña correcta, el spec sigue bloqueando; la regla dice que ya entra | «El bloqueo dura 15 minutos contados desde el 5.º fallo; pasado ese tiempo el usuario puede iniciar sesión con la contraseña correcta» |
| 3 | «Al recargar la página todo se reinicia (sesión, contadores y bloqueos)» | Se contradice (CU-R8) | Un usuario con 5 fallos recarga la página con F5 y vuelve a intentar: el spec lo deja intentar sin límite; la regla dice que sigue bloqueado 15 minutos | «Recargar la página no quita el bloqueo: el bloqueo y su hora de inicio se conservan hasta que pasen los 15 minutos» |
| 4 | «Pantalla de inicio de sesión con campos usuario y contraseña» | Se contradice (CU-R2 y CU-R8) | Escribir ana@huellitas.co con la contraseña correcta: el spec responde «Usuario o contraseña incorrectos.»; la regla pide correo y debe entrar. Escribir solo ana: el spec entra; la regla lo rechaza por no tener forma de correo | «El inicio de sesión pide correo y contraseña; el correo debe tener la forma usuario@dominio.ext, si no, se rechaza sin contar como intento» |
| 5 | «Bloqueo de un usuario tras 3 intentos fallidos seguidos» (no dice nada del correo de aviso) | Le falta información (CU-R8) | En el 5.º fallo no se puede escribir el resultado esperado: ¿se envía el aviso con fecha y hora? Huellitas no tiene servidor y el spec no lo aclara | «Al bloquear, la pantalla muestra un aviso con la fecha y la hora del bloqueo; el envío real de correo queda fuera de alcance porque Huellitas no tiene servidor» |
| 6 | «Expiración de la sesión por inactividad» (fuera de alcance) | Se contradice (CU-R9) | Sesión abierta y 30 min 00 s sin actividad: el spec la deja abierta; la regla la cierra. Tampoco dice qué es «actividad» (un clic, una tecla, mover el mouse) | «La sesión se cierra sola a los 30 minutos sin actividad; actividad es cualquier clic o tecla; a los 29 min 59 s sigue abierta y a los 30 min 00 s se cierra» |
| 7 | «Contraseñas en hash» (fuera de alcance) y «Credenciales de ejemplo documentadas en LEEME.md» | Se contradice (CU-R7) | Abrir js/dominio/empleados.js o LEEME.md: se lee la contraseña Huellitas2026 en texto plano | «La contraseña se guarda cifrada y no aparece en texto plano ni en el código ni en LEEME.md ni en ningún valor devuelto» |
| 8 | «Mientras no haya sesión, el formulario y la tabla de ingresos están ocultos» | Ambigua (AD-R1) | Sin sesión, escribir la dirección de otra página de la aplicación: el spec no dice si ve «Sin permiso», el inicio de sesión o una página vacía | «Quien abra la dirección de cualquier página de la aplicación sin haber iniciado sesión ve la pantalla «Sin permiso», salvo la pantalla de inicio de sesión» |
| 9 | «Mientras no haya sesión, el formulario y la tabla de ingresos están ocultos» | No se puede verificar | Sin sesión, abrir las herramientas del navegador: la tabla existe con display none, y el spec no dice si eso es «oculta» o debe no existir en el documento | «Sin sesión, la tabla de ingresos y el formulario no están en el documento: document.querySelector del elemento devuelve null» |
| 10 | «Crear, editar o borrar empleados desde la interfaz» (fuera de alcance) y la lista fija de empleados | Le falta información (CU-R3 y CU-R12) | Contraseña de 8 caracteres y de 21: no se puede escribir si se acepta o se rechaza, ni qué pasa con las sesiones al cambiarla | «La contraseña tiene entre 8 y 20 caracteres y requiere confirmación; al cambiarla se cierran todas las sesiones activas de ese usuario» |
| 11 | No existe en el spec (falta «Recuperar contraseña») | Le falta información (CU-R10 y CU-R11) | Escribir un correo no registrado y uno registrado: no hay resultado esperado, y la regla pide el mismo mensaje en ambos casos | «Si el correo está registrado, recibirá un enlace en unos minutos» (mismo mensaje exista o no el correo); el enlace vale 30 minutos y un solo uso |

## 4. Una línea de código que la IA podría escribir mal

Nuestro hallazgo: el número 1 (intentos fallidos para bloquear, CU-R8).
- Cumple: `if (this.fallos[usuario] >= 5) { bloquear(usuario); }`
- No cumple: `if (this.fallos[usuario] > 5) { bloquear(usuario); }` (o `>= 3`, como dice el spec tal como salió)
- El caso que las distingue: usuario con 5 fallos seguidos exactos y luego la contraseña correcta: la versión que cumple lo bloquea; la que no cumple lo deja entrar
