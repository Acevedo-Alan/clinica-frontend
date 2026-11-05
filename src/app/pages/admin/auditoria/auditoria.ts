import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { RegistroAuditoria } from '../../../core/models/api.models';
import { fechaAIso, mensajeDeError } from '../../../core/util/errores';

@Component({
  selector: 'app-auditoria',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria {
  private readonly servicio = inject(AuditoriaService);

  protected readonly columnas = ['fecha', 'usuario', 'accion', 'entidad', 'detalle'];
  protected readonly entidades = ['sede', 'especialidad', 'cobertura', 'agenda', 'usuario'];

  protected readonly registros = signal<RegistroAuditoria[]>([]);
  protected readonly total = signal(0);
  protected readonly pagina = signal(0);
  protected readonly tamanioPagina = signal(10);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filtroUsuario = signal('');
  protected readonly filtroEntidad = signal('');
  protected readonly filtroDesde = signal<Date | null>(null);
  protected readonly filtroHasta = signal<Date | null>(null);

  constructor() {
    this.cargar();
  }

  protected nombreUsuario(registro: RegistroAuditoria): string {
    if (!registro.nombre_usuario) return `Usuario N.º ${registro.id_usuario}`;
    return `${registro.apellido_usuario}, ${registro.nombre_usuario}`;
  }

  protected fechaHora(valor: string): string {
    const d = new Date(valor);
    const fecha = d.toLocaleDateString('es-AR');
    const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return `${fecha} ${hora}`;
  }

  protected buscar(): void {
    this.pagina.set(0);
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    const desde = this.filtroDesde();
    const hasta = this.filtroHasta();
    this.servicio
      .listar({
        usuario: this.filtroUsuario().trim() || undefined,
        entidad: this.filtroEntidad() || undefined,
        desde: desde ? fechaAIso(desde) : undefined,
        hasta: hasta ? fechaAIso(hasta) : undefined,
        page: this.pagina() + 1,
        pageSize: this.tamanioPagina(),
      })
      .subscribe({
        next: (resultado) => {
          this.registros.set(resultado.items);
          this.total.set(resultado.total);
          this.cargando.set(false);
        },
        error: (e: unknown) => {
          this.error.set(mensajeDeError(e, 'No se pudo cargar la auditoría.'));
          this.cargando.set(false);
        },
      });
  }

  protected paginaCambiada(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanioPagina.set(evento.pageSize);
    this.cargar();
  }
}
