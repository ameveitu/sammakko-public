import { store } from '../engine/store';
import { calmByAdult } from './sprite';
import { hasSpeechAssets, loadManifest, onAudioChange, play, playSfx, speechAssets, speechPieces, stopSfx, stopSpeech, type Playback, type Speaker } from '../audio/player';
import { spoken } from '../audio/spoken';
import { setAmbientGate, syncAmbient } from '../audio/ambient';

export type { Playback, Speaker, SpeechEnd } from '../audio/player';

// Finnish speech. Instructions, feedback and the answer the child taps are read aloud unless
// quiet mode is on; the speaker buttons always read. A pre-produced, approved file for exactly
// this text and speaker plays first; the browser's Finnish voice is the fallback; with neither,
// the text on screen is the whole message.
let voice: SpeechSynthesisVoice | undefined;
const synth = () => (typeof speechSynthesis === 'undefined' ? undefined : speechSynthesis);

// Novelty voices (macOS "Grandpa", "Bubbles"...) sound silly for instructions.
const NOVELTY = /grandma|grandpa|rocko|shelley|bubbles|bells|boing|jester|organ|whisper|zarvox|trinoids|bahh|cellos|wobble|albert|bad news|good news|superstar/i;
const listeners = new Set<() => void>();
/** Voices and the audio index arrive asynchronously; screens drawn before that redraw via this. */
export const onVoices = (f: () => void) => { listeners.add(f); return () => listeners.delete(f); };
onAudioChange(() => listeners.forEach((f) => f()));

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
void loadManifest();

/** The browser has a usable Finnish voice (any text can be read). */
export const hasFinnish = () => !!voice;
/** Some speech can be heard here: a Finnish voice, or at least pre-produced lines. */
export const speechPossible = () => !!voice || hasSpeechAssets();
/** This exact line can be heard, as this speaker (or by the browser voice). */
export const canSpeak = (text: string, speaker: Speaker = 'narrator') => !!text.trim() && (!!voice || !!speechAssets(speaker, text) || !!speechPieces(speaker, text));
/** The child chose quiet ("I can't listen right now"). */
export const speechOff = () => store.quiet();

/** Quiet mode: the child asked for it, or this browser has no Finnish voice. Listening tasks
 *  check their own lines with canSpeak(); this stays the screen-wide default. */
export const quiet = () => store.quiet() || !voice;

const NONE: Playback = { started: Promise.resolve(false), finished: Promise.resolve('unavailable'), stop() {} };

/** `force`: a deliberate "Kuuntele" tap; it reads even in quiet mode (it never unmutes anything else).
 *  `after`: queue behind what is being said on this screen (feedback after the tapped answer). */
export function say(text: string, force = false, after = false, speaker: Speaker = 'narrator'): Playback {
  if (!text.trim() || (!force && store.quiet())) return NONE;
  return play({ speaker, text, spoken: spoken(text), after, voice, rate: 0.92 });
}

/** A character's line (Aava, Loikka, Sulka): their own approved recording when there is one. */
export const sayAs = (speaker: Speaker, text: string, force = false) => say(text, force, false, speaker);

/** One short effect for one event; silent in quiet mode or when effects are off. */
/** Character sounds (Aava's quacks and wings, Loikka's croaks and pushes) are decorative: the adult's
 *  "calm characters" setting stills them along with the motion. Feedback tones stay. */
export const isCharacterSfx = (family: string) => family.startsWith('aava.') || family.startsWith('loikka.');
export function sfx(family: string, gain?: number) {
  if (store.quiet() || (isCharacterSfx(family) && calmByAdult())) return;
  playSfx(family, gain);
}

export { spoken };

/** Stops speech, its queue and any effect still loading for the old view (and checks the soundscape,
 *  so quiet mode silences it at once). */
export const hush = () => { stopSpeech(); stopSfx(); syncAmbient(); };

// The soundscape (opt-in, audio/ambient.ts) falls silent in quiet mode like speech and effects. Calm
// characters does not silence it: it is no character sound and has its own switch.
setAmbientGate(() => !store.quiet());

/** What a tapped answer says out loud: its spoken form, words or numeral (fractions as a/b). */
export function labelOf(o: { speak?: string; text?: string; big?: string; quiet?: string }) {
  const raw = o.speak ?? o.text ?? o.big ?? '';
  return raw.replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '$1/$2').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
