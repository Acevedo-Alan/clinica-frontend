import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-operador',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './operador.html',
  styleUrl: './operador.css'
})
export class Operador {}