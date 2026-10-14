export interface ApiResponse<T> {
    codigo: number;
    estado: string;
    datos: T | null;
  }