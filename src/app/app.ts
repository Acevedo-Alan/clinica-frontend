import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';
import { Menu } from './layout/menu/menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSidenavModule, Header, Footer, Menu],
  template: `
    <app-header (alternarMenu)="alternar()" />
    <mat-sidenav-container class="contenedor">
      @if (auth.autenticado()) {
        <mat-sidenav
          [mode]="movil() ? 'over' : 'side'"
          [opened]="menuAbierto()"
          (closedStart)="menuAbierto.set(false)"
          class="lateral"
        >
          <app-menu (navegar)="cerrarSiMovil()" />
        </mat-sidenav>
      }
      <mat-sidenav-content class="contenido">
        <main class="principal"><router-outlet /></main>
        <app-footer />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .contenedor {
      flex: 1;
      min-height: 0;
      background: var(--mat-sys-surface);
    }
    .lateral {
      width: 280px;
      border-right: 1px solid var(--mat-sys-outline-variant);
    }
    .contenido {
      display: flex;
      flex-direction: column;
    }
    .principal {
      flex: 1 0 auto;
    }
  `,
})
export class App {
  protected readonly auth = inject(AuthService);
  private readonly breakpoints = inject(BreakpointObserver);

  protected readonly movil = toSignal(
    this.breakpoints.observe('(max-width: 900px)').pipe(map((r) => r.matches)),
    { initialValue: false },
  );
  protected readonly menuAbierto = signal(true);

  constructor() {
    // En móvil el menú arranca cerrado; en escritorio, abierto.
    effect(() => this.menuAbierto.set(!this.movil()));
  }

  protected alternar(): void {
    this.menuAbierto.update((v) => !v);
  }

  protected cerrarSiMovil(): void {
    if (this.movil()) this.menuAbierto.set(false);
  }
}
