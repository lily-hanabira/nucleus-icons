// Bloom apps and pages: cherry blossom tiles for encore, chorus and paint, plus their document pages and the bundle page
import { ink, g4, g5, white, b3, b4, gr2, gr3, a3, p3, n3, k1, k2, k3, r, circle, S, F, S1, write, rasterise, page } from './lib.mjs'

// Pixel mask helpers, as in the emoji generators
const blank = size => new Uint8Array(size * size)
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
const or = (...ms) => ms[0].map((_, i) => ms.some(m => m[i]) ? 1 : 0)
const sub = (a, b) => a.map((v, i) => v && !b[i] ? 1 : 0)
const erode = (m, size) => {
  const out = blank(size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
const dilate = (m, size) => {
  const out = blank(size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (at(x, y) || at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) out[y * size + x] = 1
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
// Disc mask centred on cx, cy with radius rad, tested at pixel centres
const disc = (size, cx, cy, rad) => {
  const m = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= rad) m[y * size + x] = 1
  }
  return m
}
// Segment mask: pixels whose centre lies within hw of the line from (x0, y0) to (x1, y1)
const seg = (size, x0, y0, x1, y1, hw) => {
  const m = blank(size), dx = x1 - x0, dy = y1 - y0, len = dx * dx + dy * dy || 1
  for (const y of range(0, size)) for (const x of range(0, size)) {
    const px = x + 0.5, py = y + 0.5
    const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / len))
    if (Math.hypot(px - x0 - t * dx, py - y0 - t * dy) <= hw) m[y * size + x] = 1
  }
  return m
}
// Outlined bevelled surface from a silhouette mask
const body = (size, m, fill) => [F(ink, path(m, size)), S(fill, path(erode(m, size), size))]

// Blossom: five round lobes around cx, cy, each notched at the tip, k2 with the derived k3 and k1 bevel
const angles = range(0, 5).map(i => -Math.PI / 2 + i * 2 * Math.PI / 5)
const blossom = (size, cx, cy, dist, pr, notch) => {
  let m = blank(size), cut = blank(size)
  for (const a of angles) {
    const ca = Math.cos(a), sa = Math.sin(a), tip = dist + pr
    m = or(m, disc(size, cx + dist * ca, cy + dist * sa, pr))
    cut = or(cut, seg(size, cx + tip * ca, cy + tip * sa, cx + (tip - notch) * ca, cy + (tip - notch) * sa, 0.5))
  }
  return body(size, sub(m, cut), k2)
}
// Blossom centre at 32: an outlined a3 disc with five ink stamen dots out on the petals
const centre32 = (cx, cy, dist) => [
  F(ink, ...angles.map(a => r(Math.floor(cx + dist * Math.cos(a)), Math.floor(cy + dist * Math.sin(a)), 1, 1))),
  F(ink, circle(6, cx - 3, cy - 3)),
  S(a3, circle(4, cx - 2, cy - 2)),
]
const flower32 = (cx, cy, dist = 5, pr = 3.8) => [...blossom(32, cx, cy, dist, pr, 1.5), ...centre32(cx, cy, dist)]
// Hand drawn 9x9 blossom for 16, top left at ox, oy
const pix = (ox, oy, rows, map) => Object.entries(map)
  .map(([ch, fill]) => F(fill, ...rows.flatMap((row, y) => [...row].flatMap((c, x) => c === ch ? [r(ox + x, oy + y, 1, 1)] : []))))
  .filter(l => l.d)
const flower16 = (ox, oy) => pix(ox, oy, [
  '...KKK...',
  '.KK333KK.',
  'K33K2K32K',
  'K3222221K',
  'K22aa221K',
  'KK2aa22KK',
  '.K22K21K.',
  '.K21K11K.',
  '..KK.KK..',
], { K: ink, 3: k3, 2: k2, 1: k1, a: a3 })

// Ordered 2x2 Bayer dither along the diagonal through the colour list
const dither = (x0, y0, w, h, colours) => {
  const bayer = [[0, 2], [3, 1]]
  const by = colours.map(() => [])
  for (const y of range(y0, y0 + h)) for (const x of range(x0, x0 + w)) {
    const v = (x - x0 + y - y0) / (w + h - 2) * (colours.length - 1)
    const i = Math.floor(v)
    const up = v - i > (bayer[y % 2][x % 2] + 0.5) / 4
    by[Math.min(i + (up ? 1 : 0), colours.length - 1)].push(r(x, y, 1, 1))
  }
  return colours.map((c, i) => F(c, ...by[i])).filter(l => l.d)
}
// Shared Bloom tile: ink square, k3 to k2 to p3 dither at 32 and a k3 k2 checker at 16
const tile = {
  16: [
    F(ink, r(1, 1, 14, 14)),
    F(k3, ...range(2, 14).flatMap(y => range(2, 14).filter(x => (x + y) % 2 === 0).map(x => r(x, y, 1, 1)))),
    F(k2, ...range(2, 14).flatMap(y => range(2, 14).filter(x => (x + y) % 2 === 1).map(x => r(x, y, 1, 1)))),
  ],
  32: [F(ink, r(2, 2, 28, 28)), ...dither(3, 3, 26, 26, [k3, k2, p3])],
}
// White stage disc of diameter d with its top left at ox, oy
const stage = (d, ox, oy) => [F(ink, circle(d, ox, oy)), S(white, circle(d - 2, ox + 1, oy + 1))]

// Right pointing play triangle mask: left edge x0, rows top..top+h, apex w to the right
const play = (size, x0, top, h, w) => {
  const m = blank(size), cy = top + h / 2
  for (const y of range(top, top + h)) {
    const run = Math.round(w * (1 - Math.abs(y + 0.5 - cy) / (h / 2)) + 0.5)
    for (const x of range(x0, x0 + run)) m[y * size + x] = 1
  }
  return m
}

// Tilted brush: handle, ferrule and tip laid along the line x + y = c, each part a span of x - y
const brush32 = (c, parts) => {
  const m = parts.map(() => blank(32))
  for (const y of range(0, 32)) for (const x of range(0, 32)) {
    const d = x - y, t = x + y - c
    parts.forEach(([lo, hi, hw], i) => {
      const taper = hw === 0 ? Math.max(0, (d - lo) / (hi - lo) * 1.5) : hw
      if (d >= lo && d <= hi && Math.abs(t) <= taper) m[i][y * 32 + x] = 1
    })
  }
  return m
}

// Page band near the bottom, archive style, with an optional ink mark
const band16 = fill => [F(ink, r(3, 8, 10, 5)), S(fill, r(4, 9, 8, 3))]
const band32 = (fill, mark) => [F(ink, r(5, 18, 22, 9)), S(fill, r(6, 19, 20, 7)), ...(mark ? [F(ink, mark)] : [])]
// Small blossom mark: five dots around a centre, top left at x, y in a 5x5 box
const mark = (x, y) => r(x + 2, y, 1, 1) + r(x + 4, y + 1, 1, 1) + r(x + 3, y + 4, 1, 1) + r(x + 1, y + 4, 1, 1) + r(x, y + 1, 1, 1) + r(x + 2, y + 2, 1, 1)
// Three tall list play triangle with its line
const item32 = (x, y, len) => r(x, y, 1, 3) + r(x + 1, y + 1, 1, 1) + r(x + 3, y + 1, len, 1)

const icons = {
  'apps/bloom-encore': {
    16: [
      ...tile[16],
      ...flower16(2, 2),
      F(ink, path(dilate(play(16, 9, 8, 6, 4), 16), 16)),
      S(white, path(play(16, 9, 8, 6, 4), 16)),
    ],
    32: [
      ...tile[32],
      ...stage(22, 3, 3),
      ...flower32(14, 14, 4.8, 3.6),
      F(ink, path(dilate(play(32, 21, 15, 13, 7), 32), 32)),
      S(white, path(play(32, 21, 15, 13, 7), 32)),
    ],
  },
  'apps/bloom-chorus': {
    16: [
      ...tile[16],
      ...flower16(2, 2),
      F(ink, r(2, 10, 12, 4)),
      F(white, r(3, 11, 10, 3)),
      F(b3, r(4, 11, 4, 1)),
      F(gr2, r(7, 12, 5, 1)),
      F(a3, r(5, 13, 3, 1)),
      F(ink, r(9, 10, 1, 4)),
    ],
    32: [
      ...tile[32],
      ...flower32(11, 10),
      F(ink, r(4, 16, 24, 13)),
      S1(white, r(5, 17, 22, 3), r(5, 21, 22, 3), r(5, 25, 22, 3)),
      S1(b3, r(6, 17, 7, 3)),
      S1(gr2, r(9, 21, 10, 3)),
      S1(a3, r(7, 25, 4, 3), r(14, 25, 8, 3)),
      F(ink, r(17, 16, 1, 13)),
    ],
  },
  'apps/bloom-paint': {
    16: [
      ...tile[16],
      ...flower16(2, 5),
      F(ink, path(dilate(union(16, r(13, 2, 1, 2), r(12, 3, 1, 2), r(11, 4, 1, 2), r(10, 5, 1, 2)), 16), 16)),
      F(n3, r(13, 2, 1, 2), r(12, 3, 1, 2), r(11, 4, 1, 1)),
      F(g4, r(10, 5, 2, 1)),
      F(k1, r(10, 6, 1, 1)),
      F(ink, r(11, 10, 3, 3)),
      F(k2, r(12, 11, 1, 1)),
    ],
    32: [
      ...tile[32],
      ...stage(18, 3, 3),
      ...flower32(12, 12, 4, 3),
      ...(() => {
        const [handle, ferrule, tip] = brush32(37, [[8, 24, 1.5], [3, 7, 1.9], [-5, 2, 0]])
        const all = or(handle, ferrule, tip)
        return [F(ink, path(dilate(all, 32), 32)), S(n3, path(handle, 32)), S(g4, path(ferrule, 32)), F(k1, path(tip, 32))]
      })(),
      ...body(32, disc(32, 24.5, 24.5, 3.6), k2),
    ],
  },
  'system/page-encore': {
    16: [
      ...page[16],
      F(ink, r(5, 2, 1, 1), r(7, 2, 4, 1), r(5, 4, 1, 1), r(7, 4, 4, 1), r(5, 6, 1, 1), r(7, 6, 3, 1)),
      ...band16(k2),
    ],
    32: [
      ...page[32],
      F(ink, item32(9, 4, 6), item32(9, 8, 8), item32(9, 12, 7)),
      ...band32(k2, mark(14, 20)),
    ],
  },
  'system/page-chorus': {
    16: [
      ...page[16],
      F(g5, r(4, 2, 8, 1), r(4, 4, 8, 1), r(4, 6, 8, 1)),
      F(b3, r(5, 2, 3, 1)),
      F(gr2, r(7, 4, 4, 1)),
      F(a3, r(5, 6, 2, 1)),
      ...band16(p3),
    ],
    32: [
      ...page[32],
      F(g5, r(8, 4, 10, 3), r(8, 8, 16, 3), r(8, 12, 16, 3)),
      S1(b3, r(9, 4, 5, 3)),
      S1(gr2, r(12, 8, 8, 3)),
      S1(a3, r(9, 12, 4, 3), r(16, 12, 7, 3)),
      ...band32(p3, mark(14, 20)),
    ],
  },
  'system/page-paint': {
    16: [
      ...page[16],
      F(b4, r(5, 2, 6, 5)),
      F(gr3, r(5, 6, 6, 1), r(6, 5, 3, 1)),
      F(a3, r(9, 3, 1, 1)),
      ...band16(k3),
    ],
    32: [
      ...page[32],
      F(ink, r(7, 4, 12, 13)),
      F(b4, r(8, 5, 10, 11)),
      F(ink, circle(5, 13, 6)),
      F(a3, circle(3, 14, 7)),
      F(ink, r(8, 11, 10, 1), r(9, 10, 2, 1), r(11, 9, 3, 1), r(14, 10, 2, 1)),
      S1(gr3, r(8, 12, 10, 4), r(10, 11, 3, 1), r(12, 10, 2, 1)),
      ...band32(k3, mark(14, 20)),
    ],
  },
  'system/page-bundle': {
    16: [
      ...page[16],
      F(ink, r(5, 2, 4, 5)),
      F(white, r(6, 3, 2, 3)),
      F(ink, r(7, 4, 4, 5)),
      F(white, r(8, 5, 2, 3)),
      ...band16(g4),
    ],
    32: [
      ...page[32],
      F(ink, r(8, 4, 8, 10)),
      S(white, r(9, 5, 6, 8)),
      F(ink, r(11, 7, 8, 10)),
      S(white, r(12, 8, 6, 8)),
      ...band32(g4),
    ],
  },
}

write(process.argv[2], icons)
