// UI stencils: flat ink glyphs for window chrome and controls, arrows, chevrons, caption buttons, marks and grips
import { ink, r, circle, F, write, rasterise } from './lib.mjs'

// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)

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

// Union of parts minus union of holes, so overlapping rects never cancel
const shape = (size, parts, holes = []) => {
  const m = new Uint8Array(size * size)
  for (const d of parts) rasterise(d, size).forEach((v, i) => { if (v) m[i] = 1 })
  for (const d of holes) rasterise(d, size).forEach((v, i) => { if (v) m[i] = 0 })
  return path(m, size)
}

// Bitmap rows to rects, # is lit, scaled by k from ox, oy
const bits = (rows, ox, oy, k = 1) => {
  const out = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (row[x] === '#') {
        let w = 0
        while (row[x + w] === '#') w++
        out.push(r(ox + x * k, oy + y * k, w * k, k))
        x += w
      } else x++
    }
  })
  return out.join('')
}

// Single pixels at the points, 1 wide at 16 and 2 wide runs at 32
const dots = pts => pts.map(([x, y]) => r(x, y, 1, 1)).join('')
const runs = (pts, w) => pts.map(([x, y]) => r(x, y, w, 1)).join('')

// Glyph box is x4..12 at 16 and x7..24 at 32, both centred on the canvas
const B16 = 4, B32 = 7
const stencil = (d16, d32) => ({ 16: [F(ink, d16)], 32: [F(ink, d32)] })
// Same bitmap at both sizes, drawn at 1x then 2x
const scaled = rows => stencil(bits(rows, B16, B16), bits(rows, B32, B32, 2))

// Solid triangles: apex width 1 at 16 and 2 at 32, widening by two per row
const arrowRows16 = range(0, 4).map(i => [8 - i, 1 + 2 * i])
const arrowRows32 = range(0, 8).map(i => [15 - i, 2 + 2 * i])
const arrow = f => stencil(
  arrowRows16.map(([a, w], i) => f(a, w, i, 16)).join(''),
  arrowRows32.map(([a, w], i) => f(a, w, i, 32)).join(''),
)
// Open V strokes: one pixel per row at 16 and three pixel runs at 32 to match the 2px weight
const chev16 = range(0, 4), chev32 = range(0, 7)
const chevron = (p16, p32) => stencil(
  chev16.map(i => dots([[8 - i, p16(i)], [8 + i, p16(i)]])).join(''),
  chev32.map(i => runs([[13 - i, p32(i)], [16 + i, p32(i)]], 3)).join(''),
)
const chevronV = (p16, p32) => stencil(
  chev16.map(i => dots([[p16(i), 8 - i], [p16(i), 8 + i]])).join(''),
  chev32.map(i => r(p32(i), 13 - i, 1, 3) + r(p32(i), 16 + i, 1, 3)).join(''),
)

const icons = {
  'ui/arrow-up': arrow((a, w, i, s) => s === 16 ? r(a, 6 + i, w, 1) : r(a, 12 + i, w, 1)),
  'ui/arrow-down': arrow((a, w, i, s) => s === 16 ? r(a, 10 - i, w, 1) : r(a, 19 - i, w, 1)),
  'ui/arrow-left': arrow((a, w, i, s) => s === 16 ? r(6 + i, a, 1, w) : r(12 + i, a, 1, w)),
  'ui/arrow-right': arrow((a, w, i, s) => s === 16 ? r(10 - i, a, 1, w) : r(19 - i, a, 1, w)),
  'ui/chevron-up': chevron(i => 6 + i, i => 12 + i),
  'ui/chevron-down': chevron(i => 10 - i, i => 19 - i),
  'ui/chevron-left': chevronV(i => 6 + i, i => 12 + i),
  'ui/chevron-right': chevronV(i => 10 - i, i => 18 - i),

  // Caption buttons. Thick top edge is 2px at 16 and 3px at 32
  'ui/minimise': stencil(r(5, 11, 7, 2), r(9, 22, 14, 3)),
  'ui/maximise': stencil(
    shape(16, [r(4, 4, 9, 9)], [r(5, 6, 7, 6)]),
    shape(32, [r(7, 7, 18, 18)], [r(9, 10, 14, 13)]),
  ),
  'ui/restore': stencil(
    shape(16, [r(6, 4, 7, 7), r(4, 6, 7, 7)], [r(7, 6, 5, 4), r(4, 6, 7, 7)]) + shape(16, [r(4, 6, 7, 7)], [r(5, 8, 5, 4)]),
    shape(32, [r(13, 7, 12, 12)], [r(15, 10, 8, 7), r(7, 13, 12, 12)]) + shape(32, [r(7, 13, 12, 12)], [r(9, 16, 8, 7)]),
  ),
  'ui/close': stencil(
    range(0, 7).map(i => dots([[5 + i, 5 + i], [11 - i, 5 + i]])).join(''),
    shape(32, range(0, 13).map(i => runs([[8 + i, 9 + i], [21 - i, 9 + i]], 3))),
  ),

  'ui/menu': scaled([
    '.......',
    '#######',
    '.......',
    '.......',
    '#######',
    '.......',
    '.......',
    '#######',
  ].map(row => '.' + row)),
  'ui/check': stencil(
    dots([[4, 9], [5, 10], [6, 11], [7, 10], [8, 9], [9, 8], [10, 7], [11, 6], [12, 5]]),
    shape(32, [
      runs(range(0, 6).map(i => [8 + i, 15 + i]), 3),
      runs(range(1, 10).map(j => [13 + j, 20 - j]), 3),
    ]),
  ),
  'ui/radio': stencil(circle(7, 5, 5), circle(14, 9, 9)),
  'ui/plus': stencil(
    shape(16, [r(5, 8, 7, 1), r(8, 5, 1, 7)]),
    shape(32, [r(9, 15, 14, 2), r(15, 9, 2, 14)]),
  ),
  'ui/minus': stencil(r(5, 8, 7, 1), r(9, 15, 14, 2)),
  'ui/ellipsis': stencil(dots([[5, 8], [8, 8], [11, 8]]), bits(['#'], 9, 15, 2) + bits(['#'], 15, 15, 2) + bits(['#'], 21, 15, 2)),

  // Bold question mark
  'ui/help': scaled([
    '..#####..',
    '.##...##.',
    '.##...##.',
    '......##.',
    '....###..',
    '...##....',
    '...##....',
    '.........',
    '...##....',
  ]),
  // Push pin: head bar, body, flange and point
  'ui/pin': scaled([
    '.#######.',
    '...###...',
    '...###...',
    '...###...',
    '.#######.',
    '....#....',
    '....#....',
    '....#....',
    '.........',
  ]),
  // Ring with a short diagonal handle to the lower right
  'ui/search': stencil(
    bits([
      '..###....',
      '.#...#...',
      '#.....#..',
      '#.....#..',
      '#.....#..',
      '.#...#...',
      '..###.#..',
      '.......#.',
      '........#',
    ], B16, B16),
    shape(32, [circle(14, 7, 7), runs(range(0, 5).map(i => [19 + i, 19 + i]), 2)], [circle(10, 9, 9)]),
  ),
  // Resize grip: three stepped dot rows in the lower right
  'ui/grip': scaled([
    '.........',
    '.........',
    '.........',
    '.........',
    '........#',
    '.........',
    '......#.#',
    '.........',
    '....#.#.#',
  ]),
  // Drag handle: two columns of three dots
  'ui/drag': scaled([
    '.........',
    '..#...#..',
    '.........',
    '.........',
    '..#...#..',
    '.........',
    '.........',
    '..#...#..',
    '.........',
  ]),
  // Tree expanders: small triangles pointing right and down
  'ui/expand': stencil(
    r(7, 6, 1, 5) + r(8, 7, 1, 3) + r(9, 8, 1, 1),
    range(0, 5).map(c => r(14 + c, 11 + c, 1, 10 - 2 * c)).join(''),
  ),
  'ui/collapse': stencil(
    r(6, 7, 5, 1) + r(7, 8, 3, 1) + r(8, 9, 1, 1),
    range(0, 5).map(i => r(11 + i, 14 + i, 10 - 2 * i, 1)).join(''),
  ),
}

write(process.argv[2], icons)
