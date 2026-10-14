import { Component, computed, inject, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ETIQUETA_ROL, MENU, rutaDe } from '../../core/config/menu.config';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-menu',
  imports: [MatListModule, MatIconModule, RouterLink, RouterLinkActive],
  template: `
    @if (auth.rol(); as rol) {
      <p class="seccion">Menú · {{ etiqueta()[rol] }}</p>
      <mat-nav-list>
        <a mat-list-item routerLink="/" [routerLinkActive]="'activo'" [routerLinkActiveOptions]="{ exact: true }" (click)="navegar.emit()">
          <mat-icon matListItemIcon>home</mat-icon>
          <span matListItemTitle>Inicio</span>
        </a>
        @for (item of items(); track item.ruta) {
          <a mat-list-item [routerLink]="rutaDe(rol, item.ruta)" routerLinkActive="activo" (click)="navegar.emit()">
            <mat-icon matListItemIcon>{{ item.icono }}</mat-icon>
            <span matListItemTitle>{{ item.titulo }}</span>
          </a>
        }
      </mat-nav-list>
    }
  `,
  styles: `
    .seccion {
      margin: 20px 24px 4px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
    }
    mat-nav-list {
      padding-inline: 12px;
    }
    .activo {
      --mat-list-list-item-leading-icon-color: var(--mat-sys-on-secondary-container);
      background: var(--mat-sys-secondary-container);
      border-radius: 999px;
      font-weight: 600;
    }
  `,
})
export class Menu {
  protected readonly auth = inject(AuthService);
  protected readonly rutaDe = rutaDe;
  protected readonly etiqueta = computed(() => ETIQUETA_ROL);
  protected readonly items = computed(() => {
    const rol = this.auth.rol();
    return rol ? MENU[rol] : [];
  });
  readonly navegar = output<void>();
}
