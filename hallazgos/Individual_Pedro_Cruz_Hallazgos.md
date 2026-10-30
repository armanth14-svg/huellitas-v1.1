# Hallazgos individuales de Pedro Eduardo Cruz López

**Spec revisado:** 01-inicio-de-sesion-empleados.html
**Integrante:**

- Pedro Eduardo Cruz López

## 1. Reglas que el spec omite, cambia o inventa

| Regla                      | Qué dice el spec                                                                                | Qué debería decir                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Intentos antes de bloquear | Bloquea al usuario tras 3 intentos fallidos seguidos                                            | Bloquea tras 5 intentos fallidos seguidos                             |
| Duración del bloqueo       | El bloqueo solo se quita al recargar la página (F5), no tiene tiempo                            | El bloqueo dura 15 minutos y luego el usuario puede volver a intentar |
| Longitud de la contraseña  | No valida la longitud de la contraseña                                                          | La contraseña debe tener entre 8 y 20 caracteres                      |
| Expiración de la sesión    | La sesión nunca expira; sigue abierta hasta cerrar sesión o recargar (lo deja fuera de alcance) | La sesión expira tras 30 minutos de inactividad                       |

## 2. Casos de frontera

| Dato                                | Justo antes                   | Exacto                     | Justo después              | ¿Lo dice el spec?                              |
| ----------------------------------- | ----------------------------- | -------------------------- | -------------------------- | ---------------------------------------------- |
| Intentos fallidos antes de bloquear | 4 fallos → aún puede intentar | 5 fallos → queda bloqueado | 6 fallos → sigue bloqueado | No: el spec bloquea al 3.º, no al 5.º          |
| Longitud de contraseña (mínimo)     | 7 caracteres → rechazada      | 8 caracteres → aceptada    | 9 caracteres → aceptada    | No: el spec no valida longitud                 |
| Longitud de contraseña (máximo)     | 19 caracteres → aceptada      | 20 caracteres → aceptada   | 21 caracteres → rechazada  | No: el spec no valida longitud                 |
| Duración del bloqueo                | 14 min → sigue bloqueado      | 15 min → se desbloquea     | 16 min → desbloqueado      | No: el spec bloquea hasta recargar, sin tiempo |
| Inactividad antes de cerrar sesión  | 29 min → sesión activa        | 30 min → sesión cerrada    | 31 min → sesión cerrada    | No: el spec no expira la sesión                |

## 3. Hallazgos

Tipos: Ambigua · Le falta información · Se contradice · No se puede verificar

| #   | Frase del spec                                                                  | Tipo                  | Caso que lo demuestra                                                                                                                                          | Cambio propuesto                                                         |
| --- | ------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | "Bloqueo de un usuario tras 3 intentos fallidos seguidos"                       | Se contradice         | Un usuario falla 3 veces y luego escribe la contraseña correcta: el spec lo bloquea; con la regla del dueño (5 intentos) debería entrar porque solo usó 3 de 5 | "Bloquear al usuario tras 5 intentos fallidos seguidos"                  |
| 2   | El spec no menciona la longitud de la contraseña                                | Le falta información  | Una contraseña de 7 caracteres: no se puede escribir si se acepta o se rechaza, porque el spec no dice nada de longitud                                        | "La contraseña debe tener entre 8 y 20 caracteres"                       |
| 3   | "Al recargar la página todo se reinicia (sesión, contadores y bloqueos)"        | Se contradice         | Un usuario bloqueado espera 15 minutos sin recargar: el spec lo mantiene bloqueado; la regla del dueño lo desbloquea a los 15 min                              | "El bloqueo dura 15 minutos; después el usuario puede volver a intentar" |
| 4   | "Expiración de la sesión por inactividad" aparece listada como fuera de alcance | No se puede verificar | Un empleado deja la sesión 30 minutos inactiva: no hay forma de probar el resultado esperado porque el spec no define ninguna expiración                       | "La sesión expira tras 30 minutos de inactividad"                        |

## 4. Una línea de código que la IA podría escribir mal

Nuestro hallazgo (hallazgo 1: número de intentos antes de bloquear):

- Cumple: `if (this.fallos[u] >= 5)` → bloquear
- No cumple: `if (this.fallos[u] >= 3)` → bloquear
- El caso que las distingue: un usuario con 3 fallos exactos. Con `>= 5` todavía puede intentar (le quedan 2); con `>= 3` ya queda bloqueado.
