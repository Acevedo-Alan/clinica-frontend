/** Formato uniforme de respuesta del backend: { codigo, estado, datos }. */
export interface ApiResponse<T> {
  codigo: number;
  /** "ok" si salió bien; si hubo error, trae el mensaje. */
  estado: string;
  datos: T;
}

export type Rol = 'administrador' | 'operador' | 'medico' | 'paciente';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  rol: Rol;
  email: string;
}

export interface Perfil {
  id: number;
  apellido: string;
  nombre: string;
  fecha_nacimiento: string;
  rol: Rol;
  email: string;
  telefono: string;
  dni: string;
  id_sede: number | null;
  id_cobertura: number | null;
  /** Solo presente cuando `rol === 'medico'`: ids de sus propias especialidades. */
  especialidades?: number[];
}

export interface PerfilEdicion {
  email: string;
  telefono: string;
  id_cobertura: number;
}

export interface CambioPassword {
  passwordActual: string;
  passwordNueva: string;
  confirmarPassword: string;
}

export interface LoginRequest {
  dni: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}

export interface RegistroRequest {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  /** Formato YYYY-MM-DD */
  fecha_nacimiento: string;
  id_cobertura: number;
}

export interface Cobertura {
  id: number;
  nombre: string;
}

export interface Sede {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Especialidad {
  id: number;
  descripcion: string;
}

/** Roles que el administrador puede dar de alta (el paciente se registra solo). */
export type RolGestionable = 'operador' | 'medico' | 'administrador';

export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: Rol;
  id_sede: number | null;
  id_cobertura: number | null;
  /** Solo presente cuando `rol === 'medico'`. */
  especialidades?: number[];
}

export interface UsuarioAlta {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  telefono: string;
  fecha_nacimiento: string;
  rol: RolGestionable;
  id_sede?: number;
  especialidades?: number[];
}

export interface UsuarioEdicion {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fecha_nacimiento: string;
  id_sede?: number;
  id_cobertura?: number;
  especialidades?: number[];
}

export type AccionAuditoria = 'ALTA' | 'BAJA' | 'MODIFICACION';

export interface RegistroAuditoria {
  id: number;
  id_usuario: number;
  nombre_usuario: string | null;
  apellido_usuario: string | null;
  accion: AccionAuditoria;
  entidad: string;
  id_entidad: number | null;
  detalle: string | null;
  fecha: string;
}

export interface TurnosPorEspecialidad {
  id_especialidad: number;
  descripcion: string;
  cantidad: number;
}

export interface TurnosPorSede {
  id_sede: number;
  nombre: string;
  cantidad: number;
}

export interface RankingMedico {
  id_medico: number;
  nombre: string;
  apellido: string;
  cantidad: number;
}

export interface TasaCancelacion {
  total: number;
  cancelados: number;
  porcentaje: number;
}

/** El nombre evita colisión con el componente de página `Reportes`. */
export interface DatosReportes {
  turnosPorEspecialidad: TurnosPorEspecialidad[];
  turnosPorSede: TurnosPorSede[];
  rankingMedicos: RankingMedico[];
  tasaCancelacion: TasaCancelacion;
}

export type EstadoTurno = 'confirmado' | 'cancelado' | 'atendido';

export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: Especialidad[];
}

/** Bloque de agenda de un médico (`GET /agenda`), con los nombres ya resueltos. */
export interface BloqueAgenda {
  id: number;
  hora_entrada: string;
  hora_salida: string;
  /** Formato YYYY-MM-DD */
  fecha: string;
  id_medico: number;
  medico_nombre: string;
  medico_apellido: string;
  id_especialidad: number;
  especialidad_descripcion: string;
  id_sede: number;
  sede_nombre: string;
}

export interface TurnoNuevo {
  id_agenda: number;
  /** Formato HH:mm */
  hora: string;
  nota: string;
  /** Solo lo usa operador: a qué paciente se le asigna el turno (el backend lo ignora para rol paciente). */
  id_paciente?: number;
}

export interface Turno {
  id: number;
  nota: string;
  id_agenda: number;
  fecha: string;
  hora: string;
  id_paciente: number;
  id_cobertura: number;
  estado: EstadoTurno;
}

/** Alta/modificación de un rango de agenda (`POST`/`PUT /agenda`): sin nombres resueltos. */
export interface AgendaNueva {
  /** Formato HH:mm */
  hora_entrada: string;
  /** Formato HH:mm */
  hora_salida: string;
  /** Formato YYYY-MM-DD */
  fecha: string;
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
}

/** Turno visto por el médico (`GET /turnos/medico`), con el paciente y la sede resueltos. */
export interface TurnoMedico {
  id: number;
  nota: string;
  id_agenda: number;
  fecha: string;
  hora: string;
  id_cobertura: number;
  estado: EstadoTurno;
  id_paciente: number;
  paciente_nombre: string;
  paciente_apellido: string;
  /** Formato YYYY-MM-DD */
  paciente_fecha_nacimiento: string;
  id_sede: number;
  sede_nombre: string;
}

/** Turno visto por el operador (`GET /turnos/sede`), con paciente/médico/especialidad resueltos para la sede propia. */
export interface TurnoSede {
  id: number;
  nota: string;
  id_agenda: number;
  fecha: string;
  hora: string;
  id_cobertura: number;
  estado: EstadoTurno;
  id_paciente: number;
  paciente_nombre: string;
  paciente_apellido: string;
  /** Formato YYYY-MM-DD */
  paciente_fecha_nacimiento: string;
  id_medico: number;
  medico_nombre: string;
  medico_apellido: string;
  id_especialidad: number;
  especialidad_descripcion: string;
}

/** Turno visto por el paciente dueño (`GET /turnos/mios`), con médico/especialidad/sede resueltos. */
export interface TurnoMio {
  id: number;
  nota: string;
  id_agenda: number;
  fecha: string;
  hora: string;
  id_cobertura: number;
  estado: EstadoTurno;
  id_medico: number;
  medico_nombre: string;
  medico_apellido: string;
  id_especialidad: number;
  especialidad_descripcion: string;
  id_sede: number;
  sede_nombre: string;
}

export interface HistorialNuevo {
  id_turno: number;
  diagnostico: string;
  tratamiento?: string;
  observaciones?: string;
}

export interface HistorialClinico {
  id: number;
  id_turno: number;
  id_medico: number;
  id_paciente: number;
  diagnostico: string;
  tratamiento: string | null;
  observaciones: string | null;
  /** Solo en el listado (`GET /historial/paciente/:id`), no en el alta. */
  fecha_registro?: string;
}

/** Resultado de `GET /pacientes?dni=|apellido=`. */
export interface PacienteBusqueda {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  id_cobertura: number;
}

export interface Notificacion {
  id: number;
  id_usuario: number;
  tipo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

export interface Paginado<T> {
  items: T[];
  pagina: number;
  tamanioPagina: number;
  total: number;
  totalPaginas: number;
}
