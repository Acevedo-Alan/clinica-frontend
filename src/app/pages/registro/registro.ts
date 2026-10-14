import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroupDirective
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
  private fb = new FormBuilder();
  private router = inject(Router);
  private coberturaService = inject(CoberturaService);

  coberturas: Cobertura[] = [];
  cargandoCoberturas = false;
  errorCoberturas = '';

  private authService = inject(AuthService);

  registrando = false;
  mensajeExito = '';
  errorRegistro = '';

  registroForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{7,8}$/)
    ]],
    fechaNacimiento: ['', Validators.required],
    email: ['', [
      Validators.required,
      Validators.email
    ]],
    telefono: ['', Validators.required],
    coberturaId: [null as number | null, Validators.required],
    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],
    confirmarPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    this.cargarCoberturas();
  }
  
  cargarCoberturas(): void {
    this.cargandoCoberturas = true;
    this.errorCoberturas = '';
  
    this.coberturaService.listarCoberturas().subscribe({
      next: (respuesta) => {
        this.coberturas = respuesta.datos ?? [];
        this.cargandoCoberturas = false;
      },
      error: (error) => {
        console.error('Error al cargar coberturas:', error);
        this.errorCoberturas = 'No se pudieron cargar las coberturas médicas.';
        this.cargandoCoberturas = false;
      }
    });
  }

  registrar(): void {
  if (this.registrando) {
    return;
  }

  this.mensajeExito = '';
  this.errorRegistro = '';

  if (this.registroForm.invalid) {
    this.registroForm.markAllAsTouched();
    return;
  }

  const datos = this.registroForm.getRawValue();

  if (datos.password !== datos.confirmarPassword) {
    this.errorRegistro = 'Las contraseñas no coinciden.';
    return;
  }

  if (datos.coberturaId === null) {
    this.errorRegistro = 'Seleccioná una cobertura médica.';
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

  this.registrando = true;

  this.authService.registrarPaciente(paciente).subscribe({
    next: () => {
      this.registrando = false;
      this.formDirective.resetForm();
    
      this.router.navigate(['/login'], {
        queryParams: { registro: 'exitoso' }
      });
    },

    error: (error) => {
      this.registrando = false;
    
      if (error.status === 409) {
        this.errorRegistro =
          'Ya existe un usuario registrado con ese DNI o correo electrónico.';
      } else {
        this.errorRegistro =
          error.error?.estado ||
          'Ocurrió un error al registrar el paciente.';
      }
    
      alert(this.errorRegistro);
    }
  });
}
}
