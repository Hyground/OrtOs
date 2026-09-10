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

| Rol           | Correo                  | Contraseña    |
| ------------- | ----------------------- | ------------- |
| Administrador | `admin@ortos.test`      | `Admin123`    |
| Odontólogo    | `odontologo@ortos.test` | `Odonto123`   |
| Paciente      | `paciente@ortos.test`   | `Paciente123` |

Para probar:

1. Abra `http://localhost:5173`.
2. Pulse **Iniciar sesión**.
3. Use cualquiera de los usuarios anteriores.
4. Entre a **Mi panel** o navegue directo a `/panel`.

El odontólogo tiene un panel propio con acceso únicamente a **Pacientes, Citas y Pagos**, incluido el expediente desde esos módulos. Las demás rutas privadas quedan restringidas para ese rol.

El administrador conserva sus módulos y dispone de **Usuarios** (`/panel/usuarios`), identificado con un azul más oscuro. Puede buscar, crear, editar, activar, desactivar y eliminar cuentas; no puede eliminar o desactivar su propia cuenta ni quitarse el rol de administrador.

Las cuentas creadas o modificadas desde Usuarios funcionan en el inicio de sesión local durante la sesión de la aplicación. Estos cambios son mocks en memoria y se reinician al recargar. Las contraseñas no se muestran en la tabla. El control de roles del frontend deberá complementarse con autorización en la API cuando se conecte el backend.
## Mejoras de interfaz y portal

- El chat se trasladó a la barra superior para no cubrir tablas, formularios ni acciones. En pantallas pequeñas su panel se adapta al ancho disponible.
- La campana muestra notificaciones calculadas desde las citas, pagos y mensajes del entorno; permite filtrar las no leídas, marcarlas como leídas y abrir el módulo relacionado.
- El control de apariencia permite **Claro**, **Oscuro** y **Predeterminado del sistema**. La opción inicial sigue la configuración del dispositivo y la preferencia queda guardada en el navegador.
- La exportación de pacientes genera un archivo `.xlsx` con encabezado, colores, filtros, filas alternas, columnas ajustadas y fecha de generación de OrtOs.
- Las cuentas de paciente tienen un portal con próxima cita, tratamiento, pagos y comprobantes, perfil y mensajería con la clínica. No reciben acceso a funciones administrativas.

Estas funciones usan los datos mock actuales. Al conectar la API, las fuentes de citas, pagos, notificaciones y mensajes deberán sustituirse por sus servicios remotos conservando las mismas interfaces de UI.
