import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-en-construccion',
  imports: [MatIconModule],
  template: `
    <div class="pagina estado">
      <span class="icono"><mat-icon>{{ info().icono }}</mat-icon></span>
      <h1>{{ info().titulo }}</h1>
      <p class="chip"><mat-icon inline>construction</mat-icon> En construcción</p>
      <p class="texto">Esta función se habilita en una próxima etapa del proyecto. ¡Vuelta pronto!</p>
    </div>
  `,
  styles: `
    .estado {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding-top: 72px;
    }
    .icono {
      display: grid;
      place-items: center;
      width: 88px;
      height: 88px;
      border-radius: 28px;
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);

      mat-icon {
        width: 44px;
        height: 44px;
        font-size: 44px;
      }
    }
    h1 {
      margin: 24px 0 12px;
      font-size: 2rem;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 0 0 16px;
      padding: 6px 14px;
      border-radius: 999px;
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
      font-weight: 600;
      font-size: 0.85rem;
    }
    .texto {
      max-width: 40ch;
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class EnConstruccion {
  protected readonly info = toSignal(
    inject(ActivatedRoute).data.pipe(
      map((d) => ({
        titulo: (d['titulo'] as string) ?? 'Próximamente',
        icono: (d['icono'] as string) ?? 'construction',
      })),
    ),
    { initialValue: { titulo: 'Próximamente', icono: 'construction' } },
  );
}
