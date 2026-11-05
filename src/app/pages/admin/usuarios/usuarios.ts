import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ETIQUETA_ROL } from '../../../core/config/menu.config';
import { Rol, Sede, Usuario } from '../../../core/models/api.models';
import { SedeService } from '../../../core/services/sede.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { mensajeDeError } from '../../../core/util/errores';
import { UsuarioAltaDialog } from './usuario-alta-dialog';
import { UsuarioEdicionDialog } from './usuario-edicion-dialog';

@Component({
  selector: 'app-usuarios',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  private readonly servicio = inject(UsuarioService);
  private readonly sedeSrv = inject(SedeService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columnas = ['nombre', 'dni', 'email', 'rol', 'sede', 'acciones'];
  protected readonly roles: Rol[] = ['administrador', 'operador', 'medico', 'paciente'];
  protected readonly etiquetaRol = ETIQUETA_ROL;

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly total = signal(0);
  protected readonly pagina = signal(0);
  protected readonly tamanioPagina = signal(10);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly filtroNombre = signal('');
  protected readonly filtroApellido = signal('');
  protected readonly filtroRol = signal<Rol | ''>('');
  protected readonly filtroSede = signal<number | ''>('');

  protected readonly sedes = signal<Sede[]>([]);
  private readonly sedesPorId = computed(() => new Map(this.sedes().map((s) => [s.id, s.nombre])));

  constructor() {
    this.sedeSrv.listar().subscribe({ next: (sedes) => this.sedes.set(sedes) });
    this.cargar();
  }

  protected nombreSede(idSede: number | null): string {
    if (idSede == null) return '—';
    return this.sedesPorId().get(idSede) ?? `Sede N.º ${idSede}`;
  }

  protected etiquetaDe(usuario: Usuario): string {
    return this.etiquetaRol[usuario.rol];
  }

  protected buscar(): void {
    this.pagina.set(0);
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio
      .listar({
        nombre: this.filtroNombre().trim() || undefined,
        apellido: this.filtroApellido().trim() || undefined,
        rol: this.filtroRol() || undefined,
        id_sede: this.filtroSede() || undefined,
        page: this.pagina() + 1,
        pageSize: this.tamanioPagina(),
      })
      .subscribe({
        next: (resultado) => {
          this.usuarios.set(resultado.items);
          this.total.set(resultado.total);
          this.cargando.set(false);
        },
        error: (e: unknown) => {
          this.error.set(mensajeDeError(e, 'No se pudieron cargar los usuarios.'));
          this.cargando.set(false);
        },
      });
  }

  protected paginaCambiada(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanioPagina.set(evento.pageSize);
    this.cargar();
  }

  protected nuevo(): void {
    this.dialog
      .open(UsuarioAltaDialog, { width: '520px' })
      .afterClosed()
      .subscribe((creado?: Usuario) => {
        if (creado) this.cargar();
      });
  }

  protected editar(usuario: Usuario): void {
    this.servicio.obtener(usuario.id).subscribe({
      next: (completo) => {
        this.dialog
          .open(UsuarioEdicionDialog, { width: '520px', data: completo })
          .afterClosed()
          .subscribe((editado?: Usuario) => {
            if (editado) this.cargar();
          });
      },
      error: (e: unknown) =>
        this.snackBar.open(mensajeDeError(e, 'No se pudo cargar el usuario.'), 'Cerrar', {
          duration: 5000,
        }),
    });
  }
}
