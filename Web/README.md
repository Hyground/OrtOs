# Web

Interfaz web de OrtOs con React y Vite. Este documento describe la estructura base;
el diseño visual y las funcionalidades se agregan encima de este esqueleto.

## Ejecutar

```powershell
npm install
npm run dev
```

| Script | Uso |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) en `http://localhost:5173` |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve la compilación de producción |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run format` | Formatea con Prettier |
| `npm test` | Pruebas con Vitest |

Variables de entorno (ver `.env.example`):

- `VITE_API_URL`: URL base de la API. Vacío usa el proxy `/api` de Vite hacia `http://localhost:8080`.
- `VITE_APP_NAME`: nombre mostrado en la interfaz y el título del documento.

## Estructura

```
src/
  app/                Composición de la aplicación
    providers/        Proveedores globales (router, sesión)
    routes/           Definición de rutas, rutas protegidas y públicas
  components/         Componentes compartidos entre features
    layout/           Layouts público y privado, navbar, footer
    feedback/         Estados de carga y similares
  config/             Lectura de variables de entorno
  features/           Un módulo por dominio de negocio
    auth/             Sesión: contexto, hook, servicio, validaciones, página
    landing/          Página de inicio
    services/         Servicios y especialidades
    appointments/     Agendar cita
    dashboard/        Área privada
  hooks/              Hooks reutilizables
  lib/                Utilidades sin dependencia de React
    http/             Cliente HTTP y errores
    storage/          Acceso a almacenamiento local
  pages/              Páginas fuera de un feature (404)
  styles/             Reset, design tokens y estilos base
  test/               Configuración de pruebas
```

### Convenciones

- **Un feature por carpeta.** Cada feature expone lo que otros módulos pueden usar en su `index.js`.
- **Alias `@`** apunta a `src/`.
- **Reglas de negocio** (por ejemplo validaciones de sesión) viven en `features/<feature>/validation` o `features/<feature>/domain`, nunca en los componentes.
- **Llamadas a la API** pasan por `lib/http/httpClient` y se encapsulan en un `service` del feature.
- **Estilos** con CSS Modules (`*.module.css`) usando los tokens de `styles/tokens.css`.
- **Rutas** se referencian con las constantes de `app/routes/paths.js`.

## Rutas

| Ruta | Acceso | Contenido |
|---|---|---|
| `/` | Público | Inicio |
| `/servicios` | Público | Servicios y especialidades |
| `/agendar` | Público | Agendar cita |
| `/iniciar-sesion` | Solo invitados | Iniciar sesión |
| `/panel` | Requiere sesión | Área privada |
