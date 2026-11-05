import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Sede } from '../../../core/models/api.models';
import { SedeService } from '../../../core/services/sede.service';
import { mensajeDeError } from '../../../core/util/errores';

@Component({
  selector: 'app-sede-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './sede-form-dialog.html',
  styleUrl: './sede-form-dialog.scss',
})
export class SedeFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(SedeService);
  private readonly dialogRef = inject(MatDialogRef<SedeFormDialog, Sede>);
  protected readonly data = inject<Sede | null>(MAT_DIALOG_DATA);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control(this.data?.nombre ?? '', [
      Validators.required,
      Validators.maxLength(50),
    ]),
    direccion: this.fb.nonNullable.control(this.data?.direccion ?? '', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    telefono: this.fb.nonNullable.control(this.data?.telefono ?? '', [
      Validators.required,
      Validators.maxLength(15),
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
      next: (sede) => this.dialogRef.close(sede),
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo guardar la sede.'));
        this.guardando.set(false);
      },
    });
  }
}
