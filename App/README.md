# OrtOs

App para una clínica odontológica. El paciente inicia sesión y puede ver su próxima
cita, pagos, promociones y escribir a la clínica por chat.

## Credenciales de prueba

Mientras no exista API, los datos vienen de fuentes locales en memoria
(`AppContainer.USE_LOCAL_BACKEND = true`).

| Campo      | Valor              |
|------------|--------------------|
| Correo     | `demo@ortos.com`   |
| Contraseña | `Ortos123`         |

- **Login con Google**: devuelve un usuario simulado.
- **Recuperar contraseña**: responde con éxito genérico (no revela si el correo existe).
- **Recordarme**: guarda solo el correo para precargarlo; nunca la contraseña.
- **Home**: datos de ejemplo (`LocalHomeDataSource`).
- **Chat**: mensajes en memoria (`LocalChatDataSource`), la recepción responde automáticamente.

## Conectar la API real

1. Implementar la fuente `Remote*DataSource` de cada feature (`auth`, y añadir las de `home` / `chat`).
2. En `AppContainer`, inyectar la fuente remota en el repositorio correspondiente.
3. Para auth: poner `AppContainer.USE_LOCAL_BACKEND = false`.
