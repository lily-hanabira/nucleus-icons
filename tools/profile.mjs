// Profile avatars: square portrait tiles of people, bots, pets, sun, moon, a gear and a question mark
import { ramps, ink, g1, g2, g3, g4, white, b1, b2, b3, b4, b5, gr2, gr3, a2, a3, a4, r2, r3, p2, p3, n1, n2, n3, r, circle, S, F, write, rasterise } from './lib.mjs'

const teal = ramps.teal[2]
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)
const blank = size => new Uint8Array(size * size)
// Mask of every pixel inside any of the paths or masks
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) (typeof p === 'string' ? rasterise(p, size) : p).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Pixels whose four neighbours are set. Rows from floor down count as set so a shape cut by the tile bottom keeps its fill
const erode = (m, size, floor = size) => {
  const out = blank(size)
  const at = (x, y) => y >= floor || (x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (m[y * size + x] && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
const sub = (a, b) => a.map((v, i) => v && !b[i] ? 1 : 0)
const and = (a, b) => a.map((v, i) => v && b[i] ? 1 : 0)
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
// Ink outlined bevelled shape from a silhouette mask
const solid = (size, fill, m, floor) => [F(ink, path(m, size)), S(fill, path(erode(m, size, floor), size))]
// rows(y0, [[x, w], ...]) stacks one pixel tall runs downward, several runs per row as [[x, w], [x, w]]
const rows = (y0, spec) => spec.map((row, i) => (Array.isArray(row[0]) ? row : [row]).map(([x, w]) => r(x, y0 + i, w, 1)).join('')).join('')
const flip = (spec, size) => spec.map(row => (Array.isArray(row[0]) ? row : [row]).map(([x, w]) => [size - x - w, w]))
// Rounded rectangle, ins lists the inset of each corner row from the top, mirrored at the bottom
const rr = (x, y, w, h, ins) => rows(y, [...ins.map(i => [x + i, w - 2 * i]), ...range(0, h - 2 * ins.length).map(() => [x, w]), ...[...ins].reverse().map(i => [x + i, w - 2 * i])])
const dot = (x, y) => r(x, y, 1, 1)
const eyes32 = (lx, rx, y) => [F(ink, r(lx, y, 3, 3), r(rx, y, 3, 3)), F(white, dot(lx + 1, y + 1), dot(rx + 1, y + 1))]

// Tile: ink square on the safe area with a bevelled background. The floor is the first row under the interior
const floor = { 16: 14, 32: 29 }
const tile = (size, bg) => size === 16
  ? [F(ink, r(1, 1, 14, 14)), S(bg, r(2, 2, 12, 12))]
  : [F(ink, r(2, 2, 28, 28)), S(bg, r(3, 3, 26, 26))]
const portrait = (bg, l16, l32) => ({ 16: [...tile(16, bg), ...l16], 32: [...tile(32, bg), ...l32] })
// Rounded shoulders from row top, cut off by the tile bottom
const shoulderMask = (size, top) => size === 16
  ? union(16, r(5, top, 6, 1), r(3, top + 1, 10, floor[16] - top - 1))
  : union(32, r(11, top, 10, 1), r(8, top + 1, 16, 1), r(6, top + 2, 20, 1), r(5, top + 3, 22, floor[32] - top - 3))
const shoulders = (size, colour, top) => solid(size, colour, shoulderMask(size, top), floor[size])

// People. 16: d7 head at (5,2), neck row 9, shoulders from 10. 32: d14 head at (9,4), neck rows 18 to 19, shoulders from 20
const faceMask = { 16: union(16, circle(5, 6, 3)), 32: union(32, circle(12, 10, 5)) }
const topOf = (size, n) => and(faceMask[size], union(size, r(0, 0, size, n)))
const head = {
  16: [F(ink, circle(7, 5, 2)), S(a3, circle(5, 6, 3))],
  32: [F(ink, circle(14, 9, 4)), S(a3, circle(12, 10, 5))],
}
const neck = {
  16: [F(ink, dot(6, 9), dot(10, 9)), F(a3, r(7, 9, 3, 1))],
  32: [F(ink, r(12, 18, 1, 2), r(19, 18, 1, 2)), F(a3, r(13, 18, 6, 2)), F(a2, r(18, 18, 1, 2))],
}
const look = {
  16: [F(ink, dot(7, 4), dot(9, 4), r(7, 6, 3, 1))],
  32: [F(ink, r(13, 9, 1, 2), r(18, 9, 1, 2), dot(13, 13), dot(18, 13), r(14, 14, 4, 1))],
}
const hair = (size, c) => size === 16
  ? F(c, r(7, 3, 3, 1), dot(6, 4), dot(10, 4))
  : S(c, path(union(32, topOf(32, 9), r(10, 9, 2, 2), r(20, 9, 2, 2)), 32))
const bust = (size, shirt, parts) => [...shoulders(size, shirt, size === 16 ? 10 : 20), ...neck[size], ...head[size], ...parts]
const person = (bg, shirt, p16, p32) => portrait(bg, bust(16, shirt, p16), bust(32, shirt, p32))

const glasses = {
  16: [F(ink, dot(6, 4), dot(8, 4), dot(10, 4), r(6, 5, 5, 1)), F(white, dot(7, 4), dot(9, 4))],
  32: [
    F(ink, r(11, 8, 4, 1), r(11, 11, 4, 1), r(11, 9, 1, 2), r(14, 9, 1, 2), r(17, 8, 4, 1), r(17, 11, 4, 1), r(17, 9, 1, 2), r(20, 9, 1, 2), r(15, 9, 2, 1), dot(10, 9), dot(21, 9)),
    F(white, r(12, 9, 2, 2), r(18, 9, 2, 2)),
    F(ink, r(13, 9, 1, 2), r(18, 9, 1, 2)),
  ],
}
// Beard along the jaw, a skin gap for the mouth
const beard32 = union(32, and(faceMask[32], union(32, r(0, 13, 32, 4))), r(10, 11, 2, 2), r(20, 11, 2, 2))

// Animal heads sit straight on the shoulders: 16 head bottom row 9, 32 row 19 or 20
const earsL16 = rows(2, [[5, 1], [4, 3]])
const earsR16 = rows(2, flip([[5, 1], [4, 3]], 16))
const pointyHead16 = union(16, earsL16, earsR16, r(5, 4, 7, 1), r(4, 5, 9, 4), r(5, 9, 7, 1))
const earSpec32 = [[9, 2], [8, 4], [8, 5], [7, 6], [7, 7]]
const pointyHead32 = union(32, rows(4, earSpec32), rows(4, flip(earSpec32, 32)), rr(7, 9, 18, 12, [2, 1]))
const pointy = (size, colour, inner) => size === 16
  ? [...solid(16, colour, pointyHead16), F(inner, dot(6, 4), dot(10, 4))]
  : [...solid(32, colour, pointyHead32), F(inner, r(9, 6, 2, 2), r(21, 6, 2, 2))]

// Bot heads: square with a bevelled face plate
const botNeck = {
  16: [F(ink, dot(6, 9), dot(10, 9)), F(g3, r(7, 9, 3, 1))],
  32: [F(ink, dot(12, 19), dot(19, 19)), F(g3, r(13, 19, 6, 1))],
}

// Sun rays: a diagonal bar of 3x3 blocks stepping from x0, y0 by dx, dy
const bar = (x0, y0, dx, dy) => union(32, ...range(0, 4).map(i => r(x0 + i * dx, y0 + i * dy, 3, 3)))
const gear16 = union(16, circle(10, 3, 3), r(7, 2, 2, 1), r(7, 13, 2, 1), r(2, 7, 1, 2), r(13, 7, 1, 2),
  dot(3, 3), dot(4, 3), dot(3, 4), dot(12, 3), dot(11, 3), dot(12, 4), dot(3, 12), dot(4, 12), dot(3, 11), dot(12, 12), dot(11, 12), dot(12, 11))
const gear32 = union(32, circle(20, 6, 6), r(14, 3, 4, 3), r(14, 26, 4, 3), r(3, 14, 3, 4), r(26, 14, 3, 4),
  bar(5, 5, 1, 1), bar(24, 5, -1, 1), bar(5, 24, 1, -1), bar(24, 24, -1, -1))
const moon16 = sub(union(16, circle(11, 3, 2)), union(16, circle(9, 8, 3)))
const moon32 = sub(union(32, circle(22, 4, 5)), union(32, circle(18, 13, 7)))
// Question mark silhouettes, the white stroke is the erosion
const ask16 = union(16, rows(2, [[5, 7], [4, 8], [4, 8], [[4, 3], [9, 3]], [8, 4], [7, 4], [6, 4], [6, 4]]), r(6, 11, 4, 3))
const ask32 = union(32, rows(4, [[10, 12], [9, 14], [9, 14], [9, 14], [9, 14], [[9, 5], [18, 5]], [[9, 5], [18, 5]], [[9, 5], [18, 5]], [18, 5], [17, 6], [16, 6], [15, 6], [14, 6], [13, 6], [13, 6], [13, 6], [13, 6]]), r(13, 23, 6, 5))

const icons = {
  'profile/generic-male-1': person(b4, b3, [...look[16], hair(16, n1)], [...look[32], hair(32, n1)]),
  'profile/generic-male-2': person(gr3, gr2,
    [F(ink, dot(7, 4), dot(9, 4)), hair(16, g1), F(g1, dot(6, 6), dot(10, 6), r(7, 7, 3, 1))],
    [...look[32], hair(32, g1), S(g1, path(beard32, 32)), F(a3, r(14, 14, 4, 1))]),
  'profile/generic-male-3': person(p3, r2,
    [...glasses[16]],
    [...look[32], ...glasses[32]]),
  'profile/generic-female-1': portrait(teal,
    [...solid(16, n1, union(16, r(5, 2, 7, 1), r(3, 3, 10, 11)), floor[16]),
      ...bust(16, p2, [...look[16], hair(16, n1)]),
      F(ink, r(3, 10, 1, 4), r(12, 10, 1, 4)), F(n1, r(4, 10, 1, 4), r(11, 10, 1, 4))],
    [...solid(32, n1, union(32, circle(20, 6, 3), r(6, 13, 20, 16)), floor[32]),
      ...bust(32, p2, [...look[32], hair(32, n1)]),
      ...solid(32, n1, union(32, r(6, 17, 4, 12)), floor[32]), ...solid(32, n1, union(32, r(22, 17, 4, 12)), floor[32])]),
  'profile/generic-female-2': person(r3, a2,
    [F(ink, dot(7, 5), dot(9, 5)), F(ink, r(4, 3, 1, 6), r(12, 3, 1, 6), dot(5, 3), dot(11, 3), dot(5, 8), dot(11, 8)), F(g1, r(5, 4, 1, 4), r(11, 4, 1, 4), r(7, 3, 3, 1), r(6, 4, 5, 1))],
    [F(ink, r(13, 11, 1, 2), r(18, 11, 1, 2), r(14, 15, 4, 1)),
      S(g1, path(union(32, topOf(32, 11), r(9, 8, 2, 10), r(21, 8, 2, 10)), 32)),
      F(ink, r(8, 7, 1, 11), r(23, 7, 1, 11), dot(9, 7), dot(22, 7), r(9, 18, 2, 1), r(21, 18, 2, 1))]),
  'profile/generic-female-3': portrait(n3,
    [F(ink, r(10, 2, 3, 3)), F(n2, dot(11, 3)), ...bust(16, gr2, [...look[16], hair(16, n2)])],
    [F(ink, circle(8, 17, 3)), S(n2, circle(6, 18, 4)), ...bust(32, gr2, [...look[32], hair(32, n2)])]),
  'profile/generic-neutral-1': portrait(g4,
    [...solid(16, b2, union(16, r(6, 2, 5, 1), r(5, 3, 7, 1), r(4, 4, 9, 7), shoulderMask(16, 10)), floor[16]),
      F(ink, r(6, 3, 5, 7)), S(a3, r(7, 4, 3, 5)), F(n2, r(7, 4, 3, 1)), F(ink, dot(7, 5), dot(9, 5), r(7, 7, 3, 1))],
    [...solid(32, b2, union(32, circle(20, 6, 3), r(6, 13, 20, 10), shoulderMask(32, 20)), floor[32]),
      F(ink, rr(10, 6, 12, 15, [2, 1])), S(a3, rr(11, 7, 10, 13, [1])),
      F(n2, r(11, 8, 10, 3), r(11, 11, 1, 4), r(20, 11, 1, 4)),
      F(ink, r(13, 12, 1, 2), r(18, 12, 1, 2), r(14, 17, 4, 1))]),
  'profile/generic-neutral-2': person(b4, white,
    [...look[16], hair(16, g2), F(ink, dot(7, 11), dot(9, 11), dot(8, 12))],
    [...look[32], hair(32, g2),
      F(ink, circle(5, 9, 4), circle(5, 14, 3), circle(5, 19, 4), circle(5, 8, 8), circle(5, 19, 8)),
      S(g2, circle(3, 10, 5), circle(3, 15, 4), circle(3, 20, 5), circle(3, 9, 9), circle(3, 20, 9)),
      F(ink, dot(12, 21), dot(19, 21), dot(13, 22), dot(18, 22), dot(14, 23), dot(17, 23), r(15, 24, 2, 1))]),
  'profile/generic-bot-1': portrait(a3,
    [...shoulders(16, g3, 10), ...botNeck[16], F(ink, dot(8, 2), r(5, 3, 7, 6)), S(b5, r(6, 4, 5, 4)), F(ink, dot(7, 5), dot(9, 5), r(7, 7, 3, 1))],
    [...shoulders(32, g3, 20), ...botNeck[32],
      F(ink, r(14, 3, 4, 3), r(15, 6, 2, 1), r(8, 7, 16, 12)), F(r3, r(15, 4, 2, 1)),
      S(b5, r(9, 8, 14, 10)), ...eyes32(11, 18, 11), F(ink, r(12, 15, 8, 1))]),
  'profile/generic-bot-2': portrait(p3,
    [...shoulders(16, g3, 10), ...botNeck[16], F(ink, r(4, 3, 9, 6), r(3, 5, 1, 2), r(13, 5, 1, 2)), S(g4, r(5, 4, 7, 4)), F(b3, r(6, 5, 5, 2))],
    [...shoulders(32, g3, 20), ...botNeck[32],
      F(ink, r(7, 5, 18, 14), r(4, 9, 3, 5), r(25, 9, 3, 5)), F(g3, r(5, 10, 1, 3), r(26, 10, 1, 3)),
      S(g4, r(8, 6, 16, 12)), F(ink, r(9, 9, 14, 5)), S(b3, r(10, 10, 12, 3)), F(white, dot(11, 11)),
      F(ink, r(12, 15, 2, 1), r(15, 15, 2, 1), r(18, 15, 2, 1))]),
  'profile/generic-cat-1': portrait(teal,
    [...shoulders(16, a3, 9), ...pointy(16, a3, a2), F(ink, dot(6, 6), dot(10, 6), dot(5, 7), dot(8, 7), dot(11, 7))],
    [...shoulders(32, a3, 20), F(r2, r(11, 21, 10, 1)), ...pointy(32, a3, a2), ...eyes32(10, 13), F(ink, r(15, 17, 2, 1), dot(14, 18), dot(17, 18), r(8, 16, 4, 1), r(8, 18, 4, 1), r(20, 16, 4, 1), r(20, 18, 4, 1))]),
  'profile/generic-cat-2': portrait(gr3,
    [...shoulders(16, g2, 9), ...pointy(16, g2, g3), F(white, r(7, 7, 3, 2)), F(gr3, dot(6, 6), dot(10, 6)), F(ink, dot(8, 7))],
    [...shoulders(32, g2, 20), ...pointy(32, g2, g3), ...solid(32, white, union(32, rr(12, 15, 8, 6, [1]))),
      F(gr3, r(10, 12, 3, 3), r(19, 12, 3, 3)), F(ink, r(11, 12, 1, 3), r(20, 12, 1, 3)),
      F(ink, r(15, 17, 2, 1), dot(14, 18), dot(17, 18), r(8, 16, 3, 1), r(8, 18, 3, 1), r(21, 16, 3, 1), r(21, 18, 3, 1))]),
  'profile/generic-dog-1': portrait(b4,
    [...shoulders(16, n3, 9), ...solid(16, n3, union(16, r(6, 3, 5, 1), r(5, 4, 7, 5), r(6, 9, 5, 1))),
      ...solid(16, n2, union(16, r(3, 4, 3, 6))), ...solid(16, n2, union(16, r(11, 4, 3, 6))),
      F(ink, dot(7, 5), dot(9, 5), dot(8, 7)), F(r3, dot(8, 8))],
    [...shoulders(32, n3, 19), ...solid(32, n3, union(32, rr(9, 5, 14, 15, [2, 1]))),
      ...solid(32, n2, union(32, rr(5, 7, 5, 12, [1]))), ...solid(32, n2, union(32, rr(22, 7, 5, 12, [1]))),
      ...eyes32(11, 18, 10), F(ink, r(14, 14, 4, 2), r(15, 16, 2, 1), dot(13, 17), dot(18, 17))]),
  'profile/generic-dog-2': portrait(a3,
    [...shoulders(16, g1, 9), ...solid(16, g1, pointyHead16), F(white, r(8, 5, 1, 2), r(7, 7, 3, 2)), F(ink, dot(6, 6), dot(10, 6), dot(8, 7))],
    [...shoulders(32, g1, 20), ...solid(32, g1, pointyHead32), F(white, r(15, 10, 2, 5)),
      ...solid(32, white, union(32, rr(12, 15, 8, 6, [1]))), ...eyes32(10, 19, 12),
      F(ink, r(15, 17, 2, 1), dot(14, 18), dot(17, 18))]),
  'profile/generic-bird-1': portrait(n3,
    [...shoulders(16, b3, 9), F(white, r(6, 11, 4, 3)), F(ink, dot(7, 2), dot(9, 2), circle(7, 5, 3)), S(b3, circle(5, 6, 4)),
      F(ink, dot(7, 5), dot(9, 5), dot(6, 7), dot(10, 7)), F(a2, r(7, 7, 3, 1), dot(8, 8))],
    [...shoulders(32, b3, 18), F(white, rr(11, 21, 10, 8, [2, 1])),
      F(ink, r(12, 3, 2, 2), r(15, 3, 2, 2), r(18, 3, 2, 2), circle(14, 9, 5)), S(b3, circle(12, 10, 6)),
      ...eyes32(11, 18, 9), ...solid(32, a2, union(32, rows(13, [[13, 6], [13, 6], [14, 4], [15, 2]])))]),
  'profile/generic-sun-1': portrait(b4,
    [F(a2, r(7, 2, 2, 2), r(7, 12, 2, 2), r(2, 7, 2, 2), r(12, 7, 2, 2), dot(3, 3), dot(12, 3), dot(3, 12), dot(12, 12)),
      F(ink, circle(8, 4, 4)), S(a3, circle(6, 5, 5)), F(ink, dot(6, 7), dot(9, 7), dot(6, 8), dot(9, 8), r(7, 9, 2, 1))],
    [...solid(32, a2, union(32, r(14, 3, 4, 6), r(14, 23, 4, 6), r(3, 14, 6, 4), r(23, 14, 6, 4), bar(5, 5, 1, 1), bar(24, 5, -1, 1), bar(5, 24, 1, -1), bar(24, 24, -1, -1))),
      F(ink, circle(16, 8, 8)), S(a3, circle(14, 9, 9)),
      F(ink, r(12, 13, 2, 2), r(18, 13, 2, 2), dot(11, 17), dot(12, 18), r(13, 19, 6, 1), dot(19, 18), dot(20, 17))]),
  'profile/generic-moon-1': portrait(b1,
    [...solid(16, a4, moon16), F(ink, dot(5, 6), dot(5, 9), r(6, 10, 2, 1)), F(white, dot(12, 3), dot(12, 11))],
    [...solid(32, a4, moon32), F(ink, r(9, 12, 2, 2), dot(8, 18), dot(9, 19), r(10, 20, 3, 1)),
      F(white, dot(25, 7), dot(24, 8), dot(26, 8), dot(25, 9), dot(26, 23), dot(22, 25))]),
  'profile/generic-system-1': portrait(b2,
    [...solid(16, g4, gear16), F(ink, r(6, 6, 4, 4)), F(b2, r(7, 7, 2, 2))],
    [...solid(32, g4, gear32), F(ink, circle(8, 12, 12)), F(b2, circle(6, 13, 13))]),
  'profile/generic-help-1': portrait(a3,
    [...solid(16, white, ask16)],
    [...solid(32, white, ask32)]),
}

write(process.argv[2], icons)
