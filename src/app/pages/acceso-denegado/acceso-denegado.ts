import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-denegado',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="pagina estado">
      <span class="icono"><mat-icon>gpp_bad</mat-icon></span>
      <p class="codigo">403</p>
      <h1>Acceso denegado</h1>
      <p class="texto">Tu tipo de usuario no tiene permiso para ver esta sección.</p>
      <a mat-flat-button routerLink="/"><mat-icon>home</mat-icon> Volver al inicio</a>
    </div>
  `,
  styleUrl: '../no-encontrada/estado.scss',
})
export class AccesoDenegado {}
