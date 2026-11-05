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
import { Especialidad } from '../../../core/models/api.models';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { mensajeDeError } from '../../../core/util/errores';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { EspecialidadFormDialog } from './especialidad-form-dialog';

@Component({
  selector: 'app-especialidades',
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
  templateUrl: './especialidades.html',
  styleUrl: './especialidades.scss',
})
export class Especialidades {
  private readonly servicio = inject(EspecialidadService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['descripcion', 'acciones'];
  protected readonly especialidades = signal<Especialidad[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.especialidades();
    return this.especialidades().filter((e) => e.descripcion.toLowerCase().includes(texto));
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.listar().subscribe({
      next: (especialidades) => {
        this.especialidades.set(especialidades);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar las especialidades.'));
        this.cargando.set(false);
      },
    });
  }

  protected nueva(): void {
    this.dialog
      .open(EspecialidadFormDialog, { width: '420px', data: null })
      .afterClosed()
      .subscribe((creada?: Especialidad) => {
        if (creada) this.especialidades.update((lista) => [...lista, creada]);
      });
  }

  protected editar(especialidad: Especialidad): void {
    this.dialog
      .open(EspecialidadFormDialog, { width: '420px', data: especialidad })
      .afterClosed()
      .subscribe((editada?: Especialidad) => {
        if (editada)
          this.especialidades.update((lista) =>
            lista.map((e) => (e.id === editada.id ? editada : e)),
          );
      });
  }

  protected eliminar(especialidad: Especialidad): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          titulo: 'Eliminar especialidad',
          mensaje: `¿Está seguro de eliminar la especialidad "${especialidad.descripcion}"?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado?: boolean) => {
        if (!confirmado) return;
        this.servicio.eliminar(especialidad.id).subscribe({
          next: () =>
            this.especialidades.update((lista) => lista.filter((e) => e.id !== especialidad.id)),
          error: (e: unknown) =>
            this.snackBar.open(
              mensajeDeError(e, 'No se pudo eliminar la especialidad.'),
              'Cerrar',
              {
                duration: 5000,
              },
            ),
        });
      });
  }
}
