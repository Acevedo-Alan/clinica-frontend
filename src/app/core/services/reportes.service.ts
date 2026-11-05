import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, DatosReportes } from '../models/api.models';

export interface FiltrosReportes {
  desde?: string;
  hasta?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/reportes`;

  obtener(filtros: FiltrosReportes = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http
      .get<ApiResponse<DatosReportes>>(this.api, { params })
      .pipe(map((r) => r.datos));
  }
}
