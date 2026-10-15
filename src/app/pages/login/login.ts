
import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AuthService,
  UsuarioSesion
} from '../../core/services/auth';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
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
        if (!respuesta.datos?.token || !respuesta.datos?.usuario) {
          this.cargando = false;
          this.errorLogin =
            'El servidor no devolvió los datos de sesión.';
          this.cdr.markForCheck();
          return;
        }

        const token = respuesta.datos.token;
        const usuario = respuesta.datos.usuario;

        // Guardamos el token para autorizar la consulta del perfil.
        this.authService.guardarSesion(token, usuario);

        this.password = '';

        // Recuperamos los datos completos del usuario.
        this.authService.obtenerPerfil().subscribe({
          next: (perfilRespuesta) => {
            this.cargando = false;


            const perfil = perfilRespuesta.datos;

            if (!perfil) {
              this.authService.cerrarSesion();
              this.errorLogin = 'No se recibieron los datos del perfil.';
              this.cdr.markForCheck();
              return;
            }

            const usuarioCompleto: UsuarioSesion = {
              id: perfil.id,
              nombre: perfil.nombre,
              apellido: perfil.apellido,
              email: perfil.email,
              rol: usuario.rol
            };


            // Actualizamos la sesión con el nombre y apellido.
            this.authService.guardarSesion(
              token,
              usuarioCompleto
            );

            this.mensajeExito =
              `¡Bienvenido/a, ${usuarioCompleto.nombre}!`;

            let ruta: string;

            switch (usuarioCompleto.rol) {
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
                this.errorLogin =
                  'El usuario no tiene un rol válido.';
                this.mensajeExito = '';
                this.cdr.markForCheck();
                return;
            }

            this.cdr.markForCheck();
            this.router.navigate([ruta]);
          },

          error: () => {
            this.cargando = false;
            this.authService.cerrarSesion();
            this.errorLogin =
              'No se pudo recuperar tu perfil. Intentá iniciar sesión nuevamente.';
            this.cdr.markForCheck();
          }
        });
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
