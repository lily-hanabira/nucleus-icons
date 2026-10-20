// Science data icons: waveform, spectrum, oscilloscope, sigma, integral, and the badged beaker and data variants
import { ink, g1, g2, g3, g4, g5, g6, white, b3, b4, b5, gr2, gr3, a3, r2, p2, n3, r, circle, diag, S, F, H, write, page, rasterise } from './lib.mjs'

// Empty mask
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
// Path of the union of paths, so overlaps fill solid
const solid = (size, ...paths) => path(union(size, ...paths), size)
// Character grid to one pixel rects, # is set
const pix = (x0, y0, rows) => rows.flatMap((row, y) => [...row].map((c, x) => c === '#' ? r(x0 + x, y0 + y, 1, 1) : '').filter(Boolean)).join('')

// Sampled curve: one column per x, columns joined by vertical runs, t pixels thick
const trace = (size, x0, x1, fn, t) => {
  const out = []
  let prev = null
  for (const x of range(x0, x1 + 1)) {
    const y = Math.round(fn(x))
    const lo = prev === null ? y : Math.min(prev, y), hi = prev === null ? y : Math.max(prev, y)
    out.push(r(x, lo, 1, hi - lo + t))
    prev = y
  }
  return solid(size, ...out)
}
// Sine curve sampler across x0 to x1
const sine = (x0, x1, cy, amp, periods = 1) => x => cy - amp * Math.sin(2 * Math.PI * periods * (x - x0) / (x1 - x0 + 1))

// Block arrow pointing right, as editor/export
const arrow = (size, fill, shaft, headX, headTop, headH, headCols) => {
  const parts = [shaft]
  for (const i of range(0, headCols)) parts.push(r(headX + i, headTop + i, 1, headH - 2 * i))
  const m = union(size, ...parts)
  const [, sy, , sh] = shaft.match(/M(\d+) (\d+)h(\d+)v(\d+)/).slice(1).map(Number)
  return [F(ink, path(m, size)), S(fill, path(erode(m, size), size)), F(ink, r(headX, sy, 1, 1), r(headX, sy + sh - 1, 1, 1))]
}

// Spectrum bars with shared ink outlines sitting on a baseline
const bars16 = (x0, tops) => {
  const colours = [r2, a3, gr2, b3, p2]
  const layers = []
  tops.forEach((top, i) => {
    const x = x0 + i * 2
    layers.push(F(ink, r(x, top, 3, 14 - top)))
  })
  tops.forEach((top, i) => layers.push(F(colours[i], r(x0 + 1 + i * 2, top + 1, 1, 12 - top))))
  return layers
}
const bars32 = (x0, tops) => {
  const colours = [r2, a3, gr2, b3, p2]
  const layers = []
  tops.forEach((top, i) => layers.push(F(ink, r(x0 + i * 5, top, 6, 30 - top))))
  tops.forEach((top, i) => layers.push(S(colours[i], r(x0 + 1 + i * 5, top + 1, 4, 28 - top))))
  return layers
}

// Graduated beaker: open top, pouring lip upper left, ticks right, liquid in the lower half
const beaker = {
  16: [
    F(ink, r(4, 3, 1, 12), r(12, 2, 1, 13), r(4, 14, 9, 1), r(2, 2, 3, 1)),
    S(g6, r(5, 2, 7, 12)),
    S(b4, r(5, 8, 7, 6)),
    F(white, r(6, 9, 1, 1)),
    F(ink, r(10, 3, 2, 1), r(10, 5, 2, 1), r(10, 7, 2, 1)),
  ],
  32: [
    F(ink, r(8, 5, 1, 25), r(24, 4, 1, 26), r(8, 29, 17, 1), r(5, 4, 4, 1), r(5, 3, 1, 1)),
    S(g6, r(9, 4, 15, 25)),
    S(b4, r(9, 17, 15, 12)),
    F(white, r(11, 19, 1, 2)),
    F(ink, r(20, 7, 4, 1), r(20, 11, 4, 1), r(20, 15, 4, 1)),
  ],
}

// Data object: page with a three column table, b4 header over a b5 body
const data = {
  16: [
    ...page[16],
    F(g3, r(5, 3, 4, 1)),
    F(ink, r(3, 5, 10, 8)),
    S(b5, r(4, 6, 8, 6)),
    S(b4, r(4, 6, 8, 2)),
    F(ink, r(4, 8, 8, 1), r(6, 6, 1, 6), r(9, 6, 1, 6)),
  ],
  32: [
    ...page[32],
    F(g3, r(10, 6, 7, 2)),
    F(ink, r(6, 10, 20, 18)),
    S(b5, r(7, 11, 18, 16)),
    S(b4, r(7, 11, 18, 3)),
    F(ink, r(7, 14, 18, 1), r(7, 18, 18, 1), r(7, 22, 18, 1), r(12, 11, 1, 16), r(19, 11, 1, 16)),
  ],
}

// Badge: white disc with an ink rim in the lower right, then the mark
const disc = {
  16: [F(ink, circle(7, 8, 8)), S(white, circle(5, 9, 9))],
  32: [F(ink, circle(12, 18, 18)), S(white, circle(10, 19, 19))],
}
// OS marks drawn inside the badge
const marks = {
  new: {
    16: [F(gr2, r(11, 10, 1, 3), r(10, 11, 3, 1))],
    32: [F(gr2, r(23, 21, 2, 6), r(21, 23, 6, 2))],
  },
  delete: {
    16: [F(r2, diag(10, 10, 3, 1, 1, 1), r(12, 10, 1, 1), r(10, 12, 1, 1))],
    32: [F(r2, solid(32, diag(21, 20, 6, 1, 1, 2), diag(21, 25, 6, 1, -1, 2)))],
  },
  view: {
    16: [F(ink, circle(4, 9, 9), r(13, 13, 1, 1)), F(b5, r(10, 10, 2, 2)), F(white, r(10, 10, 1, 1))],
    32: [F(ink, circle(6, 19, 19), diag(24, 24, 3, 1, 1, 2)), S(b5, circle(4, 20, 20)), F(white, r(21, 21, 1, 1))],
  },
  edit: {
    16: [F(ink, r(12, 9, 1, 1)), F(n3, r(11, 10, 2, 1), r(10, 11, 2, 1)), F(r2, r(9, 12, 1, 1), r(10, 12, 1, 1))],
    32: [
      F(ink, diag(20, 25, 7, 1, -1, 3)),
      F(n3, diag(22, 23, 3, 1, -1, 3)),
      F(g4, r(25, 20, 1, 3), r(26, 19, 1, 3)),
      F(r2, r(21, 24, 1, 1), r(21, 25, 1, 1), r(20, 26, 1, 1)),
    ],
  },
  export: {
    16: [F(gr2, r(10, 11, 2, 1), r(12, 10, 1, 3), r(13, 11, 1, 1))],
    32: arrow(32, gr2, r(20, 22, 4, 4), 24, 20, 8, 4),
  },
}
// Body with a badge of the given kind
const badged = (body, kind) => ({
  16: [...body[16], ...disc[16], ...marks[kind][16]],
  32: [...body[32], ...disc[32], ...marks[kind][32]],
})

// Sigma and integral glyph grids
const sigma16 = pix(3, 2, [
  '##########',
  '##........',
  '.##.......',
  '..##......',
  '...##.....',
  '....##....',
  '...##.....',
  '..##......',
  '.##.......',
  '##........',
  '##########',
])
const sigma32 = pix(6, 4, [
  '####################',
  '####################',
  '####################',
  '###...............##',
  '.###..............##',
  '..###...............',
  '...###..............',
  '....###.............',
  '.....###............',
  '......###...........',
  '.......###..........',
  '........###.........',
  '........###.........',
  '.......###..........',
  '......###...........',
  '.....###............',
  '....###.............',
  '...###..............',
  '..###...............',
  '.###..............##',
  '###...............##',
  '####################',
  '####################',
  '####################',
])
const integral16 = pix(5, 1, [
  '...###',
  '..##.#',
  '..##..',
  '..##..',
  '..##..',
  '..##..',
  '..##..',
  '..##..',
  '..##..',
  '..##..',
  '..##..',
  '..##..',
  '#.##..',
  '###...',
])
const integral32 = pix(10, 3, [
  '......#####.',
  '.....#######',
  '.....#######',
  '.....###.###',
  '.....###..##',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '.....###....',
  '##..###.....',
  '###.###.....',
  '#######.....',
  '#######.....',
  '.#####......',
])

const icons = {
  'science/waveform': {
    16: [F(g4, r(1, 8, 14, 1)), H(b3, trace(16, 1, 14, sine(1, 14, 8, 4), 1))],
    32: [F(g4, r(2, 16, 28, 1)), H(b3, trace(32, 2, 29, sine(2, 29, 15, 9), 2))],
  },
  'science/spectrum': {
    16: [...bars16(2, [6, 9, 3, 11, 8]), F(ink, r(1, 14, 14, 1))],
    32: [...bars32(3, [12, 18, 6, 22, 15]), F(ink, r(2, 29, 28, 1))],
  },
  'science/oscilloscope': {
    16: [
      F(ink, r(1, 1, 14, 14)),
      S(g4, r(2, 2, 12, 12)),
      F(ink, r(2, 2, 12, 9)),
      F(g1, r(3, 3, 10, 7)),
      F(gr3, trace(16, 3, 12, sine(3, 12, 6, 2), 1)),
      F(ink, r(4, 12, 2, 2), r(10, 12, 2, 2)),
    ],
    32: [
      F(ink, r(2, 2, 28, 28)),
      S(g4, r(3, 3, 26, 26)),
      F(ink, r(4, 4, 24, 18)),
      F(g1, r(5, 5, 22, 16)),
      F(g2, r(5, 13, 22, 1), r(16, 5, 1, 16)),
      F(gr3, trace(32, 5, 26, sine(5, 26, 12, 5), 2)),
      F(ink, circle(5, 7, 23), circle(5, 15, 23)),
      F(g5, r(9, 24, 1, 1), r(17, 24, 1, 1)),
      F(gr3, r(24, 24, 2, 2)),
      F(ink, r(24, 24, 2, 1)),
    ],
  },
  'science/sigma': { 16: [H(ink, sigma16)], 32: [H(ink, sigma32)] },
  'science/integral': { 16: [H(ink, integral16)], 32: [H(ink, integral32)] },
  'science/beaker': beaker,
  'science/beaker-new': badged(beaker, 'new'),
  'science/beaker-edit': badged(beaker, 'edit'),
  'science/beaker-view': badged(beaker, 'view'),
  'science/beaker-delete': badged(beaker, 'delete'),
  'science/beaker-export': badged(beaker, 'export'),
  'science/data-new': badged(data, 'new'),
  'science/data-delete': badged(data, 'delete'),
  'science/data-view': badged(data, 'view'),
  'science/data-edit': badged(data, 'edit'),
  'science/data-export': badged(data, 'export'),
}

write(process.argv[2], icons)
