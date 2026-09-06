# OrtOs

## Credenciales de prueba

La autenticación usa un backend falso en memoria (`AppContainer.USE_FAKE_BACKEND = true`)
mientras no exista API real.

| Campo      | Valor              |
|------------|--------------------|
| Correo     | `demo@ortos.com`   |
| Contraseña | `Ortos123`         |

- **Login con Google**: devuelve un usuario simulado.
- **Recuperar contraseña**: responde con éxito genérico (no revela si el correo existe).
- **Recordarme**: guarda solo el correo para precargarlo; nunca la contraseña.

## Conectar la API real

1. Implementar `AuthApi` e inyectarla en `RemoteAuthDataSource` (en `AppContainer`).
2. Poner `AppContainer.USE_FAKE_BACKEND = false`.
