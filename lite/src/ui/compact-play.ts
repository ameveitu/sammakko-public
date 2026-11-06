import { h } from './dom';

export const compactPlay = () => matchMedia('(max-width:960px), (hover:none) and (pointer:coarse)').matches;

export function readingOption(label: string, ...content: HTMLElement[]) {
  return h('details', { class: 'reading-option' }, h('summary', {}, label), ...content);
}
