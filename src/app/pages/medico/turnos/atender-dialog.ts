import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TurnoMedico } from '../../../core/models/api.models';
import { HistorialService } from '../../../core/services/historial.service';
import { TurnoService } from '../../../core/services/turno.service';
import { mensajeDeError } from '../../../core/util/errores';

export interface AtenderDialogResultado {
  atendido: true;
  historialOk: boolean;
  errorHistorial?: string;
}

@Component({
  selector: 'app-atender-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './atender-dialog.html',
  styleUrl: './atender-dialog.scss',
})
export class AtenderDialog {
  private readonly fb = inject(FormBuilder);
  private readonly turnoSrv = inject(TurnoService);
  private readonly historialSrv = inject(HistorialService);
  private readonly dialogRef = inject(MatDialogRef<AtenderDialog, AtenderDialogResultado>);
  protected readonly turno = inject<TurnoMedico>(MAT_DIALOG_DATA);

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    diagnostico: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(255)]),
    tratamiento: this.fb.nonNullable.control('', [Validators.maxLength(255)]),
    observaciones: this.fb.nonNullable.control('', [Validators.maxLength(255)]),
  });

  protected confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set(null);

    this.turnoSrv.atender(this.turno.id).subscribe({
      next: () => {
        this.historialSrv
          .crear({
            id_turno: this.turno.id,
            diagnostico: v.diagnostico.trim(),
            tratamiento: v.tratamiento.trim() || undefined,
            observaciones: v.observaciones.trim() || undefined,
          })
          .subscribe({
            next: () => this.dialogRef.close({ atendido: true, historialOk: true }),
            error: (e: unknown) =>
              this.dialogRef.close({
                atendido: true,
                historialOk: false,
                errorHistorial: mensajeDeError(e, 'No se pudo guardar el historial clínico.'),
              }),
          });
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo marcar el turno como atendido.'));
        this.guardando.set(false);
      },
    });
  }
}
