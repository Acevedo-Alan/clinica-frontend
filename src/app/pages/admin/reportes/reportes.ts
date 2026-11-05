import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { DatosReportes } from '../../../core/models/api.models';
import { ReportesService } from '../../../core/services/reportes.service';
import { colorCss } from '../../../core/util/colores';
import { fechaAIso, mensajeDeError } from '../../../core/util/errores';
import { ChartComponent } from '../../../shared/chart/chart';

@Component({
  selector: 'app-reportes',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    ChartComponent,
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes {
  private readonly servicio = inject(ReportesService);

  protected readonly columnasRanking = ['posicion', 'medico', 'cantidad'];
  protected readonly datos = signal<DatosReportes | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filtroDesde = signal<Date | null>(null);
  protected readonly filtroHasta = signal<Date | null>(null);

  protected readonly colorPrimario = colorCss('--mat-sys-primary');
  protected readonly colorError = colorCss('--mat-sys-error');
  protected readonly coloresCancelacion = [this.colorError, this.colorPrimario];
  protected readonly etiquetasCancelacion = ['Cancelados', 'Resto'];

  protected readonly etiquetasEspecialidad = computed(
    () => this.datos()?.turnosPorEspecialidad.map((e) => e.descripcion) ?? [],
  );
  protected readonly valoresEspecialidad = computed(
    () => this.datos()?.turnosPorEspecialidad.map((e) => e.cantidad) ?? [],
  );

  protected readonly etiquetasSede = computed(
    () => this.datos()?.turnosPorSede.map((s) => s.nombre) ?? [],
  );
  protected readonly valoresSede = computed(
    () => this.datos()?.turnosPorSede.map((s) => s.cantidad) ?? [],
  );

  protected readonly ranking = computed(() => this.datos()?.rankingMedicos ?? []);

  protected readonly valoresCancelacion = computed(() => {
    const t = this.datos()?.tasaCancelacion;
    if (!t) return [0, 0];
    return [t.cancelados, t.total - t.cancelados];
  });

  constructor() {
    this.cargar();
  }

  protected buscar(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    const desde = this.filtroDesde();
    const hasta = this.filtroHasta();
    this.servicio
      .obtener({
        desde: desde ? fechaAIso(desde) : undefined,
        hasta: hasta ? fechaAIso(hasta) : undefined,
      })
      .subscribe({
        next: (reportes) => {
          this.datos.set(reportes);
          this.cargando.set(false);
        },
        error: (e: unknown) => {
          this.error.set(mensajeDeError(e, 'No se pudieron cargar los reportes.'));
          this.cargando.set(false);
        },
      });
  }
}
