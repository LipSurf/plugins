export function setStyles<T>(stylesObject: T, el: HTMLElement) {
  Object.keys(stylesObject).forEach(key => {
    el.style[key] = stylesObject[key];
  });
}

export function select<T extends Element>(selector: string, el?: Element): T | null {
  const element = el || document;
  return element.querySelector<T>(selector);
}

export function selectAll<T extends Element>(selector: string, el?: Element): NodeListOf<T> {
  const element = el || document;
  return element.querySelectorAll<T>(selector);
}
