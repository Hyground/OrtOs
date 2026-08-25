# OrtOs

Proyecto base dividido por plataforma:

- `API/`: servicio REST con Spring Boot y Java.
- `App/`: aplicación Android mínima con Kotlin.
- `Web/`: interfaz web con React y Vite.
- `Docker/`: contenedores para levantar la API y la web.

Consulte [STACK.md](STACK.md) para conocer todas las herramientas, dependencias y pasos de instalación del entorno.

## Inicio rápido

### API

```powershell
cd API
mvn spring-boot:run
```

Disponible en `http://localhost:8080/api/saludo`.

### Web

```powershell
cd Web
npm install
npm run dev
```

Disponible normalmente en `http://localhost:5173`.

### App Android

Abra la carpeta `App` con Android Studio, espere la sincronización de Gradle y ejecute el módulo `app` en un emulador o dispositivo.

### Docker

```powershell
cd Docker
docker compose up --build
```

La web estará en `http://localhost:3000` y la API en `http://localhost:8080`.

## Requisitos

- Java 21 y Maven 3.9+
- Node.js 20+
- Android Studio y Android SDK
- Docker Desktop (opcional)
