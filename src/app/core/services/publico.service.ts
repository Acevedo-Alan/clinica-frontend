import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface DatosLanding {
  especialidades: { id: number; descripcion: string }[];
  sedes: { id: number; nombre: string; direccion: string; telefono: string }[];
  coberturas: { id: number; nombre: string }[];
  medicos: { id: number; nombre: string; apellido: string; especialidades: string[] }[];
}

/** Datos de la portada: endpoint público, no requiere sesión. */
@Injectable({ providedIn: 'root' })
export class PublicoService {
  private readonly http = inject(HttpClient);

  landing() {
    return this.http
      .get<ApiResponse<DatosLanding>>(`${environment.apiUrl}/publico/landing`)
      .pipe(map((r) => r.datos));
  }
}
