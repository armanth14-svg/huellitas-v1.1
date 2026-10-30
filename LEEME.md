# Huellitas UPTC — Ingreso de mascotas (v1.0)

Aplicación web pequeña, en JavaScript puro y HTML, para registrar el ingreso de mascotas a una guardería.
Es el **sistema bajo prueba** de la práctica. Lo que debe hacer está en el documento de requisitos que
acompaña esta carpeta; lo que hace de verdad, lo descubren ustedes probándolo.

## Cómo abrirla

Doble clic en `index.html`. Se abre en el navegador. No hay que instalar nada ni tener internet.

## Cómo entrar

Para ver el registro de ingresos hay que iniciar sesión con correo y contraseña. Empleados de ejemplo:

| Correo | Nombre |
|---|---|
| `ana.torres@huellitas.co` | Ana Torres |
| `luis.gomez@huellitas.co` | Luis Gómez |

Las contraseñas **no están en el repositorio**: las entrega el docente. En el código solo se guardan una sal y
el hash SHA-256 de cada una.

- Tras 5 intentos fallidos seguidos, la cuenta se bloquea 15 minutos. El bloqueo se guarda en el navegador
  (localStorage), así que **recargar con F5 no lo quita**. Borrar los datos del sitio sí lo quita.
- El aviso de bloqueo no sale por correo (no hay servidor): aparece en el panel **Buzón de prueba**.
- La sesión se cierra sola tras 30 minutos sin clic ni tecla, o con el botón **Cerrar sesión**.
- Sin sesión, `index.html#ingresos` muestra `Sin permiso`.
- Esto protege la aplicación, no es seguridad real: sin servidor, el hash y la sal se ven en el código fuente.
- Si el navegador no permite `crypto.subtle` al abrir el archivo, el inicio de sesión muestra un error.

Los ingresos se guardan solo mientras la página está abierta: **al recargar (F5) todo vuelve a cero.**
Úsenlo a su favor: cada prueba puede empezar limpia.

## Cómo está organizada (principios SOLID)

```
index.html                 La página
css/estilos.css            La apariencia
js/dominio/                Las reglas del negocio. No saben nada de la página.
  especies.js              Configuración por especie: tarifa base, peso máximo, si necesita antirrábica
  empleados.js             Empleados con su correo, sal y hash de la contraseña (nunca la contraseña)
  reglas/Regla*.js         Una clase por regla de validación
  ValidadorIngreso.js      Junta las reglas
  CalculadoraTarifa.js     Calcula la tarifa por día
  EstadoIngreso.js         Los estados de un ingreso y las transiciones permitidas
  ServicioIngresos.js      Los casos de uso: registrar, registrar llegada, entregar (exigen sesión)
  ServicioSesion.js        Inicio de sesión, bloqueo por intentos e inactividad
js/infraestructura/        Dónde se guardan los ingresos (en memoria), los bloqueos (localStorage), el hash y el buzón de prueba
js/ui/                     Lo que se ve: el formulario, la tabla y la sesión
js/app.js                  Donde se crean y se conectan todas las piezas
pruebas/dominio.test.js    Las pruebas automáticas del equipo de desarrollo
```

| Principio | Dónde se ve |
|---|---|
| **S** — Responsabilidad única | Cada regla valida un solo dato. La calculadora solo calcula. La vista solo muestra. |
| **O** — Abierto/cerrado | Para agregar una regla o una especie no se modifica el validador: se agrega una regla en `app.js` o una entrada en `especies.js`. |
| **L** — Sustitución de Liskov | Todas las reglas cumplen el mismo contrato, `validar(datos)` → lista de errores, y el validador las trata igual. |
| **I** — Segregación de interfaces | El repositorio expone solo lo que el servicio usa: `siguienteCodigo`, `guardar`, `buscar`, `listar`. |
| **D** — Inversión de dependencias | El servicio recibe el validador, la calculadora, los estados y el repositorio por el constructor. No crea ninguno. |

## Las pruebas automáticas del equipo de desarrollo

Desde esta carpeta, en una terminal:

```
node --test
```

Hace falta tener Node 19 o superior instalado (las pruebas usan Web Crypto). Esas pruebas son del equipo que programó: pasar todas no significa que
la aplicación cumpla los requisitos. Sus pruebas —las de la práctica— son otras, y se registran en el Excel.
