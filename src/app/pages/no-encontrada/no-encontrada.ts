
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink, MatButtonModule],
  templateUrl: './no-encontrada.html',
  styleUrl: './no-encontrada.css'
})
export class NoEncontrada {}
