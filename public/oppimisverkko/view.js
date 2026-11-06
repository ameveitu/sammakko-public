// Pure camera geometry. An overview must fit the world, even below a readable node zoom.
export function fitView(box, width, height, padding = 55) {
  if (![box.x, box.y, box.w, box.h, width, height, padding].every(Number.isFinite) ||
      box.w <= 0 || box.h <= 0 || width <= 0 || height <= 0 || padding < 0) {
    throw new TypeError('Invalid network viewport bounds');
  }
  const scale = Math.min(5, Math.max(1, width - 2 * padding) / box.w, Math.max(1, height - 2 * padding) / box.h);
  return {scale, tx: (width - box.w * scale) / 2 - box.x * scale, ty: (height - box.h * scale) / 2 - box.y * scale};
}

export function zoomView(view, factor, cx, cy, minimum) {
  if (![view.scale, view.tx, view.ty, factor, cx, cy, minimum].every(Number.isFinite) ||
      view.scale <= 0 || factor <= 0 || minimum <= 0 || minimum > 5) {
    throw new TypeError('Invalid network zoom');
  }
  const scale = Math.max(minimum, Math.min(5, view.scale * factor));
  return {scale, tx: cx - (cx - view.tx) * scale / view.scale, ty: cy - (cy - view.ty) * scale / view.scale};
}
