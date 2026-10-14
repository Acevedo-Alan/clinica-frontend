
import { Component, inject, signal } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';
import { filter } from 'rxjs';

import { AuthService, UsuarioSesion } from '../../core/services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  private authService = inject(AuthService);
  private router = inject(Router);

  autenticado = signal(this.authService.estaAutenticado());
  usuario = signal<UsuarioSesion | null>(
    this.authService.obtenerUsuarioSesion()
  );

  constructor() {
    this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarSesion();
      });
  }

  private actualizarSesion(): void {
    this.autenticado.set(this.authService.estaAutenticado());
    this.usuario.set(this.authService.obtenerUsuarioSesion());
  }

  obtenerNombreRol(rol: string | undefined): string {
    switch (rol) {
      case 'paciente':
        return 'Paciente';
      case 'medico':
        return 'Médico';
      case 'operador':
        return 'Operador';
      case 'admin':
        return 'Administrador';
      default:
        return '';
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();

    this.autenticado.set(false);
    this.usuario.set(null);

    this.router.navigate(['/']);
  }
}
