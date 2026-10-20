// Editor document icons: charts and tables, column add and remove, formatting, goto, new, export, render and find replace,
// plus the control play, pause and find glyphs
import { ink, g3, g4, white, b2, b3, b4, b5, gr2, gr3, a3, r2, r4, n3, r, circle, diag, S, F, H, write, page, rasterise } from './lib.mjs'

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
// Path of the union of paths, so overlaps fill solid
const solid = (size, ...paths) => path(union(size, ...paths), size)
// Character grid to one pixel rects, # is set
const pix = (x0, y0, rows) => rows.flatMap((row, y) => [...row].map((c, x) => c === '#' ? r(x0 + x, y0 + y, 1, 1) : '').filter(Boolean)).join('')

// Block arrow pointing right, as actions/next
const arrow = (size, fill, shaft, headX, headTop, headH, headCols) => {
  const parts = [shaft]
  for (const i of range(0, headCols)) parts.push(r(headX + i, headTop + i, 1, headH - 2 * i))
  const m = union(size, ...parts)
  const [, sy, , sh] = shaft.match(/M(\d+) (\d+)h(\d+)v(\d+)/).slice(1).map(Number)
  return [F(ink, path(m, size)), S(fill, path(erode(m, size), size)), F(ink, r(headX, sy, 1, 1), r(headX, sy + sh - 1, 1, 1))]
}

// Paintbrush as apps/theme: a diagonal band of columns h tall from the handle end to the tip
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

// Polyline through integer vertices, t pixels thick, columns joined by vertical runs
const polyline = (size, pts, t) => {
  const out = []
  for (const k of range(0, pts.length - 1)) {
    const [x0, y0] = pts[k], [x1, y1] = pts[k + 1]
    let prev = y0
    for (const x of range(x0, x1 + 1)) {
      const y = Math.round(y0 + ((y1 - y0) * (x - x0)) / (x1 - x0))
      const lo = Math.min(prev, y), hi = Math.max(prev, y)
      out.push(r(x, lo, t, hi - lo + t))
      prev = y
    }
  }
  return solid(size, ...out)
}

// Right pointing wedge: column groups step wide, each group two rows shorter than the last
const wedge = (size, x0, top, h, step) => {
  const parts = []
  for (const j of range(0, h / 2)) parts.push(r(x0 + step * j, top + j, step, h - 2 * j))
  const m = union(size, ...parts)
  return [F(ink, path(m, size)), S(gr2, path(erode(m, size), size))]
}

// Chart area: white bevelled surface in an ink frame with ink axes
const area = {
  16: [F(ink, r(1, 1, 14, 14)), S(white, r(2, 2, 12, 12)), F(ink, r(3, 3, 1, 10), r(3, 12, 10, 1))],
  32: [F(ink, r(2, 2, 28, 28)), S(white, r(3, 3, 26, 26)), F(ink, r(5, 5, 2, 22), r(5, 25, 23, 2))],
}
// Chart bar from top down to the axis
const bar16 = (fill, x, top) => [F(ink, r(x, top, 3, 13 - top)), F(fill, r(x + 1, top + 1, 1, 11 - top))]
const bar32 = (fill, x, top) => [F(ink, r(x, top, 6, 25 - top)), S(fill, r(x + 1, top + 1, 4, 23 - top))]

// Table grid: frame, white body, b5 header, two column and two row rules. y is the frame top, h the frame height
const table = (size, y, h, head, rows, colsAt, extra = []) => {
  const w = size === 16 ? 14 : 28, x = size === 16 ? 1 : 2
  return [
    F(ink, r(x, y, w, h)),
    S(white, r(x + 1, y + 1, w - 2, h - 2)),
    S(b5, r(x + 1, y + 1, w - 2, head)),
    ...extra,
    F(ink, ...rows.map(ry => r(x + 1, ry, w - 2, 1)), ...colsAt.map(cx => r(cx, y + 1, 1, h - 2))),
  ]
}
// Table icon body
const plainTable = {
  16: table(16, 1, 14, 3, [5, 9], [5, 9]),
  32: table(32, 2, 28, 6, [9, 19], [11, 20]),
}
// Table with one highlighted column
const columnTable = fill => ({
  16: table(16, 5, 10, 2, [8, 11], [5, 9], [F(fill, r(6, 6, 3, 8))]),
  32: table(32, 9, 21, 5, [15, 22], [11, 20], [F(fill, r(12, 10, 8, 19))]),
})

// Magnifying glass glyph
const magnifier = {
  16: [H(ink, circle(8, 1, 1), diag(8, 8, 3, 1, 1, 2)), S(b5, circle(6, 2, 2)), F(white, r(3, 3, 1, 1))],
  32: [H(ink, circle(14, 2, 3), diag(15, 15, 4, 1, 1, 3)), S(b5, circle(12, 3, 4)), F(white, r(6, 7, 1, 1))],
}

// Letters for find replace
const letterA32 = pix(5, 7, [
  '.######.',
  '......##',
  '.#######',
  '##....##',
  '##....##',
  '.#######',
])
const letterB32 = pix(23, 4, [
  '##.....',
  '##.....',
  '##.....',
  '##.....',
  '######.',
  '#######',
  '##...##',
  '##...##',
  '#######',
  '######.',
])

const icons = {
  'editor/chart-bar': {
    16: [...area[16], ...bar16(b3, 4, 7), ...bar16(gr2, 7, 4), ...bar16(a3, 10, 9)],
    32: [...area[32], ...bar32(b3, 8, 12), ...bar32(gr2, 15, 7), ...bar32(a3, 22, 16)],
  },
  'editor/chart-line': {
    16: [...area[16], F(b3, polyline(16, [[4, 10], [6, 7], [8, 9], [12, 4]], 1))],
    32: [
      ...area[32],
      F(b3, polyline(32, [[8, 21], [13, 14], [17, 18], [25, 7]], 2)),
      F(b2, r(7, 20, 4, 4), r(12, 13, 4, 4), r(16, 17, 4, 4), r(24, 6, 4, 4)),
    ],
  },
  'editor/chart-table': plainTable,
  'editor/add-column': {
    16: [...columnTable(gr3)[16], H(gr2, r(7, 1, 1, 1), r(6, 2, 3, 1), r(7, 3, 1, 1))],
    32: [...columnTable(gr3)[32], H(gr2, r(15, 2, 2, 2), r(13, 4, 6, 2), r(15, 6, 2, 2))],
  },
  'editor/remove-column': {
    16: [...columnTable(r4)[16], H(r2, r(6, 2, 3, 1))],
    32: [...columnTable(r4)[32], H(r2, r(13, 4, 6, 2))],
  },
  'editor/formatting': {
    16: brush(16, 2, 11, 11, 1, 4, b3, { handle: [1, 4], ferrule: [6, 7], tip: [8, 9] }),
    32: [
      ...brush(32, 2, 24, 18, 1, 5, b3, { handle: [1, 9], ferrule: [11, 12], tip: [14, 16] }),
      H(ink, pix(19, 17, [
        '....##....',
        '...####...',
        '..##..##..',
        '..##..##..',
        '.##....##.',
        '.##....##.',
        '.########.',
        '.########.',
        '##......##',
        '##......##',
        '##......##',
        '##......##',
      ])),
    ],
  },
  'editor/goto': {
    16: [
      ...page[16],
      F(g3, r(5, 4, 6, 1), r(5, 6, 6, 1), r(9, 8, 2, 1), r(5, 10, 6, 1), r(5, 12, 6, 1)),
      ...arrow(16, gr2, r(1, 7, 5, 3), 6, 6, 5, 3),
    ],
    32: [
      ...page[32],
      F(g3, r(10, 11, 12, 2), r(10, 15, 12, 2), r(20, 19, 2, 2), r(10, 23, 12, 2)),
      ...arrow(32, gr2, r(2, 17, 10, 6), 12, 13, 14, 7),
    ],
  },
  'editor/new': {
    16: [
      ...page[16],
      F(g3, r(5, 5, 6, 1), r(5, 7, 4, 1)),
      F(ink, r(8, 8, 7, 7)),
      S(gr2, r(9, 9, 5, 5)),
      F(white, r(11, 10, 1, 1), r(10, 11, 3, 1), r(11, 12, 1, 1)),
    ],
    32: [
      ...page[32],
      F(g3, r(10, 12, 12, 2), r(10, 16, 8, 2)),
      F(ink, r(18, 18, 12, 12)),
      S(gr2, r(19, 19, 10, 10)),
      F(white, r(23, 21, 2, 2), r(21, 23, 6, 2), r(23, 25, 2, 2)),
    ],
  },
  'editor/export': {
    16: [
      ...page[16],
      F(g3, r(5, 4, 6, 1), r(5, 12, 6, 1)),
      ...arrow(16, gr2, r(6, 7, 5, 3), 11, 5, 7, 4),
    ],
    32: [
      ...page[32],
      F(g3, r(10, 8, 8, 2), r(10, 23, 12, 2)),
      ...arrow(32, gr2, r(11, 14, 11, 6), 22, 10, 14, 7),
    ],
  },
  'editor/render': {
    16: [
      ...page[16],
      F(g3, r(5, 4, 6, 1)),
      F(ink, r(4, 6, 8, 7)),
      F(b4, r(5, 7, 6, 5)),
      F(gr3, r(6, 10, 3, 1), r(5, 11, 6, 1)),
      F(a3, r(9, 8, 1, 1)),
    ],
    32: [
      ...page[32],
      F(g3, r(10, 10, 12, 2)),
      F(ink, r(8, 14, 16, 13)),
      S(b4, r(9, 15, 14, 11)),
      F(gr3, r(13, 20, 4, 1), r(12, 21, 6, 1), r(11, 22, 8, 1), r(9, 23, 14, 3)),
      F(a3, circle(4, 17, 16)),
    ],
  },
  'editor/find-replace': {
    16: [
      ...magnifier[16],
      H(ink, pix(12, 2, ['.##', '#.#', '.##']), pix(12, 9, ['#..', '#..', '###', '#.#', '###'])),
    ],
    32: [
      ...magnifier[32],
      F(ink, letterA32),
      H(b3, r(17, 9, 2, 2), r(19, 7, 1, 6), r(20, 8, 1, 4), r(21, 9, 1, 2)),
      H(ink, letterB32),
    ],
  },
  'control/play': {
    16: wedge(16, 5, 2, 12, 1),
    32: wedge(32, 4, 4, 24, 2),
  },
  'control/pause': {
    16: [F(ink, r(3, 2, 4, 12), r(9, 2, 4, 12)), S(gr2, r(4, 3, 2, 10), r(10, 3, 2, 10))],
    32: [F(ink, r(6, 4, 8, 24), r(18, 4, 8, 24)), S(gr2, r(7, 5, 6, 22), r(19, 5, 6, 22))],
  },
  'control/find': {
    16: [H(ink, circle(10, 1, 1), diag(10, 10, 4, 1, 1, 2)), S(b5, circle(8, 2, 2)), F(white, r(4, 4, 1, 1))],
    32: [H(ink, circle(18, 4, 4), solid(32, ...range(0, 5).map(i => r(19 + i, 19 + i, 2, 3)))), S(b5, circle(16, 5, 5)), F(white, r(9, 9, 2, 2))],
  },
}

write(process.argv[2], icons)
