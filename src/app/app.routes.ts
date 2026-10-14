import { Route, Routes } from '@angular/router';
import { MENU, RUTA_BASE, ROLES } from './core/config/menu.config';
import { Rol } from './core/models/api.models';
import { invitadoGuard, rolGuard } from './core/guards/auth.guards';

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
      ...MENU[rol].map((item): Route =>
        item.ruta === 'perfil'
          ? {
              path: 'perfil',
              title: 'Mi perfil',
              loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
            }
          : {
              path: item.ruta,
              title: item.titulo,
              data: { titulo: item.titulo, icono: item.icono },
              loadComponent: () =>
                import('./pages/en-construccion/en-construccion').then((m) => m.EnConstruccion),
            },
      ),
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
    loadComponent: () =>
      import('./pages/no-encontrada/no-encontrada').then((m) => m.NoEncontrada),
  },
];
