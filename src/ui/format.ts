/** Où se trouve un point par rapport à la feuille, horizontalement. */
export function whereX(x: number, W: number): string {
  if (x < 0) return `${Math.round(-x)} mm à gauche de la feuille`;
  if (x > W) return `${Math.round(x - W)} mm à droite de la feuille`;
  return "sur la feuille";
}

/** Où se trouve un point par rapport à la feuille, verticalement. */
export function whereY(y: number, H: number): string {
  if (y < 0) return `${Math.round(-y)} mm au-dessus de la feuille`;
  if (y > H) return `${Math.round(y - H)} mm sous la feuille`;
  return "sur la feuille";
}
