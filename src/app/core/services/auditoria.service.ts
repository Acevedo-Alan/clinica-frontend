import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Paginado, RegistroAuditoria } from '../models/api.models';

export interface FiltrosAuditoria {
  usuario?: string;
  entidad?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/auditoria`;

  listar(filtros: FiltrosAuditoria = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.http
      .get<ApiResponse<Paginado<RegistroAuditoria>>>(this.api, { params })
      .pipe(map((r) => r.datos));
  }
}
