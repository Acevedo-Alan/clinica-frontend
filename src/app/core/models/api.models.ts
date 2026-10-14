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
