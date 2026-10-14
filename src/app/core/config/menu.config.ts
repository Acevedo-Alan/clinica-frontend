import { Rol } from '../models/api.models';

export interface ItemMenu {
  titulo: string;
  icono: string;
  /** Segmento de ruta relativo a la sección del rol (`/paciente/<ruta>`). */
  ruta: string;
}

/** Prefijo de URL de la sección de cada rol. */
export const RUTA_BASE: Record<Rol, string> = {
  administrador: 'admin',
  operador: 'operador',
  medico: 'medico',
  paciente: 'paciente',
};

export const ETIQUETA_ROL: Record<Rol, string> = {
  administrador: 'Administrador',
  operador: 'Operador',
  medico: 'Médico',
  paciente: 'Paciente',
};

export const ROLES: Rol[] = ['administrador', 'operador', 'medico', 'paciente'];

/**
 * Menú por rol. Es la única fuente de verdad: de acá salen tanto las opciones
 * del menú lateral como las rutas de cada sección. Todo lo que no es
 * "Mi perfil" apunta, por ahora, a la pantalla "En construcción".
 */
export const MENU: Record<Rol, ItemMenu[]> = {
  paciente: [
    { titulo: 'Mi perfil', icono: 'account_circle', ruta: 'perfil' },
    { titulo: 'Solicitar turno', icono: 'event_available', ruta: 'solicitar-turno' },
    { titulo: 'Mis turnos', icono: 'calendar_month', ruta: 'mis-turnos' },
    { titulo: 'Historial clínico', icono: 'assignment', ruta: 'historial' },
  ],
  medico: [
    { titulo: 'Mi perfil', icono: 'account_circle', ruta: 'perfil' },
    { titulo: 'Mi agenda', icono: 'edit_calendar', ruta: 'agenda' },
    { titulo: 'Turnos del día', icono: 'today', ruta: 'turnos' },
    { titulo: 'Historial de pacientes', icono: 'assignment', ruta: 'historial' },
  ],
  operador: [
    { titulo: 'Mi perfil', icono: 'account_circle', ruta: 'perfil' },
    { titulo: 'Turnos', icono: 'calendar_month', ruta: 'turnos' },
    { titulo: 'Pacientes', icono: 'groups', ruta: 'pacientes' },
    { titulo: 'Agenda médica', icono: 'edit_calendar', ruta: 'agenda' },
  ],
  administrador: [
    { titulo: 'Mi perfil', icono: 'account_circle', ruta: 'perfil' },
    { titulo: 'Usuarios', icono: 'manage_accounts', ruta: 'usuarios' },
    { titulo: 'Coberturas', icono: 'health_and_safety', ruta: 'coberturas' },
    { titulo: 'Sedes', icono: 'apartment', ruta: 'sedes' },
    { titulo: 'Especialidades', icono: 'local_hospital', ruta: 'especialidades' },
  ],
};

export function rutaDe(rol: Rol, segmento: string): string {
  return `/${RUTA_BASE[rol]}/${segmento}`;
}
