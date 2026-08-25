# Stack y preparación del entorno

Este documento reúne las herramientas, frameworks y librerías utilizadas por OrtOs, además de una guía breve para preparar una computadora de desarrollo.

## Stack del proyecto

### API

| Tecnología | Uso | Versión del proyecto |
|---|---|---|
| Java | Lenguaje de la API | 21 |
| Spring Boot | Framework del servidor REST | 3.5.5 |
| Spring Web | Endpoints HTTP y respuestas JSON | Administrada por Spring Boot |
| JUnit 5 | Pruebas automatizadas | Administrada por Spring Boot |
| Maven | Dependencias y construcción | 3.9 o superior recomendado |

Archivos principales: `API/pom.xml` y `API/src/`.

### App Android

| Tecnología | Uso | Versión del proyecto |
|---|---|---|
| Kotlin | Lenguaje de la app móvil | 2.2.10 |
| Android SDK | Compilación y ejecución Android | compile/target SDK 35; mínimo SDK 24 |
| Android Gradle Plugin | Construcción de la app | 8.12.1 |
| AndroidX Core KTX | Utilidades Kotlin para Android | 1.16.0 |
| AndroidX AppCompat | Compatibilidad de interfaz | 1.7.1 |
| Gradle | Construcción y dependencias | Gestionado por Android Studio |

Archivos principales: `App/build.gradle.kts`, `App/app/build.gradle.kts` y `App/app/src/`.

### Web

| Tecnología | Uso | Versión |
|---|---|---|
| Node.js | Entorno de desarrollo web | 20 o superior; 22 recomendado |
| npm | Gestión de dependencias y scripts | Incluido con Node.js |
| React | Interfaz web | Declarada en `package.json` |
| React DOM | Renderizado de React en navegador | Declarada en `package.json` |
| Vite | Servidor de desarrollo y compilación | Declarada en `package.json` |
| Plugin React para Vite | Integración React/Vite | Declarada en `package.json` |
| Nginx | Servidor web del contenedor | 1.27 Alpine en el Dockerfile |

Archivos principales: `Web/package.json`, `Web/vite.config.js` y `Web/src/`.

Al ejecutar `npm install`, npm resolverá las versiones declaradas y generará `package-lock.json`. Este archivo debe conservarse en Git para que el equipo instale exactamente las mismas versiones.

### Contenedores

| Tecnología | Uso |
|---|---|
| Docker Engine | Construcción y ejecución de contenedores |
| Docker Compose | Inicio coordinado de API y web |
| Eclipse Temurin | Imágenes Java de compilación y ejecución |
| Maven Container Image | Compilación de la API dentro de Docker |
| Node Alpine | Compilación de la web dentro de Docker |
| Nginx Alpine | Publicación de la web y proxy hacia la API |

Archivos principales: `Docker/compose.yaml`, `API/Dockerfile` y `Web/Dockerfile`.

### Herramientas recomendadas

- Git para control de versiones.
- Visual Studio Code o IntelliJ IDEA para API y web.
- Android Studio para la app Android.
- Postman, Insomnia o Bruno para probar endpoints; también puede usarse el navegador para peticiones `GET`.

## Instalación en Windows

### 1. Git

Descargue Git desde [git-scm.com](https://git-scm.com/download/win), complete el instalador y compruebe:

```powershell
git --version
```

### 2. Java 21

Instale un JDK 21, por ejemplo Eclipse Temurin desde [Adoptium](https://adoptium.net/temurin/releases/?version=21). Durante la instalación active las opciones para configurar `JAVA_HOME` y agregar Java a `PATH`.

Reabra PowerShell y compruebe:

```powershell
java -version
javac -version
```

Ambos comandos deben indicar Java 21.

### 3. Maven

Descargue el archivo binario desde [Apache Maven](https://maven.apache.org/download.cgi), descomprímalo en una ubicación estable y agregue su carpeta `bin` a la variable de entorno `PATH`.

Compruebe la instalación:

```powershell
mvn -version
```

Maven debe mostrar la ruta del JDK 21. Maven no es obligatorio si la API solamente se ejecutará mediante Docker, pero sí es útil para desarrollo local.

### 4. Node.js y npm

Instale una versión LTS de Node.js desde [nodejs.org](https://nodejs.org/en/download). npm se instala junto con Node.js.

Compruebe:

```powershell
node --version
npm --version
```

Luego instale las dependencias web:

```powershell
cd Web
npm install
```

### 5. Android Studio y Android SDK

Instale [Android Studio](https://developer.android.com/studio). En el asistente inicial instale:

- Android SDK Platform 35.
- Android SDK Build-Tools.
- Android SDK Platform-Tools.
- Android Emulator, si no se utilizará un teléfono físico.
- Al menos una imagen de sistema para el emulador.

Después abra la carpeta `App`. Android Studio sincronizará Gradle y descargará las dependencias Kotlin/AndroidX automáticamente. Cree un dispositivo virtual desde Device Manager o conecte un teléfono con depuración USB.

### 6. Docker Desktop

Instale [Docker Desktop](https://www.docker.com/products/docker-desktop/). En Windows se recomienda utilizar el motor basado en WSL 2. Reinicie cuando el instalador lo solicite y abra Docker Desktop antes de ejecutar comandos.

Compruebe:

```powershell
docker --version
docker compose version
```

## Puesta en marcha

### Todo mediante Docker

No requiere instalar Java, Maven, Node.js ni Nginx localmente; Docker descarga y utiliza las imágenes correspondientes.

```powershell
cd Docker
docker compose up --build
```

- Web: `http://localhost:3000`
- API: `http://localhost:8080/api/saludo`

Detener los servicios:

```powershell
docker compose down
```

### Desarrollo local

Terminal 1, API:

```powershell
cd API
mvn spring-boot:run
```

Terminal 2, web:

```powershell
cd Web
npm install
npm run dev
```

Abra la dirección mostrada por Vite, normalmente `http://localhost:5173`. El proxy de desarrollo enviará las peticiones `/api` a Spring Boot.

Para Android, abra `App` con Android Studio y pulse **Run**.

## Verificación final

```powershell
git --version
java -version
mvn -version
node --version
npm --version
docker --version
docker compose version
```

No todas las herramientas son obligatorias al mismo tiempo: para trabajar únicamente con contenedores basta con Git y Docker Desktop; para desarrollar todos los módulos localmente se recomienda instalar el conjunto completo.

