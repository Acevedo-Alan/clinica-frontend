import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { rutaDe } from '../../../core/config/menu.config';
import { HistorialClinico, TurnoMio } from '../../../core/models/api.models';
import { AuthService } from '../../../core/services/auth.service';
import { HistorialService } from '../../../core/services/historial.service';
import { TurnoService } from '../../../core/services/turno.service';
import { formatearFecha, mensajeDeError } from '../../../core/util/errores';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-mis-turnos',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.scss',
})
export class MisTurnos {
  private readonly turnoSrv = inject(TurnoService);
  private readonly historialSrv = inject(HistorialService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = [
    'fecha',
    'hora',
    'especialidad',
    'profesional',
    'estado',
    'acciones',
    'expandir',
  ];
  protected readonly formatearFecha = formatearFecha;
  protected readonly rutaSolicitar = rutaDe('paciente', 'solicitar-turno');

  protected readonly pestania = signal<'proximos' | 'historial'>('proximos');
  protected readonly turnos = signal<TurnoMio[]>([]);
  protected readonly total = signal(0);
  protected readonly pagina = signal(0);
  protected readonly tamanioPagina = signal(10);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly expandidoId = signal<number | null>(null);

  /** Un envoltorio por turno: permite dos filas (principal y detalle) por registro con multiTemplateDataRows. */
  protected readonly filas = computed(() => this.turnos().map((turno) => ({ turno })));

  private readonly historialPorTurno = signal<Map<number, HistorialClinico>>(new Map());

  constructor() {
    this.cargar();
    this.cargarHistorial();
  }

  protected historialDe(turno: TurnoMio): HistorialClinico | undefined {
    return this.historialPorTurno().get(turno.id);
  }

  protected alternarExpandido(turno: TurnoMio): void {
    this.expandidoId.set(this.expandidoId() === turno.id ? null : turno.id);
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.turnoSrv.misTurnos(this.pagina() + 1, this.tamanioPagina(), this.pestania()).subscribe({
      next: (resultado) => {
        this.turnos.set(resultado.items);
        this.total.set(resultado.total);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudieron cargar tus turnos.'));
        this.cargando.set(false);
      },
    });
  }

  protected cambiarPestania(indice: number): void {
    const destino = indice === 0 ? 'proximos' : 'historial';
    if (destino === this.pestania()) return;
    this.pestania.set(destino);
    this.pagina.set(0);
    this.expandidoId.set(null);
    this.cargar();
  }

  protected paginaCambiada(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanioPagina.set(evento.pageSize);
    this.expandidoId.set(null);
    this.cargar();
  }

  protected cancelar(turno: TurnoMio): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          titulo: 'Cancelar turno',
          mensaje: `¿Está seguro de cancelar el turno del ${formatearFecha(turno.fecha)} a las ${turno.hora} con ${turno.medico_apellido}, ${turno.medico_nombre}?`,
        },
      })
      .afterClosed()
      .subscribe((confirmado?: boolean) => {
        if (!confirmado) return;
        this.turnoSrv.cancelar(turno.id).subscribe({
          // El turno pasa al historial: se recarga la lista de próximos.
          next: () => this.cargar(),
          error: (e: unknown) =>
            this.snackBar.open(mensajeDeError(e, 'No se pudo cancelar el turno.'), 'Cerrar', {
              duration: 5000,
            }),
        });
      });
  }

  private cargarHistorial(): void {
    const idPaciente = this.auth.usuario()?.id;
    if (!idPaciente) return;
    this.historialSrv.listarPorPaciente(idPaciente).subscribe({
      next: (lista) => {
        const mapa = new Map<number, HistorialClinico>();
        for (const h of lista) mapa.set(h.id_turno, h);
        this.historialPorTurno.set(mapa);
      },
      error: () => void 0,
    });
  }
}
