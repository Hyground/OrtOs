# Web

Interfaz web de OrtOs (React + Vite).

## Ejecutar

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build
npm run lint
npm test
```

Variables de entorno en `.env` (plantilla en `.env.example`): `VITE_API_URL`, `VITE_APP_NAME`.

## Estructura

```
public/         Archivos servidos tal cual (favicon, robots.txt)
src/
  app/          Router, proveedores globales y ErrorBoundary
  assets/       ImÃ¡genes y recursos estÃ¡ticos
  components/   Compartidos: layout, ui, icons, feedback
  config/       Entorno (env) y datos de contacto
  features/     LÃ³gica por dominio (auth: sesiÃ³n y validaciones)
  hooks/        Hooks reutilizables
  lib/          Utilidades sin React (http, storage)
  pages/        Una pÃ¡gina por ruta
  styles/       Reset y design tokens
```

Colores, tipografÃ­a y espaciados estÃ¡n centralizados en `src/styles/tokens.css` como
variables CSS y se usan con `var(--color-â€¦)` desde los `*.module.css`.

## Rutas

| Ruta             | Acceso      | PÃ¡gina       |
| ---------------- | ----------- | ------------- |
| `/`              | PÃºblico    | Inicio        |
| `/servicios`     | PÃºblico    | Servicios     |
| `/especialistas` | PÃºblico    | Especialistas |
| `/agendar`       | PÃºblico    | Agendar cita  |
| `/panel`         | Con sesiÃ³n | Panel         |

Iniciar sesiÃ³n no es una ruta: es un modal (`LoginModal`) que se abre sobre
cualquier pantalla con `useAuthDialog().open()`. Entrar a `/panel` sin sesiÃ³n
redirige al inicio y abre ese modal.

## Usuarios de prueba

Mientras el backend de autenticación no esté implementado, la web permite iniciar sesión en desarrollo con usuarios locales. Funcionan con `npm run dev` y no se usan en producción.

| Rol           | Correo                | Contraseña    |
| ------------- | --------------------- | ------------- |
| Administrador | `admin@ortos.test`    | `Admin123`    |
| Paciente      | `paciente@ortos.test` | `Paciente123` |

Para probar:

1. Abra `http://localhost:5173`.
2. Pulse **Iniciar sesión**.
3. Use cualquiera de los usuarios anteriores.
4. Entre a **Mi panel** o navegue directo a `/panel`.
