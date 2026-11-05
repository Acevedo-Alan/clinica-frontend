import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cobertura } from '../../../core/models/api.models';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { mensajeDeError } from '../../../core/util/errores';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { CoberturaFormDialog } from './cobertura-form-dialog';

@Component({
  selector: 'app-coberturas',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './coberturas.html',
  styleUrl: './coberturas.scss',
})
export class Coberturas {
  private readonly servicio = inject(CoberturaService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['nombre', 'acciones'];
  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.coberturas();
    return this.coberturas().filter((c) => c.nombre.toLowerCase().includes(texto));
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.listar().subscribe({
      next: (coberturas) => {
        this.coberturas.set(coberturas);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar las coberturas.'));
        this.cargando.set(false);
      },
    });
  }

  protected nueva(): void {
    this.dialog
      .open(CoberturaFormDialog, { width: '420px', data: null })
      .afterClosed()
      .subscribe((creada?: Cobertura) => {
        if (creada) this.coberturas.update((lista) => [...lista, creada]);
      });
  }

  protected editar(cobertura: Cobertura): void {
    this.dialog
      .open(CoberturaFormDialog, { width: '420px', data: cobertura })
      .afterClosed()
      .subscribe((editada?: Cobertura) => {
        if (editada)
          this.coberturas.update((lista) => lista.map((c) => (c.id === editada.id ? editada : c)));
      });
  }

  protected eliminar(cobertura: Cobertura): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          titulo: 'Eliminar cobertura',
          mensaje: `¿Está seguro de eliminar la cobertura "${cobertura.nombre}"?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado?: boolean) => {
        if (!confirmado) return;
        this.servicio.eliminar(cobertura.id).subscribe({
          next: () => this.coberturas.update((lista) => lista.filter((c) => c.id !== cobertura.id)),
          error: (e: unknown) =>
            this.snackBar.open(mensajeDeError(e, 'No se pudo eliminar la cobertura.'), 'Cerrar', {
              duration: 5000,
            }),
        });
      });
  }
}
