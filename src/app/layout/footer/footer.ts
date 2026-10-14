import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  imports: [MatIconModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly anio = new Date().getFullYear();
  protected readonly sedes = [
    { nombre: 'Sede Centro', direccion: 'San Martín 123, Santa Fe', telefono: '342 400-0001' },
    { nombre: 'Sede Norte', direccion: 'Av. Rivadavia 456, Santa Fe', telefono: '342 400-0002' },
  ];
}
