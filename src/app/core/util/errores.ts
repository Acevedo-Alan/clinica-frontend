import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte cualquier error de HTTP en un mensaje legible para el usuario.
 * El backend responde errores como { codigo, estado: "<mensaje>", datos: null }.
 */
export function mensajeDeError(error: unknown, porDefecto = 'Ocurrió un error inesperado.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Verificá que el backend esté levantado.';
    }
    const estado = error.error?.estado;
    if (typeof estado === 'string' && estado.trim() && estado !== 'ok') {
      return estado;
    }
    if (error.status >= 500) {
      return 'El servidor tuvo un problema. Probá de nuevo en unos minutos.';
    }
  }
  return porDefecto;
}

/** "1995-12-30T03:00:00.000Z" | "1995-12-30" -> "30/12/1995" */
export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return '—';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}
