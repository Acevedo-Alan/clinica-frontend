import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MENU, rutaDe } from '../../core/config/menu.config';
import { AuthService } from '../../core/services/auth.service';
import { DatosLanding, PublicoService } from '../../core/services/publico.service';

interface Especialidad {
  icono: string;
  nombre: string;
}

interface MedicoPortada {
  nombre: string;
  especialidad: string;
  iniciales: string;
  /** Foto de archivo o de stock; sin foto se muestra un avatar con las iniciales. */
  foto?: string;
}

interface SedePortada {
  nombre: string;
  direccion: string;
  telefono: string;
  horario: string;
  mapa: string;
  foto: string;
}

/** Fotos de médicos que ya tenemos, por apellido tal como figura en la base. */
const FOTOS_MEDICOS: Record<string, string> = {
  Mendez: 'images/medico-clinica-medica.jpg',
  Rios: 'images/medico-bar1.jpg',
  Souza: 'images/medico-roc2.jpg',
  Costa: foto('1594824476967-48c8b964273f', 400, 400),
  Lopez: foto('1643297654416-05795d62e39c', 400, 400),
  Gimenez: 'images/medico-gimenez.jpg',
  Navarro: foto('1612349317150-e413f6a5b16d', 400, 400),
  Ibarra: foto('1631217868264-e5b90bb7e133', 400, 400) + '&crop=faces',
};

/** Fotos de reserva para médicos que se sumen después: evitan que alguno quede sin foto. */
const FOTOS_RESERVA = [
  foto('1622253692010-333f2da6031d', 400, 400),
  foto('1582750433449-648ed127bb54', 400, 400),
];

const FOTOS_SEDES = [
  foto('1519494026892-80bbd2d6fd0d', 700, 360),
  foto('1666214280557-f1b5022eb634', 700, 360),
];

/** Icono por especialidad (sin tildes ni mayúsculas); las que no figuran usan uno genérico. */
const ICONOS: Record<string, string> = {
  traumatologia: 'accessibility_new',
  cardiologia: 'favorite',
  pediatria: 'child_care',
  ginecologia: 'pregnant_woman',
  dermatologia: 'face_retouching_natural',
  oftalmologia: 'visibility',
  psicologia: 'psychology',
  'clinica medica': 'medical_services',
};

const HORARIO_SEDE = 'Lun a Vie 8:00 a 19:00';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly auth = inject(AuthService);
  protected readonly rutaDe = rutaDe;
  protected readonly menu = MENU;

  private readonly datos = signal<DatosLanding | null>(null);

  constructor() {
    // Visitantes sin sesión: se piden los datos reales; si falla, queda el contenido de ejemplo.
    inject(PublicoService)
      .landing()
      .subscribe({ next: (d) => this.datos.set(d), error: () => void 0 });
  }

  protected readonly funcionalidades = [
    {
      icono: 'event_available',
      titulo: 'Solicitá tu turno',
      texto: 'Elegí especialidad, médico, sede y horario disponible sin llamar por teléfono.',
    },
    {
      icono: 'calendar_month',
      titulo: 'Gestioná tus turnos',
      texto: 'Consultá tus turnos próximos y cancelalos o reprogramalos cuando lo necesites.',
    },
    {
      icono: 'assignment',
      titulo: 'Historial clínico',
      texto: 'Accedé a tus consultas anteriores, diagnósticos e indicaciones en un solo lugar.',
    },
    {
      icono: 'notifications_active',
      titulo: 'Recordatorios',
      texto: 'Recibí avisos sobre confirmaciones y cambios en tus turnos.',
    },
  ];

  protected readonly cifras = computed(() => {
    const d = this.datos();
    if (!d) return CIFRAS_EJEMPLO;
    return [
      { valor: String(d.medicos.length), texto: 'médicos y especialistas' },
      { valor: String(d.especialidades.length), texto: 'especialidades' },
      { valor: String(d.sedes.length), texto: d.sedes.length === 1 ? 'sede en Santa Fe' : 'sedes en Santa Fe' },
      { valor: '24/7', texto: 'turnos online' },
    ];
  });

  protected readonly especialidades = computed<Especialidad[]>(() => {
    const d = this.datos();
    if (!d || d.especialidades.length === 0) return ESPECIALIDADES_EJEMPLO;
    return d.especialidades.map((e) => ({
      icono: ICONOS[normalizar(e.descripcion)] ?? 'local_hospital',
      nombre: e.descripcion,
    }));
  });

  protected readonly medicos = computed<MedicoPortada[]>(() => {
    const d = this.datos();
    if (!d || d.medicos.length === 0) return MEDICOS_EJEMPLO;
    return d.medicos.map((m, i) => ({
      nombre: `${m.nombre} ${m.apellido}`,
      especialidad: m.especialidades.join(' · '),
      iniciales: `${m.nombre[0] ?? ''}${m.apellido[0] ?? ''}`.toUpperCase(),
      foto: FOTOS_MEDICOS[m.apellido] ?? FOTOS_RESERVA[i % FOTOS_RESERVA.length],
    }));
  });

  protected readonly sedes = computed<SedePortada[]>(() => {
    const d = this.datos();
    if (!d || d.sedes.length === 0) return SEDES_EJEMPLO;
    return d.sedes.map((s, i) => ({
      nombre: s.nombre,
      direccion: `${s.direccion}, Santa Fe`,
      telefono: formatearTelefono(s.telefono),
      horario: HORARIO_SEDE,
      mapa: `${s.direccion}, Santa Fe, Argentina`,
      foto: FOTOS_SEDES[i % FOTOS_SEDES.length],
    }));
  });

  protected readonly coberturas = computed<string[]>(() => {
    const d = this.datos();
    if (!d || d.coberturas.length === 0) return COBERTURAS_EJEMPLO;
    return d.coberturas.map((c) => c.nombre);
  });
}

function foto(id: string, ancho: number, alto: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${ancho}&h=${alto}&q=80`;
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** "3424000001" -> "342 400-0001" (cualquier otro formato se muestra tal cual). */
function formatearTelefono(telefono: string): string {
  return /^\d{10}$/.test(telefono) ? `${telefono.slice(0, 3)} ${telefono.slice(3, 6)}-${telefono.slice(6)}` : telefono;
}

// ---- Contenido de ejemplo: se muestra solo si el backend no responde ----

const CIFRAS_EJEMPLO = [
  { valor: '30+', texto: 'médicos y especialistas' },
  { valor: '8', texto: 'especialidades' },
  { valor: '2', texto: 'sedes en Santa Fe' },
  { valor: '24/7', texto: 'turnos online' },
];

const ESPECIALIDADES_EJEMPLO: Especialidad[] = [
  { icono: 'accessibility_new', nombre: 'Traumatología' },
  { icono: 'favorite', nombre: 'Cardiología' },
  { icono: 'child_care', nombre: 'Pediatría' },
  { icono: 'pregnant_woman', nombre: 'Ginecología' },
  { icono: 'face_retouching_natural', nombre: 'Dermatología' },
  { icono: 'visibility', nombre: 'Oftalmología' },
  { icono: 'psychology', nombre: 'Psicología' },
  { icono: 'medical_services', nombre: 'Clínica médica' },
];

const MEDICOS_EJEMPLO: MedicoPortada[] = [
  { nombre: 'Laura Méndez', especialidad: 'Clínica médica', iniciales: 'LM', foto: FOTOS_MEDICOS['Mendez'] },
  { nombre: 'Martín Ríos', especialidad: 'Cardiología', iniciales: 'MR', foto: FOTOS_MEDICOS['Rios'] },
  { nombre: 'Andrés Souza', especialidad: 'Traumatología', iniciales: 'AS', foto: FOTOS_MEDICOS['Souza'] },
  { nombre: 'Valeria Costa', especialidad: 'Pediatría', iniciales: 'VC', foto: FOTOS_MEDICOS['Costa'] },
];

const SEDES_EJEMPLO: SedePortada[] = [
  {
    nombre: 'Sede Centro',
    direccion: 'San Martín 123, Santa Fe',
    telefono: '342 400-0001',
    horario: 'Lun a Vie 7:00 a 20:00 · Sáb 8:00 a 13:00',
    mapa: 'San Martín 123, Santa Fe, Argentina',
    foto: FOTOS_SEDES[0],
  },
  {
    nombre: 'Sede Norte',
    direccion: 'Av. Rivadavia 456, Santa Fe',
    telefono: '342 400-0002',
    horario: HORARIO_SEDE,
    mapa: 'Av. Rivadavia 456, Santa Fe, Argentina',
    foto: FOTOS_SEDES[1],
  },
];

const COBERTURAS_EJEMPLO = ['Jerárquicos', 'OSDE', 'Swiss Medical', 'Galeno', 'Medifé', 'IAPOS', 'PAMI', 'Particular'];
