import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Especialidad } from '../../../core/models/api.models';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { mensajeDeError } from '../../../core/util/errores';

@Component({
  selector: 'app-especialidad-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './especialidad-form-dialog.html',
  styleUrl: './especialidad-form-dialog.scss',
})
export class EspecialidadFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(EspecialidadService);
  private readonly dialogRef = inject(MatDialogRef<EspecialidadFormDialog, Especialidad>);
  protected readonly data = inject<Especialidad | null>(MAT_DIALOG_DATA);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    descripcion: this.fb.nonNullable.control(this.data?.descripcion ?? '', [
      Validators.required,
      Validators.maxLength(30),
    ]),
  });

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set(null);

    const peticion = this.data
      ? this.servicio.modificar(this.data.id, valores)
      : this.servicio.crear(valores);

    peticion.subscribe({
      next: (especialidad) => this.dialogRef.close(especialidad),
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo guardar la especialidad.'));
        this.guardando.set(false);
      },
    });
  }
}
