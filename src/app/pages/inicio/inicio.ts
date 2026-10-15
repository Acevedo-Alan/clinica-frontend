import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  private authService = inject(AuthService);

  estaAutenticado(): boolean {
    return this.authService.estaAutenticado();
  }

  obtenerRutaPanel(): string {
    switch (this.authService.obtenerRol()) {
      case 'paciente': return '/paciente';
      case 'medico': return '/medico';
      case 'operador': return '/operador';
      case 'admin': return '/admin';
      default: return '/login';
    }
  }
}