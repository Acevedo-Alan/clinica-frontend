# Clínica Virtual — Frontend

Frontend en **Angular 21 + Angular Material 21** para el sistema de gestión de turnos médicos.
Repositorio separado del backend (`clinica-backend`). Rama de entrega: `entrega-frontend`.

Cubre los cuatro roles: **paciente**, **operador**, **médico** y **administrador**.

## Versiones utilizadas

| Herramienta        | Versión                                   |
| ------------------ | ----------------------------------------- |
| Node.js            | 22.22.0 (sirve `^20.19`, `^22.12` o `^24`) |
| npm                | 10.9.4                                    |
| Angular CLI        | 21.2.26                                   |
| Angular / Material | 21.2.x                                    |
| TypeScript         | 5.9                                       |
| Chart.js           | 4.6                                       |
| MySQL / MariaDB    | cualquier versión reciente (ej. XAMPP)    |

Sin SSR. Estilos en SCSS.

## Librería de gráficos

Se usa **Chart.js 4** directamente, sin wrapper de Angular. Está encapsulada en un único componente
reutilizable, [`src/app/shared/chart`](src/app/shared/chart), y es compatible con Angular 21.
El dashboard de reportes muestra **gráficos de barras** (turnos por especialidad y por sede) y un
**gráfico de torta/dona** (tasa de cancelación).

## Puesta en marcha desde cero

Se necesitan, en este orden: la base de datos, el backend y el frontend.

### 1. Base de datos

1. Tener MySQL o MariaDB corriendo en `localhost:3306` (por ejemplo con XAMPP).
2. Importar `clinica-backend/clinica.sql`. El script crea la base `clinica` y carga los datos de prueba.
   - Desde phpMyAdmin: pestaña **Importar**, sin seleccionar ninguna base, elegir el archivo y ejecutar.
   - Desde consola: `mysql -u root -p < clinica-backend/clinica.sql`
3. Si la base `clinica` ya existía con otros datos, eliminarla antes (`DROP DATABASE clinica;`) para
   evitar mezclar versiones.

### 2. Backend

```bash
cd clinica-backend
npm install
cp .env.example .env     # en Windows: copy .env.example .env
```

Completar el `.env` (ver la tabla de variables más abajo) y levantar:

```bash
npm start                # o npm run dev para reiniciar automáticamente
```

Verificar abriendo <http://localhost:3000/health>: debe indicar que la conexión a la base funciona.

### 3. Frontend

```bash
cd clinica-frontend
npm install
ng serve
```

Abrir <http://localhost:4200>. Si `npm install` falla por resolución de dependencias,
usar `npm install --legacy-peer-deps`.

Build de producción: `ng build` (salida en `dist/`).

### 4. Probar

Ingresar con cualquiera de los usuarios de la sección siguiente.

## Variables de entorno

### Backend (`clinica-backend/.env`)

| Variable         | Descripción                                  | Valor de ejemplo |
| ---------------- | -------------------------------------------- | ---------------- |
| `PORT`           | Puerto del servidor                          | `3000`           |
| `DB_HOST`        | Host de la base de datos                     | `localhost`      |
| `DB_PORT`        | Puerto de la base de datos                   | `3306`           |
| `DB_USER`        | Usuario de la base                           | `root`           |
| `DB_PASSWORD`    | Contraseña de la base                        | (la propia)      |
| `DB_NAME`        | Nombre de la base                            | `clinica`        |
| `JWT_SECRET`     | Clave para firmar los tokens                 | (cadena larga)   |
| `JWT_EXPIRES_IN` | Duración de la sesión                        | `8h`             |

### Frontend

La URL de la API se define en **un único lugar**: [`src/environments/environment.ts`](src/environments/environment.ts).

```ts
export const environment = { apiUrl: 'http://localhost:3000' };
```

Todos los servicios la toman de ahí. Si el backend corre en otro puerto, se cambia solo ese archivo.

## Usuarios de prueba

Contraseña de todos: `123456`. El ingreso es por **DNI**, no por email.

| Rol           | DNI      | Nombre          |
| ------------- | -------- | --------------- |
| administrador | 18222333 | Marcos Gomez    |
| operador      | 15200548 | Juan Perez      |
| médico        | 20111222 | Ana Lopez       |
| paciente      | 36000960 | Franco Friggeri |

### Datos de demostración adicionales

Cargados desde la propia aplicación (administrador y médicos), con contraseña `123456`:

| Rol    | DNI      | Nombre         | Especialidad  | Sede        |
| ------ | -------- | -------------- | ------------- | ----------- |
| médico | 25111333 | Laura Martinez | Cardiologia   | Sede Centro |
| médico | 27222444 | Pablo Ruiz     | Pediatria     | Sede Norte  |

Ana Lopez tiene agenda en **más de una sede** (Sede Centro y Sede Norte). Hay turnos en los tres
estados: confirmado, cancelado y atendido.

Un paciente nuevo se puede crear desde **Registrarme** (pantalla de login) o, con el rol operador,
desde **Pacientes**.

## Pantallas por rol

Cada pantalla solo es accesible para los roles que corresponden, tanto desde el menú como escribiendo
la URL a mano (guards de rol; los demás roles ven "Acceso denegado").

| Rol           | Pantallas                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------- |
| Paciente      | Mi perfil, Solicitar turno, Mis turnos                                                      |
| Médico        | Mi perfil, Mi agenda, Turnos del día, Historial de pacientes                                |
| Operador      | Mi perfil, Turnos (asignar), Pacientes (alta), Agenda médica                                |
| Administrador | Mi perfil, Usuarios, Coberturas, Sedes, Especialidades, Auditoría, Reportes                 |

Todos los roles tienen además la **campana de notificaciones** en el header, con contador de no leídas.

## Reglas de negocio relevantes

- Los turnos duran **30 minutos**. Solo se ofrecen las fechas con agenda y los horarios libres.
- No se puede eliminar un rango horario con turnos, ni modificarlo dejando un turno confirmado fuera
  del nuevo horario. El backend informa el motivo y la interfaz lo muestra.
- El operador solo modifica la agenda y los turnos de **su sede**; las demás sedes se pueden consultar.
- El médico ve y opera solo sobre su propia agenda y sus propios turnos, en cualquiera de sus sedes, y
  solo ve el historial clínico de los turnos que atendió él mismo.
- El paciente solo puede modificar email, contraseña, teléfono y cobertura.
- Si el token vence, se vuelve al login. Si el backend no responde, se muestra un mensaje con la opción
  de reintentar.
- Fechas en formato día/mes/año. Aplicación pensada para escritorio.

### Límites de los campos

Coinciden con las columnas de la base de datos:

| Campo                 | Máximo         |
| --------------------- | -------------- |
| Nombre y apellido     | 30 caracteres  |
| Email                 | 30 caracteres  |
| Teléfono de usuario   | 10 caracteres  |
| DNI                   | 8 dígitos      |
| Nota del turno        | 40 caracteres  |

## Cambios realizados en el backend

Se respetó la estructura de respuesta uniforme, la protección por rol y el registro en auditoría.
Detalle completo en [`clinica-backend/README.md`](../clinica-backend/README.md). Los endpoints
agregados o modificados están documentados en `postman_collection.json`.

- `GET /medicos`: médicos con sus especialidades, filtrable por especialidad y sede.
- `GET /disponibilidad/fechas` y `GET /disponibilidad/horarios`: fechas con agenda y horarios libres.
- `GET /pacientes`: búsqueda por DNI o apellido (operador, médico y administrador).
- `PUT /auth/perfil` y `PUT /auth/password`: el paciente actualiza sus datos (contraseña hasheada).
- `GET/POST/PUT /usuarios`: listado paginado con filtros, alta y edición (incluye especialidades del médico).
- `GET /auditoria` y `GET /reportes`: consulta del administrador.
- Sedes y especialidades: lectura para cualquier usuario con sesión; alta, modificación y baja solo del administrador.
- Agenda: el operador solo puede modificar su sede (403 en otro caso).

## Estructura

```
src/app/
  core/        config del menú, guards, interceptor, modelos, servicios y utilidades
  layout/      header y menú lateral
  pages/       login, registro, perfil, home y las pantallas de cada rol
  shared/      componentes reutilizables (gráfico, diálogo de confirmación)
src/environments/environment.ts   URL de la API
```

## Entrega

Rama `entrega-frontend`. Para validar el proyecto: `npm install`, `ng build` (sin errores) y `ng serve`.
