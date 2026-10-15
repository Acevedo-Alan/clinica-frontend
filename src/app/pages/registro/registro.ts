
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroupDirective,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

import { CoberturaService } from '../../core/services/cobertura';
import { Cobertura } from '../../models/cobertura';
import { AuthService, RegistroPaciente } from '../../core/services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro implements OnInit {

  @ViewChild(FormGroupDirective)
  formDirective!: FormGroupDirective;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private coberturaService = inject(CoberturaService);
  private authService = inject(AuthService);

  // ESTADOS REACTIVOS
  coberturas = signal<Cobertura[]>([]);
  cargandoCoberturas = signal(false);
  errorCoberturas = signal('');

  registrando = signal(false);
  mensajeExito = signal('');
  errorRegistro = signal('');

  registroForm = this.fb.group(
    {
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{7,8}$/)
        ]
      ],
      fechaNacimiento: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      telefono: ['', Validators.required],
      coberturaId: [
        null as number | null,
        Validators.required
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],
      confirmarPassword: ['', Validators.required]
    },
    {
      validators: this.validarCoincidenciaContrasenas
    }
  );

  ngOnInit(): void {
    this.cargarCoberturas();
  }

  private validarCoincidenciaContrasenas(
    control: AbstractControl
  ): ValidationErrors | null {

    const password = control.get('password')?.value;
    const confirmarPassword =
      control.get('confirmarPassword')?.value;

    if (!password || !confirmarPassword) {
      return null;
    }

    return password === confirmarPassword
      ? null
      : { contrasenasNoCoinciden: true };
  }

  contrasenasNoCoinciden(): boolean {
    const password = this.registroForm.controls.password.value;
    const confirmarPassword =
      this.registroForm.controls.confirmarPassword.value;

    return !!password &&
      !!confirmarPassword &&
      password !== confirmarPassword;
  }

  cargarCoberturas(): void {
    this.cargandoCoberturas.set(true);
    this.errorCoberturas.set('');

    this.coberturaService.listarCoberturas().subscribe({
      next: (respuesta) => {
        this.coberturas.set(respuesta.datos ?? []);
        this.cargandoCoberturas.set(false);
      },

      error: (error) => {
        console.error('Error al cargar coberturas:', error);

        this.errorCoberturas.set(
          'No se pudieron cargar las coberturas médicas.'
        );

        this.cargandoCoberturas.set(false);
      }
    });
  }

  registrar(): void {
    if (this.registrando()) {
      return;
    }

    this.mensajeExito.set('');
    this.errorRegistro.set('');

    if (this.cargandoCoberturas() || this.errorCoberturas()) {
      return;
    }

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();

      console.log('Formulario inválido');

      Object.entries(this.registroForm.controls).forEach(
        ([campo, control]) => {
          if (control.invalid) {
            console.log(
              'Campo inválido:',
              campo,
              control.errors
            );
          }
        }
      );

      console.log(
        'Errores generales:',
        this.registroForm.errors
      );

      return;
    }

    const datos = this.registroForm.getRawValue();

    if (datos.coberturaId === null) {
      this.errorRegistro.set(
        'Seleccioná una cobertura médica.'
      );
      return;
    }

    const paciente: RegistroPaciente = {
      nombre: datos.nombre!,
      apellido: datos.apellido!,
      dni: datos.dni!,
      email: datos.email!,
      password: datos.password!,
      fecha_nacimiento: datos.fechaNacimiento!,
      id_cobertura: datos.coberturaId,
      telefono: datos.telefono ?? ''
    };

    this.registrando.set(true);

    this.authService.registrarPaciente(paciente).subscribe({
      next: () => {
        this.registrando.set(false);

        this.formDirective.resetForm();

        this.router.navigate(['/login'], {
          queryParams: { registro: 'exitoso' }
        });
      },

      error: (error) => {
        this.registrando.set(false);

        if (error.status === 409) {
          this.errorRegistro.set(
            'Ya existe un usuario registrado con ese DNI o correo electrónico.'
          );
        } else {
          this.errorRegistro.set(
            error.error?.estado ||
            'Ocurrió un error al registrar el paciente.'
          );
        }
      }
    });
  }
}
