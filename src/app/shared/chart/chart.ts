import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  input,
} from '@angular/core';
import { Chart, type ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

/**
 * Envoltorio fino sobre Chart.js (sin wrapper de Angular: evita el choque de
 * peer-deps de ng2-charts/ngx-charts con esta versión de Angular). Un solo
 * componente para barras (una serie, un color) y torta/dona (una porción por
 * color, para mostrar proporciones).
 *
 * El host ocupa el 100% de su contenedor: quien lo use debe envolverlo en un
 * elemento con alto fijo (Chart.js con `maintainAspectRatio: false` necesita
 * un ancestro con tamaño real, si no el canvas queda en 0px).
 */
@Component({
  selector: 'app-chart',
  template: `<canvas #lienzo></canvas>`,
  styles: `
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
  `,
})
export class ChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('lienzo') private readonly lienzo!: ElementRef<HTMLCanvasElement>;

  readonly tipo = input.required<'bar' | 'doughnut'>();
  readonly etiquetas = input.required<string[]>();
  readonly valores = input.required<number[]>();
  readonly color = input<string | string[]>('#0097a7');
  readonly etiquetaSerie = input('Cantidad');
  readonly mostrarLeyenda = input(false);

  private instancia?: Chart;

  ngAfterViewInit(): void {
    this.crear();
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (!this.instancia) return;
    if (cambios['etiquetas'] || cambios['valores'] || cambios['tipo'] || cambios['color']) {
      this.instancia.destroy();
      this.crear();
    }
  }

  ngOnDestroy(): void {
    this.instancia?.destroy();
  }

  private crear(): void {
    this.instancia = new Chart(this.lienzo.nativeElement, this.configuracion());
  }

  private configuracion(): ChartConfiguration {
    const esBarra = this.tipo() === 'bar';
    return {
      type: this.tipo(),
      data: {
        labels: this.etiquetas(),
        datasets: [
          {
            label: this.etiquetaSerie(),
            data: this.valores(),
            backgroundColor: this.color(),
            borderRadius: esBarra ? 4 : 0,
            borderWidth: esBarra ? 0 : 2,
            borderColor: esBarra ? undefined : colorCssSuperficie(),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: this.mostrarLeyenda() } },
        scales: esBarra ? { y: { beginAtZero: true, ticks: { precision: 0 } } } : undefined,
      },
    };
  }
}

/** Separador visual de 2px entre porciones de la torta, como pide la guía de dataviz. */
function colorCssSuperficie(): string {
  if (typeof window === 'undefined') return '#ffffff';
  return (
    getComputedStyle(document.documentElement).getPropertyValue('--mat-sys-surface').trim() ||
    '#ffffff'
  );
}
