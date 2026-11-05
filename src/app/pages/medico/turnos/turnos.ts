import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TurnoMedico } from '../../../core/models/api.models';
import { TurnoService } from '../../../core/services/turno.service';
import { edadDesdeFecha, fechaAIso, mensajeDeError } from '../../../core/util/errores';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { AtenderDialog, AtenderDialogResultado } from './atender-dialog';

@Component({
  selector: 'app-turnos-medico',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss',
})
export class TurnosMedico {
  private readonly turnoSrv = inject(TurnoService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['hora', 'paciente', 'edad', 'sede', 'estado', 'acciones'];
  protected readonly edadDesdeFecha = edadDesdeFecha;

  protected readonly fecha = signal<Date>(new Date());
  protected readonly turnos = signal<TurnoMedico[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filtroSede = signal<number | ''>('');
  protected readonly expandidoId = signal<number | null>(null);

  protected readonly sedesDisponibles = computed(() => {
    const vistas = new Map<number, string>();
    for (const t of this.turnos()) vistas.set(t.id_sede, t.sede_nombre);
    return [...vistas.entries()].map(([id, nombre]) => ({ id, nombre }));
  });

  protected readonly filtrados = computed(() => {
    const sede = this.filtroSede();
    return sede ? this.turnos().filter((t) => t.id_sede === sede) : this.turnos();
  });

  constructor() {
    this.cargar();
  }

  protected cambiarFecha(fecha: Date | null): void {
    if (!fecha) return;
    this.fecha.set(fecha);
    this.filtroSede.set('');
    this.expandidoId.set(null);
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.turnoSrv.listarDelMedico(fechaAIso(this.fecha())).subscribe({
      next: (turnos) => {
        this.turnos.set(turnos);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar los turnos.'));
        this.cargando.set(false);
      },
    });
  }

  protected alternarExpandido(turno: TurnoMedico): void {
    this.expandidoId.set(this.expandidoId() === turno.id ? null : turno.id);
  }

  protected atender(turno: TurnoMedico): void {
    this.dialog
      .open(AtenderDialog, { width: '440px', data: turno })
      .afterClosed()
      .subscribe((resultado?: AtenderDialogResultado) => {
        if (!resultado?.atendido) return;
        this.turnos.update((lista) =>
          lista.map((t) => (t.id === turno.id ? { ...t, estado: 'atendido' } : t)),
        );
        if (!resultado.historialOk) {
          this.snackBar.open(
            resultado.errorHistorial ?? 'El turno quedó atendido, pero no se pudo guardar el historial.',
            'Cerrar',
            { duration: 7000 },
          );
        }
      });
  }

  protected cancelar(turno: TurnoMedico): void {
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
          error: (e: unknown) =>
            this.snackBar.open(mensajeDeError(e, 'No se pudo cancelar el turno.'), 'Cerrar', {
              duration: 5000,
            }),
        });
      });
  }
}
