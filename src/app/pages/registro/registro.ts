import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { Cobertura } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { CoberturaService } from '../../core/services/cobertura.service';
import { mensajeDeError } from '../../core/util/errores';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly coberturaSrv = inject(CoberturaService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly hoy = new Date();
  protected readonly coberturas = signal<Cobertura[]>([]);
  protected readonly cargandoCoberturas = signal(true);
  protected readonly errorCoberturas = signal<string | null>(null);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly verPassword = signal(false);

  protected readonly form = this.fb.group({
    nombre: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    apellido: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(50)]),
    dni: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{7,8}$/)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(EMAIL), Validators.maxLength(100)]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(6)]),
    fecha_nacimiento: this.fb.control<Date | null>(null, [Validators.required]),
    id_cobertura: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor() {
    this.cargarCoberturas();
  }

  protected cargarCoberturas(): void {
    this.cargandoCoberturas.set(true);
    this.errorCoberturas.set(null);
    this.coberturaSrv.listar().subscribe({
      next: (lista) => {
        this.coberturas.set(lista);
        this.cargandoCoberturas.set(false);
      },
      error: (e: unknown) => {
        this.errorCoberturas.set(mensajeDeError(e, 'No se pudieron cargar las coberturas.'));
        this.cargandoCoberturas.set(false);
      },
    });
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.enviando.set(true);
    this.error.set(null);

    this.auth
      .registro({
        nombre: v.nombre.trim(),
        apellido: v.apellido.trim(),
        dni: v.dni,
        email: v.email.trim(),
        password: v.password,
        fecha_nacimiento: this.aIso(v.fecha_nacimiento!),
        id_cobertura: v.id_cobertura!,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('¡Registro exitoso! Ahora podés iniciar sesión.', 'Cerrar', { duration: 6000 });
          void this.router.navigate(['/login'], { queryParams: { registrado: 1 } });
        },
        error: (e: unknown) => {
          this.error.set(mensajeDeError(e, 'No se pudo completar el registro.'));
          this.enviando.set(false);
        },
      });
  }

  /** Date local -> "YYYY-MM-DD" sin corrimiento de zona horaria. */
  private aIso(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
}
