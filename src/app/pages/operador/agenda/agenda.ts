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
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { BloqueAgenda, Medico, Perfil, Sede } from '../../../core/models/api.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { MedicoService } from '../../../core/services/medico.service';
import { SedeService } from '../../../core/services/sede.service';
import { fechaAIso, mensajeDeError } from '../../../core/util/errores';
import { GestionarMedicoDialog, GestionarMedicoDialogData } from './gestionar-medico-dialog';
import { SeleccionarMedicoDialog } from './seleccionar-medico-dialog';
import { TurnosMedicoDialog } from './turnos-medico-dialog';

@Component({
  selector: 'app-agenda-operador',
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
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class AgendaOperador {
  private readonly agendaSrv = inject(AgendaService);
  private readonly auth = inject(AuthService);
  private readonly medicoSrv = inject(MedicoService);
  private readonly sedeSrv = inject(SedeService);
  private readonly dialog = inject(MatDialog);

  protected readonly columnas = ['medico', 'especialidad', 'horario', 'acciones'];

  protected readonly fecha = signal<Date>(new Date());
  protected readonly sedeId = signal<number | null>(null);
  protected readonly bloques = signal<BloqueAgenda[]>([]);
  protected readonly cargandoInicial = signal(true);
  protected readonly errorInicial = signal<string | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly perfil = signal<Perfil | null>(null);
  protected readonly sedes = signal<Sede[]>([]);
  protected readonly medicos = signal<Medico[]>([]);

  protected readonly sedePropia = computed(() => this.sedes().find((s) => s.id === this.perfil()?.id_sede) ?? null);
  protected readonly esPropiaSede = computed(() => this.sedeId() === this.perfil()?.id_sede);

  constructor() {
    this.cargarInicial();
  }

  protected cargarInicial(): void {
    this.cargandoInicial.set(true);
    this.errorInicial.set(null);
    forkJoin({
      perfil: this.auth.perfil(),
      sedes: this.sedeSrv.listar(),
      medicos: this.medicoSrv.listar(),
    }).subscribe({
      next: ({ perfil, sedes, medicos }) => {
        this.perfil.set(perfil);
        this.sedes.set(sedes);
        this.medicos.set(medicos);
        this.sedeId.set(perfil.id_sede);
        this.cargandoInicial.set(false);
        this.cargar();
      },
      error: (e: unknown) => {
        this.errorInicial.set(mensajeDeError(e, 'No se pudieron cargar los datos iniciales.'));
        this.cargandoInicial.set(false);
      },
    });
  }

  protected cambiarFecha(fecha: Date | null): void {
    if (!fecha) return;
    this.fecha.set(fecha);
    this.cargar();
  }

  protected cambiarSede(id: number): void {
    this.sedeId.set(id);
    this.cargar();
  }

  protected cargar(): void {
    const id_sede = this.sedeId();
    if (id_sede == null) return;
    this.cargando.set(true);
    this.error.set(null);
    this.agendaSrv.listar({ fecha: fechaAIso(this.fecha()), id_sede }).subscribe({
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

  protected nuevaAgenda(): void {
    const sedePropia = this.sedePropia();
    if (!sedePropia) return;

    this.dialog
      .open(SeleccionarMedicoDialog, { width: '420px', data: { medicos: this.medicos() } })
      .afterClosed()
      .subscribe((medico?: Medico) => {
        if (!medico) return;
        this.abrirGestion(medico, sedePropia);
      });
  }

  protected gestionarMedico(bloque: BloqueAgenda): void {
    const sedePropia = this.sedePropia();
    const medico = this.medicos().find((m) => m.id === bloque.id_medico);
    if (!sedePropia || !medico) return;
    this.abrirGestion(medico, sedePropia);
  }

  private abrirGestion(medico: Medico, sedePropia: Sede): void {
    const data: GestionarMedicoDialogData = { medico, sedePropia, fechaInicial: this.fecha() };
    this.dialog
      .open(GestionarMedicoDialog, { width: '640px', data })
      .afterClosed()
      .subscribe(() => this.cargar());
  }

  protected verTurnos(bloque: BloqueAgenda): void {
    this.dialog.open(TurnosMedicoDialog, {
      width: '600px',
      data: {
        idMedico: bloque.id_medico,
        nombreMedico: `${bloque.medico_apellido}, ${bloque.medico_nombre}`,
        fecha: fechaAIso(this.fecha()),
      },
    });
  }
}
