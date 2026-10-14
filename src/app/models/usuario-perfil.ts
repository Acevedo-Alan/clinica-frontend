export interface UsuarioPerfil {
    id: number;
    apellido: string;
    nombre: string;
    fecha_nacimiento: string;
    rol: string;
    email: string;
    telefono: string | null;
    dni: string;
    id_sede: number | null;
    id_cobertura: number | null;
  }