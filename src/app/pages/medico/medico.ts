import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-medico',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './medico.html',
  styleUrl: './medico.css'
})
export class Medico {}