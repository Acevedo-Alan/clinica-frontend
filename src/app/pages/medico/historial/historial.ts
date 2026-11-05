import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { HistorialClinico, PacienteBusqueda } from '../../../core/models/api.models';
import { HistorialService } from '../../../core/services/historial.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { formatearFecha, mensajeDeError } from '../../../core/util/errores';

@Component({
  selector: 'app-historial-medico',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './historial.html',
  styleUrl: './historial.scss',
})
export class HistorialMedico {
  private readonly pacienteSrv = inject(PacienteService);
  private readonly historialSrv = inject(HistorialService);

  protected readonly formatearFecha = formatearFecha;
  protected readonly columnas = ['nombre', 'dni', 'fecha_nacimiento', 'acciones'];

  protected readonly filtroDni = signal('');
  protected readonly filtroApellido = signal('');
  protected readonly buscando = signal(false);
  protected readonly errorBusqueda = signal<string | null>(null);
  protected readonly resultados = signal<PacienteBusqueda[] | null>(null);

  protected readonly pacienteSeleccionado = signal<PacienteBusqueda | null>(null);
  protected readonly historial = signal<HistorialClinico[]>([]);
  protected readonly cargandoHistorial = signal(false);
  protected readonly errorHistorial = signal<string | null>(null);

  protected buscar(): void {
    const dni = this.filtroDni().trim();
    const apellido = this.filtroApellido().trim();
    if (!dni && !apellido) {
      this.errorBusqueda.set('Ingresá un DNI o un apellido para buscar.');
      return;
    }

    this.buscando.set(true);
    this.errorBusqueda.set(null);
    this.pacienteSeleccionado.set(null);
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

  protected verHistorial(paciente: PacienteBusqueda): void {
    this.pacienteSeleccionado.set(paciente);
    this.cargandoHistorial.set(true);
    this.errorHistorial.set(null);
    this.historialSrv.listarPorPaciente(paciente.id).subscribe({
      next: (historial) => {
        this.historial.set(historial);
        this.cargandoHistorial.set(false);
      },
      error: (e: unknown) => {
        this.errorHistorial.set(mensajeDeError(e, 'No se pudo cargar el historial clínico.'));
        this.cargandoHistorial.set(false);
      },
    });
  }
}
