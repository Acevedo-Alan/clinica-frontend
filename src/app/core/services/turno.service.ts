import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Paginado,
  Turno,
  TurnoMedico,
  TurnoMio,
  TurnoNuevo,
  TurnoSede,
} from '../models/api.models';
import { NotificacionService } from './notificacion.service';

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly notificaciones = inject(NotificacionService);
  private readonly api = `${environment.apiUrl}/turnos`;

  /** Refresca el contador de notificaciones sin que el usuario tenga que recargar. */
  private refrescarNotificaciones() {
    this.notificaciones.cargar().subscribe({ error: () => void 0 });
  }

  crear(datos: TurnoNuevo) {
    return this.http.post<ApiResponse<Turno>>(this.api, datos).pipe(
      map((r) => r.datos),
      tap(() => this.refrescarNotificaciones()),
    );
  }

  /** Turnos del paciente autenticado: próximos (más cercano primero) o historial (más reciente primero). */
  misTurnos(page: number, pageSize: number, tab: 'proximos' | 'historial') {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('tab', tab);
    return this.http
      .get<ApiResponse<Paginado<TurnoMio>>>(`${this.api}/mios`, { params })
      .pipe(map((r) => r.datos));
  }

  /** Turnos de la sede del operador autenticado para esa fecha. */
  turnosSede(fecha: string) {
    const params = new HttpParams().set('fecha', fecha);
    return this.http
      .get<ApiResponse<TurnoSede[]>>(`${this.api}/sede`, { params })
      .pipe(map((r) => r.datos));
  }

  /** Turnos del médico autenticado para esa fecha, en todas sus sedes. */
  listarDelMedico(fecha: string) {
    const params = new HttpParams().set('fecha', fecha);
    return this.http
      .get<ApiResponse<TurnoMedico[]>>(`${this.api}/medico`, { params })
      .pipe(map((r) => r.datos));
  }

  atender(id: number) {
    return this.http
      .put<ApiResponse<{ id: number; estado: string }>>(`${this.api}/${id}/atender`, {})
      .pipe(
        map((r) => r.datos),
        tap(() => this.refrescarNotificaciones()),
      );
  }

  cancelar(id: number) {
    return this.http
      .put<ApiResponse<{ id: number; estado: string }>>(`${this.api}/${id}/cancelar`, {})
      .pipe(
        map((r) => r.datos),
        tap(() => this.refrescarNotificaciones()),
      );
  }
}
