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
import { MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';
import {
  BloqueAgenda,
  Cobertura,
  Especialidad,
  Medico,
  PacienteBusqueda,
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
import { PacienteService } from '../../../core/services/paciente.service';
import { SedeService } from '../../../core/services/sede.service';
import { TurnoService } from '../../../core/services/turno.service';
import { formatearFecha, mensajeDeError } from '../../../core/util/errores';

/**
 * "Asignar turno": igual flujo que `paciente/solicitar-turno`, pero empezando con una
 * búsqueda de paciente y con la sede fija en la del operador (no hay paso de sede).
 */
@Component({
  selector: 'app-turnos-operador',
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
    MatTableModule,
  ],
  templateUrl: './turnos.html',
  styleUrl: './turnos.scss',
})
export class TurnosOperador {
  private readonly auth = inject(AuthService);
  private readonly pacienteSrv = inject(PacienteService);
  private readonly especialidadSrv = inject(EspecialidadService);
  private readonly sedeSrv = inject(SedeService);
  private readonly medicoSrv = inject(MedicoService);
  private readonly disponibilidadSrv = inject(DisponibilidadService);
  private readonly agendaSrv = inject(AgendaService);
  private readonly coberturaSrv = inject(CoberturaService);
  private readonly turnoSrv = inject(TurnoService);

  @ViewChild('stepper') private stepper!: MatStepper;

  protected readonly formatearFecha = formatearFecha;

  // Catálogos iniciales.
  protected readonly especialidades = signal<Especialidad[]>([]);
  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargandoInicial = signal(true);
  protected readonly errorInicial = signal<string | null>(null);

  // Sede propia del operador (fija para todo el flujo).
  protected readonly sedePropia = signal<Sede | null>(null);

  // Paso 1: búsqueda de paciente.
  protected readonly filtroDni = signal('');
  protected readonly filtroApellido = signal('');
  protected readonly buscando = signal(false);
  protected readonly errorBusqueda = signal<string | null>(null);
  protected readonly resultados = signal<PacienteBusqueda[] | null>(null);
  protected readonly pacienteId = signal<number | null>(null);

  protected readonly pacienteElegido = computed(
    () => this.resultados()?.find((p) => p.id === this.pacienteId()) ?? null,
  );
  protected readonly nombreCobertura = computed(() => {
    const id = this.pacienteElegido()?.id_cobertura;
    if (id == null) return null;
    return this.coberturas().find((c) => c.id === id)?.nombre ?? null;
  });

  // Selección del turno, paso a paso (sin paso de sede: siempre la propia).
  protected readonly especialidadId = signal<number | null>(null);
  protected readonly medicoId = signal<number | null>(null);
  protected readonly fechaElegida = signal<string | null>(null);
  protected readonly horaElegida = signal<string | null>(null);
  protected readonly idAgenda = signal<number | null>(null);
  protected readonly nota = signal('');

  protected readonly especialidadElegida = computed(
    () => this.especialidades().find((e) => e.id === this.especialidadId()) ?? null,
  );
  protected readonly medicoElegido = computed(
    () => this.medicos().find((m) => m.id === this.medicoId()) ?? null,
  );

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
      coberturas: this.coberturaSrv.listar(),
      sedes: this.sedeSrv.listar(),
      perfil: this.auth.perfil(),
    }).subscribe({
      next: ({ especialidades, coberturas, sedes, perfil }) => {
        this.especialidades.set(especialidades);
        this.coberturas.set(coberturas);
        const sedePropia = sedes.find((s) => s.id === perfil.id_sede) ?? null;
        this.sedePropia.set(sedePropia);
        if (!sedePropia) {
          this.errorInicial.set('Tu usuario no tiene una sede asignada: pedile a un administrador que te la asigne.');
        }
        this.cargandoInicial.set(false);
      },
      error: (e: unknown) => {
        this.errorInicial.set(mensajeDeError(e, 'No se pudieron cargar los datos iniciales.'));
        this.cargandoInicial.set(false);
      },
    });
  }

  protected buscarPaciente(): void {
    const dni = this.filtroDni().trim();
    const apellido = this.filtroApellido().trim();
    if (!dni && !apellido) {
      this.errorBusqueda.set('Ingresá un DNI o un apellido para buscar.');
      return;
    }
    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.pacienteSrv.buscar({ dni: dni || undefined, apellido: apellido || undefined }).subscribe({
      next: (pacientes) => {
        this.resultados.set(pacientes);
        this.buscando.set(false);
      },
      error: (e: unknown) => {
        this.errorBusqueda.set(mensajeDeError(e, 'No se pudo buscar el paciente.'));
        this.buscando.set(false);
      },
    });
  }

  protected elegirPaciente(paciente: PacienteBusqueda): void {
    this.pacienteId.set(paciente.id);
    this.stepper.next();
  }

  protected elegirEspecialidad(id: number): void {
    this.especialidadId.set(id);
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
    const id_sede = this.sedePropia()?.id;
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
    const id_sede = this.sedePropia()?.id;
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
    const id_sede = this.sedePropia()?.id;
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
    const id_paciente = this.pacienteId();
    if (id_agenda == null || !hora || !nota || id_paciente == null) return;

    this.enviando.set(true);
    this.errorEnvio.set(null);
    this.turnoSrv.crear({ id_agenda, hora, nota, id_paciente }).subscribe({
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

  protected elegirOtroHorario(): void {
    this.errorEnvio.set(null);
    this.horaElegida.set(null);
    this.idAgenda.set(null);
    this.stepper.selectedIndex = 4;
    this.cargarHorarios();
  }

  protected asignarOtroTurno(): void {
    this.filtroDni.set('');
    this.filtroApellido.set('');
    this.resultados.set(null);
    this.pacienteId.set(null);
    this.especialidadId.set(null);
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
