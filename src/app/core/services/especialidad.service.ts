import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Especialidad } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/especialidades`;

  listar() {
    return this.http.get<ApiResponse<Especialidad[]>>(this.api).pipe(map((r) => r.datos));
  }

  crear(datos: Omit<Especialidad, 'id'>) {
    return this.http.post<ApiResponse<Especialidad>>(this.api, datos).pipe(map((r) => r.datos));
  }

  modificar(id: number, datos: Omit<Especialidad, 'id'>) {
    return this.http
      .put<ApiResponse<Especialidad>>(`${this.api}/${id}`, datos)
      .pipe(map((r) => r.datos));
  }

  eliminar(id: number) {
    return this.http
      .delete<ApiResponse<{ id: number; mensaje: string }>>(`${this.api}/${id}`)
      .pipe(map((r) => r.datos));
  }
}
