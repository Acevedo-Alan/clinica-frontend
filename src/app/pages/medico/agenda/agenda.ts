import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { BloqueAgenda, Especialidad, Perfil, Sede } from '../../../core/models/api.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { SedeService } from '../../../core/services/sede.service';
import { fechaAIso, mensajeDeError } from '../../../core/util/errores';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { AgendaFormDialog, AgendaFormDialogData } from './agenda-form-dialog';

@Component({
  selector: 'app-agenda-medico',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class AgendaMedico {
  private readonly agendaSrv = inject(AgendaService);
  private readonly auth = inject(AuthService);
  private readonly especialidadSrv = inject(EspecialidadService);
  private readonly sedeSrv = inject(SedeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['horario', 'especialidad', 'sede', 'acciones'];

  protected readonly fecha = signal<Date>(new Date());
  protected readonly bloques = signal<BloqueAgenda[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly especialidadesPropias = signal<Especialidad[]>([]);
  protected readonly sedes = signal<Sede[]>([]);

  constructor() {
    forkJoin({
      perfil: this.auth.perfil(),
      especialidades: this.especialidadSrv.listar(),
      sedes: this.sedeSrv.listar(),
    }).subscribe({
      next: ({ perfil, especialidades, sedes }) => {
        this.perfil.set(perfil);
        this.especialidadesPropias.set(
          especialidades.filter((e) => (perfil.especialidades ?? []).includes(e.id)),
        );
        this.sedes.set(sedes);
        this.cargar();
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar los datos del médico.'));
        this.cargando.set(false);
      },
    });
  }

  protected cambiarFecha(fecha: Date | null): void {
    if (!fecha) return;
    this.fecha.set(fecha);
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.agendaSrv.listar({ fecha: fechaAIso(this.fecha()) }).subscribe({
      next: (bloques) => {
        this.bloques.set(bloques);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo cargar la agenda.'));
        this.cargando.set(false);
      },
    });
  }

  protected nuevoRango(): void {
    const perfil = this.perfil();
    if (!perfil) return;
    this.abrirFormulario({
      idMedico: perfil.id,
      sedePreseleccionada: perfil.id_sede,
      especialidades: this.especialidadesPropias(),
      sedes: this.sedes(),
      fechaInicial: this.fecha(),
      bloque: null,
    });
  }

  protected editarRango(bloque: BloqueAgenda): void {
    this.abrirFormulario({
      idMedico: bloque.id_medico,
      sedePreseleccionada: bloque.id_sede,
      especialidades: this.especialidadesPropias(),
      sedes: this.sedes(),
      fechaInicial: this.fecha(),
      bloque,
    });
  }

  private abrirFormulario(data: AgendaFormDialogData): void {
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
