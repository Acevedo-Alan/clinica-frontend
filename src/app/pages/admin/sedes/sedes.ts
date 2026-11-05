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
import { Sede } from '../../../core/models/api.models';
import { SedeService } from '../../../core/services/sede.service';
import { mensajeDeError } from '../../../core/util/errores';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { SedeFormDialog } from './sede-form-dialog';

@Component({
  selector: 'app-sedes',
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
  templateUrl: './sedes.html',
  styleUrl: './sedes.scss',
})
export class Sedes {
  private readonly servicio = inject(SedeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['nombre', 'direccion', 'telefono', 'acciones'];
  protected readonly sedes = signal<Sede[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');

  protected readonly filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.sedes();
    return this.sedes().filter((s) =>
      `${s.nombre} ${s.direccion} ${s.telefono}`.toLowerCase().includes(texto),
    );
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.listar().subscribe({
      next: (sedes) => {
        this.sedes.set(sedes);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar las sedes.'));
        this.cargando.set(false);
      },
    });
  }

  protected nueva(): void {
    this.dialog
      .open(SedeFormDialog, { width: '420px', data: null })
      .afterClosed()
      .subscribe((creada?: Sede) => {
        if (creada) this.sedes.update((lista) => [...lista, creada]);
      });
  }

  protected editar(sede: Sede): void {
    this.dialog
      .open(SedeFormDialog, { width: '420px', data: sede })
      .afterClosed()
      .subscribe((editada?: Sede) => {
        if (editada)
          this.sedes.update((lista) => lista.map((s) => (s.id === editada.id ? editada : s)));
      });
  }

  protected eliminar(sede: Sede): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          titulo: 'Eliminar sede',
          mensaje: `¿Está seguro de eliminar la sede "${sede.nombre}"?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado?: boolean) => {
        if (!confirmado) return;
        this.servicio.eliminar(sede.id).subscribe({
          next: () => this.sedes.update((lista) => lista.filter((s) => s.id !== sede.id)),
          error: (e: unknown) =>
            this.snackBar.open(mensajeDeError(e, 'No se pudo eliminar la sede.'), 'Cerrar', {
              duration: 5000,
            }),
        });
      });
  }
}
