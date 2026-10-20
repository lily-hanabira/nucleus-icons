// Mail icons: closed, send, reply, delete, open, attachment and urgent, plus the sysmonitor, notepad, colorpicker and theme apps
import { ink, g1, g3, g4, g5, g6, white, b2, b3, gr2, gr3, a3, r2, p2, n3, n4, r, circle, diag, S, F, S1, write, rasterise } from './lib.mjs'

// Pixel masks: the ink is the whole mask, the fill is the mask eroded by one pixel
const blank = size => new Uint8Array(size * size)
// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
// Mask of every pixel inside any of the paths
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Mask with the paths cleared
const cut = (m, size, ...paths) => {
  const out = new Uint8Array(m)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) out[i] = 0 })
  return out
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
// Columns x0 to x1 of a mask
const band = (m, size, x0, x1) => {
  const out = blank(size)
  for (const y of range(0, size)) for (const x of range(x0, x1 + 1)) out[y * size + x] = m[y * size + x]
  return out
}
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
// One pixel columns from [x, y, h]
const cols = pts => pts.map(([x, y, h]) => r(x, y, 1, h)).join('')
// Character grid to one pixel rects, # is set
const pix = (size, x0, y0, rows) => union(size, ...rows.flatMap((row, y) => [...row].map((c, x) => c === '#' ? r(x0 + x, y0 + y, 1, 1) : '').filter(Boolean)))

// Block arrow pointing right, as actions/next
const arrow = (size, fill, shaft, headX, headTop, headH, headCols) => {
  const parts = [shaft]
  for (const i of range(0, headCols)) parts.push(r(headX + i, headTop + i, 1, headH - 2 * i))
  const m = union(size, ...parts)
  const [, sy, , sh] = shaft.match(/M(\d+) (\d+)h(\d+)v(\d+)/).slice(1).map(Number)
  return [F(ink, path(m, size)), S(fill, path(erode(m, size), size)), F(ink, r(headX, sy, 1, 1), r(headX, sy + sh - 1, 1, 1))]
}

// Hook arrow pointing left, as actions/undo
const hook = (size, fill, { tip, cols: n, c0, c1, cx, cy, R, rr, bottom }) => {
  const m = blank(size)
  const set = (x, y) => { m[y * size + x] = 1 }
  for (const i of range(0, n)) for (const y of range(c0 - i, c1 + i + 1)) set(tip + i, y)
  const x0 = tip + n
  for (const y of range(0, size)) for (const x of range(x0, size)) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy)
    let on
    if (x < cx) on = y + 0.5 >= cy - R && y + 0.5 < cy - rr
    else if (y + 0.5 > cy) on = dx >= rr && dx < R && y <= bottom
    else on = d >= rr && d < R
    if (on) set(x, y)
  }
  const top = cy - R, bot = cy - rr - 1
  return [F(ink, path(m, size)), S(fill, path(erode(m, size), size)), F(ink, r(x0 - 1, top, 1, 1), r(x0 - 1, bot, 1, 1))]
}

// X mark with an ink outline, columns h tall stepping one pixel per column
const cross = (size, x0, y0, n, h) => union(size, diag(x0, y0, n, 1, 1, h), diag(x0, y0 + n - 1, n, 1, -1, h))

// Closed envelope
const envelope = {
  16: [
    F(ink, r(1, 3, 14, 10)),
    S(white, r(2, 4, 12, 8)),
    F(ink, diag(2, 4, 6, 1, 1, 1), diag(13, 4, 6, -1, 1, 1)),
  ],
  32: [
    F(ink, r(2, 6, 28, 20)),
    S(white, r(3, 7, 26, 18)),
    F(g5, diag(3, 8, 13, 1, 1, 1), diag(28, 8, 13, -1, 1, 1)),
    F(ink, diag(3, 7, 13, 1, 1, 1), diag(28, 7, 13, -1, 1, 1)),
  ],
}

// Open envelope: raised flap as an inverted V above the body, g3 inside, letter rising out over the body edge
const open = {
  16: [
    F(ink, diag(7, 1, 7, -1, 1, 1), diag(8, 1, 7, 1, 1, 1)),
    S(g3, ...range(0, 5).map(i => r(7 - i, 2 + i, 2 + 2 * i, 1))),
    F(ink, r(1, 7, 14, 6)),
    S(white, r(2, 8, 12, 4)),
    F(ink, r(6, 4, 4, 5)),
    S(white, r(7, 5, 2, 3)),
    F(g3, r(7, 5, 2, 1)),
  ],
  32: [
    F(ink, diag(14, 3, 13, -1, 1, 1), diag(17, 3, 13, 1, 1, 1), r(15, 2, 2, 1)),
    S(g3, ...range(0, 12).map(i => r(15 - i, 3 + i, 2 + 2 * i, 1))),
    F(ink, r(2, 15, 28, 11)),
    S(white, r(3, 16, 26, 9)),
    F(ink, r(10, 9, 12, 10)),
    S(white, r(11, 10, 10, 8)),
    F(g3, r(12, 11, 8, 2), r(12, 14, 5, 2)),
  ],
}

// Paperclip: one wire, outer loop whose left end stops short of the bottom, inner loop whose right end stops short of the top
const clip16 = pix(16, 7, 6, [
  '.#####.',
  '#.....#',
  '#.....#',
  '#.###.#',
  '#.#.#.#',
  '#.#.#.#',
  '..#.#.#',
  '..#...#',
  '...###.',
])
const clip32 = pix(32, 20, 13, [
  '.######.',
  '#......#',
  '#......#',
  '#......#',
  '#..##..#',
  '#.#..#.#',
  '#.#..#.#',
  '#.#..#.#',
  '#.#..#.#',
  '#.#..#.#',
  '..#..#.#',
  '..#..#.#',
  '..#....#',
  '..#....#',
  '...####.',
])

// Window frame from system/executable-generic, body colour varies
const frame = (body, big) => big
  ? [F(ink, r(1, 3, 30, 26)), S1(b3, r(2, 4, 28, 4)), F(g6, r(23, 5, 2, 2), r(26, 5, 2, 2)), S(body, r(2, 8, 28, 20))]
  : [F(ink, r(1, 1, 14, 14)), S(b2, r(2, 2, 12, 2)), S(body, r(2, 4, 12, 10))]

// Painter's palette: a blob of two circles with a thumb hole
const palette = (size, blob, hole) => {
  const m = cut(union(size, ...blob), size, hole)
  return [F(ink, path(m, size)), S(n4, path(erode(m, size), size))]
}
// Paint dab on the palette
const dab = (c, x, y) => [F(ink, circle(6, x, y)), S1(c, circle(4, x + 1, y + 1))]

// Paintbrush: a diagonal band, columns h tall, running from the handle end towards the tip.
// Segments are column index ranges into the interior
const brush = (size, x0, y0, n, dx, h, tip, segs) => {
  const m = union(size, diag(x0, y0, n, dx, -1, h))
  const inner = erode(m, size)
  const col = i => x0 + i * dx
  const seg = (a, b) => band(inner, size, Math.min(col(a), col(b)), Math.max(col(a), col(b)))
  return [
    F(ink, path(m, size)),
    S(n3, path(seg(...segs.handle), size)),
    S(g4, path(seg(...segs.ferrule), size)),
    S(tip, path(seg(...segs.tip), size)),
  ]
}

// Cross for mail delete at 32
const x32 = cross(32, 18, 15, 11, 5)

const icons = {
  'mail/closed': envelope,
  'mail/send': {
    16: [...envelope[16], ...arrow(16, gr2, r(7, 8, 3, 5), 10, 6, 9, 5)],
    32: [...envelope[32], ...arrow(32, gr2, r(17, 19, 6, 6), 23, 15, 14, 7)],
  },
  'mail/reply': {
    16: [...envelope[16], ...hook(16, b3, { tip: 1, cols: 3, c0: 9, c1: 10, cx: 5, cy: 13, R: 5, rr: 1, bottom: 14 })],
    32: [...envelope[32], ...hook(32, b3, { tip: 2, cols: 5, c0: 18, c1: 19, cx: 10, cy: 24, R: 7, rr: 2, bottom: 29 })],
  },
  'mail/delete': {
    16: [...envelope[16], F(r2, path(cross(16, 8, 6, 5, 2), 16))],
    32: [...envelope[32], F(ink, path(x32, 32)), S(r2, path(erode(x32, 32), 32))],
  },
  'mail/open': open,
  'mail/attachment': {
    16: [...envelope[16], F(white, r(8, 7, 5, 2), r(8, 9, 1, 3), r(12, 9, 1, 4), r(10, 10, 1, 3)), F(ink, path(clip16, 16))],
    32: [...envelope[32], F(white, r(21, 14, 6, 3), r(21, 17, 2, 1), r(25, 17, 2, 1), r(21, 18, 1, 5), r(23, 18, 2, 7), r(26, 18, 1, 8), r(23, 25, 3, 1)), F(ink, path(clip32, 32))],
  },
  'mail/urgent': {
    16: [...envelope[16], F(ink, circle(7, 8, 7)), S(r2, circle(5, 9, 8)), F(white, r(11, 8, 1, 2), r(11, 11, 1, 1))],
    32: [...envelope[32], F(ink, circle(12, 17, 15)), S(r2, circle(10, 18, 16)), F(white, r(22, 17, 2, 5), r(22, 23, 2, 2))],
  },
  'apps/sysmonitor': {
    16: [
      ...frame(g1, false),
      F(gr3, cols([[3, 9, 1], [4, 9, 1], [5, 9, 1], [6, 7, 2], [7, 5, 2], [8, 6, 3], [9, 9, 2], [10, 11, 1], [11, 10, 1], [12, 9, 1]])),
    ],
    32: [
      ...frame(g1, true),
      F(gr3, r(4, 18, 6, 2), cols([[10, 16, 4], [11, 13, 4], [12, 10, 4], [13, 9, 3], [14, 10, 4], [15, 13, 4], [16, 16, 4], [17, 19, 4], [18, 22, 4], [19, 21, 3], [20, 19, 3], [21, 18, 2]]), r(22, 18, 6, 2)),
    ],
  },
  'apps/notepad': {
    16: [
      ...frame(white, false),
      F(g3, r(4, 6, 7, 1), r(4, 8, 5, 1), r(4, 10, 7, 1), r(4, 12, 3, 1)),
    ],
    32: [
      ...frame(white, true),
      F(g3, r(5, 11, 16, 2), r(5, 15, 12, 2), r(5, 19, 18, 2), r(5, 23, 8, 2)),
      F(ink, r(14, 22, 1, 4)),
    ],
  },
  'apps/colorpicker': {
    16: [
      ...palette(16, [circle(12, 1, 1), circle(10, 4, 4)], r(10, 9, 2, 2)),
      F(r2, r(3, 6, 2, 2)),
      F(a3, r(6, 3, 2, 2)),
      F(b3, r(9, 5, 2, 2)),
      F(gr2, r(5, 10, 2, 2)),
    ],
    32: [
      ...palette(32, [circle(24, 3, 3), circle(18, 11, 11)], r(21, 20, 4, 4)),
      ...dab(r2, 6, 9),
      ...dab(a3, 11, 5),
      ...dab(gr2, 17, 7),
      ...dab(b3, 6, 16),
      ...dab(p2, 12, 19),
    ],
  },
  'apps/theme': {
    16: brush(16, 2, 11, 11, 1, 4, r2, { handle: [1, 4], ferrule: [6, 7], tip: [8, 9] }),
    32: [
      ...brush(32, 4, 25, 24, 1, 5, b3, { handle: [1, 13], ferrule: [15, 17], tip: [19, 22] }),
      ...brush(32, 27, 25, 24, -1, 5, r2, { handle: [1, 13], ferrule: [15, 17], tip: [19, 22] }),
    ],
  },
}

write(process.argv[2], icons)
