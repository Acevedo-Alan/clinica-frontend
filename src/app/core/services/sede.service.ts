import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Sede } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/sedes`;

  listar() {
    return this.http.get<ApiResponse<Sede[]>>(this.api).pipe(map((r) => r.datos));
  }

  crear(datos: Omit<Sede, 'id'>) {
    return this.http.post<ApiResponse<Sede>>(this.api, datos).pipe(map((r) => r.datos));
  }

  modificar(id: number, datos: Omit<Sede, 'id'>) {
    return this.http.put<ApiResponse<Sede>>(`${this.api}/${id}`, datos).pipe(map((r) => r.datos));
  }

  eliminar(id: number) {
    return this.http
      .delete<ApiResponse<{ id: number; mensaje: string }>>(`${this.api}/${id}`)
      .pipe(map((r) => r.datos));
  }
}
