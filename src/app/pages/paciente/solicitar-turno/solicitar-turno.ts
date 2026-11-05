import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { forkJoin } from 'rxjs';
import {
  BloqueAgenda,
  Cobertura,
  Especialidad,
  Medico,
  Perfil,
  Sede,
  Turno,
} from '../../../core/models/api.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { AuthService } from '../../../core/services/auth.service';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { DisponibilidadService } from '../../../core/services/disponibilidad.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { MedicoService } from '../../../core/services/medico.service';
import { SedeService } from '../../../core/services/sede.service';
import { TurnoService } from '../../../core/services/turno.service';
import { formatearFecha, mensajeDeError } from '../../../core/util/errores';

@Component({
  selector: 'app-solicitar-turno',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatStepperModule,
  ],
  templateUrl: './solicitar-turno.html',
  styleUrl: './solicitar-turno.scss',
})
export class SolicitarTurno {
  private readonly auth = inject(AuthService);
  private readonly especialidadSrv = inject(EspecialidadService);
  private readonly sedeSrv = inject(SedeService);
  private readonly medicoSrv = inject(MedicoService);
  private readonly disponibilidadSrv = inject(DisponibilidadService);
  private readonly agendaSrv = inject(AgendaService);
  private readonly coberturaSrv = inject(CoberturaService);
  private readonly turnoSrv = inject(TurnoService);

  @ViewChild('stepper') private stepper!: MatStepper;

  protected readonly formatearFecha = formatearFecha;

  // Catálogos iniciales (especialidad y sede no dependen de nada más).
  protected readonly especialidades = signal<Especialidad[]>([]);
  protected readonly sedes = signal<Sede[]>([]);
  protected readonly cargandoInicial = signal(true);
  protected readonly errorInicial = signal<string | null>(null);

  // Perfil propio, para mostrar la cobertura en el resumen (no se elige).
  protected readonly perfil = signal<Perfil | null>(null);
  private readonly coberturas = signal<Cobertura[]>([]);
  protected readonly nombreCobertura = computed(() => {
    const id = this.perfil()?.id_cobertura;
    if (id == null) return null;
    return this.coberturas().find((c) => c.id === id)?.nombre ?? null;
  });

  // Selección del paciente, paso a paso.
  protected readonly especialidadId = signal<number | null>(null);
  protected readonly sedeId = signal<number | null>(null);
  protected readonly medicoId = signal<number | null>(null);
  protected readonly fechaElegida = signal<string | null>(null);
  protected readonly horaElegida = signal<string | null>(null);
  protected readonly idAgenda = signal<number | null>(null);
  protected readonly nota = signal('');

  protected readonly especialidadElegida = computed(
    () => this.especialidades().find((e) => e.id === this.especialidadId()) ?? null,
  );
  protected readonly sedeElegida = computed(
    () => this.sedes().find((s) => s.id === this.sedeId()) ?? null,
  );
  protected readonly medicoElegido = computed(
    () => this.medicos().find((m) => m.id === this.medicoId()) ?? null,
  );

  // Opciones de cada paso siguiente, cargadas on-demand.
  protected readonly medicos = signal<Medico[]>([]);
  protected readonly cargandoMedicos = signal(false);
  protected readonly errorMedicos = signal<string | null>(null);

  protected readonly fechas = signal<string[]>([]);
  protected readonly cargandoFechas = signal(false);
  protected readonly errorFechas = signal<string | null>(null);

  protected readonly horarios = signal<string[]>([]);
  private readonly bloquesAgenda = signal<BloqueAgenda[]>([]);
  protected readonly cargandoHorarios = signal(false);
  protected readonly errorHorarios = signal<string | null>(null);

  // Confirmación final.
  protected readonly enviando = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);
  protected readonly turnoConfirmado = signal<Turno | null>(null);

  constructor() {
    this.cargarInicial();
  }

  protected cargarInicial(): void {
    this.cargandoInicial.set(true);
    this.errorInicial.set(null);
    forkJoin({
      especialidades: this.especialidadSrv.listar(),
      sedes: this.sedeSrv.listar(),
      coberturas: this.coberturaSrv.listar(),
      perfil: this.auth.perfil(),
    }).subscribe({
      next: ({ especialidades, sedes, coberturas, perfil }) => {
        this.especialidades.set(especialidades);
        this.sedes.set(sedes);
        this.coberturas.set(coberturas);
        this.perfil.set(perfil);
        this.cargandoInicial.set(false);
      },
      error: (e: unknown) => {
        this.errorInicial.set(mensajeDeError(e, 'No se pudieron cargar los datos iniciales.'));
        this.cargandoInicial.set(false);
      },
    });
  }

  protected elegirEspecialidad(id: number): void {
    this.especialidadId.set(id);
    this.reiniciarDesdeMedico();
    this.stepper.next();
  }

  protected elegirSede(id: number): void {
    this.sedeId.set(id);
    this.reiniciarDesdeMedico();
    this.stepper.next();
    this.cargarMedicos();
  }

  protected elegirMedico(id: number): void {
    this.medicoId.set(id);
    this.reiniciarDesdeFecha();
    this.stepper.next();
    this.cargarFechas();
  }

  protected elegirFecha(fecha: string): void {
    this.fechaElegida.set(fecha);
    this.reiniciarDesdeHora();
    this.stepper.next();
    this.cargarHorarios();
  }

  protected elegirHora(hora: string): void {
    const bloque = this.bloquesAgenda().find(
      (b) => hora >= b.hora_entrada && hora < b.hora_salida,
    );
    if (!bloque) {
      this.errorHorarios.set('Ese horario ya no está disponible. Elegí otro.');
      this.cargarHorarios();
      return;
    }
    this.horaElegida.set(hora);
    this.idAgenda.set(bloque.id);
    this.stepper.next();
  }

  private cargarMedicos(): void {
    const id_especialidad = this.especialidadId();
    const id_sede = this.sedeId();
    if (id_especialidad == null || id_sede == null) return;

    this.cargandoMedicos.set(true);
    this.errorMedicos.set(null);
    this.medicoSrv.listar({ id_especialidad, id_sede }).subscribe({
      next: (medicos) => {
        this.medicos.set(medicos);
        this.cargandoMedicos.set(false);
      },
      error: (e: unknown) => {
        this.errorMedicos.set(mensajeDeError(e, 'No se pudieron cargar los médicos.'));
        this.cargandoMedicos.set(false);
      },
    });
  }

  private cargarFechas(): void {
    const id_medico = this.medicoId();
    const id_especialidad = this.especialidadId();
    const id_sede = this.sedeId();
    if (id_medico == null || id_especialidad == null || id_sede == null) return;

    this.cargandoFechas.set(true);
    this.errorFechas.set(null);
    this.disponibilidadSrv.fechas({ id_medico, id_especialidad, id_sede }).subscribe({
      next: (fechas) => {
        this.fechas.set(fechas);
        this.cargandoFechas.set(false);
      },
      error: (e: unknown) => {
        this.errorFechas.set(mensajeDeError(e, 'No se pudieron cargar las fechas disponibles.'));
        this.cargandoFechas.set(false);
      },
    });
  }

  private cargarHorarios(): void {
    const id_medico = this.medicoId();
    const id_especialidad = this.especialidadId();
    const id_sede = this.sedeId();
    const fecha = this.fechaElegida();
    if (id_medico == null || id_especialidad == null || id_sede == null || !fecha) return;

    this.cargandoHorarios.set(true);
    this.errorHorarios.set(null);
    forkJoin({
      horarios: this.disponibilidadSrv.horarios({ id_medico, id_especialidad, id_sede, fecha }),
      bloques: this.agendaSrv.listar({ id_medico, id_especialidad, id_sede, fecha }),
    }).subscribe({
      next: ({ horarios, bloques }) => {
        this.horarios.set(horarios);
        this.bloquesAgenda.set(bloques);
        this.cargandoHorarios.set(false);
      },
      error: (e: unknown) => {
        this.errorHorarios.set(mensajeDeError(e, 'No se pudieron cargar los horarios disponibles.'));
        this.cargandoHorarios.set(false);
      },
    });
  }

  protected confirmar(): void {
    const id_agenda = this.idAgenda();
    const hora = this.horaElegida();
    const nota = this.nota().trim();
    if (id_agenda == null || !hora || !nota) return;

    this.enviando.set(true);
    this.errorEnvio.set(null);
    this.turnoSrv.crear({ id_agenda, hora, nota }).subscribe({
      next: (turno) => {
        this.turnoConfirmado.set(turno);
        this.enviando.set(false);
      },
      error: (e: unknown) => {
        this.errorEnvio.set(mensajeDeError(e, 'No se pudo confirmar el turno.'));
        this.enviando.set(false);
      },
    });
  }

  /** El horario elegido pudo haberse ocupado mientras completaba la nota: vuelve a elegir horario. */
  protected elegirOtroHorario(): void {
    this.errorEnvio.set(null);
    this.horaElegida.set(null);
    this.idAgenda.set(null);
    this.stepper.selectedIndex = 4;
    this.cargarHorarios();
  }

  protected solicitarOtroTurno(): void {
    this.especialidadId.set(null);
    this.sedeId.set(null);
    this.reiniciarDesdeMedico();
    this.turnoConfirmado.set(null);
    this.errorEnvio.set(null);
    this.stepper.reset();
  }

  private reiniciarDesdeMedico(): void {
    this.medicoId.set(null);
    this.medicos.set([]);
    this.errorMedicos.set(null);
    this.reiniciarDesdeFecha();
  }

  private reiniciarDesdeFecha(): void {
    this.fechaElegida.set(null);
    this.fechas.set([]);
    this.errorFechas.set(null);
    this.reiniciarDesdeHora();
  }

  private reiniciarDesdeHora(): void {
    this.horaElegida.set(null);
    this.idAgenda.set(null);
    this.horarios.set([]);
    this.bloquesAgenda.set([]);
    this.errorHorarios.set(null);
    this.nota.set('');
  }
}
