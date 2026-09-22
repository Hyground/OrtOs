# OrtOs — instrucciones obligatorias para agentes de IA

Estas instrucciones aplican a todo agente que trabaje en este repositorio. Su
objetivo es permitir trabajo paralelo sin convertir OrtOs en microservicios ni
crear conflictos evitables.

## Arquitectura innegociable

- OrtOs tiene una sola API Spring Boot, una sola base PostgreSQL y un único
  Compose principal en `Docker/compose.yaml`.
- Los módulos son límites de propiedad de código; **no** son APIs, contenedores
  ni bases de datos independientes.
- No crear `postgres-*`, `api-*`, esquemas por módulo ni duplicados de
  entidades ya existentes.
- Mantener los contratos HTTP públicos existentes salvo que la tarea solicite
  expresamente un cambio compatible y documentado.
- No editar ni eliminar datos o migraciones históricas para resolver un error.

## Mapa de propiedad

| Dueño | Rama | Código API | Migraciones | Tablas actuales | Rutas actuales |
| --- | --- | --- | --- | --- | --- |
| Patients | `feature/patients` | `API/src/main/java/com/ortos/api/modules/patients/` | `API/src/main/resources/db/migration/patients/` | `pacientes` | `/api/patients` |
| Staff | `feature/staff` | `API/src/main/java/com/ortos/api/modules/staff/` | `API/src/main/resources/db/migration/staff/` | `medicos`, `especialidades`, `usuarios` | `/api/doctors`, `/api/specialties`, `/api/users`, `/api/auth` |
| Appointments | `feature/appointments` | `API/src/main/java/com/ortos/api/modules/appointments/` | `API/src/main/resources/db/migration/appointments/` | `citas` | `/api/appointments` |
| Clinical | `feature/clinical` | `API/src/main/java/com/ortos/api/modules/clinical/` | `API/src/main/resources/db/migration/clinical/` | `tratamientos`, `historial_clinico`, `odontograma` | `/api/services`, `/api/clinical-history`, `/api/odontogram` |
| Finance | `feature/finance` | `API/src/main/java/com/ortos/api/modules/finance/` | `API/src/main/resources/db/migration/finance/` | `pagos` | `/api/payments` |

Capacidades aún no implementadas, pero reservadas:

- Patients: `patient_messages`, `user_preferences`.
- Appointments: `notifications`.
- Finance: `audit_log`.

Su primera implementación debe crearse exclusivamente dentro de su módulo y
carpeta de migraciones asignados.

## Procedimiento automático obligatorio

Antes de editar:

1. Ejecutar `git status --short` y preservar todos los cambios existentes.
2. Ejecutar `git fetch origin` y comparar archivos entrantes con cambios locales.
3. Hacer `git pull --ff-only origin main` únicamente si no hay solapamiento de
   archivos locales rastreados o no rastreados. Si hay solapamiento, no hacer
   pull, no sobrescribir nada y reportar los archivos implicados.
4. Identificar el módulo dueño usando la tabla anterior y leer
   `API/TEAM_MODULES.md` y `API/src/main/resources/db/migration/README.md`.
5. Limitar los cambios al módulo dueño, su carpeta de migraciones y pruebas
   asociadas. Si la tarea requiere otro módulo o un archivo compartido, informar
   el alcance y esperar autorización cuando el cambio no sea estrictamente
   necesario.

Durante la implementación:

1. Mantener juntos controller, service, repository, entity y DTO del dominio.
2. Mantener los paquetes Java `com.ortos.api.modules.<modulo>` y actualizar
   todos los imports afectados por cualquier movimiento.
3. Para referencias externas usar IDs y contratos enfocados; nunca copiar una
   entidad de otro módulo.
4. Usar `com.ortos.api.shared` solo para seguridad, configuración, errores o
   utilidades que realmente sirvan a más de un módulo. No convertirlo en un
   contenedor genérico de lógica de negocio.
5. No añadir dependencias de infraestructura, servicios Docker o credenciales
   sin una necesidad explícita y autorización del usuario.

Antes de finalizar:

1. Ejecutar `git diff --check`.
2. Ejecutar las pruebas del área y `mvn test` desde `API/` cuando Maven esté
   disponible.
3. Validar que imports, paquetes, rutas y migraciones sigan siendo coherentes.
4. Si se cambió Docker, ejecutar con una variable temporal
   `ORTOS_JWT_SECRET` el comando `docker compose config` desde `Docker/`.
5. Si Docker Desktop está disponible, levantar el stack y comprobar la conexión
   de API a PostgreSQL. Si una herramienta no está disponible, no inventar un
   resultado: informar el bloqueo y el comando pendiente.

## Dependencias permitidas entre módulos

- `staff` puede referenciar `patients` mediante `usuarios.patient_id`.
- `appointments` puede referenciar pacientes (`patient_id`) y usuarios
  (`creada_por`).
- `clinical` puede referenciar pacientes (`patient_id`) y usuarios
  (`registrado_por`).
- `finance` puede referenciar pacientes (`patient_id`) y usuarios
  (`registrado_por`).
- Ningún módulo debe importar una entidad ajena si un ID o una operación
  específica resuelve la necesidad. Evitar dependencias circulares.

## Flyway y PostgreSQL

### Fuente de verdad de datos

- El respaldo de base de datos ubicado en la raíz,
  `dump-ortos_db-202609172135.sql`, **puede y debe modificarse** cuando una tarea
  cambie de forma legítima el esquema o los datos de referencia.
- Antes de tomar decisiones sobre tablas, columnas, relaciones, valores de
  catálogo o datos existentes, inspeccionar directamente ese archivo SQL. Sus
  datos son la fuente prioritaria de verdad.
- Los archivos `.md`, incluidos inventarios y documentación, son apoyo y pueden
  quedar desactualizados; no deben prevalecer sobre los datos reales del dump.
- Si el dump y un `.md` se contradicen, usar el dump, señalar la discrepancia y
  actualizar la documentación afectada cuando esté dentro del alcance.
- Cuando una migración nueva cambie esquema o datos de referencia, actualizar
  también el dump de forma coherente, sin borrar registros ni reemplazar datos
  existentes salvo que el usuario lo haya autorizado explícitamente.
- El dump raíz no sustituye a Flyway ni se ejecuta automáticamente por Docker:
  los cambios evolutivos siguen requiriendo una migración nueva del módulo dueño.

- `V1__init.sql`, `V2__seed.sql` y `V3__add_asistente_role.sql` son inmutables:
  no mover, renombrar, editar ni borrar.
- Cada cambio de esquema nuevo requiere una migración SQL nueva, reversible en
  lo posible, dentro de la carpeta del módulo dueño.
- Usar un nombre `V<version>__<descripcion_snake_case>.sql` y el siguiente
  número libre del rango reservado:
  - Patients: `1000`–`1999`
  - Staff: `2000`–`2999`
  - Appointments: `3000`–`3999`
  - Clinical: `4000`–`4999`
  - Finance: `5000`–`5999`
- Respetar llaves foráneas: una tabla dependiente se crea después de la tabla
  referenciada. No usar una migración central para trabajo nuevo.
- Flyway se ejecuta al iniciar la API; no se debe inicializar PostgreSQL con
  scripts Docker duplicados.

## Archivos compartidos: coordinación requerida

No modificarlos salvo que la tarea lo exija y se indique el impacto:

- `API/src/main/java/com/ortos/api/shared/`
- `API/src/main/resources/application*.properties`
- `API/pom.xml`, `API/Dockerfile`, `API/.dockerignore`
- `Docker/compose.yaml`
- Migraciones históricas V1–V3

No tocar `Web/` ni `App/` durante una tarea de API/Docker a menos que el usuario
lo pida explícitamente.

## Git y entrega

- Usar una rama por módulo y un pull request por funcionalidad.
- No usar `git reset --hard`, `git checkout --`, borrados masivos ni reescritura
  de historial.
- Nunca hacer push, crear ramas remotas, commits ni cambios externos sin que el
  usuario lo pida explícitamente.
- No incluir archivos ajenos al alcance en el commit.
- Entregar: resumen, archivos creados/movidos/modificados, rutas afectadas,
  migraciones, pruebas ejecutadas, resultado y bloqueos reales.
