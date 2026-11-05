import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte cualquier error de HTTP en un mensaje legible para el usuario.
 * El backend responde errores como { codigo, estado: "<mensaje>", datos: null }.
 */
export function mensajeDeError(
  error: unknown,
  porDefecto = 'Ocurrió un error inesperado.',
): string {
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

/** Date local -> "YYYY-MM-DD" sin corrimiento de zona horaria. */
export function fechaAIso(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "1995-12-30T03:00:00.000Z" | "1995-12-30" -> Date local a medianoche, sin corrimiento de zona horaria. */
export function fechaDesdeIso(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Edad en años cumplidos a partir de una fecha de nacimiento ISO. */
export function edadDesdeFecha(fechaNacimiento: string): number {
  const nacimiento = fechaDesdeIso(fechaNacimiento);
  if (!nacimiento) return 0;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const todaviaNoCumplio =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (todaviaNoCumplio) edad--;
  return edad;
}
