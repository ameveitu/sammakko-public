import { h } from '../../ui/dom';
import {
  rationalFormatNames, solutionRationalLink,
  type RationalLinkLabel, type RationalLinkResponse, type RationalLinkTask,
} from '../models/rational-links';

export const showRationalMark = (format: RationalLinkLabel['format'], value: string): string =>
  format === 'percent' ? `${value.replace(/\s*%$/, '')} %` : value;

const inputStyle = 'box-sizing:border-box;min-width:0;width:100%;min-height:44px;border:1px solid #87aaa0;border-radius:8px;padding:4px;background:#fffdf5;color:#203e40;text-align:center;font:inherit;font-weight:700';

function valueInput(label: string, inputmode: 'numeric' | 'decimal', maxlength: number) {
  return h('input', {
    type: 'text', inputmode, maxlength, autocomplete: 'off', spellcheck: 'false',
    'aria-label': label, style: inputStyle,
  });
}

function editable(label: RationalLinkLabel) {
  const fraction = label.format === 'fraction';
  const start = label.proposed ?? '';
  const [first, second] = fraction ? start.split('/') : [start, undefined];
  const a = valueInput(fraction ? 'Osoittaja' : rationalFormatNames[label.format], fraction ? 'numeric' : 'decimal', fraction ? 8 : 17);
  const b = fraction ? valueInput('Nimittäjä', 'numeric', 8) : null;
  a.value = first ?? '';
  if (b) b.value = second ?? '';
  const controls = h('div', {
    style: `display:grid;align-items:center;gap:3px;grid-template-columns:${b ? 'minmax(0,1fr) auto minmax(0,1fr)' : label.format === 'percent' ? 'minmax(0,1fr) auto' : 'minmax(0,1fr)'}`,
  }, a, b ? h('span', { 'aria-hidden': 'true' }, '/') : label.format === 'percent' ? h('span', { 'aria-hidden': 'true' }, '%') : null, b);
  return {
    controls,
    value: () => b ? `${a.value}/${b.value}` : a.value,
    show(value: string) {
      if (b) [a.value, b.value] = value.split('/') as [string, string];
      else a.value = value;
    },
    lock() { a.disabled = true; if (b) b.disabled = true; },
  };
}

/** Local drafts are sent to the exact domain checker only on submit. */
export function mountRationalLink(task: RationalLinkTask, host: HTMLElement, submit: (response: RationalLinkResponse) => void) {
  const fields = new Map<RationalLinkLabel['format'], ReturnType<typeof editable>>();
  const panels = task.labels.map(label => {
    const given = label.given;
    const input = given === undefined ? editable(label) : undefined;
    if (input) fields.set(label.format, input);
    return h('div', {
      'data-rational-format': label.format, 'data-given': given === undefined ? 'false' : 'true',
      style: 'min-width:0;border:1px solid #b5cbc1;border-radius:10px;background:#eaf3e9;padding:6px;display:grid;align-content:start;gap:4px',
    },
    h('strong', { class: 'small' }, rationalFormatNames[label.format]),
    input?.controls ?? h('p', { 'data-trusted-label': '', style: 'margin:0;min-height:44px;display:grid;align-items:center;font-weight:750' }, showRationalMark(label.format, given!)));
  });
  const done = h('button', { type: 'submit', class: 'btn primary big wide' }, 'Tarkista lähetys');
  const form = h('form', { 'data-rational-link-form': '', style: 'display:grid;gap:8px' },
    h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(124px,100%),1fr));gap:6px' }, ...panels),
    done);
  let locked = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (locked) return;
    locked = true;
    const values = Object.fromEntries([...fields].map(([format, field]) => [format, field.value()]));
    for (const field of fields.values()) field.lock();
    done.disabled = true;
    submit({ kind: 'rational-link', values });
  });
  host.append(form);
  return {
    reveal() {
      const answer = solutionRationalLink(task);
      for (const [format, field] of fields) field.show(answer.values[format]!);
    },
  };
}
