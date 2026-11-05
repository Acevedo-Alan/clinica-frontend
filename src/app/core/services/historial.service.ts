import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, HistorialClinico, HistorialNuevo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/historial`;

  crear(datos: HistorialNuevo) {
    return this.http
      .post<ApiResponse<HistorialClinico>>(this.api, datos)
      .pipe(map((r) => r.datos));
  }

  /** Para médico: solo trae los registros que el médico autenticado cargó. */
  listarPorPaciente(idPaciente: number) {
    return this.http
      .get<ApiResponse<HistorialClinico[]>>(`${this.api}/paciente/${idPaciente}`)
      .pipe(map((r) => r.datos));
  }
}
