import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { Especialidad, RolGestionable, Sede, Usuario } from '../../../core/models/api.models';
import { EspecialidadService } from '../../../core/services/especialidad.service';
import { SedeService } from '../../../core/services/sede.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { fechaAIso, mensajeDeError } from '../../../core/util/errores';
import { listaNoVacia } from '../../../core/util/validadores';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'app-usuario-alta-dialog',
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
  templateUrl: './usuario-alta-dialog.html',
  styleUrl: './usuario-alta-dialog.scss',
})
export class UsuarioAltaDialog {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(UsuarioService);
  private readonly sedeSrv = inject(SedeService);
  private readonly especialidadSrv = inject(EspecialidadService);
  private readonly dialogRef = inject(MatDialogRef<UsuarioAltaDialog, Usuario>);

  protected readonly hoy = new Date();
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly rolSeleccionado = signal<RolGestionable | null>(null);

  protected readonly sedes = signal<Sede[]>([]);
  protected readonly especialidadesDisponibles = signal<Especialidad[]>([]);
  protected readonly cargandoSelectores = signal(true);
  protected readonly errorSelectores = signal<string | null>(null);

  protected readonly form = this.fb.group({
    rol: this.fb.control<RolGestionable | null>(null, [Validators.required]),
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(30)]),
    apellido: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(30)]),
    dni: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{7,8}$/)]),
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(EMAIL),
      Validators.maxLength(30),
    ]),
    telefono: this.fb.nonNullable.control('', [Validators.maxLength(15)]),
    fecha_nacimiento: this.fb.control<Date | null>(null, [Validators.required]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
    id_sede: this.fb.control<number | null>(null),
    especialidades: this.fb.nonNullable.control<number[]>([]),
  });

  constructor() {
    forkJoin({
      sedes: this.sedeSrv.listar(),
      especialidades: this.especialidadSrv.listar(),
    }).subscribe({
      next: ({ sedes, especialidades }) => {
        this.sedes.set(sedes);
        this.especialidadesDisponibles.set(especialidades);
        this.cargandoSelectores.set(false);
      },
      error: (e: unknown) => {
        this.errorSelectores.set(
          mensajeDeError(e, 'No se pudieron cargar sedes y especialidades.'),
        );
        this.cargandoSelectores.set(false);
      },
    });

    this.form.controls.rol.valueChanges.pipe(takeUntilDestroyed()).subscribe((rol) => {
      this.rolSeleccionado.set(rol);
      this.actualizarValidadoresPorRol(rol);
    });
  }

  private actualizarValidadoresPorRol(rol: RolGestionable | null): void {
    const sede = this.form.controls.id_sede;
    const especialidades = this.form.controls.especialidades;

    if (rol === 'operador' || rol === 'medico') {
      sede.setValidators([Validators.required]);
    } else {
      sede.setValue(null);
      sede.setValidators([]);
    }
    sede.updateValueAndValidity();

    if (rol === 'medico') {
      especialidades.setValidators([listaNoVacia]);
    } else {
      especialidades.setValue([]);
      especialidades.setValidators([]);
    }
    especialidades.updateValueAndValidity();
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
      .crear({
        nombre: v.nombre.trim(),
        apellido: v.apellido.trim(),
        dni: v.dni,
        email: v.email.trim(),
        password: v.password,
        telefono: v.telefono.trim(),
        fecha_nacimiento: fechaAIso(v.fecha_nacimiento!),
        rol: v.rol!,
        id_sede: v.id_sede ?? undefined,
        especialidades: v.rol === 'medico' ? v.especialidades : undefined,
      })
      .subscribe({
        next: (usuario) => this.dialogRef.close(usuario),
        error: (e: unknown) => {
          this.error.set(mensajeDeError(e, 'No se pudo crear el usuario.'));
          this.guardando.set(false);
        },
      });
  }
}
