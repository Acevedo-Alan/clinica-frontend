import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BloqueAgenda, Medico, Sede } from '../../../core/models/api.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { fechaAIso, mensajeDeError } from '../../../core/util/errores';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { AgendaFormDialog, AgendaFormDialogData } from '../../medico/agenda/agenda-form-dialog';

export interface GestionarMedicoDialogData {
  medico: Medico;
  sedePropia: Sede;
  fechaInicial: Date;
}

/**
 * Ícono "editar" de una fila de la agenda del operador: administra todos los
 * rangos horarios de ese médico en la sede propia (alta/mod/baja), no solo la fila clickeada.
 */
@Component({
  selector: 'app-gestionar-medico-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './gestionar-medico-dialog.html',
  styleUrl: './gestionar-medico-dialog.scss',
})
export class GestionarMedicoDialog {
  private readonly agendaSrv = inject(AgendaService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly data = inject<GestionarMedicoDialogData>(MAT_DIALOG_DATA);

  protected readonly columnas = ['horario', 'especialidad', 'acciones'];

  protected readonly fecha = signal<Date>(this.data.fechaInicial);
  protected readonly bloques = signal<BloqueAgenda[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  protected cambiarFecha(fecha: Date | null): void {
    if (!fecha) return;
    this.fecha.set(fecha);
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.agendaSrv
      .listar({
        id_medico: this.data.medico.id,
        id_sede: this.data.sedePropia.id,
        fecha: fechaAIso(this.fecha()),
      })
      .subscribe({
        next: (bloques) => {
          this.bloques.set(bloques);
          this.cargando.set(false);
        },
        error: (e: unknown) => {
          this.error.set(mensajeDeError(e, 'No se pudo cargar la agenda del médico.'));
          this.cargando.set(false);
        },
      });
  }

  protected nuevoRango(): void {
    this.abrirFormulario(null);
  }

  protected editarRango(bloque: BloqueAgenda): void {
    this.abrirFormulario(bloque);
  }

  private abrirFormulario(bloque: BloqueAgenda | null): void {
    const data: AgendaFormDialogData = {
      idMedico: this.data.medico.id,
      sedePreseleccionada: this.data.sedePropia.id,
      especialidades: this.data.medico.especialidades,
      sedes: [this.data.sedePropia],
      fechaInicial: this.fecha(),
      bloque,
    };
    this.dialog
      .open(AgendaFormDialog, { width: '480px', data })
      .afterClosed()
      .subscribe((guardado?: boolean) => {
        if (guardado) this.cargar();
      });
  }

  protected eliminarRango(bloque: BloqueAgenda): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          titulo: 'Eliminar rango horario',
          mensaje: `¿Está seguro de eliminar el rango de ${bloque.hora_entrada} a ${bloque.hora_salida}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado?: boolean) => {
        if (!confirmado) return;
        this.agendaSrv.eliminar(bloque.id).subscribe({
          next: () => this.bloques.update((lista) => lista.filter((b) => b.id !== bloque.id)),
          error: (e: unknown) =>
            this.snackBar.open(mensajeDeError(e, 'No se pudo eliminar el rango.'), 'Cerrar', {
              duration: 5000,
            }),
        });
      });
  }
}
