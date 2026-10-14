import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response';
import { Cobertura } from '../../models/cobertura';

@Injectable({
  providedIn: 'root'
})
export class CoberturaService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/coberturas`;

  listarCoberturas(): Observable<ApiResponse<Cobertura[]>> {
    return this.http.get<ApiResponse<Cobertura[]>>(this.apiUrl);
  }
}