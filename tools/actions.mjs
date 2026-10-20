// Action icons: next, previous, undo, redo, cut, copy and paste
import { ink, g3, g4, g5, white, b3, gr2, n2, r, circle, diag, S, F, S1, write, rasterise } from './lib.mjs'

// Pixel masks: silhouettes are built as masks, the ink is the whole mask and the fill is the mask eroded by one pixel
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
const blank = size => new Uint8Array(size * size)
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
// Mirror a mask left to right
const flipX = (m, size) => {
  const out = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) out[y * size + size - 1 - x] = m[y * size + x]
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
// Mirror layers left to right
const mirror = (size, layers) => layers.map(l => ({ ...l, d: path(flipX(rasterise(l.d, size), size), size) }))

// Block arrow pointing right: rectangular shaft, 45 degree head. corners square off the shaft to head joint
const arrow = (size, shaft, headX, headTop, headH, headCols) => {
  const parts = [shaft]
  for (const i of range(0, headCols)) parts.push(r(headX + i, headTop + i, 1, headH - 2 * i))
  const m = union(size, ...parts)
  const [, sy, , sh] = shaft.match(/M(\d+) (\d+)h(\d+)v(\d+)/).slice(1).map(Number)
  return [F(ink, path(m, size)), S(gr2, path(erode(m, size), size)), F(ink, r(headX, sy, 1, 1), r(headX, sy + sh - 1, 1, 1))]
}

// Hook arrow: head pointing left, band runs right then bends down around (cx, cy) with outer radius R and inner radius rr
const hook = (size, { tip, cols, c0, c1, cx, cy, R, rr, bottom }) => {
  const m = blank(size)
  const set = (x, y) => { m[y * size + x] = 1 }
  for (const i of range(0, cols)) for (const y of range(c0 - i, c1 + i + 1)) set(tip + i, y)
  const x0 = tip + cols
  for (const y of range(0, size)) for (const x of range(x0, size)) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, d = Math.hypot(dx, dy)
    let on
    if (x < cx) on = y + 0.5 >= cy - R && y + 0.5 < cy - rr
    else if (y + 0.5 > cy) on = dx >= rr && dx < R && y <= bottom
    else on = d >= rr && d < R
    if (on) set(x, y)
  }
  const top = cy - R, bot = cy - rr - 1
  return [F(ink, path(m, size)), S(b3, path(erode(m, size), size)), F(ink, r(x0 - 1, top, 1, 1), r(x0 - 1, bot, 1, 1))]
}

// Page body at any size. big adds the crease lines of the 32 page
const pageBody = (x, y, w, h, f, big) => {
  const fx = x + w - f - 1
  const layers = [
    F(ink, `M${x} ${y}h${w - f}` + 'v1h1'.repeat(f) + `v${h - f}h-${w}z`),
    S(white, `M${x + 1} ${y + 1}h${w - f - 2}` + 'v1h1'.repeat(f) + `v${h - 2 - f}h-${w - 2}z`),
  ]
  if (big) {
    layers.push(S1(g5, `M${fx} ${y + 2}` + 'h1v1'.repeat(f) + `h-${f}z`))
    layers.push(F(ink, r(fx, y + 2, 1, f), r(fx, y + 1 + f, f + 1, 1)))
  } else layers.push(F(g5, `M${fx} ${y + 1}` + 'h1v1'.repeat(f) + `h-${f}z`))
  return layers
}

// Right arrow, mirrored for previous
const next = {
  16: arrow(16, r(1, 5, 8, 6), 9, 2, 12, 6),
  32: arrow(32, r(2, 11, 16, 10), 18, 4, 24, 12),
}
// Undo hook, mirrored for redo
const undo = {
  16: hook(16, { tip: 1, cols: 5, c0: 5, c1: 5, cx: 8, cy: 9, R: 6, rr: 1, bottom: 14 }),
  32: hook(32, { tip: 2, cols: 7, c0: 9, c1: 10, cx: 16, cy: 18, R: 12, rr: 4, bottom: 29 }),
}

// Scissor blades and handle rings at 32
const blades32 = union(32, diag(4, 2, 12, 1, 1, 4), diag(27, 2, 12, -1, 1, 4))
const ring32 = (ox, oy) => [
  F(ink, circle(10, ox, oy) + circle(2, ox + 4, oy + 4)),
  S(g4, circle(8, ox + 1, oy + 1) + circle(4, ox + 3, oy + 3)),
]

const icons = {
  'actions/next': next,
  'actions/previous': { 16: mirror(16, next[16]), 32: mirror(32, next[32]) },
  'actions/undo': undo,
  'actions/redo': { 16: mirror(16, undo[16]), 32: mirror(32, undo[32]) },
  'actions/cut': {
    16: [
      F(ink, diag(2, 1, 6, 1, 1, 3), diag(13, 1, 6, -1, 1, 3), r(7, 9, 2, 1), diag(6, 10, 2, -1, 1, 1), diag(9, 10, 2, 1, 1, 1)),
      F(g4, diag(3, 3, 4, 1, 1, 1), diag(12, 3, 4, -1, 1, 1)),
      F(ink, circle(4, 2, 11) + r(3, 12, 2, 2), circle(4, 10, 11) + r(11, 12, 2, 2)),
    ],
    32: [
      F(ink, path(blades32, 32), diag(14, 17, 3, -1, 1, 2), diag(17, 17, 3, 1, 1, 2)),
      S(g4, path(erode(blades32, 32), 32)),
      F(ink, r(15, 14, 2, 2)),
      ...ring32(5, 19),
      ...ring32(17, 19),
    ],
  },
  'actions/copy': {
    16: [
      ...pageBody(1, 1, 9, 11, 3),
      ...pageBody(6, 4, 9, 11, 3),
      F(g3, r(8, 8, 5, 1), r(8, 10, 5, 1), r(8, 12, 3, 1)),
    ],
    32: [
      ...pageBody(2, 2, 18, 23, 5, true),
      ...pageBody(12, 7, 18, 23, 5, true),
      F(g3, r(15, 16, 12, 2), r(15, 20, 12, 2), r(15, 24, 8, 2)),
    ],
  },
  'actions/paste': {
    16: [
      F(ink, r(1, 2, 10, 13)),
      S(n2, r(2, 3, 8, 11)),
      S(white, r(3, 5, 6, 8)),
      F(ink, r(3, 1, 6, 3)),
      F(g3, r(4, 2, 4, 1)),
      ...pageBody(7, 6, 8, 9, 3),
    ],
    32: [
      F(ink, r(2, 4, 19, 26)),
      S(n2, r(3, 5, 17, 24)),
      S(white, r(5, 9, 13, 18)),
      F(ink, r(7, 2, 9, 5)),
      S1(g3, r(8, 3, 7, 3)),
      ...pageBody(14, 11, 16, 19, 5, true),
    ],
  },
}

write(process.argv[2], icons)
