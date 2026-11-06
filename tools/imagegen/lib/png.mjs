// Minimal PNG reader/writer for post-processing (8-bit, non-interlaced).
// Enough for OpenAI output and pngquant palettes; no dependencies.
import { inflateSync, deflateSync } from 'node:zlib';

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Decode a PNG buffer to { width, height, data: RGBA Uint8Array }. */
export function decodePng(buf) {
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error('Ei PNG-tiedosto');
  let pos = 8, width, height, bitDepth, colorType, interlace;
  const idat = [];
  let palette = null, trns = null;
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('latin1', pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    pos += 12 + len;
    if (type === 'IHDR') {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4);
      bitDepth = body[8]; colorType = body[9]; interlace = body[12];
    } else if (type === 'PLTE') palette = body;
    else if (type === 'tRNS') trns = body;
    else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
  }
  if (bitDepth !== 8) throw new Error(`Tuetaan vain 8-bittisiä PNG:itä (bitDepth ${bitDepth})`);
  if (interlace) throw new Error('Lomitettuja PNG:itä ei tueta');
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`Tuntematon PNG-värityyppi ${colorType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const px = Buffer.alloc(stride * height);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = px.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? out[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v = line[i];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[i] = v & 0xff;
    }
    prev = out;
  }
  const data = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i++, j += channels) {
    let r, g, b, al = 255;
    if (colorType === 0) { r = g = b = px[j]; }
    else if (colorType === 4) { r = g = b = px[j]; al = px[j + 1]; }
    else if (colorType === 2) { r = px[j]; g = px[j + 1]; b = px[j + 2]; }
    else if (colorType === 6) { r = px[j]; g = px[j + 1]; b = px[j + 2]; al = px[j + 3]; }
    else { const k = px[j]; r = palette[k * 3]; g = palette[k * 3 + 1]; b = palette[k * 3 + 2]; al = trns && k < trns.length ? trns[k] : 255; }
    data.set([r, g, b, al], i * 4);
  }
  return { width, height, data };
}

function chunk(type, body) {
  const len = Buffer.alloc(4); len.writeUInt32BE(body.length);
  const tb = Buffer.concat([Buffer.from(type, 'latin1'), body]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(tb));
  return Buffer.concat([len, tb, crc]);
}

/** Encode RGBA pixels to a PNG buffer. */
export function encodePng({ width, height, data }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(data.buffer, data.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1);
  }
  return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/** Bounding box of pixels with alpha > threshold, or null if fully transparent. */
export function alphaBounds({ width, height, data }, threshold = 8) {
  let x0 = width, y0 = height, x1 = -1, y1 = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * 4 + 3] > threshold) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Facts useful for sprite QA: transparency share and whether the subject touches an edge. */
export function alphaReport(img) {
  const { width, height, data } = img;
  let transparent = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] <= 8) transparent++;
  const b = alphaBounds(img);
  return {
    width, height,
    transparentShare: +(transparent / (width * height)).toFixed(3),
    bounds: b,
    touchesEdge: !!b && (b.x === 0 || b.y === 0 || b.x + b.w === width || b.y + b.h === height),
  };
}

/** Crop to visible pixels, add padding, optionally center on a square canvas. */
export function trim(img, { pad = 0, square = false, threshold = 8 } = {}) {
  const b = alphaBounds(img, threshold);
  if (!b) throw new Error('Kuva on kokonaan läpinäkyvä');
  let w = b.w + pad * 2, h = b.h + pad * 2;
  if (square) w = h = Math.max(w, h);
  const out = new Uint8Array(w * h * 4);
  const ox = Math.floor((w - b.w) / 2), oy = Math.floor((h - b.h) / 2);
  for (let y = 0; y < b.h; y++) {
    const src = ((b.y + y) * img.width + b.x) * 4;
    out.set(img.data.subarray(src, src + b.w * 4), ((oy + y) * w + ox) * 4);
  }
  return { width: w, height: h, data: out };
}

/** 2x2 tiling to inspect seams; the seams meet in the centre cross. */
export function tile2x2(img) {
  const { width: w, height: h } = img;
  const out = new Uint8Array(w * 2 * h * 2 * 4);
  for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++)
    for (let y = 0; y < h; y++)
      out.set(img.data.subarray(y * w * 4, (y + 1) * w * 4), (((ty * h + y) * w * 2) + tx * w) * 4);
  return { width: w * 2, height: h * 2, data: out };
}

/**
 * Seam ratio: colour jump across the wrap-around edges divided by the typical
 * jump between neighbouring pixels inside the image. About 1 = seamless,
 * above ~2 = a seam is likely visible when tiled.
 */
export function seamScore({ width: w, height: h, data }) {
  const d = (i, j) => Math.abs(data[i] - data[j]) + Math.abs(data[i + 1] - data[j + 1]) + Math.abs(data[i + 2] - data[j + 2]);
  const px = (x, y) => (y * w + x) * 4;
  let edge = 0, inner = 0;
  for (let y = 0; y < h; y++) { edge += d(px(0, y), px(w - 1, y)); inner += d(px(w >> 1, y), px((w >> 1) - 1, y)); }
  for (let x = 0; x < w; x++) { edge += d(px(x, 0), px(x, h - 1)); inner += d(px(x, h >> 1), px(x, (h >> 1) - 1)); }
  return +(edge / Math.max(inner, 1)).toFixed(2);
}
