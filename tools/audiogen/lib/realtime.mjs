// OpenAI Realtime adapter for reading one approved line (developer machine only).
// tts-1, tts-1-hd and gpt-4o-mini-tts (/v1/audio/speech) retire 6.1.2027; this uses the
// recommended successor gpt-realtime-2.1-mini over the Realtime WebSocket instead.
// Each line gets its own short session and an out-of-band response (conversation "none")
// with explicit input, so earlier lines never become context for later ones.

export const PROVIDER = 'openai-realtime';
const URL_BASE = process.env.AUDIOGEN_REALTIME_URL || 'wss://api.openai.com/v1/realtime';

/** Price table (USD per 1M tokens). Check the pricing page before large runs. */
export const PRICES = {
  'gpt-realtime-2.1-mini': { audioOut: 20, textIn: 0.6, textOut: 2.4, checked: '2026-11-02', audioOutOnly: true },
  // Full model: priced like gpt-realtime (conservative until the pricing page is rechecked).
  'gpt-realtime-2.1': { audioOut: 64, textIn: 4, textOut: 16, checked: '2026-11-02', audioOutOnly: true },
};
/** Documented rough rate: one output audio token per 50 ms. */
export const AUDIO_TOKENS_PER_SEC = 20;
/** Calm Finnish reading pace used for estimates (characters per second). */
const CHARS_PER_SEC = 12;

export function estimateUsd(text, model, instructions = '') {
  const p = PRICES[model];
  if (!p) throw new Error(`Tuntematon malli hinnastossa: ${model}`);
  const sec = text.length / CHARS_PER_SEC + 0.8;
  const audioTok = sec * AUDIO_TOKENS_PER_SEC;
  const textIn = (instructions.length + text.length) / 3 + 40;
  const textOut = text.length / 3;
  // Safety factor 1.5: retakes inside a response, longer pauses, tokenizer differences.
  return (1.5 * (audioTok * p.audioOut + textIn * p.textIn + textOut * p.textOut)) / 1e6;
}

/** Cost from the response.done usage block; falls back to null if usage is missing. */
export function usageUsd(usage, model) {
  const p = PRICES[model];
  if (!usage || !p) return null;
  const out = usage.output_token_details ?? {}, inp = usage.input_token_details ?? {};
  const audioOut = out.audio_tokens ?? 0, textOut = out.text_tokens ?? Math.max(0, (usage.output_tokens ?? 0) - audioOut);
  const textIn = inp.text_tokens ?? usage.input_tokens ?? 0;
  return (audioOut * p.audioOut + textOut * p.textOut + textIn * p.textIn) / 1e6;
}

/**
 * Reads `text` with `voice`. Resolves { pcm: Buffer (s16le mono 24 kHz), rate, transcript, usage, responseId }.
 * `WebSocketImpl` is injectable for tests; the real one is Node's global WebSocket.
 */
export function renderLine({ key, model, voice, instructions, text, WebSocketImpl = globalThis.WebSocket, timeoutMs = 90000 }) {
  return new Promise((resolve, reject) => {
    if (!WebSocketImpl) return reject(new Error('WebSocket ei ole saatavilla (Node ≥ 22 tarvitaan).'));
    const ws = new WebSocketImpl(`${URL_BASE}?model=${encodeURIComponent(model)}`, { headers: { Authorization: `Bearer ${key}` } });
    const chunks = [];
    let transcript = '', sent = false, done = false;
    const fail = (err) => { if (done) return; done = true; clearTimeout(timer); try { ws.close(); } catch { /* closed */ } err.sent = sent; reject(err); };
    const timer = setTimeout(() => fail(new Error('aikakatkaisu: vastaus ei valmistunut')), timeoutMs);
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'session.update', session: { type: 'realtime', output_modalities: ['audio'], instructions, audio: { output: { voice, format: { type: 'audio/pcm', rate: 24000 } } } } }));
      ws.send(JSON.stringify({
        type: 'response.create',
        response: { conversation: 'none', output_modalities: ['audio'], metadata: { tool: 'sammakko-audiogen' }, input: [{ type: 'message', role: 'user', content: [{ type: 'input_text', text }] }] },
      }));
      sent = true;
    };
    ws.onerror = (e) => fail(new Error(`yhteysvirhe: ${e?.message ?? 'tuntematon'}`));
    ws.onclose = () => fail(new Error('yhteys sulkeutui ennen valmistumista'));
    ws.onmessage = (m) => {
      let ev; try { ev = JSON.parse(typeof m.data === 'string' ? m.data : Buffer.from(m.data).toString('utf8')); } catch { return; }
      if (ev.type === 'error') return fail(new Error(`API-virhe: ${ev.error?.code ?? ''} ${ev.error?.message ?? ''}`.trim()));
      if (ev.type === 'response.output_audio.delta') chunks.push(Buffer.from(ev.delta, 'base64'));
      if (ev.type === 'response.output_audio_transcript.delta') transcript += ev.delta;
      if (ev.type === 'response.done') {
        const r = ev.response ?? {};
        if (r.status !== 'completed') return fail(Object.assign(new Error(`vastaus ei valmistunut: ${r.status} ${JSON.stringify(r.status_details ?? {})}`), { usage: r.usage }));
        done = true; clearTimeout(timer);
        try { ws.close(); } catch { /* closed */ }
        resolve({ pcm: Buffer.concat(chunks), rate: 24000, transcript, usage: r.usage ?? null, responseId: r.id ?? null });
      }
    };
  });
}
