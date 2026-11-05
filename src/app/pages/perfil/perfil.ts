import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, of, catchError } from 'rxjs';
import { ETIQUETA_ROL } from '../../core/config/menu.config';
import { Cobertura, Perfil as PerfilDatos } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { CoberturaService } from '../../core/services/cobertura.service';
import { formatearFecha, mensajeDeError } from '../../core/util/errores';
import { passwordsCoinciden } from '../../core/util/validadores';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'app-perfil',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  private readonly auth = inject(AuthService);
  private readonly coberturaSrv = inject(CoberturaService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly datos = signal<PerfilDatos | null>(null);
  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly etiquetaRol = ETIQUETA_ROL;
  protected readonly formatearFecha = formatearFecha;

  /** Solo paciente puede entrar en este modo (es el único rol con botón "Editar datos"). */
  protected readonly editando = signal(false);
  protected readonly guardandoDatos = signal(false);
  protected readonly errorDatos = signal<string | null>(null);

  protected readonly cambiandoPassword = signal(false);
  protected readonly guardandoPassword = signal(false);
  protected readonly errorPassword = signal<string | null>(null);
  protected readonly verPasswords = signal(false);

  protected readonly iniciales = computed(() => {
    const d = this.datos();
    return d ? `${d.nombre[0] ?? ''}${d.apellido[0] ?? ''}`.toUpperCase() : '';
  });

  protected readonly nombreCobertura = computed(() => {
    const id = this.datos()?.id_cobertura;
    if (id == null) return null;
    return this.coberturas().find((c) => c.id === id)?.nombre ?? `Cobertura #${id}`;
  });

  protected readonly formDatos = this.fb.group({
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(EMAIL),
      Validators.maxLength(30),
    ]),
    telefono: this.fb.nonNullable.control('', [Validators.maxLength(15)]),
    id_cobertura: this.fb.control<number | null>(null, [Validators.required]),
  });

  protected readonly formPassword = this.fb.group(
    {
      passwordActual: this.fb.nonNullable.control('', [Validators.required]),
      passwordNueva: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
      confirmarPassword: this.fb.nonNullable.control('', [Validators.required]),
    },
    { validators: passwordsCoinciden },
  );

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    forkJoin({
      perfil: this.auth.perfil(),
      // Si falla el listado de coberturas, el perfil igual se muestra.
      coberturas: this.coberturaSrv.listar().pipe(catchError(() => of([] as Cobertura[]))),
    }).subscribe({
      next: ({ perfil, coberturas }) => {
        this.datos.set(perfil);
        this.coberturas.set(coberturas);
        this.cargando.set(false);
      },
      error: (e: unknown) => {
        this.error.set(mensajeDeError(e, 'No se pudo cargar tu perfil.'));
        this.cargando.set(false);
      },
    });
  }

  protected editar(): void {
    const d = this.datos();
    if (!d) return;
    this.formDatos.setValue({
      email: d.email,
      telefono: d.telefono ?? '',
      id_cobertura: d.id_cobertura,
    });
    this.errorDatos.set(null);
    this.editando.set(true);
  }

  protected cancelarEdicion(): void {
    this.editando.set(false);
    this.errorDatos.set(null);
    this.cancelarPassword();
  }

  protected cancelarPassword(): void {
    this.cambiandoPassword.set(false);
    this.formPassword.reset();
    this.errorPassword.set(null);
  }

  protected guardarDatos(): void {
    if (this.formDatos.invalid) {
      this.formDatos.markAllAsTouched();
      return;
    }
    const v = this.formDatos.getRawValue();
    this.guardandoDatos.set(true);
    this.errorDatos.set(null);
    this.auth
      .actualizarPerfil({
        email: v.email.trim(),
        telefono: v.telefono.trim(),
        id_cobertura: v.id_cobertura!,
      })
      .subscribe({
        next: (perfil) => {
          this.datos.set(perfil);
          this.guardandoDatos.set(false);
          this.editando.set(false);
          this.snackBar.open('Datos actualizados correctamente.', 'Cerrar', { duration: 4000 });
        },
        error: (e: unknown) => {
          this.errorDatos.set(mensajeDeError(e, 'No se pudieron guardar los cambios.'));
          this.guardandoDatos.set(false);
        },
      });
  }

  protected guardarPassword(): void {
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    this.guardandoPassword.set(true);
    this.errorPassword.set(null);
    this.auth.cambiarPassword(this.formPassword.getRawValue()).subscribe({
      next: () => {
        this.guardandoPassword.set(false);
        this.cancelarPassword();
        this.snackBar.open('Contraseña actualizada correctamente.', 'Cerrar', { duration: 4000 });
      },
      error: (e: unknown) => {
        this.errorPassword.set(mensajeDeError(e, 'No se pudo cambiar la contraseña.'));
        this.guardandoPassword.set(false);
      },
    });
  }
}
