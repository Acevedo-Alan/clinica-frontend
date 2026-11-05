import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Para controles cuyo valor es un array (ej. especialidades multi-select): exige al menos un elemento. */
export const listaNoVacia: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  Array.isArray(control.value) && control.value.length > 0 ? null : { listaVacia: true };

/**
 * Validador de grupo: exige que `hora_salida` (HH:mm) sea posterior a `hora_entrada`.
 * Se deja pasar si falta algún valor: el `required` de cada control ya se encarga de eso.
 */
export const horaSalidaPosteriorAEntrada: ValidatorFn = (
  grupo: AbstractControl,
): ValidationErrors | null => {
  const entrada = grupo.get('hora_entrada')?.value;
  const salida = grupo.get('hora_salida')?.value;
  if (!entrada || !salida) return null;
  return salida > entrada ? null : { horaSalidaInvalida: true };
};

/** Validador de grupo: exige que `passwordNueva` y `confirmarPassword` coincidan. */
export const passwordsCoinciden: ValidatorFn = (
  grupo: AbstractControl,
): ValidationErrors | null => {
  const nueva = grupo.get('passwordNueva')?.value;
  const confirmar = grupo.get('confirmarPassword')?.value;
  if (!nueva || !confirmar) return null;
  return nueva === confirmar ? null : { passwordsNoCoinciden: true };
};
