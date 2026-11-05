import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Notificacion } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/notificaciones`;

  private readonly _notificaciones = signal<Notificacion[]>([]);

  readonly notificaciones = this._notificaciones.asReadonly();
  readonly noLeidas = computed(() => this._notificaciones().filter((n) => !n.leida).length);

  /** Trae las notificaciones del usuario autenticado, de más reciente a más antigua. */
  cargar() {
    return this.http.get<ApiResponse<Notificacion[]>>(this.api).pipe(
      map((r) => r.datos.map((n) => ({ ...n, leida: !!n.leida }))),
      tap((notificaciones) => this._notificaciones.set(notificaciones)),
    );
  }

  marcarLeida(id: number) {
    return this.http.put<ApiResponse<{ id: number; leida: boolean }>>(`${this.api}/${id}/leida`, {}).pipe(
      tap(() => {
        this._notificaciones.update((lista) =>
          lista.map((n) => (n.id === id ? { ...n, leida: true } : n)),
        );
      }),
    );
  }

  /** Se limpia al cerrar sesión para no arrastrar notificaciones del usuario anterior. */
  limpiar(): void {
    this._notificaciones.set([]);
  }
}
