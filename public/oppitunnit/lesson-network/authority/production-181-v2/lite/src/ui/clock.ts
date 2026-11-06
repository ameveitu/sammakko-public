// An analogue clock face. Minutes may be fractional, so the hour hand creeps on between numbers
// exactly as on a real clock (used by the clock lessons, their animation and the set-the-clock game).
export function clockBody(h: number, m: number, size = 140) {
  const c = size / 2, R = size / 2 - 6;
  let s = `<circle cx="${c}" cy="${c}" r="${R}" fill="var(--card)" stroke="currentColor" stroke-width="4"/>`;
  for (let i = 1; i <= 12; i++) {
    const a = (i / 12) * 2 * Math.PI - Math.PI / 2;
    s += `<text x="${c + Math.cos(a) * (R - 16)}" y="${c + Math.sin(a) * (R - 16) + 6}" text-anchor="middle" font-size="${size / 9}" font-weight="700" fill="currentColor">${i}</text>`;
  }
  const ha = (((h % 12) + m / 60) / 12) * 2 * Math.PI - Math.PI / 2, ma = (m / 60) * 2 * Math.PI - Math.PI / 2;
  s += `<line x1="${c}" y1="${c}" x2="${c + Math.cos(ma) * (R - 12)}" y2="${c + Math.sin(ma) * (R - 12)}" stroke="var(--pond)" stroke-width="4" stroke-linecap="round"/>`;
  s += `<line x1="${c}" y1="${c}" x2="${c + Math.cos(ha) * (R * 0.5)}" y2="${c + Math.sin(ha) * (R * 0.5)}" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>`;
  return s + `<circle cx="${c}" cy="${c}" r="5" fill="currentColor"/>`;
}
