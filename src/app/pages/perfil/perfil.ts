import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { CoberturaService } from '../../core/services/cobertura';
import { UsuarioPerfil } from '../../models/usuario-perfil';
import { Cobertura } from '../../models/cobertura';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-perfil',
  imports: [RouterLink, DatePipe, MatButtonModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  private coberturaService = inject(CoberturaService);

  usuario = signal<UsuarioPerfil | null>(null);
  coberturas = signal<Cobertura[]>([]);

  cargando = signal(true);
  errorPerfil = signal('');

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarCoberturas();
  }

  // Obtener los datos del paciente autenticado
  cargarPerfil(): void {
    this.cargando.set(true);
    this.errorPerfil.set('');

    this.authService.obtenerPerfil().subscribe({
      next: (respuesta) => {
        this.usuario.set(respuesta.datos);
        this.cargando.set(false);
      },

      error: (error) => {
        console.error('Error al obtener el perfil:', error);

        if (error.status === 401) {
          this.authService.cerrarSesion();
          this.router.navigate(['/login']);
          return;
        }

        if (error.status === 403) {
          this.errorPerfil.set(
            'No tenés permiso para acceder a este perfil.'
          );
        } else {
          this.errorPerfil.set(
            'No pudimos cargar tu perfil. Intentá nuevamente.'
          );
        }

        this.cargando.set(false);
      }
    });
  }

  // Obtener las coberturas médicas desde el backend
  cargarCoberturas(): void {
    this.coberturaService.listarCoberturas().subscribe({
      next: (respuesta) => {
        this.coberturas.set(respuesta.datos ?? []);
      },

      error: (error) => {
        console.error('Error al cargar las coberturas:', error);
      }
    });
  }

  // Buscar el nombre de una cobertura a partir de su ID
  obtenerNombreCobertura(id: number | null | undefined): string {
    if (id == null) {
      return 'Sin cobertura';
    }
  
    const cobertura = this.coberturas().find(
      cobertura => cobertura.id === id
    );
  
    return cobertura?.nombre ?? 'Cobertura no disponible';
  }
}