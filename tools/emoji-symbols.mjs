// Emoji symbols: the three wise monkeys, kiss mark, 100, anger, collision, dizzy, sweat, dashing away, hole, speech and zzz
import { ink, white, g1, g2, g4, b4, a3, r2, r3, n2, n4, r, circle, S, F, H, write, rasterise } from './lib.mjs'

// Mask helpers: a silhouette mask is the ink outline, the mask eroded by one pixel is the fill
const blank = size => new Uint8Array(size * size)
// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
// Mask of every pixel inside any of the paths
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Pixels of a mask whose four neighbours are all set
const erode = (m, size) => {
  const out = blank(size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
// Pixels in either mask
const or = (a, b) => a.map((v, i) => v || b[i] ? 1 : 0)
// Pixels in both masks
const and = (a, b) => a.map((v, i) => v && b[i] ? 1 : 0)
// Pixels in the first mask and not the second
const sub = (a, b) => a.map((v, i) => v && !b[i] ? 1 : 0)
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
// Sample a predicate over pixel centres
const sample = (size, f) => {
  const m = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) if (f(x + 0.5, y + 0.5)) m[y * size + x] = 1
  return m
}
// Ellipse mask with radii a and b
const ellipse = (size, cx, cy, a, b) => sample(size, (x, y) => ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 <= 1)
// Star or burst: radius alternates between outer and inner over n points
const burst = (size, cx, cy, ro, ri, n, rot = 0) => sample(size, (x, y) => {
  const d = Math.hypot(x - cx, y - cy)
  let t = ((Math.atan2(y - cy, x - cx) - rot) / (2 * Math.PI) * n) % 1
  if (t < 0) t += 1
  const k = 1 - 2 * Math.abs(t - 0.5)
  return d <= ri + (ro - ri) * (1 - k)
})
// Teardrop: a disc with a pointed cap above it
const drop = (size, cx, top, cy, R) => sample(size, (x, y) =>
  Math.hypot(x - cx, y - cy) <= R || (y >= top && y <= cy && Math.abs(x - cx) <= R * (y - top) / (cy - top)))
// Mask from [y, x0, x1] spans
const rows = (size, spans) => union(size, ...spans.map(([y, x0, x1]) => r(x0, y, x1 - x0 + 1, 1)))
// Rectangle with the four corner pixels cut
const rrect = (x, y, w, h) => r(x + 1, y, w - 2, 1) + r(x, y + 1, w, h - 2) + r(x + 1, y + h - 1, w - 2, 1)
// Ink outline and bevelled fill from a mask
const surface = (size, fill, m) => [F(ink, path(m, size)), S(fill, path(erode(m, size), size))]

// Monkey head: brown disc, lighter face patch over the lower two thirds, round ears at the sides
const head = {
  16: [
    F(ink, circle(4, 1, 6), circle(4, 11, 6)),
    F(n2, r(2, 7, 2, 2), r(12, 7, 2, 2)),
    F(ink, circle(12, 2, 2)),
    S(n2, circle(10, 3, 3)),
    S(n4, path(and(union(16, circle(10, 3, 3)), union(16, circle(8, 4, 5)), 16), 16)),
    F(ink, r(5, 6, 1, 1), r(10, 6, 1, 1), r(5, 8, 1, 1), r(10, 8, 1, 1), r(6, 9, 4, 1)),
  ],
  32: [
    F(ink, circle(8, 2, 12), circle(8, 22, 12)),
    S(n2, circle(6, 3, 13), circle(6, 23, 13)),
    F(ink, circle(24, 4, 4)),
    S(n2, circle(22, 5, 5)),
    S(n4, path(and(union(32, circle(22, 5, 5)), union(32, circle(20, 6, 10)), 32), 32)),
    F(ink, r(11, 12, 2, 2), r(19, 12, 2, 2), r(14, 16, 1, 1), r(17, 16, 1, 1)),
    F(white, r(11, 12, 1, 1), r(19, 12, 1, 1)),
    F(ink, r(10, 18, 1, 1), r(21, 18, 1, 1), r(11, 19, 1, 1), r(20, 19, 1, 1), r(12, 20, 8, 1)),
  ],
}
// Hands: a rounded mitt with finger grooves cut into the top edge
const hand16 = (x, y) => surface(16, n2, union(16, rrect(x, y, 5, 5)))
const hand32 = (x, y) => [
  ...surface(32, n2, union(32, rrect(x, y, 9, 9), r(x + 2, y - 1, 5, 1))),
  F(ink, r(x + 3, y, 1, 2), r(x + 5, y, 1, 2)),
]
// Monkey head with a pair of hands
const monkey = (h16, h32) => ({ 16: [...head[16], ...h16], 32: [...head[32], ...h32] })

// Kiss mark: two upper lobes over a wider lower lip
const lips16 = or(union(16, circle(5, 2, 4), circle(5, 9, 4)), rows(16, [[6, 4, 11], [7, 2, 13], [8, 2, 13], [9, 3, 12], [10, 5, 10]]))
const lips32 = or(union(32, circle(10, 4, 8), circle(10, 18, 8)),
  rows(32, [[10, 12, 19], [11, 9, 22], [12, 6, 25], [16, 4, 27], [17, 4, 27], [18, 4, 27], [19, 5, 26], [20, 6, 25], [21, 8, 23], [22, 12, 19]]))

// Anger vein: one curved blade sweeping into the centre from the top left, mirrored four ways
const blade = (size, cx, cy, R, w0, curl) => sample(size, (x, y) => {
  const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy)
  if (d > R || d < 0.4) return false
  const t = d / R
  const w = w0 * Math.min(1, t / 0.45) * (t < 0.72 ? 1 : Math.sqrt(1 - ((t - 0.72) / 0.28) ** 2))
  const thc = -3 * Math.PI / 4 + curl * t, theta = Math.atan2(dy, dx)
  const da = Math.atan2(Math.sin(theta - thc), Math.cos(theta - thc))
  return Math.abs(da) < Math.PI / 2 && Math.abs(d * Math.sin(da)) <= w
})
// Mirror a mask left to right
const mirrorX = (m, size) => {
  const out = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) out[y * size + (size - 1 - x)] = m[y * size + x]
  return out
}
// Mirror a mask top to bottom
const mirrorY = (m, size) => {
  const out = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) out[(size - 1 - y) * size + x] = m[y * size + x]
  return out
}
// Mask mirrored across both axes
const fourWay = (m, size) => {
  const a = or(m, mirrorX(m, size))
  return or(a, mirrorY(a, size))
}

// Z letters with a diagonal of the given stroke width
const zee = (x, y, w, h, s) => {
  const d = [r(x, y, w, s), r(x, y + h - s, w, s)]
  for (const i of range(0, h - 2 * s)) d.push(r(x + w - s - 1 - i, y + s + i, s, 1))
  return d.join('')
}

const icons = {
  'emoji/monkey-see-no-evil': monkey([...hand16(2, 4), ...hand16(9, 4)], [...hand32(5, 9), ...hand32(18, 9)]),
  'emoji/monkey-hear-no-evil': monkey([...hand16(1, 5), ...hand16(10, 5)], [...hand32(2, 10), ...hand32(21, 10)]),
  'emoji/monkey-speak-no-evil': monkey([...hand16(3, 8), ...hand16(8, 8)], [...hand32(7, 15), ...hand32(16, 15)]),
  'emoji/kiss': {
    16: [...surface(16, r2, lips16), F(ink, r(3, 7, 10, 1)), F(r3, r(3, 5, 2, 1))],
    32: [...surface(32, r2, lips32), F(ink, r(5, 15, 22, 1)), F(r3, r(6, 10, 3, 1), r(5, 11, 2, 1), r(20, 10, 3, 1))],
  },
  'emoji/100': {
    16: [H(r2, r(3, 3, 1, 6), r(2, 4, 1, 1), rrect(6, 3, 3, 6), r(7, 4, 1, 4), rrect(10, 3, 3, 6), r(11, 4, 1, 4), r(2, 10, 11, 1), r(4, 12, 7, 1))],
    32: [H(r2,
      r(8, 7, 2, 12), r(6, 9, 2, 2), r(7, 8, 1, 1),
      rrect(12, 7, 6, 12), r(14, 9, 2, 8), rrect(20, 7, 6, 12), r(22, 9, 2, 8),
      r(7, 21, 20, 2), r(10, 25, 14, 2),
    )],
  },
  'emoji/symbol-anger': {
    16: surface(16, r2, fourWay(blade(16, 8, 8, 7, 2.2, 0.2), 16)),
    32: surface(32, r2, fourWay(blade(32, 16, 16, 14, 3.6, 0.2), 32)),
  },
  'emoji/symbol-collision': {
    16: [...surface(16, r2, burst(16, 8, 8, 7, 4.2, 8, 0.2)), S(a3, path(burst(16, 8, 8, 4, 2, 8, 0.2), 16))],
    32: [...surface(32, r2, burst(32, 16, 16, 14, 8.5, 9, 0.3)), ...surface(32, a3, burst(32, 16, 16, 8.5, 4.5, 9, 0.3))],
  },
  'emoji/symbol-dizzy': {
    16: [
      H(ink, r(13, 4, 1, 3), r(11, 3, 2, 1), r(10, 4, 1, 2), r(11, 6, 1, 1), r(12, 5, 1, 1)),
      ...surface(16, a3, burst(16, 7, 8.5, 6.5, 3, 5, -Math.PI / 2)),
    ],
    32: [
      H(ink, r(26, 12, 1, 1), r(27, 11, 1, 1), r(28, 8, 1, 3), r(27, 7, 1, 1), r(24, 6, 3, 1), r(23, 7, 1, 1), r(22, 8, 1, 2), r(23, 10, 1, 1), r(24, 10, 1, 1), r(25, 9, 1, 1)),
      ...surface(32, a3, burst(32, 13.5, 17.5, 12.5, 5.5, 5, -Math.PI / 2)),
    ],
  },
  'emoji/symbol-sweat': {
    16: [...surface(16, b4, drop(16, 6, 1, 10.5, 4)), F(white, r(4, 9, 1, 2)), ...surface(16, b4, drop(16, 13, 7, 12, 1.9))],
    32: [...surface(32, b4, drop(32, 12, 2, 21, 8)), F(white, r(7, 18, 2, 1), r(6, 19, 2, 3)), ...surface(32, b4, drop(32, 25, 14, 25, 4)), F(white, r(23, 24, 1, 2))],
  },
  'emoji/symbol-dashing-away': {
    16: [
      ...surface(16, g4, rows(16, [[2, 8, 13], [3, 5, 14], [4, 5, 14], [5, 8, 13]])),
      ...surface(16, g4, rows(16, [[6, 5, 13], [7, 2, 14], [8, 2, 14], [9, 5, 13]])),
      ...surface(16, g4, rows(16, [[10, 8, 13], [11, 5, 14], [12, 5, 14], [13, 8, 13]])),
    ],
    32: [
      ...surface(32, g4, rows(32, [[5, 17, 27], [6, 13, 28], [7, 9, 29], [8, 9, 29], [9, 13, 28], [10, 17, 27]])),
      ...surface(32, g4, rows(32, [[12, 12, 27], [13, 7, 28], [14, 3, 29], [15, 3, 29], [16, 7, 28], [17, 12, 27]])),
      ...surface(32, g4, rows(32, [[19, 17, 27], [20, 13, 28], [21, 9, 29], [22, 9, 29], [23, 13, 28], [24, 17, 27]])),
    ],
  },
  'emoji/symbol-hole': {
    16: [
      F(ink, path(ellipse(16, 8, 8.5, 7, 3.6), 16)),
      S(g2, path(ellipse(16, 8, 8.5, 6, 2.6), 16)),
      S(g1, path(ellipse(16, 8, 9, 4.5, 1.6), 16)),
    ],
    32: [
      F(ink, path(ellipse(32, 16, 17, 14, 7), 32)),
      S(g2, path(ellipse(32, 16, 17, 13, 6), 32)),
      S(g1, path(ellipse(32, 16, 18, 10, 4), 32)),
    ],
  },
  'emoji/symbol-speech': {
    16: [
      ...surface(16, white, union(16, rrect(1, 2, 14, 10), r(3, 12, 4, 1), r(2, 13, 4, 1), r(2, 14, 2, 1))),
      F(ink, r(3, 6, 2, 2), r(7, 6, 2, 2), r(11, 6, 2, 2)),
    ],
    32: [
      ...surface(32, white, union(32, r(4, 4, 24, 20), r(3, 5, 26, 18), r(2, 6, 28, 16), r(6, 24, 8, 1), r(5, 25, 7, 1), r(4, 26, 5, 1), r(3, 27, 4, 1), r(3, 28, 2, 1))),
      F(ink, r(7, 12, 4, 4), r(14, 12, 4, 4), r(21, 12, 4, 4)),
    ],
  },
  'emoji/symbol-zzz': {
    16: [H(ink, zee(2, 10, 3, 3, 1), zee(5, 6, 4, 4, 1), zee(9, 2, 5, 5, 1))],
    32: [H(ink, zee(3, 21, 6, 6, 2), zee(10, 13, 8, 8, 2), zee(18, 3, 11, 11, 2))],
  },
}

write(process.argv[2], icons)
