# Docker

## Qué hay aquí

Un archivo de Docker Compose que construye y conecta la API Spring Boot con la web React servida por Nginx. Los `Dockerfile` específicos viven junto al código de cada módulo.

## Qué debería hacer

Esta carpeta debe centralizar la ejecución local en contenedores. Más adelante puede incluir bases de datos, volúmenes, redes, observabilidad y configuraciones por ambiente.

## Responsable


## Ejecutar

```powershell
Set-Location Docker
$env:ORTOS_JWT_SECRET = "replace-with-a-long-random-secret"
docker compose up --build
```

Para detener los servicios use `docker compose down`.

El Compose conserva una sola API, una sola PostgreSQL y el volumen nombrado
`ortos_pgdata`. PostgreSQL tiene healthcheck; la API espera ese servicio y
Flyway aplica las migraciones al arrancar. Los módulos no crean bases de datos
ni servicios Docker adicionales.

