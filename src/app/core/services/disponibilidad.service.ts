import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface FiltrosDisponibilidad {
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
}

@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/disponibilidad`;

  /** Fechas (desde hoy) en las que ese médico tiene agenda para esa especialidad/sede. */
  fechas(filtros: FiltrosDisponibilidad) {
    const params = this.aParams(filtros);
    return this.http
      .get<ApiResponse<string[]>>(`${this.api}/fechas`, { params })
      .pipe(map((r) => r.datos));
  }

  /** Horarios libres de ese médico, esa fecha, especialidad y sede. */
  horarios(filtros: FiltrosDisponibilidad & { fecha: string }) {
    const params = this.aParams(filtros);
    return this.http
      .get<ApiResponse<string[]>>(`${this.api}/horarios`, { params })
      .pipe(map((r) => r.datos));
  }

  private aParams(filtros: object): HttpParams {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      params = params.set(clave, String(valor));
    }
    return params;
  }
}
