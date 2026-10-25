// Control panel settings applets: language, win32, graphics api, sound, regional, themes, fonts, displays, associations, performance, profiler and memory
import { ink, g1, g2, g3, g4, g5, g6, white, b2, b3, b4, b5, gr2, gr3, a3, r2, p3, n2, n3, r, circle, diag, S, F, S1, H, write, page, rasterise } from './lib.mjs'

// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)
// One pixel tall run from x0 to x1 inclusive
const seg = (y, x0, x1) => r(x0, y, x1 - x0 + 1, 1)
// Rows y0 to y1 all spanning x0 to x1 as one path
const band = (y0, y1, x0, x1) => range(y0, y1 + 1).map(y => seg(y, x0, x1)).join('')
// Bitmap rows of '#' and '.' to pixel rectangles anchored at ox, oy
const bits = (rows, ox, oy) => rows.flatMap((row, y) => [...row].map((c, x) => c === '#' ? r(ox + x, oy + y, 1, 1) : '')).join('')

// Mask helpers for shapes that overlap, since paths fill even odd
const union = (size, ...paths) => {
  const m = new Uint8Array(size * size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
const cut = (m, size, ...paths) => {
  const out = new Uint8Array(m)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) out[i] = 0 })
  return out
}
// Keep only the pixels where pred(x, y) holds
const clip = (m, size, pred) => m.map((v, i) => v && pred(i % size, Math.floor(i / size)) ? 1 : 0)
// Mask to a path of row runs
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
// Top part of a disc, rows above yMax inclusive
const dome = (size, d, ox, oy, yMax) => path(clip(union(size, circle(d, ox, oy)), size, (x, y) => y <= yMax), size)
// Ring between two discs limited to rows up to yMax and columns x0..x1
const arc = (size, outer, inner, yMax, x0, x1) => path(clip(cut(union(size, outer), size, inner), size, (x, y) => y <= yMax && x >= x0 && x <= x1), size)

// Miniature gear badge shared with control.mjs, 7px at 16 and 11px at 32
const badge = {
  16: (ox, oy) => [
    F(ink, circle(5, ox + 1, oy + 1), r(ox + 3, oy, 1, 1), r(ox + 3, oy + 6, 1, 1), r(ox, oy + 3, 1, 1), r(ox + 6, oy + 3, 1, 1)),
    F(g4, r(ox + 2, oy + 2, 3, 3)),
    F(ink, r(ox + 3, oy + 3, 1, 1)),
  ],
  32: (ox, oy) => [
    F(ink, circle(9, ox + 1, oy + 1), r(ox + 4, oy, 3, 2), r(ox + 4, oy + 9, 3, 2), r(ox, oy + 4, 2, 3), r(ox + 9, oy + 4, 2, 3)),
    S1(g3, circle(7, ox + 2, oy + 2), r(ox + 5, oy + 1, 1, 1), r(ox + 5, oy + 9, 1, 1), r(ox + 1, oy + 5, 1, 1), r(ox + 9, oy + 5, 1, 1)),
    F(ink, r(ox + 4, oy + 4, 3, 3)),
    F(g5, r(ox + 5, oy + 5, 1, 1)),
  ],
}

// Gray monitor with a blue screen, anchored at its top left, w by h outer size
const monitor = (x, y, w, h, screen) => [
  F(ink, r(x, y, w, h)),
  S(g4, r(x + 1, y + 1, w - 2, h - 2)),
  F(ink, r(x + 2, y + 2, w - 4, h - 4)),
  S(screen, r(x + 3, y + 3, w - 6, h - 6)),
]

// Chunky PE style digits, 6 by 10
const three = ['######', '######', '....##', '....##', '..####', '..####', '....##', '....##', '######', '######']
const two = ['######', '######', '....##', '....##', '######', '######', '##....', '##....', '######', '######']

const icons = {
  'control/language': {
    16: [
      F(ink, circle(10, 3, 1), r(7, 11, 2, 1), r(4, 12, 8, 3)),
      F(g3, r(5, 13, 6, 1)),
      S(b4, circle(8, 4, 2)),
      F(b2, r(4, 6, 8, 1)),
      F(gr3, r(5, 3, 2, 1), r(5, 4, 3, 2), r(9, 7, 2, 2), r(7, 8, 2, 1), r(9, 3, 1, 2)),
      // speech bubble with a bold A
      F(ink, band(6, 13, 8, 14), r(9, 14, 1, 1)),
      S(white, r(9, 7, 5, 6), r(9, 13, 1, 1)),
      F(ink, bits(['.#.', '#.#', '###', '#.#'], 10, 8)),
    ],
    32: [
      F(ink, circle(22, 5, 2), r(14, 24, 4, 2), 'M9 26h14v1h1v2h-1v1h-14v-1h-1v-2h1z'),
      F(g3, r(15, 24, 2, 2)),
      S(g4, r(9, 27, 14, 2)),
      S(b4, circle(20, 6, 3)),
      F(b2, r(6, 13, 20, 1)),
      F(gr3, r(9, 6, 6, 4), r(11, 10, 3, 3), r(17, 14, 5, 5), r(18, 19, 3, 2), r(16, 5, 4, 2), r(8, 16, 3, 3)),
      F(ink, band(14, 24, 16, 28), seg(25, 16, 20), seg(26, 16, 19), seg(27, 17, 18)),
      S(white, r(17, 15, 11, 9), seg(24, 17, 19), seg(25, 17, 18), seg(26, 17, 17)),
      F(ink, bits(['....###....', '...##.##...', '...##.##...', '..##...##..', '..#######..', '..##...##..', '.##.....##.', '.##.....##.'], 17, 15)),
    ],
  },
  'control/win32': {
    16: [
      F(ink, r(1, 1, 14, 14)),
      S(b3, r(2, 2, 12, 2)),
      S(g1, r(2, 4, 12, 10)),
      F(white, bits(['###', '..#', '.##', '..#', '###'], 2, 5), bits(['###', '..#', '###', '#..', '###'], 6, 5)),
      ...badge[16](8, 8),
    ],
    32: [
      F(ink, r(2, 2, 28, 26)),
      S1(b3, r(3, 3, 26, 4)),
      F(g6, r(24, 4, 2, 2), r(27, 4, 2, 2)),
      S(g1, r(3, 7, 26, 20)),
      F(white, bits(three, 5, 9), bits(two, 12, 9)),
      ...badge[32](19, 17),
    ],
  },
  'control/graphics-api': {
    16: [
      // small isometric cube
      F(ink, seg(1, 5, 5), seg(2, 3, 4), seg(2, 6, 7), seg(3, 1, 2), seg(3, 8, 9), seg(4, 2, 3), seg(4, 7, 8), seg(5, 4, 6), r(1, 4, 1, 5), r(9, 4, 1, 5), r(5, 6, 1, 4), seg(9, 1, 2), seg(9, 8, 9), seg(10, 3, 4), seg(10, 6, 7), seg(11, 5, 5)),
      F(b5, seg(2, 5, 5), seg(3, 3, 7), seg(4, 4, 6)),
      F(b3, r(2, 5, 3, 4), seg(9, 3, 4)),
      F(b2, r(6, 5, 3, 4), seg(9, 6, 7)),
      // wireframe triangle and overlay rectangle
      H(gr2, r(12, 1, 1, 1), r(11, 2, 1, 1), r(13, 2, 1, 1), r(10, 3, 1, 1), r(14, 3, 1, 1), seg(4, 10, 14)),
      F(ink, r(11, 6, 4, 3)),
      F(a3, r(12, 7, 2, 1)),
      ...badge[16](8, 8),
    ],
    32: [
      F(ink, seg(3, 10, 10), seg(4, 8, 9), seg(4, 11, 12), seg(5, 6, 7), seg(5, 13, 14), seg(6, 4, 5), seg(6, 15, 16), seg(7, 2, 3), seg(7, 17, 18),
        seg(8, 3, 4), seg(8, 16, 17), seg(9, 5, 6), seg(9, 14, 15), seg(10, 7, 8), seg(10, 12, 13), seg(11, 9, 11),
        r(2, 8, 1, 10), r(18, 8, 1, 10), r(10, 12, 1, 10), seg(18, 2, 3), seg(18, 17, 18), seg(19, 4, 5), seg(19, 15, 16), seg(20, 6, 7), seg(20, 13, 14), seg(21, 8, 9), seg(21, 11, 12), seg(22, 10, 10)),
      S(b5, seg(4, 10, 10), seg(5, 8, 12), seg(6, 6, 14), seg(7, 4, 16), seg(8, 5, 15), seg(9, 7, 13), seg(10, 9, 11)),
      S(b3, seg(8, 3, 4), seg(9, 3, 6), seg(10, 3, 8), r(3, 11, 7, 7), seg(18, 4, 9), seg(19, 6, 9), seg(20, 8, 9)),
      S(b2, seg(8, 16, 17), seg(9, 14, 17), seg(10, 12, 17), r(11, 11, 7, 7), seg(18, 11, 16), seg(19, 11, 14), seg(20, 11, 12)),
      H(gr2, seg(4, 24, 24), seg(5, 23, 23), seg(5, 25, 25), seg(6, 22, 22), seg(6, 26, 26), seg(7, 21, 21), seg(7, 27, 27), seg(8, 20, 20), seg(8, 28, 28), seg(9, 19, 29)),
      F(ink, r(22, 11, 7, 5)),
      S(a3, r(23, 12, 5, 3)),
      ...badge[32](19, 18),
    ],
  },
  'control/sound': {
    16: [
      F(ink, seg(2, 7, 8), seg(3, 6, 8), seg(4, 5, 8), band(5, 10, 1, 8), seg(11, 5, 8), seg(12, 6, 8), seg(13, 7, 8)),
      S(g4, r(2, 6, 2, 4)),
      S(g4, seg(3, 7, 7), seg(4, 6, 7), band(5, 10, 5, 7), seg(11, 6, 7), seg(12, 7, 7)),
      // slider card
      F(ink, r(9, 2, 6, 9)),
      S(white, r(10, 3, 4, 7)),
      F(g4, r(10, 4, 4, 1), r(10, 7, 4, 1)),
      F(ink, r(11, 3, 1, 3), r(12, 6, 1, 3)),
      ...badge[16](8, 8),
    ],
    32: [
      F(ink, seg(4, 16, 17), seg(5, 15, 17), seg(6, 13, 17), seg(7, 12, 17), seg(8, 10, 17), seg(9, 9, 17), band(10, 21, 2, 17),
        seg(22, 9, 17), seg(23, 10, 17), seg(24, 12, 17), seg(25, 13, 17), seg(26, 15, 17), seg(27, 16, 17)),
      S(g4, r(3, 11, 5, 10)),
      F(g3, r(4, 13, 3, 1), r(4, 15, 3, 1), r(4, 17, 3, 1)),
      S(g4, seg(5, 16, 16), seg(6, 15, 16), seg(7, 13, 16), seg(8, 12, 16), seg(9, 10, 16), band(10, 21, 9, 16),
        seg(22, 10, 16), seg(23, 12, 16), seg(24, 13, 16), seg(25, 15, 16), seg(26, 16, 16)),
      F(g3, seg(9, 13, 13), seg(10, 12, 12), seg(11, 11, 11), band(12, 19, 10, 10), seg(20, 11, 11), seg(21, 12, 12), seg(22, 13, 13)),
      F(ink, r(19, 4, 11, 14)),
      S(white, r(20, 5, 9, 12)),
      F(ink, r(21, 8, 7, 1), r(21, 13, 7, 1)),
      F(ink, r(22, 6, 3, 5), r(25, 11, 3, 5)),
      F(g4, r(23, 7, 1, 3), r(26, 12, 1, 3)),
      ...badge[32](19, 18),
    ],
  },
  'control/regional': {
    16: [
      F(ink, r(1, 2, 14, 12)),
      S(white, r(2, 3, 12, 10)),
      // calendar
      F(ink, r(3, 4, 5, 7)),
      F(b3, r(4, 5, 3, 2)),
      F(white, r(4, 7, 3, 3)),
      F(ink, r(5, 7, 1, 3), r(4, 8, 3, 1)),
      // currency glyph
      F(ink, bits(['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'], 9, 4)),
    ],
    32: [
      F(ink, r(2, 4, 28, 22)),
      S(white, r(3, 5, 26, 20)),
      F(ink, r(5, 7, 10, 14)),
      S1(b3, r(6, 8, 8, 3)),
      F(white, r(6, 11, 8, 8)),
      F(ink, r(8, 11, 1, 8), r(11, 11, 1, 8), r(6, 13, 8, 1), r(6, 16, 8, 1)),
      F(b4, r(9, 14, 2, 2)),
      F(ink, bits(['...##...', '.######.', '##.##.##', '##.##...', '.####...', '..####..', '...####.', '...##.##', '##.##.##', '.######.', '...##...'], 18, 8)),
    ],
  },
  'control/themes': {
    16: [
      ...monitor(2, 1, 12, 9, b4),
      F(p3, r(5, 6, 6, 1)),
      F(b2, r(6, 4, 2, 1)),
      F(white, r(6, 5, 2, 2)),
      // swatch strip
      F(ink, r(2, 9, 13, 5)),
      S(r2, r(3, 10, 3, 3)),
      S(gr2, r(7, 10, 3, 3)),
      S(b3, r(11, 10, 3, 3)),
    ],
    32: [
      ...monitor(2, 2, 24, 18, b4),
      F(p3, r(6, 12, 16, 4)),
      F(ink, r(9, 8, 8, 6)),
      F(b2, r(10, 9, 6, 1)),
      S1(white, r(10, 10, 6, 3)),
      F(ink, r(12, 20, 4, 1)),
      F(ink, r(14, 21, 16, 9)),
      S(r2, r(15, 22, 4, 7)),
      S(gr2, r(20, 22, 4, 7)),
      S(b3, r(25, 22, 4, 7)),
    ],
  },
  'control/fonts': {
    16: [
      ...page[16],
      F(ink, bits(['..#..', '.#.#.', '#####', '#...#'], 5, 3)),
      F(ink, bits(['.##', '..#', '.##', '#.#', '.##'], 5, 8)),
      F(ink, r(9, 9, 2, 1)),
      F(g3, r(9, 11, 2, 1)),
      F(g4, r(4, 13, 8, 1)),
      F(ink, r(5, 13, 1, 1), r(7, 13, 1, 1), r(9, 13, 1, 1), r(11, 13, 1, 1)),
    ],
    32: [
      ...page[32],
      F(ink, bits(['.....##.....', '....####....', '....####....', '...##..##...', '...##..##...', '..##....##..', '..##....##..', '..########..', '.##......##.', '.##......##.', '##........##', '###......###'], 7, 6)),
      F(ink, bits(['.###.', '....#', '.####', '#...#', '#..##', '.##.#'], 20, 12)),
      F(g3, r(8, 19, 14, 1)),
      F(ink, r(8, 21, 12, 1)),
      F(ink, r(8, 23, 10, 2)),
      F(g4, r(7, 26, 18, 2)),
      F(ink, r(8, 26, 1, 1), r(11, 26, 1, 1), r(14, 26, 1, 1), r(17, 26, 1, 1), r(20, 26, 1, 1), r(23, 26, 1, 1)),
    ],
  },
  'control/displays': {
    16: [
      ...monitor(5, 1, 10, 8, b3),
      ...monitor(1, 3, 10, 9, b3),
      F(ink, r(5, 6, 1, 3), r(4, 7, 4, 1)),
      ...badge[16](8, 8),
    ],
    32: [
      ...monitor(9, 2, 21, 16, b3),
      ...monitor(2, 7, 19, 15, b3),
      F(ink, r(9, 11, 1, 7), r(13, 11, 1, 7), r(6, 13, 11, 1), r(6, 15, 11, 1)),
      F(ink, r(10, 22, 3, 2), r(6, 24, 11, 1)),
      ...badge[32](19, 18),
    ],
  },
  'control/associations': {
    16: [
      // small page
      F(ink, 'M1 1h4v1h1v1h1v7h-6z'),
      S(white, 'M2 2h2v2h2v5h-4z'),
      F(g5, r(4, 2, 1, 2), r(5, 3, 1, 1)),
      F(g3, r(3, 5, 2, 1), r(3, 7, 2, 1)),
      // app tile
      F(ink, r(8, 8, 7, 7)),
      F(b2, r(9, 9, 5, 1)),
      S(g5, r(9, 10, 5, 4)),
      // link arrow
      H(gr2, r(7, 5, 5, 1), r(11, 6, 1, 1), r(10, 6, 1, 1), r(12, 6, 1, 1)),
    ],
    32: [
      F(ink, 'M2 2h8v1h1v1h1v1h1v14h-11z'),
      S(white, 'M3 3h6v1h1v1h1v1h1v12h-9z'),
      F(g5, 'M9 4h1v1h1v1h1v1h-3z'),
      F(g3, r(5, 9, 5, 1), r(5, 12, 5, 1), r(5, 15, 3, 1)),
      F(ink, r(16, 14, 14, 14)),
      S1(b3, r(17, 15, 12, 3)),
      F(g6, r(26, 16, 2, 1)),
      S(g5, r(17, 18, 12, 9)),
      F(g3, r(19, 20, 8, 1), r(19, 23, 5, 1)),
      H(gr2, r(14, 7, 9, 2), r(21, 9, 2, 2), seg(11, 19, 24), seg(12, 20, 23), seg(13, 21, 22)),
    ],
  },
  'control/performance': {
    16: [
      F(ink, dome(16, circle(14, 1, 1), 1, 1, 9), seg(10, 1, 14)),
      S(white, dome(16, circle(12, 2, 2), 2, 2, 9)),
      F(gr3, arc(16, circle(12, 2, 2), circle(10, 3, 3), 6, 2, 5)),
      F(a3, arc(16, circle(12, 2, 2), circle(10, 3, 3), 6, 6, 9)),
      F(r2, arc(16, circle(12, 2, 2), circle(10, 3, 3), 6, 10, 13)),
      F(g4, r(4, 7, 1, 1), r(7, 4, 2, 1), r(11, 7, 1, 1)),
      F(r2, diag(9, 7, 3, 1, -1, 1)),
      F(ink, r(7, 8, 2, 2)),
    ],
    32: [
      F(ink, dome(32, circle(28, 2, 2), 2, 2, 19), seg(20, 2, 29)),
      S(white, dome(32, circle(26, 3, 3), 3, 3, 19)),
      F(gr3, arc(32, circle(26, 3, 3), circle(22, 5, 5), 13, 3, 10)),
      F(a3, arc(32, circle(26, 3, 3), circle(22, 5, 5), 13, 11, 20)),
      F(r2, arc(32, circle(26, 3, 3), circle(22, 5, 5), 13, 21, 28)),
      F(g4, r(6, 15, 2, 2), r(9, 9, 2, 2), r(15, 6, 2, 2), r(21, 9, 2, 2), r(24, 15, 2, 2)),
      F(r2, diag(18, 12, 5, 1, -1, 2)),
      F(ink, circle(4, 14, 14)),
      F(g3, r(15, 15, 1, 1)),
    ],
  },
  'control/profiler': {
    16: [
      F(ink, r(6, 1, 4, 1), r(7, 2, 2, 2), r(12, 3, 1, 1), r(13, 2, 1, 1)),
      F(ink, circle(10, 3, 4)),
      S(white, circle(8, 4, 5)),
      F(b3, r(5, 9, 1, 3), r(7, 7, 1, 5), r(9, 8, 1, 4)),
      F(ink, r(5, 12, 5, 1)),
    ],
    32: [
      F(ink, r(13, 2, 6, 3), r(14, 5, 4, 2), diag(21, 6, 3, 1, -1, 2)),
      F(g4, r(14, 3, 4, 1)),
      F(ink, circle(22, 5, 7)),
      S(white, circle(20, 6, 8)),
      F(ink, r(9, 17, 4, 7), r(14, 11, 4, 13), r(19, 19, 4, 5), r(9, 24, 14, 1)),
      F(b3, r(10, 18, 2, 5), r(15, 12, 2, 11), r(20, 20, 2, 3)),
    ],
  },
  'control/memory': {
    16: [
      F(ink, r(1, 3, 14, 8), r(2, 11, 12, 2)),
      S(g2, r(2, 4, 12, 6)),
      F(g4, r(3, 5, 2, 2), r(6, 5, 2, 2), r(9, 5, 2, 2), r(12, 5, 2, 2)),
      F(n3, r(3, 11, 10, 1)),
      F(n2, r(4, 11, 1, 1), r(6, 11, 1, 1), r(8, 11, 1, 1), r(10, 11, 1, 1)),
      // magnifier
      F(ink, circle(6, 8, 7), diag(13, 12, 2, 1, 1, 2)),
      S(b5, circle(4, 9, 8)),
    ],
    32: [
      F(ink, r(2, 6, 28, 16), r(4, 22, 24, 3)),
      S(g2, r(3, 7, 26, 14)),
      F(ink, r(5, 9, 5, 7), r(11, 9, 5, 7), r(17, 9, 5, 7), r(23, 9, 5, 7)),
      S1(g4, r(6, 10, 3, 5), r(12, 10, 3, 5), r(18, 10, 3, 5), r(24, 10, 3, 5)),
      F(g3, r(5, 18, 22, 1)),
      F(n3, r(5, 22, 22, 2)),
      F(n2, r(7, 22, 1, 2), r(10, 22, 1, 2), r(13, 22, 1, 2), r(16, 22, 1, 2), r(19, 22, 1, 2), r(22, 22, 1, 2), r(25, 22, 1, 2)),
      F(ink, circle(10, 18, 16), diag(27, 25, 3, 1, 1, 2)),
      S(b5, circle(8, 19, 17)),
      F(white, r(21, 19, 1, 1)),
    ],
  },
}

write(process.argv[2], icons)
