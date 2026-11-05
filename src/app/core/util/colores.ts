/** Lee el valor resuelto de una variable CSS (los tokens --mat-sys-* del tema). Canvas no entiende var(), necesita el color ya resuelto. */
export function colorCss(variable: string): string {
  if (typeof window === 'undefined') return '#000000';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}
