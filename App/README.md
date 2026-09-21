# OrtOs

## Preparar el proyecto en una computadora nueva

1. Instale Android Studio y el Android SDK. No copie `local.properties` desde otra
   computadora: Android Studio lo crea localmente con la ubicacion del SDK.
2. Abra **esta carpeta `App/` como proyecto**, no el repositorio completo ni
   `App/app/`. El archivo `settings.gradle.kts` que define el proyecto esta aqui.
3. Permita la sincronizacion y las descargas de Gradle. El wrapper descarga la
   version exacta de Gradle y los criterios del daemon descargan un JDK 17 de
   Temurin cuando no existe uno compatible. No se guarda ninguna ruta absoluta
   en el repositorio.
4. Instale desde SDK Manager la plataforma Android indicada por `compileSdk` si
   Android Studio no la instala durante la sincronizacion.

Para comprobar el entorno desde una terminal:

```powershell
cd App
.\gradlew.bat clean assembleDebug
```

En Linux o macOS use `./gradlew clean assembleDebug`.

Si aparece `Task 'prepareKotlinBuildScriptModel' not found in project ':app'`,
el IDE vinculo el modulo como si fuera el proyecto completo. Quite ese vinculo
Gradle y vuelva a abrir/importar la carpeta `App/`.

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
