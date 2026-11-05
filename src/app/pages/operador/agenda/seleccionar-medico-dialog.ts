import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Medico } from '../../../core/models/api.models';

export interface SeleccionarMedicoDialogData {
  medicos: Medico[];
}

/** Paso 1 de "Nueva agenda": elegir a qué médico se le va a cargar un rango horario. */
@Component({
  selector: 'app-seleccionar-medico-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>Elegir médico</h2>
    <mat-dialog-content>
      <mat-form-field class="completo">
        <mat-label>Médico</mat-label>
        <mat-select [ngModel]="medicoId()" (ngModelChange)="medicoId.set($event)">
          @for (m of data.medicos; track m.id) {
            <mat-option [value]="m.id">{{ m.apellido }}, {{ m.nombre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      @if (data.medicos.length === 0) {
        <p>No hay médicos cargados en el sistema todavía.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="undefined">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="medicoId() === null" (click)="confirmar()">
        Continuar
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .completo {
      width: 100%;
      min-width: 280px;
    }
  `,
})
export class SeleccionarMedicoDialog {
  protected readonly data = inject<SeleccionarMedicoDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<SeleccionarMedicoDialog, Medico>);

  protected readonly medicoId = signal<number | null>(null);

  protected confirmar(): void {
    const medico = this.data.medicos.find((m) => m.id === this.medicoId());
    if (medico) this.dialogRef.close(medico);
  }
}
