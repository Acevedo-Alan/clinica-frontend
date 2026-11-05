import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { ETIQUETA_ROL } from '../../../core/config/menu.config';
import { Cobertura, Especialidad, Sede, Usuario } from '../../../core/models/api.models';
import { CoberturaService } from '../../../core/services/cobertura.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { SedeService } from '../../../core/services/sede.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { fechaAIso, fechaDesdeIso, mensajeDeError } from '../../../core/util/errores';
import { listaNoVacia } from '../../../core/util/validadores';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'app-usuario-edicion-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuario-edicion-dialog.html',
  styleUrl: './usuario-edicion-dialog.scss',
})
export class UsuarioEdicionDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(UsuarioService);
  private readonly sedeSrv = inject(SedeService);
  private readonly especialidadSrv = inject(EspecialidadService);
  private readonly coberturaSrv = inject(CoberturaService);
  private readonly dialogRef = inject(MatDialogRef<UsuarioEdicionDialog, Usuario>);
  protected readonly data = inject<Usuario>(MAT_DIALOG_DATA);

  protected readonly hoy = new Date();
  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly esOperadorOMedico = this.data.rol === 'operador' || this.data.rol === 'medico';
  protected readonly esMedico = this.data.rol === 'medico';
  protected readonly esPaciente = this.data.rol === 'paciente';

  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly sedes = signal<Sede[]>([]);
  protected readonly especialidadesDisponibles = signal<Especialidad[]>([]);
  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargandoSelectores = signal(true);
  protected readonly errorSelectores = signal<string | null>(null);

  protected readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control(this.data.nombre, [
      Validators.required,
      Validators.maxLength(30),
    ]),
    apellido: this.fb.nonNullable.control(this.data.apellido, [
      Validators.required,
      Validators.maxLength(30),
    ]),
    email: this.fb.nonNullable.control(this.data.email, [
      Validators.required,
      Validators.pattern(EMAIL),
      Validators.maxLength(30),
    ]),
    telefono: this.fb.nonNullable.control(this.data.telefono, [Validators.maxLength(15)]),
    fecha_nacimiento: this.fb.control<Date | null>(fechaDesdeIso(this.data.fecha_nacimiento), [
      Validators.required,
    ]),
    id_sede: this.fb.control<number | null>(
      this.data.id_sede,
      this.esOperadorOMedico ? [Validators.required] : [],
    ),
    id_cobertura: this.fb.control<number | null>(
      this.data.id_cobertura,
      this.esPaciente ? [Validators.required] : [],
    ),
    especialidades: this.fb.nonNullable.control<number[]>(
      this.data.especialidades ?? [],
      this.esMedico ? [listaNoVacia] : [],
    ),
  });

  constructor() {
    forkJoin({
      sedes: this.sedeSrv.listar(),
      especialidades: this.especialidadSrv.listar(),
      coberturas: this.coberturaSrv.listar(),
    }).subscribe({
      next: ({ sedes, especialidades, coberturas }) => {
        this.sedes.set(sedes);
        this.especialidadesDisponibles.set(especialidades);
        this.coberturas.set(coberturas);
        this.cargandoSelectores.set(false);
      },
      error: (e: unknown) => {
        this.errorSelectores.set(mensajeDeError(e, 'No se pudieron cargar los selectores.'));
        this.cargandoSelectores.set(false);
      },
    });
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.guardando.set(true);
    this.error.set(null);

    this.servicio
      .modificar(this.data.id, {
        nombre: v.nombre.trim(),
        apellido: v.apellido.trim(),
        email: v.email.trim(),
        telefono: v.telefono.trim(),
        fecha_nacimiento: fechaAIso(v.fecha_nacimiento!),
        id_sede: v.id_sede ?? undefined,
        id_cobertura: v.id_cobertura ?? undefined,
        especialidades: this.esMedico ? v.especialidades : undefined,
      })
      .subscribe({
        next: (usuario) => this.dialogRef.close(usuario),
        error: (e: unknown) => {
          this.error.set(mensajeDeError(e, 'No se pudo modificar el usuario.'));
          this.guardando.set(false);
        },
      });
  }
}
