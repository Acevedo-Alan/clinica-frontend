import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrada',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  template: `
    <div class="pagina estado">
      <span class="icono"><mat-icon>travel_explore</mat-icon></span>
      <p class="codigo">404</p>
      <h1>Página no encontrada</h1>
      <p class="texto">La dirección que ingresaste no existe o fue movida.</p>
      <a mat-flat-button routerLink="/"><mat-icon>home</mat-icon> Volver al inicio</a>
    </div>
  `,
  styleUrl: './estado.scss',
})
export class NoEncontrada {}
