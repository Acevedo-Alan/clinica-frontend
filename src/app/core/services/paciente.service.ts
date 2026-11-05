import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PacienteBusqueda } from '../models/api.models';

export interface FiltrosPaciente {
  dni?: string;
  apellido?: string;
}

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/pacientes`;

  buscar(filtros: FiltrosPaciente) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http
      .get<ApiResponse<PacienteBusqueda[]>>(this.api, { params })
      .pipe(map((r) => r.datos));
  }
}
