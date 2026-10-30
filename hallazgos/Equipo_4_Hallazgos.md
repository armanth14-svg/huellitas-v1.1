# Hallazgos del Equipo 4

**Spec revisado:** specs/01-inicio-de-sesion-empleados.md
**Integrantes:**
- Fabian Leonardo Correa Rojas
- Alejandro Forero
- Linyor Steven Leon Macana
- Nicolas Danilo Muñoz

## 1. Reglas que el spec omite, cambia o inventa

| Regla | Qué dice el spec | Qué debería decir |
|---|---|---|
| CU-R2 (cambia) | «Pantalla de inicio de sesión con campos usuario y contraseña» y los usuarios son «ana» y «luis» | «Se inicia sesión con correo y contraseña. El correo tiene la forma usuario@dominio.ext: texto antes de la arroba, una sola arroba y un dominio con al menos un punto y texto a los dos lados del punto» |
| CU-R3 (omite) | No habla de la longitud de la contraseña ni de una confirmación | «La contraseña tiene entre 8 y 20 caracteres, ambos incluidos; al crearla o cambiarla, la confirmación debe coincidir» |
| CU-R7 (cambia) | Pone «Contraseñas en hash» fuera de alcance, guarda contrasena: 'Huellitas2026' en empleados.js y documenta las credenciales en LEEME.md. Solo cumple en que el empleado devuelto no incluye la contraseña | «La contraseña se guarda cifrada y nunca se muestra ni se devuelve: ni en el código, ni en LEEME.md, ni en la respuesta del servicio» |
| CU-R8 (cambia el número) | «Bloqueo de un usuario tras 3 intentos fallidos seguidos» | «Con 5 intentos fallidos seguidos, la cuenta queda bloqueada» |
| CU-R8 (cambia la duración) | Pone «Bloqueo temporal por tiempo o desbloqueo manual» fuera de alcance y dice «Al recargar (F5) se vuelve a pedir inicio de sesión y los bloqueos desaparecen» | «La cuenta queda bloqueada 15 minutos», y recargar la página no la desbloquea |
| CU-R8 (omite el aviso) | No menciona ningún aviso al bloquear | «Al bloquearse la cuenta se envía un correo de aviso con la fecha y la hora» |
| CU-R9 (omite) | Pone «Expiración de la sesión por inactividad» fuera de alcance | «La sesión se cierra sola tras 30 minutos sin actividad» |
| CU-R10 (omite) | No menciona recuperar la contraseña, ni siquiera en «Fuera de alcance» | «El usuario escribe su correo; si está registrado se envía un enlace válido por 30 minutos. Exista o no, el mensaje es: Si el correo está registrado, recibirá un enlace en unos minutos» |
| CU-R11 (omite) | No hay pantalla de nueva contraseña | «El enlace lleva a una pantalla de nueva contraseña y confirmación con las reglas de CU-R3; cada enlace sirve una sola vez» |
| CU-R12 (omite) | No menciona cambiar la contraseña | «Al cambiar la contraseña se cierran todas las sesiones activas de ese usuario» |
| AD-R1 (cambia) | «Mientras no haya sesión, el formulario y la tabla de ingresos están ocultos» y acepta como riesgo que «Desde la consola del navegador se puede mostrar main.contenido sin iniciar sesión» | «Solo quien inició sesión entra a la aplicación; quien llega a una página sin sesión ve la pantalla Sin permiso» |
| Inventada | «Se cuenta por usuario normalizado, exista o no» | Ninguna regla lo pide: CU-R8 habla de bloquear la cuenta. El dueño debe confirmarlo o se quita |
| Inventada | «Usuario normalizado: String(usuario).trim().toLowerCase()» | Ninguna regla lo pide. Con el correo de CU-R2, el dueño debe decidir si «ANA@huellitas.co» y «ana@huellitas.co» son la misma cuenta |
| Inventada | «campos vacíos no cuentan como fallo» | Ninguna regla lo pide. El dueño debe confirmarlo o se quita |

## 2. Casos de frontera

| Dato | Justo antes | Exacto | Justo después | ¿Lo dice el spec? |
|---|---|---|---|---|
| Longitud mínima de la contraseña nueva (CU-R3) | 7 caracteres → rechazada | 8 caracteres → aceptada | 9 caracteres → aceptada | No: el spec no habla de longitud de contraseña ni permite crearla o cambiarla |
| Longitud máxima de la contraseña nueva (CU-R3) | 19 caracteres → aceptada | 20 caracteres → aceptada | 21 caracteres → rechazada | No: igual que la fila anterior |
| Fallos seguidos antes del bloqueo (CU-R8) | 4 fallos y luego la contraseña correcta → entra | 5 fallos → cuenta bloqueada 15 minutos y correo de aviso con fecha y hora | 6.º intento con la contraseña correcta → rechazado, sigue bloqueada | Lo contradice: el spec bloquea en el 3.er fallo y no envía aviso |
| El 3 del spec frente a CU-R8 | 2 fallos y luego la contraseña correcta → entra | 3 fallos y luego la contraseña correcta → entra, porque CU-R8 pide 5 | 4 fallos y luego la contraseña correcta → entra | Lo contradice: con 3 fallos el spec ya responde «Usuario bloqueado por demasiados intentos fallidos.» |
| Duración del bloqueo (CU-R8) | 14 min 59 s, contraseña correcta → rechazado, sigue bloqueada | 15 min 0 s, contraseña correcta → entra | 15 min 1 s, contraseña correcta → entra | Lo contradice: el spec bloquea hasta recargar; con F5 en el segundo 1 ya se puede entrar |
| Inactividad de la sesión (CU-R9) | 29 min 59 s sin actividad → la sesión sigue abierta | 30 min 0 s → la sesión se cierra sola | 30 min 1 s → la sesión está cerrada | No: el spec deja la expiración fuera de alcance y la sesión sigue abierta indefinidamente |
| Vigencia del enlace de recuperación (CU-R10) | 29 min 59 s → abre la pantalla de nueva contraseña | 30 min 0 s → vencido, no abre | 30 min 1 s → vencido, no abre | No: el spec no tiene recuperación de contraseña |
| Usos del enlace (CU-R11) | Enlace sin usar → abre la pantalla de nueva contraseña | Primer uso → la contraseña cambia | Segundo uso del mismo enlace → rechazado | No: el spec no tiene recuperación de contraseña |
| Arrobas en el correo (CU-R2) | 0 arrobas: «ana.huellitas.co» → rechazado | 1 arroba: «ana@huellitas.co» → aceptado | 2 arrobas: «ana@@huellitas.co» → rechazado | No: el spec pide usuario («ana»), no correo |
| Puntos en el dominio del correo (CU-R2) | 0 puntos: «ana@huellitas» → rechazado | 1 punto: «ana@huellitas.co» → aceptado | 2 puntos: «ana@uptc.edu.co» → aceptado | No: el spec pide usuario, no correo |

## 3. Hallazgos

Tipos: Ambigua · Le falta información · Se contradice · No se puede verificar

| # | Frase del spec | Tipo | Caso que lo demuestra | Cambio propuesto |
|---|---|---|---|---|
| 1 | «Bloqueo de un usuario tras 3 intentos fallidos seguidos.» | Se contradice (CU-R8) | ana falla 3 veces seguidas y en el 4.º intento escribe Huellitas2026. Por CU-R8 debe entrar (lleva 3 de 5 fallos); con el spec ve «Usuario bloqueado por demasiados intentos fallidos.» | «Con 5 intentos fallidos seguidos, la cuenta queda bloqueada 15 minutos. Un inicio exitoso antes del 5.º fallo pone el contador en 0» |
| 2 | «Al recargar (F5) se vuelve a pedir inicio de sesión y los bloqueos desaparecen.» | Se contradice (CU-R8) | ana queda bloqueada, se pulsa F5 y en el segundo 1 escribe la contraseña correcta. Con el spec entra; por CU-R8 debe seguir bloqueada hasta los 15 minutos | «El bloqueo dura 15 minutos contados desde el fallo que lo produjo y no se quita al recargar la página» |
| 3 | «Huellitas es una página estática sin servidor.» | Se contradice (CU-R8 y CU-R10 con lo que el sistema puede hacer) | Al 5.º fallo, CU-R8 exige enviar un correo de aviso con fecha y hora, y CU-R10 exige enviar un enlace. Una página que corre solo en el navegador no puede enviar correos, y el spec no dice qué pasa en su lugar | «El dueño decide una de dos: agregar un servicio de correo, o simular el envío en un buzón de prueba visible que muestre destinatario, asunto, fecha y hora. El spec dice cuál» |
| 4 | «Pantalla de inicio de sesión con campos usuario y contraseña» | Se contradice (CU-R2 y CU-R8) | Con el spec, «ana» / Huellitas2026 entra aunque «ana» no tiene forma de correo, y «ana@huellitas.co» / Huellitas2026 se rechaza como usuario inexistente. Por las reglas es al revés | «Se inicia sesión con correo y contraseña. Un correo sin la forma usuario@dominio.ext se rechaza. Cada empleado tiene un correo en la lista» |
| 5 | «Credenciales de ejemplo documentadas en LEEME.md.» y «Contraseñas en hash» fuera de alcance | Se contradice (CU-R7) | Se abre js/dominio/empleados.js o LEEME.md y se lee «Huellitas2026». CU-R7 dice que la contraseña nunca se muestra | «La lista de empleados guarda solo la contraseña cifrada. Ni el código, ni LEEME.md, ni ninguna respuesta del servicio contienen la contraseña en texto» |
| 6 | No aparece en el spec, ni siquiera en «Fuera de alcance» | Le falta información (CU-R10, CU-R11 y CU-R3) | Un empleado olvidó su contraseña y escribe su correo para recuperarla. CU-R10 espera el mensaje «Si el correo está registrado, recibirá un enlace en unos minutos»; con el spec no hay pantalla para hacerlo y no se puede escribir el resultado esperado | «Agregar Recuperar contraseña: mismo mensaje exista o no el correo, enlace válido por 30 minutos y de un solo uso, nueva contraseña de 8 a 20 caracteres con confirmación que debe coincidir» |
| 7 | «Expiración de la sesión por inactividad.» (en «Fuera de alcance») | Se contradice (CU-R9) | ana inicia sesión y no toca nada durante 30 minutos. Por CU-R9 la sesión se cierra en el minuto 30; con el spec sigue abierta | «Tras 30 minutos sin actividad (ningún clic ni tecla en la página), la sesión se cierra y se vuelve a la pantalla de inicio de sesión» |
| 8 | «Desde la consola del navegador se puede mostrar main.contenido sin iniciar sesión» (riesgo aceptado) | Se contradice (AD-R1) | Sin iniciar sesión, en la consola se escribe document.querySelector('main').hidden = false. Aparecen el formulario y la tabla, y se puede registrar un ingreso. AD-R1 dice que sin sesión no se entra | «Sin sesión, la página no dibuja el formulario ni la tabla (no basta con ocultarlos) y quien intente usarlos ve la pantalla Sin permiso» |
| 9 | «Al abrir index.html solo se ve la pantalla de inicio de sesión» | Ambigua (frente a AD-R1) | Se abre index.html sin sesión. Por el spec se ve el inicio de sesión; por AD-R1 se ve «Sin permiso». Huellitas tiene una sola página, así que no se puede escribir cuál de las dos es el resultado esperado | «index.html sin sesión muestra el inicio de sesión. Cualquier otra vista de la aplicación sin sesión muestra la pantalla Sin permiso» |
| 10 | «Sí: sesión solo en memoria.» | Le falta información (CU-R12) | ana tiene la aplicación abierta en dos pestañas y cambia su contraseña en una. Por CU-R12 la otra pestaña debe quedar sin sesión; con la sesión solo en memoria, cada pestaña no sabe de la otra y el spec no dice qué pasa | «Al cambiar la contraseña se cierran todas las sesiones activas de ese usuario, también las abiertas en otras pestañas» |
| 11 | «Sí: campos vacíos no cuentan como fallo.» junto con «tras 3 intentos fallidos seguidos» | Ambigua | ana falla 2 veces, envía la contraseña vacía y falla 1 vez más. No se puede escribir si queda bloqueada (el vacío no cuenta y son 3 fallos) o no (el vacío cortó la serie de fallos seguidos) | «Un envío con campos vacíos no cuenta como fallo ni corta la serie; solo un inicio de sesión exitoso pone el contador en 0» |

## 4. Una línea de código que la IA podría escribir mal

Nuestro hallazgo:
- Cumple: `new ServicioSesion({ empleados: EMPLEADOS, maxIntentos: 5 });`
- No cumple: `new ServicioSesion({ empleados: EMPLEADOS, maxIntentos: 3 });`
- El caso que las distingue: ana falla 3 veces seguidas y en el 4.º intento escribe la contraseña correcta. Con 5 entra, como pide CU-R8; con 3 ve «Usuario bloqueado por demasiados intentos fallidos.»
