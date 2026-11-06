import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BloqueAgenda, Especialidad, Sede } from '../../../core/models/api.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { fechaAIso, fechaDesdeIso, formatearFecha, mensajeDeError } from '../../../core/util/errores';
import { horaSalidaPosteriorAEntrada } from '../../../core/util/validadores';

export interface AgendaFormDialogData {
  idMedico: number;
  sedePreseleccionada: number | null;
  especialidades: Especialidad[];
  sedes: Sede[];
  fechaInicial: Date;
  /** `null` = alta de un rango nuevo; con valor = edición de ese rango. */
  bloque: BloqueAgenda | null;
}

@Component({
  selector: 'app-agenda-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './agenda-form-dialog.html',
  styleUrl: './agenda-form-dialog.scss',
})
export class AgendaFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(AgendaService);
  private readonly dialogRef = inject(MatDialogRef<AgendaFormDialog, boolean>);
  protected readonly data = inject<AgendaFormDialogData>(MAT_DIALOG_DATA);

  private readonly snackBar = inject(MatSnackBar);

  protected readonly hoy = new Date();
  protected readonly diasSemana = [
    { valor: 1, letra: 'L', nombre: 'Lunes' },
    { valor: 2, letra: 'M', nombre: 'Martes' },
    { valor: 3, letra: 'X', nombre: 'Miércoles' },
    { valor: 4, letra: 'J', nombre: 'Jueves' },
    { valor: 5, letra: 'V', nombre: 'Viernes' },
    { valor: 6, letra: 'S', nombre: 'Sábado' },
    { valor: 7, letra: 'D', nombre: 'Domingo' },
  ];
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      fecha: this.fb.control<Date | null>(
        this.data.bloque ? fechaDesdeIso(this.data.bloque.fecha) : this.data.fechaInicial,
        [Validators.required],
      ),
      hora_entrada: this.fb.nonNullable.control(this.data.bloque?.hora_entrada ?? '', [
        Validators.required,
      ]),
      hora_salida: this.fb.nonNullable.control(this.data.bloque?.hora_salida ?? '', [
        Validators.required,
      ]),
      id_especialidad: this.fb.control<number | null>(
        this.data.bloque?.id_especialidad ?? null,
        [Validators.required],
      ),
      id_sede: this.fb.control<number | null>(
        this.data.bloque?.id_sede ?? this.data.sedePreseleccionada,
        [Validators.required],
      ),
      repetir: this.fb.nonNullable.control(false),
      dias: this.fb.nonNullable.control<number[]>([]),
      fecha_hasta: this.fb.control<Date | null>(null),
    },
    { validators: [horaSalidaPosteriorAEntrada, repeticionValida] },
  );

  constructor() {
    // Al activar "Repetir" se sugiere el día de la fecha elegida y cuatro semanas de repetición.
    this.form.controls.repetir.valueChanges.subscribe((activo) => {
      if (!activo) return;
      const inicio = this.form.controls.fecha.value ?? this.hoy;
      const dia = inicio.getDay() === 0 ? 7 : inicio.getDay();
      if (this.form.controls.dias.value.length === 0) this.form.controls.dias.setValue([dia]);
      if (!this.form.controls.fecha_hasta.value) {
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 28);
        this.form.controls.fecha_hasta.setValue(fin);
      }
    });
  }

  /** Fecha máxima de repetición: el backend acepta hasta 92 días desde la fecha de inicio. */
  protected get maximoRepeticion(): Date {
    const d = new Date(this.form.controls.fecha.value ?? this.hoy);
    d.setDate(d.getDate() + 91);
    return d;
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set(null);

    if (!this.data.bloque && v.repetir) {
      this.servicio
        .crearRecurrente({
          hora_entrada: v.hora_entrada,
          hora_salida: v.hora_salida,
          fecha_desde: fechaAIso(v.fecha!),
          fecha_hasta: fechaAIso(v.fecha_hasta!),
          dias_semana: v.dias,
          id_medico: this.data.idMedico,
          id_especialidad: v.id_especialidad!,
          id_sede: v.id_sede!,
        })
        .subscribe({
          next: (r) => {
            const omitidas = r.omitidas.length
              ? ` · ${r.omitidas.length} omitida(s) por superposición (${r.omitidas.map((o) => formatearFecha(o.fecha)).join(', ')})`
              : '';
            this.snackBar.open(`Se crearon ${r.creadas.length} rango(s) horario(s)${omitidas}`, 'Cerrar', {
              duration: 8000,
            });
            this.dialogRef.close(true);
          },
          error: (e: unknown) => {
            this.error.set(mensajeDeError(e, 'No se pudo crear la agenda recurrente.'));
            this.guardando.set(false);
          },
        });
      return;
    }

    const datos = {
      hora_entrada: v.hora_entrada,
      hora_salida: v.hora_salida,
      fecha: fechaAIso(v.fecha!),
      id_medico: this.data.idMedico,
      id_especialidad: v.id_especialidad!,
      id_sede: v.id_sede!,
    };

    const peticion = this.data.bloque
      ? this.servicio.modificar(this.data.bloque.id, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: () => this.dialogRef.close(true),
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo guardar el rango horario.'));
        this.guardando.set(false);
      },
    });
  }
}

/** Si se repite, hacen falta al menos un día y una fecha de fin no anterior a la de inicio. */
function repeticionValida(grupo: AbstractControl): ValidationErrors | null {
  if (!grupo.get('repetir')?.value) return null;
  const dias = grupo.get('dias')?.value as number[];
  const desde = grupo.get('fecha')?.value as Date | null;
  const hasta = grupo.get('fecha_hasta')?.value as Date | null;
  if (!dias?.length) return { sinDias: true };
  if (!hasta) return { sinFechaHasta: true };
  if (desde && hasta < desde) return { hastaAnterior: true };
  return null;
}
