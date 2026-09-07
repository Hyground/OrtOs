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
  assets/       Imágenes y recursos estáticos
  components/   Compartidos: layout, ui, icons, feedback
  config/       Entorno (env) y datos de contacto
  features/     Lógica por dominio (auth: sesión y validaciones)
  hooks/        Hooks reutilizables
  lib/          Utilidades sin React (http, storage)
  pages/        Una página por ruta
  styles/       Reset y design tokens
```

Colores, tipografía y espaciados están centralizados en `src/styles/tokens.css` como
variables CSS y se usan con `var(--color-…)` desde los `*.module.css`.

## Rutas

| Ruta             | Acceso     | Página        |
| ---------------- | ---------- | ------------- |
| `/`              | Público    | Inicio        |
| `/servicios`     | Público    | Servicios     |
| `/especialistas` | Público    | Especialistas |
| `/agendar`       | Público    | Agendar cita  |
| `/panel`         | Con sesión | Panel         |

Iniciar sesión no es una ruta: es un modal (`LoginModal`) que se abre sobre
cualquier pantalla con `useAuthDialog().open()`. Entrar a `/panel` sin sesión
redirige al inicio y abre ese modal.
