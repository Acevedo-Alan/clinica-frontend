import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  Perfil,
  RegistroRequest,
  Rol,
  UsuarioSesion,
} from '../models/api.models';

const CLAVE_TOKEN = 'clinica.token';
const CLAVE_USUARIO = 'clinica.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly api = `${environment.apiUrl}/auth`;

  private readonly _token = signal<string | null>(null);
  private readonly _usuario = signal<UsuarioSesion | null>(null);

  readonly token = this._token.asReadonly();
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => !!this._token() && !!this._usuario());
  readonly rol = computed<Rol | null>(() => this._usuario()?.rol ?? null);

  constructor() {
    this.restaurarSesion();
  }

  registro(datos: RegistroRequest) {
    return this.http.post<ApiResponse<unknown>>(`${this.api}/registro`, datos);
  }

  login(credenciales: LoginRequest) {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.api}/login`, credenciales).pipe(
      map((r) => r.datos),
      tap((datos) => this.guardarSesion(datos.token, datos.usuario)),
    );
  }

  perfil() {
    return this.http.get<ApiResponse<Perfil>>(`${this.api}/perfil`).pipe(map((r) => r.datos));
  }

  /** Elimina el token y vuelve a la pantalla principal. */
  logout(): void {
    this.limpiarSesion();
    void this.router.navigateByUrl('/');
  }

  /**
   * Chequea que haya sesión y que el token no haya vencido.
   * Si venció, limpia la sesión (los guards redirigen al login).
   */
  haySesionVigente(): boolean {
    const token = this._token();
    if (!token || !this._usuario()) return false;
    if (this.vencido(token)) {
      this.limpiarSesion();
      return false;
    }
    return true;
  }

  limpiarSesion(): void {
    this._token.set(null);
    this._usuario.set(null);
    try {
      localStorage.removeItem(CLAVE_TOKEN);
      localStorage.removeItem(CLAVE_USUARIO);
    } catch {
      /* almacenamiento no disponible: la sesión en memoria ya se limpió */
    }
  }

  private guardarSesion(token: string, usuario: UsuarioSesion): void {
    this._token.set(token);
    this._usuario.set(usuario);
    try {
      localStorage.setItem(CLAVE_TOKEN, token);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } catch {
      /* sin persistencia: la sesión dura hasta recargar */
    }
  }

  private restaurarSesion(): void {
    try {
      const token = localStorage.getItem(CLAVE_TOKEN);
      const usuario = localStorage.getItem(CLAVE_USUARIO);
      if (!token || !usuario) return;
      if (this.vencido(token)) {
        this.limpiarSesion();
        return;
      }
      this._token.set(token);
      this._usuario.set(JSON.parse(usuario) as UsuarioSesion);
    } catch {
      this.limpiarSesion();
    }
  }

  /** Lee `exp` del JWT (sin verificar firma: eso lo hace el backend). */
  private vencido(token: string): boolean {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const { exp } = JSON.parse(atob(payload)) as { exp?: number };
      return typeof exp === 'number' && exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}
