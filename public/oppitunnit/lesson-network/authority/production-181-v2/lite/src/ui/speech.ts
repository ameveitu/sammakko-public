import { store } from '../engine/store';

// Finnish text-to-speech. Instructions, feedback and the answer the child taps are
// read aloud unless quiet mode is on; the speaker buttons always read.
let voice: SpeechSynthesisVoice | undefined;
const synth = () => (typeof speechSynthesis === 'undefined' ? undefined : speechSynthesis);

// Novelty voices (macOS "Grandpa", "Bubbles"...) sound silly for instructions.
const NOVELTY = /grandma|grandpa|rocko|shelley|bubbles|bells|boing|jester|organ|whisper|zarvox|trinoids|bahh|cellos|wobble|albert|bad news|good news|superstar/i;
const listeners = new Set<() => void>();
/** Voices arrive asynchronously; screens drawn before that redraw via this. */
export const onVoices = (f: () => void) => { listeners.add(f); return () => listeners.delete(f); };

function pickVoice() {
  const had = !!voice;
  const vs = (synth()?.getVoices() ?? []).filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('fi'));
  voice = vs.find((v) => v.localService && !NOVELTY.test(v.name)) ?? vs.find((v) => !NOVELTY.test(v.name)) ?? vs[0];
  if (!had && voice) listeners.forEach((f) => f());
}
pickVoice();
synth()?.addEventListener?.('voiceschanged', pickVoice);
// Some browsers never fire voiceschanged: poll briefly.
for (const ms of [250, 1000, 2500]) setTimeout(pickVoice, ms);

export const hasFinnish = () => !!voice;

/** Quiet mode: the child asked for it ("I can't listen right now"), or this
 *  browser has no Finnish voice. Listening tasks get their written variant. */
export const quiet = () => store.quiet() || !voice;

/** `after`: queue behind what is being said (feedback after the tapped answer). */
export function say(text: string, force = false, after = false) {
  const s = synth();
  if (!s || !text.trim() || (!force && quiet())) return;
  if (!after) s.cancel();
  const u = new SpeechSynthesisUtterance(spoken(text));
  u.lang = 'fi-FI';
  if (voice) u.voice = voice;
  u.rate = 0.92;
  s.speak(u);
}

const PART = ['', '', 'kahdes', 'kolmas', 'neljäs', 'viides', 'kuudes', 'seitsemäs', 'kahdeksas', 'yhdeksäs', 'kymmenes', 'yhdestoista', 'kahdestoista'];
/** Maths symbols as Finnish words: "3/4" → "3 neljäsosaa", "□" → "laatikko". */
export function spoken(text: string) {
  return text
    .replace(/(\d+)\/(\d+)/g, (m, a: string, b: string) => (PART[+b] ? `${a} ${PART[+b]}osa${a === '1' ? '' : 'a'}` : `${a} per ${b}`))
    .replace(/□/g, ' laatikko ')
    .replace(/×|·/g, ' kertaa ').replace(/÷/g, ' jaettuna ').replace(/\//g, ' per ')
    .replace(/[−-](?=\d)/g, (m, i: number, s: string) => (/\d\s*$/.test(s.slice(0, i)) ? ' miinus ' : 'miinus '))
    .replace(/ − /g, ' miinus ')
    .replace(/\+/g, ' plus ')
    .replace(/=/g, ' on yhtä suuri kuin ');
}

export const hush = () => synth()?.cancel();

/** What a tapped answer says out loud: its spoken form, words or numeral (fractions as a/b). */
export function labelOf(o: { speak?: string; text?: string; big?: string; quiet?: string }) {
  const raw = o.speak ?? o.text ?? o.big ?? '';
  return raw.replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '$1/$2').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
