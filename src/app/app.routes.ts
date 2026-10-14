
import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Perfil } from './pages/perfil/perfil';
import { authGuard } from './core/guards/auth-guard';
import { rolGuard } from './core/guards/rol-guard';
import { NoEncontrada } from './pages/no-encontrada/no-encontrada';

export const routes: Routes = [
  {
    path: '',
    component: Inicio,
    title: 'Inicio | Clínica Salud'
  },
  {
    path: 'login',
    component: Login,
    title: 'Iniciar sesión'
  },
  {
    path: 'registro',
    component: Registro,
    title: 'Registro de paciente'
  },
  {
    path: 'perfil',
    component: Perfil,
    title: 'Mi perfil | Clínica Salud',
    canActivate: [authGuard]
  },

  // Secciones por rol (provisorias)
  {
    path: 'paciente',
    canActivate: [rolGuard],
    data: { roles: ['paciente'] },
    loadComponent: () =>
      import('./pages/inicio/inicio').then(m => m.Inicio),
    title: 'Panel de paciente | Clínica Salud'
  },
  {
    path: 'medico',
    canActivate: [rolGuard],
    data: { roles: ['medico'] },
    loadComponent: () =>
      import('./pages/inicio/inicio').then(m => m.Inicio),
    title: 'Panel médico | Clínica Salud'
  },
  {
    path: 'operador',
    canActivate: [rolGuard],
    data: { roles: ['operador'] },
    loadComponent: () =>
      import('./pages/inicio/inicio').then(m => m.Inicio),
    title: 'Panel de operador | Clínica Salud'
  },
  {
    path: 'admin',
    canActivate: [rolGuard],
    data: { roles: ['admin'] },
    loadComponent: () =>
      import('./pages/inicio/inicio').then(m => m.Inicio),
    title: 'Panel de administración | Clínica Salud'
  },

  // Esta ruta siempre debe quedar última
  {
    path: '**',
    component: NoEncontrada,
    title: 'Página no encontrada | Clínica Salud'
  }
];
