// Hardware range for the devices domain: mini pc, tower, workstation, server, mac mini, macbook, imac, four consoles, headset and vr goggles
import { ink, g1, g2, g3, g4, g5, g6, white, b3, b5, gr3, r2, r, circle, S, F, H, write } from './lib.mjs'

const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)

// Mask helpers for shapes that overlap, since paths fill even odd
const blank = size => new Uint8Array(size * size)
const at = (m, size) => (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
const sub = (m, n) => m.map((v, i) => (v && !n[i] ? 1 : 0))
const erode = (m, size) => {
  const out = blank(size), a = at(m, size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (a(x, y) && a(x - 1, y) && a(x + 1, y) && a(x, y - 1) && a(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
const edge = (m, size) => sub(m, erode(m, size))
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
// Rounded rectangle mask: corner pixels closer than rad to the corner, in taxicab steps, are cut
const rrect = (size, x0, y0, w, h, rad) => {
  const m = blank(size)
  for (const y of range(y0, y0 + h)) for (const x of range(x0, x0 + w)) {
    const dx = Math.min(x - x0, x0 + w - 1 - x), dy = Math.min(y - y0, y0 + h - 1 - y)
    if (dx + dy >= rad) m[y * size + x] = 1
  }
  return m
}
// Ink outline and bevelled fill of a mask
const shape = (size, m, fill) => [F(ink, path(edge(m, size), size)), S(fill, path(erode(m, size), size))]
// Ink outlined bevelled box
const box = (x, y, w, h, fill) => [F(ink, r(x, y, w, h)), S(fill, r(x + 1, y + 1, w - 2, h - 2))]
// 2x2 Bayer checker of colour c over a rect, the fade where a sheen meets its body
const fade = (c, x0, y0, w, h) => F(c, ...range(y0, y0 + h).flatMap(y => range(x0, x0 + w).filter(x => (x + y) % 2 === 0).map(x => r(x, y, 1, 1))))
// Sheen band: a solid run then a dithered tail
const sheen = (c, x, y, solid, tail, h = 1) => [F(c, r(x, y, solid, h)), fade(c, x + solid, y, tail, h)]
// Mesh: the checker in g3 over a g4 panel
const mesh = (x0, y0, w, h) => fade(g3, x0, y0, w, h)

const icons = {
  'devices/mini-pc': {
    16: [
      ...box(3, 7, 10, 7, g4),
      F(ink, r(4, 6, 1, 1), r(11, 6, 1, 1), r(5, 5, 6, 1)),
      S(g5, r(5, 6, 6, 1)),
      F(white, r(6, 6, 2, 1)),
      F(ink, r(5, 9, 1, 3), r(7, 9, 1, 3), r(9, 9, 1, 3)),
      F(gr3, r(11, 11, 1, 1)),
    ],
    32: [
      ...box(6, 15, 20, 13, g4),
      // trapezoid top face, one step narrower per row going up
      F(ink, r(7, 14, 1, 1), r(24, 14, 1, 1), r(8, 13, 1, 1), r(23, 13, 1, 1), r(9, 12, 1, 1), r(22, 12, 1, 1), r(10, 11, 12, 1)),
      S(g5, r(10, 12, 12, 1), r(9, 13, 14, 1), r(8, 14, 16, 1)),
      ...sheen(white, 11, 12, 5, 4),
      ...sheen(g6, 8, 16, 8, 6),
      F(ink, r(9, 19, 1, 6), r(11, 19, 1, 6), r(13, 19, 1, 6), r(15, 19, 1, 6), r(17, 19, 1, 6)),
      F(gr3, r(22, 24, 2, 1)),
    ],
  },
  'devices/tower': {
    16: [
      ...box(5, 2, 7, 12, g4),
      F(g6, r(6, 3, 3, 1)),
      F(ink, r(6, 5, 5, 1)),
      F(ink, r(7, 8, 1, 1), r(9, 8, 1, 1)),
      F(gr3, r(8, 10, 1, 1)),
      F(ink, r(5, 14, 1, 1), r(11, 14, 1, 1)),
    ],
    32: [
      ...box(9, 3, 14, 25, g4),
      ...sheen(white, 11, 5, 5, 4),
      F(ink, r(11, 8, 10, 3)),
      F(g2, r(12, 9, 8, 1)),
      F(ink, r(12, 14, 2, 2), r(15, 14, 2, 2)),
      F(gr3, r(19, 15, 2, 1)),
      F(g2, r(12, 20, 8, 1), r(12, 22, 8, 1), r(12, 24, 8, 1)),
      F(ink, r(10, 28, 2, 2), r(20, 28, 2, 2)),
    ],
  },
  'devices/workstation': {
    16: [
      ...box(1, 1, 14, 13, g4),
      mesh(3, 3, 5, 9),
      F(ink, r(9, 3, 5, 9)),
      F(g1, r(10, 4, 3, 7)),
      F(g2, r(10, 5, 3, 2), r(10, 8, 3, 2)),
      F(gr3, r(12, 5, 1, 1), r(12, 8, 1, 1)),
      F(ink, r(2, 14, 2, 1), r(12, 14, 2, 1)),
    ],
    32: [
      ...box(2, 2, 28, 26, g4),
      ...sheen(white, 4, 3, 8, 6),
      F(ink, r(4, 6, 13, 20)),
      F(g4, r(5, 7, 11, 18)),
      mesh(5, 7, 11, 18),
      F(ink, r(18, 6, 9, 20)),
      F(g1, r(19, 7, 7, 18)),
      F(g2, r(19, 10, 7, 4), r(19, 17, 7, 4)),
      F(g3, r(20, 11, 3, 1), r(20, 18, 3, 1)),
      F(gr3, r(24, 11, 1, 2), r(24, 18, 1, 2)),
      F(ink, r(4, 28, 3, 2), r(25, 28, 3, 2)),
    ],
  },
  'devices/server': {
    16: [
      F(ink, r(1, 4, 1, 8), r(14, 4, 1, 8)),
      F(g5, r(1, 5, 1, 1), r(1, 10, 1, 1), r(14, 5, 1, 1), r(14, 10, 1, 1)),
      ...box(2, 5, 12, 6, g4),
      F(ink, r(3, 6, 9, 4)),
      F(g5, r(4, 7, 1, 1), r(6, 7, 1, 1), r(8, 7, 1, 1), r(10, 7, 1, 1)),
      F(gr3, r(4, 8, 1, 1), r(6, 8, 1, 1), r(8, 8, 1, 1), r(10, 8, 1, 1)),
    ],
    32: [
      F(ink, r(2, 10, 5, 12), r(25, 10, 5, 12)),
      F(g3, r(3, 11, 3, 10), r(26, 11, 3, 10)),
      F(ink, r(4, 13, 1, 1), r(4, 18, 1, 1), r(27, 13, 1, 1), r(27, 18, 1, 1)),
      ...box(6, 11, 20, 10, g4),
      ...sheen(white, 8, 12, 6, 4),
      F(ink, r(7, 13, 17, 6)),
      S(g5, r(8, 14, 3, 4), r(12, 14, 3, 4), r(16, 14, 3, 4), r(20, 14, 3, 4)),
      F(gr3, r(9, 17, 1, 1), r(13, 17, 1, 1), r(17, 17, 1, 1), r(21, 17, 1, 1)),
    ],
  },
  'devices/mac-mini': {
    16: [
      F(ink, path(edge(rrect(16, 3, 5, 10, 8, 1), 16), 16)),
      S(g5, r(4, 6, 8, 3)),
      S(g4, r(4, 9, 8, 3)),
      F(white, r(5, 6, 4, 1)),
      F(ink, r(5, 10, 1, 1), r(7, 10, 1, 1), r(9, 10, 1, 1)),
    ],
    32: [
      F(ink, path(edge(rrect(32, 7, 10, 18, 14, 2), 32), 32)),
      S(g5, path(sub(erode(rrect(32, 7, 10, 18, 14, 2), 32), rrect(32, 0, 18, 32, 14, 0)), 32)),
      S(g4, path(sub(erode(rrect(32, 7, 10, 18, 14, 2), 32), rrect(32, 0, 0, 32, 18, 0)), 32)),
      ...sheen(white, 9, 12, 7, 5),
      F(white, r(9, 13, 2, 1)),
      F(ink, r(10, 20, 2, 1), r(13, 20, 2, 1), r(16, 20, 2, 1), r(19, 20, 2, 1)),
    ],
  },
  'devices/macbook': {
    16: [
      ...box(3, 1, 10, 9, g5),
      F(white, r(4, 2, 3, 1)),
      F(ink, r(5, 3, 6, 5)),
      S(b3, r(6, 4, 4, 3)),
      F(ink, r(1, 10, 14, 4)),
      S(g5, r(2, 11, 12, 2)),
      F(g2, r(4, 11, 8, 1)),
    ],
    32: [
      ...box(6, 3, 20, 17, g5),
      ...sheen(white, 8, 4, 6, 4),
      F(ink, r(8, 5, 16, 13)),
      S(b3, r(9, 6, 14, 11)),
      F(b5, r(11, 8, 3, 1), r(11, 9, 1, 2)),
      F(ink, r(2, 20, 28, 6)),
      S(g5, r(3, 21, 26, 4)),
      ...sheen(white, 4, 21, 5, 4),
      F(g2, r(7, 22, 18, 2)),
      F(g4, r(13, 24, 6, 1)),
    ],
  },
  'devices/imac': {
    16: [
      ...box(1, 1, 14, 10, g5),
      F(white, r(2, 2, 3, 1)),
      F(ink, r(2, 2, 12, 6)),
      S(b3, r(3, 3, 10, 4)),
      F(b5, r(4, 4, 2, 1), r(4, 5, 1, 1)),
      F(g6, r(3, 8, 10, 1)),
      F(ink, r(6, 11, 4, 2)),
      F(g5, r(7, 11, 2, 1)),
      F(ink, r(3, 13, 10, 2)),
      F(g5, r(4, 13, 8, 1)),
    ],
    32: [
      ...box(2, 2, 28, 19, g5),
      ...sheen(white, 4, 3, 8, 6),
      F(ink, r(4, 4, 24, 12)),
      S(b3, r(5, 5, 22, 10)),
      F(b5, r(7, 7, 4, 1), r(7, 8, 1, 3)),
      F(g6, r(5, 17, 22, 2)),
      F(ink, r(13, 21, 6, 4)),
      F(g5, r(14, 21, 4, 3)),
      F(g4, r(14, 23, 4, 1)),
      F(ink, r(7, 25, 18, 4)),
      S(g5, r(8, 25, 16, 3)),
    ],
  },
  'devices/console-1': {
    16: [
      F(ink, r(1, 6, 14, 6)),
      S(g5, r(2, 7, 12, 2)),
      F(white, r(3, 7, 4, 1)),
      F(g2, r(2, 9, 12, 2)),
      F(ink, r(3, 9, 1, 2), r(5, 9, 1, 2), r(7, 9, 1, 2), r(9, 9, 1, 2)),
      F(g4, r(12, 9, 1, 1)),
      F(gr3, r(12, 10, 1, 1)),
    ],
    32: [
      F(ink, r(2, 10, 28, 14)),
      S(g5, r(3, 11, 26, 5)),
      ...sheen(white, 4, 12, 10, 6),
      F(g4, r(6, 14, 14, 1)),
      F(g2, r(3, 16, 26, 7)),
      F(ink, ...range(0, 8).map(i => r(5 + 2 * i, 17, 1, 5))),
      F(ink, circle(5, 23, 17)),
      F(g4, circle(3, 24, 18)),
      F(gr3, r(27, 21, 1, 1)),
    ],
  },
  'devices/console-2': {
    16: [
      F(ink, r(2, 3, 12, 11)),
      S(g1, r(3, 4, 10, 9)),
      F(g2, r(4, 5, 8, 2)),
      F(g4, r(7, 5, 2, 2)),
      F(g2, r(4, 9, 8, 3)),
      F(ink, r(5, 10, 1, 1), r(7, 10, 1, 1), r(9, 10, 1, 1), r(11, 10, 1, 1)),
    ],
    32: [
      F(ink, r(3, 4, 26, 24)),
      S(g1, r(4, 5, 24, 22)),
      ...sheen(g3, 6, 6, 6, 4),
      F(ink, r(6, 7, 20, 8)),
      S(g2, r(7, 8, 18, 6)),
      F(ink, circle(6, 13, 8)),
      S(g4, circle(4, 14, 9)),
      F(ink, r(7, 19, 3, 3), r(12, 19, 3, 3), r(17, 19, 3, 3), r(22, 19, 3, 3)),
      F(g3, r(8, 20, 1, 1), r(13, 20, 1, 1), r(18, 20, 1, 1), r(23, 20, 1, 1)),
    ],
  },
  'devices/console-3': {
    16: [
      ...shape(16, rrect(16, 1, 4, 14, 8, 1), g5),
      F(white, r(3, 5, 3, 1)),
      F(ink, r(5, 6, 5, 4)),
      S(b3, r(6, 7, 3, 2)),
      F(ink, r(3, 7, 1, 3), r(2, 8, 3, 1)),
      F(r2, r(12, 7, 1, 1), r(11, 8, 1, 1)),
    ],
    32: [
      ...shape(32, rrect(32, 2, 8, 28, 16, 2), g5),
      ...sheen(white, 5, 9, 6, 4),
      F(ink, r(10, 10, 11, 10)),
      S(b3, r(11, 11, 9, 8)),
      F(b5, r(12, 12, 3, 1), r(12, 13, 1, 2)),
      F(ink, r(5, 12, 2, 6), r(3, 14, 6, 2)),
      F(g3, r(5, 14, 2, 2)),
      F(ink, circle(4, 25, 10), circle(4, 22, 14)),
      F(r2, r(26, 11, 2, 2), r(23, 15, 2, 2)),
      F(ink, r(12, 21, 3, 1), r(16, 21, 3, 1)),
    ],
  },
  'devices/console-4': {
    16: [
      ...box(2, 1, 12, 7, g5),
      F(white, r(3, 2, 3, 1)),
      S(b3, r(5, 3, 6, 3)),
      ...box(2, 7, 12, 7, g5),
      S(b3, r(6, 8, 4, 3)),
      F(ink, r(4, 8, 1, 3), r(3, 9, 3, 1)),
      F(r2, r(11, 8, 1, 1), r(10, 9, 1, 1), r(12, 9, 1, 1), r(11, 10, 1, 1)),
    ],
    32: [
      ...box(6, 2, 20, 13, g5),
      ...sheen(white, 8, 3, 6, 4),
      F(ink, r(9, 4, 14, 9)),
      S(b3, r(10, 5, 12, 7)),
      F(b5, r(11, 6, 3, 1), r(11, 7, 1, 2)),
      F(ink, r(5, 14, 22, 2)),
      F(g3, r(7, 14, 2, 1), r(23, 14, 2, 1)),
      ...box(6, 15, 20, 14, g5),
      ...sheen(white, 8, 16, 6, 4),
      F(ink, r(11, 17, 10, 8)),
      S(b3, r(12, 18, 8, 6)),
      F(ink, r(9, 19, 1, 3), r(8, 20, 3, 1)),
      F(r2, r(23, 19, 1, 1), r(22, 20, 1, 1), r(24, 20, 1, 1), r(23, 21, 1, 1)),
      F(ink, r(13, 26, 3, 1), r(17, 26, 3, 1)),
    ],
  },
  'devices/headset': {
    16: [
      H(ink, r(1, 6, 1, 2), r(2, 5, 1, 1), r(3, 4, 1, 1), r(4, 3, 8, 1), r(12, 4, 1, 1), r(13, 5, 1, 1), r(14, 6, 1, 2)),
      F(ink, r(1, 8, 5, 6), r(10, 8, 5, 6)),
      S(g4, r(2, 9, 3, 4), r(11, 9, 3, 4)),
      F(g2, r(3, 10, 1, 2), r(12, 10, 1, 2)),
      H(ink, r(5, 13, 1, 1), r(6, 14, 3, 1)),
      F(ink, r(9, 13, 3, 2)),
      F(g4, r(10, 14, 1, 1)),
    ],
    32: [
      H(ink, r(11, 3, 10, 2), r(9, 4, 2, 2), r(7, 6, 2, 2), r(6, 8, 2, 2), r(5, 10, 2, 2), r(4, 12, 2, 6),
        r(21, 4, 2, 2), r(23, 6, 2, 2), r(24, 8, 2, 2), r(25, 10, 2, 2), r(26, 12, 2, 6)),
      F(ink, r(2, 17, 8, 11), r(22, 17, 8, 11)),
      S(g4, r(3, 18, 6, 9), r(23, 18, 6, 9)),
      F(g2, r(4, 20, 4, 5), r(24, 20, 4, 5)),
      F(g3, r(5, 21, 1, 1), r(25, 21, 1, 1)),
      H(ink, r(9, 26, 1, 1), r(10, 27, 1, 1), r(11, 28, 3, 1)),
      F(ink, r(14, 26, 5, 4)),
      S(g4, r(15, 27, 3, 2)),
    ],
  },
  'devices/vr-goggles': {
    16: [
      F(ink, r(5, 3, 6, 1), r(4, 4, 1, 1), r(11, 4, 1, 1)),
      F(g5, r(5, 4, 6, 1)),
      F(ink, r(1, 7, 1, 4), r(14, 7, 1, 4)),
      F(g5, r(1, 8, 1, 2), r(14, 8, 1, 2)),
      ...shape(16, rrect(16, 2, 5, 12, 8, 1), g4),
      F(g2, r(4, 7, 8, 4)),
      F(white, r(3, 6, 5, 1)),
    ],
    32: [
      F(ink, r(10, 6, 12, 5)),
      S(g5, r(11, 7, 10, 3)),
      F(ink, r(2, 13, 4, 9), r(26, 13, 4, 9)),
      S(g5, r(3, 14, 2, 7), r(27, 14, 2, 7)),
      ...shape(32, rrect(32, 5, 10, 22, 16, 2), g4),
      F(g2, path(rrect(32, 7, 13, 18, 10, 1), 32)),
      ...sheen(white, 7, 11, 9, 6),
      F(white, r(6, 12, 1, 3)),
      F(b3, r(10, 16, 2, 2), r(20, 16, 2, 2)),
      F(ink, r(14, 24, 4, 2)),
    ],
  },
}

write(process.argv[2] || 'out', icons)
