import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BloqueAgenda, Especialidad, Sede } from '../../../core/models/api.models';
import { AgendaService } from '../../../core/services/agenda.service';
import { fechaAIso, fechaDesdeIso, mensajeDeError } from '../../../core/util/errores';
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
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './agenda-form-dialog.html',
  styleUrl: './agenda-form-dialog.scss',
})
export class AgendaFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(AgendaService);
  private readonly dialogRef = inject(MatDialogRef<AgendaFormDialog, boolean>);
  protected readonly data = inject<AgendaFormDialogData>(MAT_DIALOG_DATA);

  protected readonly hoy = new Date();
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
    },
    { validators: horaSalidaPosteriorAEntrada },
  );

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set(null);

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
