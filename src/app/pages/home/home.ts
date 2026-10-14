import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MENU, rutaDe } from '../../core/config/menu.config';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly auth = inject(AuthService);
  protected readonly rutaDe = rutaDe;
  protected readonly menu = MENU;

  protected readonly funcionalidades = [
    {
      icono: 'event_available',
      titulo: 'Solicitá tu turno',
      texto: 'Elegí especialidad, médico, sede y horario disponible sin llamar por teléfono.',
    },
    {
      icono: 'calendar_month',
      titulo: 'Gestioná tus turnos',
      texto: 'Consultá tus turnos próximos y cancelalos o reprogramalos cuando lo necesites.',
    },
    {
      icono: 'assignment',
      titulo: 'Historial clínico',
      texto: 'Accedé a tus consultas anteriores, diagnósticos e indicaciones en un solo lugar.',
    },
    {
      icono: 'notifications_active',
      titulo: 'Recordatorios',
      texto: 'Recibí avisos sobre confirmaciones y cambios en tus turnos.',
    },
  ];
}
