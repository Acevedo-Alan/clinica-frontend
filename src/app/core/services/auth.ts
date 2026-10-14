
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { UsuarioPerfil } from '../../models/usuario-perfil';

export interface RegistroPaciente {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  id_cobertura: number;
  telefono?: string;
}

export interface UsuarioRegistrado {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
}

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  rol: string;
  email: string;
}

export interface LoginDatos {
  dni: string;
  password: string;
}

export interface LoginRespuesta {
  token: string;
  usuario: UsuarioSesion;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  registrarPaciente(
    datos: RegistroPaciente
  ): Observable<ApiResponse<UsuarioRegistrado>> {
    return this.http.post<ApiResponse<UsuarioRegistrado>>(
      `${this.apiUrl}/registro`,
      datos
    );
  }

  iniciarSesion(
    datos: LoginDatos
  ): Observable<ApiResponse<LoginRespuesta>> {
    return this.http.post<ApiResponse<LoginRespuesta>>(
      `${this.apiUrl}/login`,
      datos
    );
  }

  guardarSesion(token: string, usuario: UsuarioSesion): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
  }

  obtenerUsuarioSesion(): UsuarioSesion | null {
    const usuario = sessionStorage.getItem('usuario');

    if (!usuario) {
      return null;
    }

    try {
      return JSON.parse(usuario) as UsuarioSesion;
    } catch {
      return null;
    }
  }

  obtenerRol(): string | null {
    return this.obtenerUsuarioSesion()?.rol ?? null;
  }

  cerrarSesion(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
  }

  estaAutenticado(): boolean {
    return !!sessionStorage.getItem('token');
  }

  obtenerPerfil(): Observable<ApiResponse<UsuarioPerfil>> {
    return this.http.get<ApiResponse<UsuarioPerfil>>(
      `${this.apiUrl}/perfil`
    );
  }
}
