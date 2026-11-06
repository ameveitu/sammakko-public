// Independent listening check (developer machine only). The Realtime transcript is the model's own
// text, not what the audio says; this sends the finished file to a separate speech recognizer so a
// misread word (for example "Lokka" for "Loikka") shows up without a person listening.
import fs from 'node:fs';
import path from 'node:path';

export const EAR_MODEL = 'gpt-4o-transcribe';
/** USD per audio minute (checked 2026-11-06); a conservative minimum per request. */
export const EAR_USD_PER_MIN = 0.006;
export const earEstimate = (ms) => Math.max(0.001, (ms / 60000) * EAR_USD_PER_MIN * 1.5);

/** Transcribes one wav/mp3 file in Finnish. Resolves the recognized text. */
export async function hear({ key, file, prompt, fetchImpl = globalThis.fetch }) {
  const form = new FormData();
  const type = file.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
  form.append('file', new Blob([fs.readFileSync(file)], { type }), path.basename(file));
  form.append('model', EAR_MODEL);
  form.append('language', 'fi');
  form.append('response_format', 'json');
  if (prompt) form.append('prompt', prompt);
  const res = await fetchImpl('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: form });
  if (!res.ok) throw Object.assign(new Error(`kuuntelu epäonnistui: ${res.status} ${(await res.text()).slice(0, 200)}`), { sent: true });
  return (await res.json()).text ?? '';
}
