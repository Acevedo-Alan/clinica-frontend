import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgendaNueva, ApiResponse, BloqueAgenda } from '../models/api.models';

export interface FiltrosAgenda {
  id_medico?: number;
  id_sede?: number;
  id_especialidad?: number;
  /** Formato YYYY-MM-DD */
  fecha?: string;
}

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/agenda`;

  listar(filtros: FiltrosAgenda = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.http
      .get<ApiResponse<BloqueAgenda[]>>(this.api, { params })
      .pipe(map((r) => r.datos));
  }

  crear(datos: AgendaNueva) {
    return this.http
      .post<ApiResponse<AgendaNueva & { id: number }>>(this.api, datos)
      .pipe(map((r) => r.datos));
  }

  modificar(id: number, datos: AgendaNueva) {
    return this.http
      .put<ApiResponse<AgendaNueva & { id: number }>>(`${this.api}/${id}`, datos)
      .pipe(map((r) => r.datos));
  }

  eliminar(id: number) {
    return this.http
      .delete<ApiResponse<{ id: number; mensaje: string }>>(`${this.api}/${id}`)
      .pipe(map((r) => r.datos));
  }
}
