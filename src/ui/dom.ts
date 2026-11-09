/** Élément de la page par son id ; échoue clairement s'il manque. */
export function $<T extends Element = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Élément #${id} introuvable dans index.html`);
  return el as unknown as T;
}

export function $$<T extends HTMLElement = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** Premier descendant de `root` qui correspond au sélecteur ; échoue clairement s'il manque. */
export function child<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Élément « ${selector} » introuvable`);
  return el;
}
