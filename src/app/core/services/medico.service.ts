import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Medico } from '../models/api.models';

export interface FiltrosMedicos {
  id_especialidad?: number;
  id_sede?: number;
}

@Injectable({ providedIn: 'root' })
export class MedicoService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/medicos`;

  listar(filtros: FiltrosMedicos = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null) {
        params = params.set(clave, String(valor));
      }
    }
    return this.http.get<ApiResponse<Medico[]>>(this.api, { params }).pipe(map((r) => r.datos));
  }
}
