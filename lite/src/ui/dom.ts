type Kid = Node | string | number | null | undefined | false;
type Attrs = Record<string, unknown> & { class?: string; html?: string; style?: string };

/** Minimal element builder: h('button', {class: 'x', onclick}, 'text'). */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...kids: Kid[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'html') el.innerHTML = String(v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v as EventListener);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of kids) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : String(c));
  return el;
}

/** Icon-only or icon+label button. */
export function btn(icon: string, label: string, onclick: () => void, cls = '', showLabel = true) {
  return h('button', { class: `btn ${cls}`, onclick, 'aria-label': label, type: 'button' },
    icon ? h('span', { class: 'ico', html: icon }) : null,
    showLabel ? h('span', {}, label) : null);
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
