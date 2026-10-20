// Developer apps: debugger, web navigator and compiler windows, plus the Bastion Nucleus brand tile
import { ink, g1, g3, g4, g5, g6, white, b2, b3, b4, gr3, a2, a3, r2, r, circle, S, F, S1, write, rasterise } from './lib.mjs'

// Pixel masks: the ink is the whole mask, the fill is the mask eroded by one pixel
const blank = size => new Uint8Array(size * size)
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)
const erode = (m, size) => {
  const out = blank(size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
const path = (m, size) => {
  let d = ''
  for (const y of range(0, size)) {
    let x = 0
    while (x < size) {
      let w = 0
      while (x + w < size && m[y * size + x + w]) w++
      if (w) d += r(x, y, w, 1)
      x += w || 1
    }
  }
  return d
}

// Window frame as apps/image-viewer, body colour varies
const frame = (body, big) => big
  ? [F(ink, r(1, 3, 30, 26)), S1(b3, r(2, 4, 28, 4)), F(g6, r(23, 5, 2, 2), r(26, 5, 2, 2)), S(body, r(2, 8, 28, 20))]
  : [F(ink, r(1, 1, 14, 14)), S(b2, r(2, 2, 12, 2)), S(body, r(2, 4, 12, 10))]

// Gear with four teeth, 7px at 16 and 13px at 32, anchored at its top left corner
const gear = {
  16: (ox, oy, fill) => [
    F(ink, circle(5, ox + 1, oy + 1), r(ox + 3, oy, 1, 1), r(ox + 3, oy + 6, 1, 1), r(ox, oy + 3, 1, 1), r(ox + 6, oy + 3, 1, 1)),
    F(fill, r(ox + 2, oy + 2, 3, 3)),
    F(ink, r(ox + 3, oy + 3, 1, 1)),
  ],
  32: (ox, oy, fill) => [
    F(ink, circle(11, ox + 1, oy + 1), r(ox + 5, oy, 3, 2), r(ox + 5, oy + 11, 3, 2), r(ox, oy + 5, 2, 3), r(ox + 11, oy + 5, 2, 3)),
    S1(fill, circle(9, ox + 2, oy + 2), r(ox + 6, oy + 1, 1, 1), r(ox + 6, oy + 11, 1, 1), r(ox + 1, oy + 6, 1, 1), r(ox + 11, oy + 6, 1, 1)),
    F(ink, r(ox + 5, oy + 5, 3, 3)),
    F(g1, r(ox + 6, oy + 6, 1, 1)),
  ],
}

// Ordered dither: a diagonal gradient across the rect through the colour list, each step crossing through a 2x2 checker
const dither = (x0, y0, w, h, colours) => {
  const by = colours.map(() => [])
  for (const y of range(y0, y0 + h)) for (const x of range(x0, x0 + w)) {
    const v = (x - x0 + y - y0) / (w + h - 2) * (colours.length - 1)
    const i = Math.floor(v)
    const up = v - i > ((x + y) % 2 ? 0.75 : 0.25)
    by[Math.min(i + (up ? 1 : 0), colours.length - 1)].push(r(x, y, 1, 1))
  }
  return colours.map((c, i) => F(c, ...by[i])).filter(l => l.d)
}

// Swish: a quadratic curve through the control points, fill thin at the ends and thick in the middle, ink outlined.
// Every pixel within half the local width of the curve is set, so the stroke keeps its width on the diagonal
const swish = (size, [x0, y0], [cx, cy], [x1, y1], thin, thick) => {
  const pts = range(0, 201).map(i => {
    const s = i / 200, u = 1 - s
    return [u * u * x0 + 2 * u * s * cx + s * s * x1, u * u * y0 + 2 * u * s * cy + s * s * y1, s]
  })
  const m = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    let best = Infinity, bs = 0
    for (const [px, py, s] of pts) {
      const d = Math.hypot(x + 0.5 - px, y + 0.5 - py)
      if (d < best) [best, bs] = [d, s]
    }
    const width = thin + 2 + (thick - thin) * Math.sin(Math.PI * bs)
    if (best < width / 2) m[y * size + x] = 1
  }
  return [F(ink, path(m, size)), F(white, path(erode(m, size), size))]
}

const icons = {
  'apps/debugger': {
    16: [
      ...frame(white, false),
      F(g3, r(3, 5, 4, 1), r(3, 11, 3, 1)),
      F(gr3, r(3, 8, 10, 2)),
      F(r2, r(3, 8, 1, 2)),
      F(ink, r(9, 5, 3, 1), circle(7, 7, 6), r(6, 8, 1, 1), r(13, 8, 1, 1), r(6, 11, 1, 1), r(13, 11, 1, 1)),
      S(r2, circle(5, 8, 7)),
      F(ink, r(10, 7, 1, 5), r(8, 9, 1, 1), r(12, 9, 1, 1)),
    ],
    32: [
      ...frame(white, true),
      F(g5, r(3, 9, 4, 18)),
      F(g3, r(9, 10, 8, 2), r(11, 20, 5, 2), r(9, 24, 10, 2)),
      F(gr3, r(3, 14, 26, 4)),
      F(ink, circle(4, 3, 15)),
      F(r2, r(4, 16, 2, 2)),
      F(ink, r(18, 9, 1, 1), r(23, 9, 1, 1), r(19, 10, 4, 3), circle(10, 16, 12)),
      F(ink, r(14, 14, 2, 1), r(13, 17, 3, 1), r(14, 20, 2, 1), r(26, 14, 2, 1), r(26, 17, 3, 1), r(26, 20, 2, 1)),
      S(r2, circle(8, 17, 13)),
      F(ink, r(20, 13, 2, 8), r(18, 15, 1, 1), r(23, 15, 1, 1), r(18, 18, 1, 1), r(23, 18, 1, 1)),
    ],
  },
  'apps/web-navigator': {
    16: [
      ...frame(white, false),
      F(ink, circle(8, 4, 5)),
      S(b4, circle(6, 5, 6)),
      F(b2, r(5, 9, 6, 1)),
      F(gr3, r(6, 6, 2, 2), r(9, 7, 1, 1), r(8, 10, 2, 1)),
    ],
    32: [
      ...frame(white, true),
      F(g5, r(2, 8, 28, 3)),
      F(ink, r(2, 11, 28, 1)),
      F(ink, circle(14, 9, 13)),
      S(b4, circle(12, 10, 14)),
      F(b2, r(10, 20, 12, 1)),
      F(gr3, r(12, 16, 4, 3), r(14, 19, 2, 1), r(18, 21, 4, 3), r(19, 15, 3, 2), r(21, 17, 1, 1)),
    ],
  },
  'apps/compiler': {
    16: [
      ...frame(g1, false),
      F(b3, r(3, 7, 3, 1)),
      F(a3, r(3, 9, 4, 1)),
      F(gr3, r(3, 11, 3, 1)),
      ...gear[16](7, 6, a3),
    ],
    32: [
      ...frame(g1, true),
      F(b3, r(4, 12, 8, 2)),
      F(a3, r(4, 16, 11, 2)),
      F(gr3, r(4, 20, 6, 2)),
      ...gear[32](16, 11, a3),
    ],
  },
  'apps/nucleus': {
    16: [
      F(ink, r(1, 1, 14, 14)),
      F(g3, ...range(2, 14).flatMap(y => range(2, 14).filter(x => (x + y) % 2 === 0).map(x => r(x, y, 1, 1)))),
      F(a3, ...range(2, 14).flatMap(y => range(2, 14).filter(x => (x + y) % 2 === 1).map(x => r(x, y, 1, 1)))),
      ...swish(16, [2.5, 12.5], [8, 11], [11.5, 5.5], 1, 2),
      F(ink, circle(4, 10, 2)),
      F(a3, r(11, 3, 2, 2)),
    ],
    32: [
      F(ink, r(2, 2, 28, 28)),
      ...dither(3, 3, 26, 26, [g3, g4, a2, a3]),
      ...swish(32, [4, 26], [18, 24], [24, 10], 1, 4),
      F(ink, circle(7, 22, 4)),
      F(a3, circle(5, 23, 5)),
    ],
  },
}

write(process.argv[2], icons)
