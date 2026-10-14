
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const rolGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  const rolUsuario = authService.obtenerRol();
  const rolesPermitidos = route.data['roles'] as string[] | undefined;

  if (!rolUsuario || !rolesPermitidos?.includes(rolUsuario)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
