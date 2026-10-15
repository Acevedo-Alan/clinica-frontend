
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should persist and clear the session', () => {
    const usuario = {
      id: 1,
      nombre: 'Ana',
      apellido: 'Pérez',
      rol: 'paciente',
      email: 'ana@example.com'
    };

    service.guardarSesion('token-prueba', usuario);

    expect(service.estaAutenticado()).toBe(true);
    expect(service.obtenerUsuarioSesion()).toEqual(usuario);
    expect(service.obtenerRol()).toBe('paciente');

    service.cerrarSesion();

    expect(service.estaAutenticado()).toBe(false);
    expect(service.obtenerUsuarioSesion()).toBeNull();
  });
});
