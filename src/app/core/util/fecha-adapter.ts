import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

/**
 * El adaptador nativo interpreta "14/03/1998" como mes/día (formato US) y falla.
 * Este acepta dd/mm/aaaa (también con - o .) para poder tipear la fecha a mano.
 */
@Injectable()
export class FechaArAdapter extends NativeDateAdapter {
  override parse(valor: unknown): Date | null {
    if (typeof valor === 'string') {
      const m = /^\s*(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\s*$/.exec(valor);
      if (!m) return valor.trim() === '' ? null : this.invalid();
      const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
      const fecha = new Date(a, mes - 1, d);
      const coincide = fecha.getFullYear() === a && fecha.getMonth() === mes - 1 && fecha.getDate() === d;
      return coincide ? fecha : this.invalid();
    }
    return super.parse(valor);
  }
}
