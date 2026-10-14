import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of, catchError } from 'rxjs';
import { ETIQUETA_ROL } from '../../core/config/menu.config';
import { Cobertura, Perfil as PerfilDatos } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { CoberturaService } from '../../core/services/cobertura.service';
import { formatearFecha, mensajeDeError } from '../../core/util/errores';

@Component({
  selector: 'app-perfil',
  imports: [MatCardModule, MatIconModule, MatButtonModule, MatDividerModule, MatProgressSpinnerModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  private readonly auth = inject(AuthService);
  private readonly coberturaSrv = inject(CoberturaService);

  protected readonly datos = signal<PerfilDatos | null>(null);
  private readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly formatearFecha = formatearFecha;

  protected readonly iniciales = computed(() => {
    const d = this.datos();
    return d ? `${d.nombre[0] ?? ''}${d.apellido[0] ?? ''}`.toUpperCase() : '';
  });

  protected readonly nombreCobertura = computed(() => {
    const id = this.datos()?.id_cobertura;
    if (id == null) return null;
    return this.coberturas().find((c) => c.id === id)?.nombre ?? `Cobertura #${id}`;
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      perfil: this.auth.perfil(),
      // Si falla el listado de coberturas, el perfil igual se muestra.
      coberturas: this.coberturaSrv.listar().pipe(catchError(() => of([] as Cobertura[]))),
    }).subscribe({
      next: ({ perfil, coberturas }) => {
        this.datos.set(perfil);
        this.coberturas.set(coberturas);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo cargar tu perfil.'));
        this.cargando.set(false);
      },
    });
  }
}
