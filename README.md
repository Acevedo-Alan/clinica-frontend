# Clínica Salud — Frontend

Aplicación web para la gestión de una clínica, desarrollada con Angular y conectada a una API REST construida con Node.js, Express y MySQL.

## Tecnologías utilizadas

- **Node.js:** 22.20.0
- **Angular CLI:** 21.2.26
- **Angular:** 21.2.25
- **Angular Material:** 21
- **TypeScript:** 5.9
- **Backend:** Node.js y Express
- **Base de datos:** MySQL
- **Autenticación:** JWT

## Funcionalidades implementadas

- Registro de pacientes con validaciones.
- Listado de coberturas médicas obtenido desde el backend.
- Inicio de sesión mediante DNI y contraseña.
- Autenticación con JWT.
- Persistencia de sesión al recargar la página.
- Cierre de sesión.
- Protección de rutas mediante guards.
- Acceso a secciones según el rol del usuario: administrador, médico, operador y paciente.
- Consulta de datos personales desde la pantalla «Mi perfil».
- Página de error para rutas inexistentes.
- Layout general con encabezado, menú de navegación y pie de página.

## Requisitos previos

- Node.js compatible con Angular 21.
- Angular CLI 21.
- Backend de Clínica Salud configurado y en ejecución.
- Base de datos MySQL configurada para el backend.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Acevedo-Alan/clinica-frontend.git
```

Ingresar al proyecto:

```bash
cd clinica-frontend
```

Instalar las dependencias:

```bash
npm install
```

## Configuración

Verificar la URL base de la API en:

`src/environments/environment.ts`

El backend debe estar en ejecución y tener habilitado CORS para permitir las solicitudes desde el frontend.

## Ejecución

Iniciar el servidor de desarrollo:

```bash
npx ng serve
```

Abrir en el navegador:

http://localhost:4200

## Roles disponibles

- **Paciente:** acceso a su sección y perfil.
- **Médico:** acceso a su sección y perfil.
- **Operador:** acceso a su sección y perfil.
- **Administrador:** acceso a su sección y perfil.

Las funcionalidades específicas de cada sección se incorporarán progresivamente en las siguientes etapas del proyecto.

## Seguridad

Las rutas privadas están protegidas mediante guards de Angular. Las peticiones autenticadas incluyen el token JWT y el backend valida los permisos correspondientes.

## Estado del proyecto

Frontend inicial correspondiente a la Semana 1 de desarrollo.

## Rama de entrega

`entrega-frontend-1`
