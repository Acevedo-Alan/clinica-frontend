import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Cobertura } from '../../../core/models/api.models';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { mensajeDeError } from '../../../core/util/errores';

@Component({
  selector: 'app-cobertura-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cobertura-form-dialog.html',
  styleUrl: './cobertura-form-dialog.scss',
})
export class CoberturaFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(CoberturaService);
  private readonly dialogRef = inject(MatDialogRef<CoberturaFormDialog, Cobertura>);
  protected readonly data = inject<Cobertura | null>(MAT_DIALOG_DATA);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control(this.data?.nombre ?? '', [
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
      next: (cobertura) => this.dialogRef.close(cobertura),
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo guardar la cobertura.'));
        this.guardando.set(false);
      },
    });
  }
}
