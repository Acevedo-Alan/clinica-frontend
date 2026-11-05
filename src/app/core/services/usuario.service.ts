import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  Paginado,
  Rol,
  Usuario,
  UsuarioAlta,
  UsuarioEdicion,
} from '../models/api.models';

export interface FiltrosUsuarios {
  nombre?: string;
  apellido?: string;
  rol?: Rol;
  id_sede?: number;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/usuarios`;

  listar(filtros: FiltrosUsuarios = {}) {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtros)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params = params.set(clave, String(valor));
      }
    }
    return this.http
      .get<ApiResponse<Paginado<Usuario>>>(this.api, { params })
      .pipe(map((r) => r.datos));
  }

  obtener(id: number) {
    return this.http.get<ApiResponse<Usuario>>(`${this.api}/${id}`).pipe(map((r) => r.datos));
  }

  crear(datos: UsuarioAlta) {
    return this.http.post<ApiResponse<Usuario>>(this.api, datos).pipe(map((r) => r.datos));
  }

  modificar(id: number, datos: UsuarioEdicion) {
    return this.http
      .put<ApiResponse<Usuario>>(`${this.api}/${id}`, datos)
      .pipe(map((r) => r.datos));
  }
}
