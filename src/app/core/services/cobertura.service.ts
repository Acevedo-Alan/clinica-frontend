import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Cobertura } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CoberturaService {
  private readonly http = inject(HttpClient);

  listar() {
    return this.http
      .get<ApiResponse<Cobertura[]>>(`${environment.apiUrl}/coberturas`)
      .pipe(map((r) => r.datos));
  }
}
