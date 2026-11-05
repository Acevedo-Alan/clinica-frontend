import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TurnoSede } from '../../../core/models/api.models';
import { TurnoService } from '../../../core/services/turno.service';
import { mensajeDeError } from '../../../core/util/errores';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

export interface TurnosMedicoDialogData {
  idMedico: number;
  nombreMedico: string;
  /** Formato YYYY-MM-DD */
  fecha: string;
}

/** Ícono "ojo" de una fila de la agenda del operador: turnos confirmados del médico ese día, con cancelación. */
@Component({
  selector: 'app-turnos-medico-dialog',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './turnos-medico-dialog.html',
  styleUrl: './turnos-medico-dialog.scss',
})
export class TurnosMedicoDialog {
  private readonly turnoSrv = inject(TurnoService);
  private readonly dialog = inject(MatDialog);
  protected readonly data = inject<TurnosMedicoDialogData>(MAT_DIALOG_DATA);

  protected readonly columnas = ['hora', 'paciente', 'estado', 'acciones'];

  protected readonly turnos = signal<TurnoSede[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.turnoSrv.turnosSede(this.data.fecha).subscribe({
      next: (turnos) => {
        this.turnos.set(turnos.filter((t) => t.id_medico === this.data.idMedico));
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar los turnos.'));
        this.cargando.set(false);
      },
    });
  }

  protected cancelar(turno: TurnoSede): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          titulo: 'Cancelar turno',
          mensaje: `¿Está seguro de cancelar el turno de ${turno.paciente_apellido}, ${turno.paciente_nombre} a las ${turno.hora}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado?: boolean) => {
        if (!confirmado) return;
        this.turnoSrv.cancelar(turno.id).subscribe({
          next: () =>
            this.turnos.update((lista) =>
              lista.map((t) => (t.id === turno.id ? { ...t, estado: 'cancelado' } : t)),
            ),
          error: (e: unknown) => this.error.set(mensajeDeError(e, 'No se pudo cancelar el turno.')),
        });
      });
  }
}
