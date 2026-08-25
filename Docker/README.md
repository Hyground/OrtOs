# Docker

## Qué hay aquí

Un archivo de Docker Compose que construye y conecta la API Spring Boot con la web React servida por Nginx. Los `Dockerfile` específicos viven junto al código de cada módulo.

## Qué debería hacer

Esta carpeta debe centralizar la ejecución local en contenedores. Más adelante puede incluir bases de datos, volúmenes, redes, observabilidad y configuraciones por ambiente.

## Responsable


## Ejecutar

```powershell
docker compose up --build
```

Para detener los servicios use `docker compose down`.

