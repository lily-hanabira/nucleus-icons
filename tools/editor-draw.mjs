// Editor drawing icons: bucket fill, line, shapes, line thickness and pattern, arrows, textbox and cursor
import { ink, g4, white, b3, gr2, r2, r, circle, tri, diag, S, F, H, write, rasterise } from './lib.mjs'

// Mask helpers: ink is the whole silhouette, fill is the silhouette eroded by one pixel
const blank = size => new Uint8Array(size * size)
// Mask of every pixel inside any of the paths
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Mask from a predicate over pixel coordinates
const pred = (size, f) => Uint8Array.from({ length: size * size }, (_, i) => f(i % size, Math.floor(i / size)) ? 1 : 0)
// Pixels of a mask whose four neighbours are all set
const erode = (m, size) => {
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  return pred(size, (x, y) => at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1))
}
// Pixels in the first mask and not the second
const sub = (a, b) => a.map((v, i) => v && !b[i] ? 1 : 0)
// Pixels in both masks
const both = (a, b) => a.map((v, i) => v && b[i] ? 1 : 0)
// Mask to a path of row runs
const path = (m, size) => {
  let d = ''
  Array.from({ length: size }).forEach((_, y) => {
    let x = 0
    while (x < size) {
      let w = 0
      while (x + w < size && m[y * size + x + w]) w++
      if (w) d += r(x, y, w, 1)
      x += w + 1
    }
  })
  return d
}
// Ink outline and bevelled fill from a mask
const outlined = (size, m, fill) => [F(ink, path(m, size)), S(fill, path(erode(m, size), size))]

// Character grid: X is ink, . is white, space is empty
const grid = (x0, y0, rows, flat) => {
  let inkD = '', whiteD = ''
  rows.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === 'X') inkD += r(x0 + i, y0 + j, 1, 1)
    if (c === '.') whiteD += r(x0 + i, y0 + j, 1, 1)
  }))
  return [F(ink, inkD), (flat ? F : S)(white, whiteD)]
}

// Paint bucket rotated 45 degrees, mouth facing lower right. s runs along the axis, t across it
const bucket = (size, cx, cy, Smax, T, rim, ring, drip, puddle) => {
  const s = (x, y) => x + y - cx - cy, t = (x, y) => x - y - cx + cy
  const body = pred(size, (x, y) => Math.abs(s(x, y)) <= Smax && Math.abs(t(x, y)) <= T)
  const inner = erode(body, size)
  const line = k => both(inner, pred(size, (x, y) => s(x, y) === k))
  const mouth = both(inner, pred(size, (x, y) => s(x, y) > rim))
  const handle = sub(union(size, circle(ring.d, ring.x, ring.y) + circle(ring.d - 2, ring.x + 1, ring.y + 1)), body)
  const layers = [
    H(ink, path(handle, size)),
    F(ink, path(body, size)),
    S(g4, path(inner, size)),
    F(ink, path(line(rim), size), path(line(-rim), size)),
    (size > 16 ? S : F)(b3, path(mouth, size)),
  ]
  if (puddle) layers.push(...outlined(size, union(size, ...puddle), b3))
  layers.push(F(ink, drip.ink), F(b3, drip.fill))
  return layers
}

// Diagonal block arrow along the x = y line. dir 1 points up right, -1 down left
const diagArrow = (size, fill, apex, head, tLo, w) => {
  const [ax, ay] = apex
  const sc = ax + ay
  const up = ay < ax
  const m = pred(size, (x, y) => {
    const s = x + y, t = up ? x - y : y - x
    const tHead = up ? ax - ay - head : ay - ax - head
    const inHead = t >= tHead && (up ? x <= ax && y >= ay : y <= ay && x >= ax)
    const inShaft = Math.abs(s - sc) <= w && t >= tLo && t <= tHead
    return inHead || inShaft
  })
  return outlined(size, m, fill)
}

// n dashes of len with gap between them along row y
const dashes = (y, h, x0, len, gap, n) => Array.from({ length: n }, (_, i) => r(x0 + i * (len + gap), y, len, h)).join('')

// Spilled paint under the bucket at 32
const puddle32 = [r(12, 25, 8, 1), r(9, 26, 14, 1), r(8, 27, 16, 1), r(9, 28, 14, 1), r(12, 29, 8, 1)]

// Arrow cursor grids
const cursor16 = [
  'X',
  'XX',
  'X.X',
  'X..X',
  'X...X',
  'X....X',
  'X.....X',
  'X......X',
  'X.......X',
  'X....XXXXX',
  'X.XX.X',
  'XX X.X',
  '    X.X',
  '    XXX',
]
const cursor32 = [
  'X',
  'XX',
  'X.X',
  'X..X',
  'X...X',
  'X....X',
  'X.....X',
  'X......X',
  'X.......X',
  'X........X',
  'X.........X',
  'X..........X',
  'X...........X',
  'X............X',
  'X.............X',
  'X.......XXXXXXXX',
  'X...X...X',
  'X..XX...X',
  'X.X  X...X',
  'XX   X...X',
  'X     X...X',
  '      X...X',
  '       X...X',
  '       X...X',
  '        X...X',
  '         XXXX',
]

// Letter A with 2px strokes at slope 2, legs from apex (ax, top) down h rows
const letterA32 = () => Array.from({ length: 14 }, (_, i) => {
  const k = Math.floor(i / 2)
  return r(15 - k, 9 + i, 2, 1) + r(15 + k, 9 + i, 2, 1)
}).join('') + r(12, 17, 8, 2)

const icons = {
  'editor/bucket-fill': {
    16: bucket(16, 6, 6, 6, 4, 3, { d: 6, x: 9, y: 1 }, { ink: r(6, 11, 3, 3), fill: r(7, 11, 1, 3) }),
    32: bucket(32, 13, 13, 11, 9, 6, { d: 10, x: 17, y: 3 }, { ink: r(13, 22, 4, 5), fill: r(14, 22, 2, 6) }, puddle32),
  },
  'editor/line': {
    16: [H(ink, diag(3, 11, 9, 1, -1, 1), r(2, 11, 2, 2), r(11, 2, 2, 2))],
    32: [H(ink, diag(7, 23, 18, 1, -1, 2), r(4, 24, 4, 4), r(24, 4, 4, 4))],
  },
  'editor/shapes': {
    16: [
      F(ink, r(1, 1, 8, 8)),
      S(b3, r(2, 2, 6, 6)),
      F(ink, circle(8, 7, 4)),
      S(r2, circle(6, 8, 5)),
      F(ink, tri(5, 8, 4, 1)),
      S(gr2, tri(5, 10, 3, 1)),
    ],
    32: [
      F(ink, r(2, 3, 14, 14)),
      S(b3, r(3, 4, 12, 12)),
      F(ink, circle(15, 13, 7)),
      S(r2, circle(13, 14, 8)),
      F(ink, tri(10, 15, 7)),
      S(gr2, tri(10, 17, 6, 1)),
    ],
  },
  'editor/line-thickness': {
    16: [H(ink, r(3, 3, 10, 1), r(3, 6, 10, 2), r(3, 10, 10, 3))],
    32: [H(ink, r(5, 5, 22, 1), r(5, 12, 22, 3), r(5, 21, 22, 5))],
  },
  'editor/line-pattern': {
    16: [H(ink, r(3, 3, 10, 1), dashes(7, 1, 3, 3, 1, 3), dashes(11, 1, 3, 1, 1, 6))],
    32: [H(ink, r(5, 7, 22, 2), dashes(15, 2, 5, 4, 2, 4), dashes(23, 2, 5, 2, 2, 6))],
  },
  'editor/arrows': {
    16: [
      ...diagArrow(16, gr2, [14, 1], 5, 1, 1),
      ...diagArrow(16, b3, [1, 14], 5, 1, 1),
    ],
    32: [
      ...diagArrow(32, gr2, [28, 3], 10, 2, 3),
      ...diagArrow(32, b3, [3, 28], 10, 2, 3),
    ],
  },
  'editor/textbox': {
    16: [
      H(ink, r(3, 3, 10, 10), r(2, 2, 1, 1), r(13, 2, 1, 1), r(2, 13, 1, 1), r(13, 13, 1, 1)),
      S(white, r(4, 4, 8, 8)),
      H(ink, r(7, 5, 2, 1), r(6, 6, 1, 2), r(9, 6, 1, 2), r(5, 8, 6, 1), r(5, 9, 1, 2), r(10, 9, 1, 2)),
    ],
    32: [
      H(ink, r(3, 4, 26, 24), r(2, 3, 3, 3), r(27, 3, 3, 3), r(2, 26, 3, 3), r(27, 26, 3, 3)),
      S(white, r(4, 5, 24, 22)),
      H(ink, letterA32()),
    ],
  },
  'editor/cursor': {
    16: grid(3, 1, cursor16, true),
    32: grid(8, 3, cursor32),
  },
}

write(process.argv[2], icons)
