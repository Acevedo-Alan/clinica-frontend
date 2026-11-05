import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Cobertura } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CoberturaService {
  private readonly http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/coberturas`;

  listar() {
    return this.http.get<ApiResponse<Cobertura[]>>(this.api).pipe(map((r) => r.datos));
  }

  crear(datos: Omit<Cobertura, 'id'>) {
    return this.http.post<ApiResponse<Cobertura>>(this.api, datos).pipe(map((r) => r.datos));
  }

  modificar(id: number, datos: Omit<Cobertura, 'id'>) {
    return this.http
      .put<ApiResponse<Cobertura>>(`${this.api}/${id}`, datos)
      .pipe(map((r) => r.datos));
  }

  eliminar(id: number) {
    return this.http
      .delete<ApiResponse<{ id: number; mensaje: string }>>(`${this.api}/${id}`)
      .pipe(map((r) => r.datos));
  }
}
