import { Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { ETIQUETA_ROL } from '../../core/config/menu.config';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Notificacion } from '../../core/models/api.models';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    RouterLink,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly notificaciones = inject(NotificacionService);
  protected readonly etiquetaRol = ETIQUETA_ROL;
  readonly alternarMenu = output<void>();

  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** En login y registro el header ofrece volver al inicio en vez de repetir los botones de acceso. */
  protected readonly enAcceso = () => /^[/](login|registro)([?]|$)/.test(this.url());

  /** Misma convención que `auditoria.fechaHora`: fecha y hora locales a partir de un timestamp ISO. */
  protected fechaHora(valor: string): string {
    const d = new Date(valor);
    const fecha = d.toLocaleDateString('es-AR');
    const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return `${fecha} ${hora}`;
  }

  protected marcarLeida(n: Notificacion): void {
    if (n.leida) return;
    this.notificaciones.marcarLeida(n.id).subscribe({ error: () => void 0 });
  }
}
