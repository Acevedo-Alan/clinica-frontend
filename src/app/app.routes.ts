import { Type } from '@angular/core';
import { Route, Routes } from '@angular/router';
import { MENU, RUTA_BASE, ROLES } from './core/config/menu.config';
import { Rol } from './core/models/api.models';
import { invitadoGuard, rolGuard } from './core/guards/auth.guards';

type Cargador = () => Promise<Type<unknown>>;

/**
 * Pantallas ya implementadas, por rol y segmento de ruta (el segmento es el
 * mismo `ruta` de `menu.config.ts`). Lo que no figura acá cae en "En construcción".
 */
const PAGINAS: Partial<Record<Rol, Partial<Record<string, Cargador>>>> = {
  paciente: {
    'solicitar-turno': () =>
      import('./pages/paciente/solicitar-turno/solicitar-turno').then((m) => m.SolicitarTurno),
    'mis-turnos': () => import('./pages/paciente/mis-turnos/mis-turnos').then((m) => m.MisTurnos),
  },
  medico: {
    agenda: () => import('./pages/medico/agenda/agenda').then((m) => m.AgendaMedico),
    turnos: () => import('./pages/medico/turnos/turnos').then((m) => m.TurnosMedico),
    historial: () => import('./pages/medico/historial/historial').then((m) => m.HistorialMedico),
  },
  operador: {
    agenda: () => import('./pages/operador/agenda/agenda').then((m) => m.AgendaOperador),
    pacientes: () => import('./pages/operador/pacientes/pacientes').then((m) => m.PacientesOperador),
    turnos: () => import('./pages/operador/turnos/turnos').then((m) => m.TurnosOperador),
  },
  administrador: {
    usuarios: () => import('./pages/admin/usuarios/usuarios').then((m) => m.Usuarios),
    sedes: () => import('./pages/admin/sedes/sedes').then((m) => m.Sedes),
    especialidades: () =>
      import('./pages/admin/especialidades/especialidades').then((m) => m.Especialidades),
    coberturas: () => import('./pages/admin/coberturas/coberturas').then((m) => m.Coberturas),
    auditoria: () => import('./pages/admin/auditoria/auditoria').then((m) => m.Auditoria),
    reportes: () => import('./pages/admin/reportes/reportes').then((m) => m.Reportes),
  },
};

/**
 * Sección de un rol (`/admin/...`, `/medico/...`, etc.), generada desde el menú.
 * Solo entra quien tenga sesión y ese rol.
 */
function seccionDe(rol: Rol): Route {
  return {
    path: RUTA_BASE[rol],
    canActivate: [rolGuard(rol)],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'perfil' },
      ...MENU[rol].map((item): Route => {
        if (item.ruta === 'perfil') {
          return {
            path: 'perfil',
            title: 'Mi perfil',
            loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
          };
        }
        const cargador = PAGINAS[rol]?.[item.ruta];
        if (!cargador) {
          throw new Error(`Falta la pantalla "${item.ruta}" del rol ${rol} en PAGINAS`);
        }
        return {
          path: item.ruta,
          title: item.titulo,
          data: { titulo: item.titulo, icono: item.icono },
          loadComponent: cargador,
        };
      }),
    ],
  };
}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Inicio',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    title: 'Iniciar sesión',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Registrarme',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  ...ROLES.map(seccionDe),
  {
    path: 'acceso-denegado',
    title: 'Acceso denegado',
    loadComponent: () =>
      import('./pages/acceso-denegado/acceso-denegado').then((m) => m.AccesoDenegado),
  },
  {
    path: '**',
    title: 'No encontrada',
    loadComponent: () => import('./pages/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
];
