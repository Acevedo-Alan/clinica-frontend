import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../models/api.models';
import { AuthService } from '../services/auth.service';

/** Exige sesión. Sin sesión redirige al login recordando a dónde quería ir. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.haySesionVigente()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/**
 * Exige sesión y que el rol del usuario sea uno de los permitidos.
 * Con otro rol redirige a "Acceso denegado".
 */
export const rolGuard =
  (...permitidos: Rol[]): CanActivateFn =>
  (_route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.haySesionVigente()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
    const rol = auth.rol();
    return rol && permitidos.includes(rol) ? true : router.createUrlTree(['/acceso-denegado']);
  };

/** Para login/registro: con sesión abierta no tiene sentido verlos. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.haySesionVigente() ? inject(Router).createUrlTree(['/']) : true;
};
