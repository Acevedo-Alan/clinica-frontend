import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = sessionStorage.getItem('token');

  // Solo agregamos el token a peticiones de nuestro backend.
  const esPeticionBackend = req.url.startsWith(
    `${environment.apiUrl}/`
  );

  const esLoginORegistro =
    req.url === `${environment.apiUrl}/auth/login` ||
    req.url === `${environment.apiUrl}/auth/registro`;

  let peticion = req;

  if (token && esPeticionBackend && !esLoginORegistro) {
    peticion = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(peticion).pipe(
    catchError((error) => {

      // Si el backend rechaza una petición autenticada,
      // eliminamos la sesión y volvemos al login.
      if (
        error.status === 401 &&
        esPeticionBackend &&
        !esLoginORegistro &&
        token
      ) {
        authService.cerrarSesion();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};