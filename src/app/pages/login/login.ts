import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';


@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  dni = '';
  password = '';

  cargando = false;
  errorLogin = '';
  mensajeExito = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      if (params.get('registro') === 'exitoso') {
        this.mensajeExito =
          '¡Tu cuenta fue creada correctamente! Ya podés iniciar sesión.';
        this.cdr.markForCheck();
      }
    });
  }
  
iniciarSesion(): void {
  if (this.cargando) {
    return;
  }

  this.errorLogin = '';
  this.mensajeExito = '';

  if (!this.dni.trim() || !this.password) {
    this.errorLogin = 'Ingresá tu DNI y contraseña.';
    return;
  }

  this.cargando = true;

  this.authService.iniciarSesion({
    dni: this.dni.trim(),
    password: this.password
  }).subscribe({
    next: (respuesta) => {
      this.cargando = false;

      if (!respuesta.datos?.token || !respuesta.datos?.usuario) {
        this.errorLogin = 'El servidor no devolvió los datos de sesión.';
        this.cdr.markForCheck();
        return;
      }

      const usuario = respuesta.datos.usuario;

      this.authService.guardarSesion(
        respuesta.datos.token,
        respuesta.datos.usuario
      );

      this.mensajeExito = `¡Bienvenido/a, ${usuario.nombre}!`;
      this.password = '';

      let ruta: string;

      switch (usuario.rol) {
        case 'paciente':
          ruta = '/paciente';
          break;

        case 'medico':
          ruta = '/medico';
          break;

        case 'operador':
          ruta = '/operador';
          break;

        case 'admin':
          ruta = '/admin';
          break;

        default:
          this.authService.cerrarSesion();
          this.errorLogin = 'El usuario no tiene un rol válido.';
          this.mensajeExito = '';
          this.cdr.markForCheck();
          return;
      }

      this.cdr.markForCheck();
      this.router.navigate([ruta]);
    },

    error: (error) => {
      this.cargando = false;

      if (error.status === 401) {
        this.errorLogin = 'DNI o contraseña incorrectos.';
      } else {
        this.errorLogin =
          error.error?.estado ||
          'No se pudo iniciar sesión. Intentá nuevamente.';
      }

      this.cdr.markForCheck();
    }
  });
}

}