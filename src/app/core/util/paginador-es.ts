import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

/** Traduce el paginador de Material al español. */
@Injectable()
export class PaginadorEs extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Filas por página:';
  override nextPageLabel = 'Página siguiente';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (pagina: number, tamanio: number, total: number): string => {
    if (total === 0 || tamanio === 0) return `0 de ${total}`;
    const desde = pagina * tamanio + 1;
    const hasta = Math.min((pagina + 1) * tamanio, total);
    return `${desde}–${hasta} de ${total}`;
  };
}
