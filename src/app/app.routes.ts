
import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Perfil } from './pages/perfil/perfil';
import { authGuard } from './core/guards/auth-guard';
import { rolGuard } from './core/guards/rol-guard';
import { NoEncontrada } from './pages/no-encontrada/no-encontrada';
import { Paciente } from './pages/paciente/paciente';
import { Medico } from './pages/medico/medico';
import { Operador } from './pages/operador/operador';
import { Admin } from './pages/admin/admin';

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

    // Secciones protegidas por rol
    {
      path: 'paciente',
      component: Paciente,
      canActivate: [authGuard, rolGuard],
      data: { roles: ['paciente'] },
      title: 'Panel de paciente | Clínica Salud'
    },
    {
      path: 'medico',
      component: Medico,
      canActivate: [authGuard, rolGuard],
      data: { roles: ['medico'] },
      title: 'Panel médico | Clínica Salud'
    },
    {
      path: 'operador',
      component: Operador,
      canActivate: [authGuard, rolGuard],
      data: { roles: ['operador'] },
      title: 'Panel de operador | Clínica Salud'
    },
    {
      path: 'admin',
      component: Admin,
      canActivate: [authGuard, rolGuard],
      data: { roles: ['admin'] },
      title: 'Panel de administración | Clínica Salud'
    },

  // Esta ruta siempre debe quedar última
  {
    path: '**',
    component: NoEncontrada,
    title: 'Página no encontrada | Clínica Salud'
  }
];
