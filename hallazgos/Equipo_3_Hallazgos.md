# Hallazgos del Equipo 3

**Spec revisado:** spec.md

**Integrantes:**
- Sara Alejandra Mongui
- Diana Lucia Ojeda Saavedra
- Angela Rocio Peña

## 1. Reglas que el spec omite, cambia o inventa

| Regla | Qué dice el spec | Qué debería decir |
| --- | --- | --- |
| CU-R2 | El spec sugiere un archivo con los datos de los empleados de la forma: `usuario: ‘ana’` | Debe iniciar sesión con correo en el formato: [usuario@dominio.ext](mailto:usuario@dominio.ext) |
| CU-R3 | La contraseña se compara de forma exacta; distingue mayúsculas y minúsculas y no se recortan espacios. No especifica nada sobre la cantidad de caracteres | La contraseña debe tener entre 8 y 20 caracteres, ambos incluidos. Y la confirmación debe coincidir. |
| CU-R7 | En el spec: la contraseña se guarda en formato plano `contrasena: 'Huellitas2026'` Fuera del alcance del spec: almacenar contraseñas mediante funciones hash. | La contraseña se guarda cifrada. Nunca se muestra ni se devuelve |
| CU-R8 | Bloqueo de un usuario después de tres intentos fallidos consecutivos. | Bloqueo de un usuario después de cinco intentos fallidos consecutivos. |
| CU-R8 | Fuera de alcance: Implementar bloqueos temporales | La cuenta queda bloqueada 15 minutos tras los intentos fallidos  |
| CU-R9 | Fuera de alcance: Expirar la sesión por inactividad. | La sesión se cierra sola tras 30 minutos sin actividad. |
| CU-R12 | No es mencionado en el spec el proceso a tener en cuenta cuando se cambia la contraseña | Al cambiar la contraseña se cierran todas las sesiones activas de ese usuario |
| CU-R10 | Se omite: la spec no dice nada sobre esta regla. No existe la pantalla de nueva contraseña. | El enlace de recuperación de contraseña es válido por 30 minutos, y el sistema muestra el mensaje («Si el correo está registrado, recibirá un enlace en unos minutos») independientemente de si existe o no el correo. |
| CU-R11 | No se está teniendo en cuenta la regla de cambio de contraseña en la spec. | El enlace de recuperación de contraseña es de único uso y la contraseña debe cumplir con los criterios de CU-R3. Se redirecciona a una pantalla de nueva contraseña y confirmación. |
| AD-R1 | Ocultamiento del formulario y de la tabla de ingresos mientras no exista una sesión activa. | Se deben ocultar todas las pantallas mientras no exista una sesión activa y se debe mostrar el mensaje “Sin Permiso” |

## 2. Casos de frontera

| Dato | Justo antes | Exacto | Justo después | ¿Lo dice el spec? |
| --- | --- | --- | --- | --- |
| CU-R3: caracteres de contraseña en límite inferior | 7 caracteres → no inicia sesión | 8 caracteres → Inicia sesión | 9 caracteres → Inicia sesión | No especifica |
| CU-R3: caracteres de contraseña en límite superior | 19 caracteres → inicia sesión | 20 caracteres → inicia sesión | 21 caracteres → no inicia sesión | No especifica |
| CU-R8: tiempo de bloqueo tras intentos fallidos | 14 minutos → cuenta bloqueada | 15 minutos → se desbloquea la cuenta | 16 minutos → se desbloquea la cuenta | Implementar bloqueos temporales: no especifica cómo se producen ni el tiempo del bloqueo |
| CU-R9: tiempo de inactividad | 29 minutos → se mantiene la sesión abierta | 30 minutos → se cierra la no sesión | 31 minutos → se cierra la no sesión | No especifica |
| CU-R10: duración del enlace de recuperación de contraseña | 29 minutos → el enlace funciona | 30 minutos → el enlace ya no sirve | 31 minutos → el enlace ya no sirve | No: no existe la recuperación de contraseña. |

## 3. Hallazgos

Tipos: Ambigua · Le falta información · Se contradice · No se puede verificar

| # | Frase del spec | Tipo | Caso que lo demuestra | Cambio propuesto |
| --- | --- | --- | --- | --- |
| CU-R2 | `usuario: ‘ana’` | `Se contradice` | Usuario: ‘ana’ : no puede iniciar sesión porque no tiene un formato permitido | Debe iniciar sesión con correo en el formato: [usuario@dominio.ext](mailto:usuario@dominio.ext) |
| CU-R3 | La contraseña se compara de forma exacta; distingue mayúsculas y minúsculas y no se recortan espacios. No especifica nada sobre la cantidad de caracteres | `Le falta información` | No se especifica la cantidad de caracteres en la contraseña | La contraseña debe tener entre 8 y 20 caracteres, ambos incluidos. Y la confirmación debe coincidir. |
| CU-R7 | Contraseña se guarda en formato plano | `Se contradice` | Contrasena: 'Huellitas2026’ : no se guarda cifrada | La contraseña se guarda cifrada. Nunca se muestra ni se devuelve |
| CU-R8 | Bloqueo de un usuario después de tres intentos fallidos consecutivos. | `Se contradice` | Código de servicio de sesión `new ServicioSesion({ empleados: EMPLEADOS, maxIntentos: 3 });` | Bloqueo de un usuario después de cinco intentos fallidos consecutivos. |
| CU-R9 | 30 minutos → se cierra la no sesión | `Le falta información` | No especifica | La sesión se cierra sola tras 30 minutos sin actividad. |
| CU-R12 | No es mencionado en el spec | `Le falta información` | No se especifica  | Al cambiar la contraseña se cierran todas las sesiones activas de ese usuario |
| CU-R10 | No es mencionado en el spec, no se incluye el cambio de contraseña | `Le falta información` | Se escribe un correo para recuperación de contraseña; la regla espera el mensaje «Si el correo está registrado, recibirá un enlace en unos minutos». En el spec no existe. | La pantalla de inicio de sesión ofrece la función de ‘Recuperar contraseña’ y dirige a una pantallla en la que se ingresa el correo. Si está registrado, se envía un enlace válido por 30 minutos. Y siempre muestra en pantalla «Si el correo está registrado, recibirá un enlace en unos minutos». |
| CU-R11 | No es mencionado en el spec, no se incluye el cambio de contraseña | `Le falta información` | Se debería recibir un enlace de recuperación de único uso. El spec no dice nada al respecto. | El enlace de recuperación de contraseña recibido en el correo es de único uso y lleva a una pantalla de nueva contraseña y confirmación que cumpla con las reglas de CU-R3. |
| AD-R1 | Ocultamiento del formulario y de la tabla de ingresos mientras no exista una sesión activa | `Le falta información` | Sin iniciar sesión se escribe en el navegador la dirección de otra página de la aplicación. La regla espera la pantalla «Sin permiso»; el spec solo habla de ocultamiento y muestra de la pantalla de inicio de sesión. | Toda página de la aplicación, abierta sin sesión, muestra la pantalla ‘Sin permiso’ y no se muestra el formulario ni la tabla de ingresos. |

## 4. Una línea de código que la IA podría escribir mal

**Nuestro hallazgo: CU-R8, 5 intentos fallidos seguidos**

- Cumple: `if (this.fallos[usuario] >= 5) bloquear(usuario);`
- No cumple: `if (this.fallos[usuario] > 5) bloquear(usuario);`
- El caso que las distingue: [ana@huellitas.com](mailto:ana@huellitas.com) falla exactamente 5 veces seguidas y en el 6.º intento escribe la contraseña correcta. Con la línea que cumple ve «Usuario bloqueado por demasiados intentos fallidos.»; con la que no cumple entra, porque 5 no es mayor que 5.
