# Hallazgos del Equipo 5

**Spec revisado:** spec.md
**Integrantes:**
- Julian Bocanegra
- Oscar Gonzalez
- Diego Gil
- Sebastian Zarate
- Jhon Castro
- Juan José Forero

> Archivo unido por el docente: el equipo subió dos entregas distintas (Julián Bocanegra y Juan José Forero). Las filas del final de cada tabla, y los hallazgos 17 a 23, vienen de la entrega de Juan José Forero.

## 1. Reglas que el spec omite, cambia o inventa

| Regla | Qué dice el spec | Qué debería decir |
|---|---|---|
| CU-R2 Correo con forma usuario@dominio.ext | Inicia sesión con «usuario» (`ana`, `luis`), sin arroba ni dominio | Campo de correo con forma usuario@dominio.ext, o declarar que el usuario no es un correo y CU-R2 no aplica |
| CU-R3 Contraseña de 8 a 20 caracteres y confirmación | No define longitud ni confirmación | Entre 8 y 20 caracteres; si la contraseña se crea o cambia, pedir confirmación. Si las contraseñas son fijas en el código, declararlo |
| CU-R7 La contraseña se guarda cifrada y nunca se muestra | `contrasena: 'Huellitas2026'` en texto plano en `js/dominio/empleados.js`; «Contraseñas en hash» queda fuera de alcance | Excepción explícita: en esta versión no se cumple y el dueño la acepta |
| CU-R7 La contraseña nunca se muestra | `LEEME.md` documentará las credenciales de ejemplo (`Credenciales de ejemplo documentadas en LEEME.md`) | Documentar solo usuarios, sin contraseñas |
| CU-R8 Bloqueo tras 5 intentos fallidos | Bloqueo tras 3 intentos (`maxIntentos: 3`) | Bloqueo tras 5 intentos fallidos seguidos (`maxIntentos: 5`) |
| CU-R8 Bloqueo de 15 minutos | «Bloqueo temporal por tiempo o desbloqueo manual» queda fuera de alcance: el bloqueo dura hasta recargar | Bloqueo de 15 minutos desde el quinto fallo |
| CU-R8 Aviso por correo con fecha y hora | No aparece | Declarar que no se cumple: una página sin servidor no envía correos |
| CU-R8 Un inicio correcto reinicia el contador | Sí lo dice, pero «Al recargar la página todo se reinicia (sesión, contadores y bloqueos)» anula el bloqueo | El bloqueo debe sobrevivir a la recarga, o declarar la excepción |
| CU-R9 Cierre por 30 minutos de inactividad | «Expiración de la sesión por inactividad» queda fuera de alcance | Cerrar sesión tras 30 minutos sin actividad (factible con un temporizador en el navegador), o declarar la exclusión con su motivo |
| CU-R10 Recuperar contraseña por correo (enlace de 30 minutos) | No aparece en el spec, ni dentro ni fuera de alcance | Declarar fuera de alcance: no hay servidor ni correo |
| CU-R11 Enlace de un solo uso | No aparece | Declarar fuera de alcance |
| CU-R12 Cambio de contraseña cierra las sesiones | No aparece | Declarar fuera de alcance, porque no hay cambio de contraseña |
| AD-R1 Sin sesión, «Sin permiso» al entrar a una página | Solo oculta el formulario y la tabla dentro de `index.html`; no hay pantalla «Sin permiso» | Pantalla «Sin permiso» al entrar sin sesión, y la tabla no se llena sin sesión |
| CU-R2 y CU-R8 | «Contrato: iniciarSesion(usuario, contrasena)» y el modelo usa el campo `usuario` con valores como `ana` y `luis`. | El inicio de sesión debe solicitar un correo con forma `usuario@dominio.ext`, con una sola arroba, dominio con al menos un punto y texto a ambos lados del punto. |
| CU-R3 | El SPEC no define creación ni restablecimiento de contraseñas; solo compara la contraseña recibida exactamente. | Al crear o restablecer una contraseña, debe tener entre 8 y 20 caracteres, ambos incluidos, y la confirmación debe coincidir. Esta regla no obliga a validar esa longitud en el formulario de inicio de sesión. |
| CU-R7 | «{ usuario: 'ana', nombre: 'Ana Torres', contrasena: 'Huellitas2026' }» y «Las credenciales de ejemplo [quedan] documentadas en `LEEME.md`». | La contraseña debe guardarse cifrada y nunca mostrarse ni devolverse. En una página estática que entrega las credenciales y la lógica al navegador no se puede cumplir una protección real de contraseña; el SPEC debe declarar esa limitación o cambiar la arquitectura. |
| CU-R8 | «Bloqueo de un usuario tras 3 intentos fallidos seguidos» y «cualquier intento posterior [...] aunque la contraseña sea correcta» queda bloqueado sin duración indicada. | Con 5 intentos fallidos seguidos, la cuenta debe bloquearse durante 15 minutos. Un inicio exitoso reinicia el contador. Durante el bloqueo debe enviarse un correo de aviso con fecha y hora. |
| CU-R9 | «Expiración de la sesión por inactividad» está fuera de alcance. | La sesión debe cerrarse automáticamente tras 30 minutos sin actividad. |
| AD-R1 | «Mientras no haya sesión, el formulario y la tabla de ingresos están ocultos». No se especifica qué ocurre al escribir directamente la dirección de otra página. | Solo quien inició sesión puede entrar a las páginas de la aplicación; una dirección accedida sin sesión debe mostrar «Sin permiso». |
| CU-R10 y CU-R11 | «Crear, editar o borrar empleados desde la interfaz» y «Contraseñas en hash» están fuera de alcance; no hay recuperación de contraseña. | La recuperación debe aceptar el correo y mostrar el mismo mensaje exista o no: «Si el correo está registrado, recibirá un enlace en unos minutos». El enlace debe durar 30 minutos. La nueva contraseña y su confirmación deben cumplir CU-R3 y el enlace debe servir una sola vez. Su exclusión es explícita y legítima para esta spec, pero queda pendiente para una spec posterior. |
| CU-R12 | No se define cambio de contraseña ni qué ocurre con sesiones activas cuando cambia una contraseña. | Al cambiar la contraseña, deben cerrarse todas las sesiones activas de ese usuario. Su exclusión es explícita y legítima para esta spec, pero queda pendiente para una spec posterior. |

## 2. Casos de frontera

| Dato | Justo antes | Exacto | Justo después | ¿Lo dice el spec? |
|---|---|---|---|---|
| CU-R8: fallos seguidos de un usuario | 4 fallos → «Usuario o contraseña incorrectos.», cuenta abierta | 5.º fallo → «Usuario bloqueado por demasiados intentos fallidos.» | 6.º intento con contraseña correcta → sigue bloqueada | No: el spec bloquea en el 3.º fallo |
| CU-R8: tiempo de bloqueo | 14 min → sigue bloqueada | 15 min → ¿libre o bloqueada? La regla no lo dice | 16 min → libre con contraseña correcta | No: el spec no libera nunca (solo al recargar) |
| CU-R9: inactividad | 29 min → sesión activa | 30 min → ¿cerrada? La regla dice «tras 30 minutos» | 31 min → sesión cerrada | No: está fuera de alcance |
| CU-R10: enlace de recuperación | 29 min → enlace válido | 30 min → ¿válido? La regla no lo dice | 31 min → enlace vencido | No: no hay recuperación |
| CU-R3: longitud mínima de contraseña | 7 caracteres → rechazada | 8 caracteres → aceptada | 9 caracteres → aceptada | No: no define longitud |
| CU-R3: longitud máxima de contraseña | 19 caracteres → aceptada | 20 caracteres → aceptada | 21 caracteres → rechazada | No: no define longitud |
| CU-R2: forma del correo | `ana@guarderia` (sin punto en el dominio) → rechazado | `ana@guarderia.co` → aceptado | `ana@.co` → rechazado | No: usa usuario, no correo |
| CU-R3: contraseña de creación o restablecimiento | 7 caracteres → inválida | 8 caracteres → válida | 9 caracteres → válida | No. El SPEC no incluye creación ni restablecimiento; CU-R3 no necesariamente aplica al formulario de inicio de sesión. |
| CU-R3: contraseña de creación o restablecimiento | 19 caracteres → válida | 20 caracteres → válida | 21 caracteres → inválida | No. El resultado se conoce por CU-R3, pero el SPEC no define esos casos ni esos flujos. |
| CU-R8: cuarto intento fallido seguido | 3 fallos previos → el cuarto fallo incrementa el contador a 4; aún no alcanza el umbral oficial de bloqueo | No aplica: el umbral oficial es 5 | 5 fallos acumulados → cuenta bloqueada durante 15 minutos y se envía aviso con fecha y hora | No. El SPEC bloquea tras 3, por lo que produciría un resultado distinto en el cuarto intento. |
| CU-R8: quinto intento fallido seguido | 4 fallos previos → todavía se permite el quinto intento | 5.º fallo → cuenta bloqueada durante 15 minutos y se envía aviso | 6.º intento → la cuenta sigue bloqueada; no se autentica | No. El SPEC fija 3 intentos y no define duración ni correo de aviso. |
| CU-R8: sexto intento fallido seguido | 5 fallos previos → ya debe estar bloqueada | No aplica: la cuenta se bloquea desde el quinto fallo | 6.º intento → sigue bloqueada durante el periodo vigente | No. El SPEC sí dice que un intento posterior queda bloqueado, pero no define el umbral ni la duración oficiales. |
| CU-R8: duración del bloqueo | 14 minutos transcurridos → la cuenta sigue bloqueada | 15 minutos transcurridos → termina el bloqueo; puede intentarse iniciar sesión | 16 minutos transcurridos → la cuenta ya no está bloqueada por ese evento | No. El SPEC no define bloqueo temporal; indica bloqueo sin duración y reinicio solo al recargar. |
| CU-R9: inactividad de la sesión | 29 minutos sin actividad → la sesión sigue abierta | 30 minutos sin actividad → la sesión se cierra automáticamente | 31 minutos sin actividad → la sesión permanece cerrada y se requiere iniciar sesión | No. La expiración por inactividad está fuera de alcance en el SPEC. |
| CU-R3: confirmación al crear o restablecer | Contraseña de 8 caracteres y confirmación distinta → inválida | Contraseña de 8 caracteres y confirmación idéntica → válida | Contraseña de 20 caracteres y confirmación distinta → inválida | No. El SPEC no define confirmación ni esos flujos. |

## 3. Hallazgos

Tipos: Ambigua · Le falta información · Se contradice · No se puede verificar

| # | Frase del spec | Tipo | Caso que lo demuestra | Cambio propuesto |
|---|---|---|---|---|
| 1 | «Bloqueo de un usuario tras 3 intentos fallidos seguidos.» | Se contradice (CU-R8: 5 intentos) | `ana` falla 3 veces. El spec la bloquea en el 3.º fallo; CU-R8 la deja seguir intentando hasta el 5.º | «Bloqueo tras 5 intentos fallidos seguidos» (`maxIntentos: 5`) |
| 2 | «Bloqueo temporal por tiempo o desbloqueo manual.» (fuera de alcance) | Se contradice (CU-R8: 15 minutos) | Quinto fallo a las 10:00. A las 10:16 con la contraseña correcta, CU-R8 permite entrar; el spec sigue bloqueado | «Bloqueo de 15 minutos desde el quinto fallo; al cumplirse, el contador vuelve a 0». Quitarlo de «fuera de alcance» |
| 3 | «Al recargar la página todo se reinicia (sesión, contadores y bloqueos).» | Se contradice (CU-R8) | `ana` queda bloqueada, recarga con F5 y vuelve a tener 0 fallos: el bloqueo se salta en un segundo | Guardar el fin del bloqueo en `localStorage`, y documentar que borrar el almacenamiento lo elimina (límite de página estática). O declarar la excepción |
| 4 | Tabla: «Tercer fallo y cualquier intento posterior…» con «¿Cuenta como fallo?» = «—» | Ambigua | El tercer intento con clave incorrecta: la fila dice «bloqueado» y «—». No se sabe si ese fallo suma al contador | «El quinto fallo cuenta y dispara el bloqueo. Los intentos posteriores muestran el mensaje de bloqueo sin sumar» |
| 5 | «Usuario bloqueado…» con «15 minutos» (CU-R8) | Ambigua | Bloqueo a las 10:00. A las 10:15:00 exactas, ¿sigue bloqueado o ya puede entrar? | «Bloqueado mientras no hayan pasado 15 minutos completos. A los 15 minutos ya se acepta el intento» |
| 6 | «Expiración de la sesión por inactividad.» (fuera de alcance) | Se contradice (CU-R9) | Sin actividad durante 31 minutos: CU-R9 cierra la sesión; el spec la mantiene abierta | Incluir CU-R9 en alcance con un temporizador en el navegador, o dejar la exclusión escrita con su motivo |
| 7 | No aparece recuperación de contraseña | Le falta información (CU-R10, CU-R11) | Ana olvida su contraseña. El spec no dice qué hacer, y la regla pide un enlace de 30 minutos de un solo uso | Agregar a «fuera de alcance»: «Recuperación de contraseña (CU-R10, CU-R11): requiere servidor y correo» |
| 8 | No aparece cambio de contraseña | Le falta información (CU-R12) | Ana cambia su contraseña en otro navegador y la sesión abierta sigue activa. El spec no lo regula | Agregar a «fuera de alcance» con su motivo |
| 9 | Ausente: aviso por correo al bloquear | No se puede verificar (CU-R8) | Cinco fallos: la regla pide un correo con fecha y hora. En una página sin servidor no se puede enviar | Declarar que el aviso no se cumple, o mostrar el aviso en pantalla como excepción |
| 10 | «Contraseñas en hash.» (fuera de alcance) y `contrasena: 'Huellitas2026'` | Se contradice (CU-R7) | Abrir `js/dominio/empleados.js` y leer la contraseña en texto plano | Declarar CU-R7 como excepción aceptada por el dueño en esta versión |
| 11 | «Credenciales de ejemplo documentadas en `LEEME.md`.» | Se contradice (CU-R7: nunca se muestra) | `LEEME.md` muestra `Huellitas2026`: la contraseña se muestra en la documentación | Documentar solo los usuarios; las contraseñas se entregan por fuera del repositorio |
| 12 | «Pantalla de inicio de sesión con campos usuario y contraseña» | Se contradice (CU-R2) | CU-R2 pide correo con forma usuario@dominio.ext; el spec acepta `ana`, que no es un correo | Campo de correo validado con la forma usuario@dominio.ext, o declarar que el usuario no es correo |
| 13 | Ausente: longitud y confirmación de contraseña | Le falta información (CU-R3) | Si se crea o cambia una contraseña, `abc` sería aceptada; la regla exige 8 a 20 caracteres y confirmación | Declarar que las contraseñas son fijas (no aplica CU-R3), o agregar 8 a 20 caracteres y confirmación al crearlas |
| 14 | «Mientras no haya sesión, el formulario y la tabla de ingresos están ocultos.» | No se puede verificar (AD-R1) | Con las herramientas del navegador se puede ver la tabla de ingresos aunque esté oculta con CSS. El spec no dice si los datos se cargan solo con sesión | «La tabla no se llena sin sesión» (no solo se oculta), y una prueba que lo compruebe |
| 15 | «visible al abrir `index.html`» (AD-R1) | Le falta información | Quien escribe la dirección de otra página sin sesión: el spec no define qué ve. La regla pide la pantalla «Sin permiso» | Agregar la pantalla «Sin permiso» con su texto exacto, o declarar que la app tiene una sola página |
| 16 | «Crear `js/dominio/empleados.js` con `EMPLEADOS` y el wrapper `exportar`. Agregar su» (plan, paso 1) | Le falta información | El plan termina a mitad de frase y no dice qué exporta el wrapper `exportar` | Completar el paso 1 y definir qué exporta `exportar` |
| 17 | «Contrato: iniciarSesion(usuario, contrasena)» | Se contradice | Regla oficial: CU-R2 y CU-R8. Se intenta iniciar sesión con `ana` y la contraseña correcta. El SPEC lo considera un usuario válido, pero las reglas exigen un correo como `ana@huellitas.com`. | Cambiar el contrato a `iniciarSesion(correo, contrasena)` y definir que el correo debe cumplir CU-R2. |
| 18 | «Bloqueo de un usuario tras 3 intentos fallidos seguidos» | Se contradice | Regla oficial: CU-R8. Con cuatro contraseñas incorrectas para la misma cuenta, el SPEC ya bloquea desde el tercer fallo; CU-R8 exige que el bloqueo ocurra al quinto fallo. | Sustituir 3 por 5 y especificar que son fallos seguidos por cuenta. |
| 19 | «cualquier intento posterior de ese usuario, aunque la contraseña sea correcta» | Se contradice | Regla oficial: CU-R8. Tras el quinto fallo, a los 14 minutos una contraseña correcta debe seguir bloqueada, pero después de 15 minutos debe poder intentarse de nuevo. El SPEC no permite distinguir esos momentos porque no define duración. | Especificar bloqueo de 15 minutos, comportamiento durante el bloqueo y reintento permitido al finalizarlo. |
| 20 | «Tercer fallo y cualquier intento posterior de ese usuario, aunque la contraseña sea correcta» | Le falta información | Regla oficial: CU-R8. El SPEC define el mensaje de bloqueo, pero no define cómo se enviaría el correo de aviso con fecha y hora que exige CU-R8: no indica destinatario, contenido, servicio ni evidencia. En una página sin servidor no hay un mecanismo de correo descrito. | Definir el mecanismo, destinatario, contenido y evidencia verificable del aviso, o declarar explícitamente que el aviso requiere un backend y queda fuera de esta implementación estática. |
| 21 | «{ usuario: 'ana', nombre: 'Ana Torres', contrasena: 'Huellitas2026' }» | Se contradice | Regla oficial: CU-R7. La contraseña aparece en texto claro en el código fuente y puede devolverse desde el modelo, mientras CU-R7 exige que se guarde cifrada y nunca se muestre ni se devuelva. | No incluir contraseñas recuperables en el código entregado; definir almacenamiento cifrado y devolver solo `{ usuario, nombre }`. Si se mantiene la página estática, declarar que CU-R7 no se puede cumplir realmente con esta arquitectura. |
| 22 | «Expiración de la sesión por inactividad» está fuera de alcance. | Le falta información | Regla oficial: CU-R9. La frase excluye expresamente la expiración por inactividad, por lo que no es una contradicción dentro del alcance actual. Sin embargo, no se define cómo se atenderá la regla oficial: a los 30 minutos sin actividad la sesión debe cerrarse. Es una funcionalidad pendiente para una spec posterior, no un defecto de la funcionalidad incluida aquí. | Mantenerla fuera del alcance de SPEC 01 y crear una spec posterior que defina el cierre a los 30 minutos, la medición de actividad y los casos de frontera de CU-R9. |
| 23 | «Mientras no haya sesión, el formulario y la tabla de ingresos están ocultos» | Le falta información | Regla oficial: AD-R1. Sin sesión, al abrir `otra-pagina.html` directamente, el SPEC solo dice qué elementos se ocultan, pero AD-R1 exige mostrar «Sin permiso» para cualquier página de la aplicación. | Definir la protección de cada página y la respuesta exacta «Sin permiso» ante una URL directa sin sesión. |

## 4. Una línea de código que la IA podría escribir mal

Caso de la regla CU-R8 (5 intentos):
- Cumple: `if (this.fallos[usuario] >= 5)`, evaluado antes de comparar la contraseña
- No cumple: `if (this.fallos[usuario] > 5)`
- El caso que las distingue: 5 fallos seguidos y después el 6.º intento con la contraseña correcta. Con `>= 5` muestra «Usuario bloqueado…»; con `> 5` la cuenta entra

Nuestro hallazgo:
- Cumple: `if (this.fallos[usuario] >= MAX_INTENTOS)`, con `MAX_INTENTOS = 5`, evaluado antes de comparar la contraseña
- No cumple: `if (this.fallos[usuario] > MAX_INTENTOS)` o `maxIntentos: 3` como en el spec actual
- El caso que las distingue: 5 fallos seguidos y luego el 6.º intento con la contraseña correcta. Con `>=` el sistema responde «Usuario bloqueado…»; con `>` deja entrar

Hallazgo de la entrega de Juan José Forero:
- Cumple: `if (fallos >= 5) bloquearDurante(15 * 60 * 1000);`
- No cumple: `if (fallos >= 3) bloquearDurante(15 * 60 * 1000);`
- El caso que las distingue: después de tres fallos y antes del quinto, por ejemplo el cuarto fallo. La primera versión todavía permite llegar al quinto intento y bloquea al quinto; la segunda bloquea prematuramente al tercer fallo, en contra de CU-R8.
