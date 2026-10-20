// File manager view and sort glyphs, plus the icon, font and video viewer apps
import { ink, g1, g4, g5, g6, white, b2, b3, b4, gr2, a3, r2, r, circle, S, F, S1, H, write, rasterise } from './lib.mjs'

// Pixel masks: the ink is the whole mask, the fill is the mask eroded by one pixel
const blank = size => new Uint8Array(size * size)
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
const erode = (m, size) => {
  const out = blank(size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
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
const pix = (x0, y0, rows) => rows.flatMap((row, y) => [...row].map((c, x) => c === '#' ? r(x0 + x, y0 + y, 1, 1) : '').filter(Boolean)).join('')

// Sort direction arrow, shared by every sort icon
const arrow = {
  16: H(ink, r(12, 4, 1, 5), r(10, 9, 5, 1), r(11, 10, 3, 1), r(12, 11, 1, 1)),
  32: H(ink, r(24, 8, 2, 10), r(20, 18, 10, 2), r(22, 20, 6, 2), r(24, 22, 2, 2)),
}

// Ink outlined square with a bevelled fill
const tile = (fill, x, y, w) => [F(ink, r(x, y, w, w)), S(fill, r(x + 1, y + 1, w - 2, w - 2))]

// Small page with a folded corner f pixels deep and a coloured band across the middle
const pageMask = (x, y, w, h, f) => `M${x} ${y}h${w - f}` + 'v1h1'.repeat(f) + `v${h - f}h-${w}z`
const smallPage = (size, x, y, w, h, f, band) => {
  const m = union(size, pageMask(x, y, w, h, f))
  const layers = [F(ink, path(m, size)), S(white, path(erode(m, size), size))]
  if (size === 32) layers.push(F(g5, r(x + w - f, y + 1, 1, 2), r(x + w - f + 1, y + 2, 1, 1)), F(ink, r(x + w - f - 1, y + 1, 1, f), r(x + w - f - 1, y + f, f, 1)))
  layers.push(F(band, size === 32 ? r(x + 1, y + 5, w - 2, 3) : r(x + 1, y + 3, w - 2, 1)))
  return layers
}

// Calendar page: ink outline, b3 header, ink grid dots
const calendar = {
  16: [
    F(ink, r(1, 2, 8, 10)),
    S(white, r(2, 3, 6, 8)),
    F(b3, r(2, 3, 6, 2)),
    F(ink, r(3, 6, 1, 1), r(6, 6, 1, 1), r(3, 8, 1, 1), r(6, 8, 1, 1)),
  ],
  32: [
    F(ink, r(2, 3, 14, 24)),
    S(white, r(3, 4, 12, 22)),
    F(b3, r(3, 4, 12, 4)),
    F(ink, r(3, 8, 12, 1)),
    F(ink, ...[11, 15, 19, 23].flatMap(y => [4, 8, 12].map(x => r(x, y, 2, 2)))),
  ],
}

// Play wedge: column groups step wide, each two rows shorter than the last
const wedge = (size, fill, x0, top, h, step) => {
  const parts = []
  for (const j of range(0, h / 2)) parts.push(r(x0 + step * j, top + j, step, h - 2 * j))
  const m = union(size, ...parts)
  return [F(ink, path(m, size)), S(fill, path(erode(m, size), size))]
}

// Window frame, as apps/image-viewer, body colour varies
const frame = (body, big) => big
  ? [F(ink, r(1, 3, 30, 26)), S1(b3, r(2, 4, 28, 4)), F(g6, r(23, 5, 2, 2), r(26, 5, 2, 2)), S(body, r(2, 8, 28, 20))]
  : [F(ink, r(1, 1, 14, 14)), S(b2, r(2, 2, 12, 2)), S(body, r(2, 4, 12, 10))]

const A16 = ['..#..', '.#.#.', '.#.#.', '#...#', '#####', '#...#', '#...#']
const Z16 = ['#####', '...#.', '..#..', '.#...', '#####']
const A32 = [
  '...####...',
  '..######..',
  '..##..##..',
  '..##..##..',
  '.##....##.',
  '.########.',
  '.########.',
  '##......##',
  '##......##',
  '##......##',
]
const Z32 = [
  '##########',
  '##########',
  '.......##.',
  '......##..',
  '.....##...',
  '....##....',
  '...##.....',
  '..##......',
  '##########',
  '##########',
]
const serifA16 = ['..#..', '.#.#.', '.#.#.', '#...#', '#####', '#...#', '##.##']
const serifA32 = [
  '.....###.....',
  '....#####....',
  '....##.##....',
  '...##...##...',
  '...##...##...',
  '..##.....##..',
  '..##.....##..',
  '..#########..',
  '.###########.',
  '.##.......##.',
  '.##.......##.',
  '##.........##',
  '##.........##',
  '####.....####',
]
const a16 = ['.##.', '...#', '.###', '#..#', '.###']
const a32 = [
  '00111100',
  '01111110',
  '00000011',
  '00000011',
  '00111111',
  '01111111',
  '11000011',
  '11000011',
  '01111111',
  '00111011',
].map(row => row.replace(/1/g, '#').replace(/0/g, '.'))

const icons = {
  'filemanager/view-grid': {
    16: [...tile(b4, 2, 2, 6), ...tile(b4, 9, 2, 6), ...tile(b4, 2, 9, 6), ...tile(b4, 9, 9, 6)],
    32: [...tile(b4, 3, 3, 12), ...tile(b4, 17, 3, 12), ...tile(b4, 3, 17, 12), ...tile(b4, 17, 17, 12)],
  },
  'filemanager/view-details': {
    16: [
      ...[2, 6, 10].flatMap(y => tile(b4, 1, y, 3)),
      H(ink, ...[2, 6, 10].flatMap(y => [r(5, y + 1, 5, 1), r(11, y + 1, 3, 1)])),
    ],
    32: [
      ...[4, 13, 22].flatMap(y => tile(b4, 2, y, 6)),
      H(ink, ...[4, 13, 22].flatMap(y => [r(10, y + 2, 10, 2), r(22, y + 2, 7, 2)])),
    ],
  },
  'filemanager/view-list': {
    16: [H(ink, ...[4, 7, 10].map(y => r(2, y, 2, 2) + r(5, y + 1, 9, 1)))],
    32: [H(ink, ...[8, 14, 20].map(y => r(4, y, 4, 4) + r(10, y + 1, 18, 2)))],
  },
  'filemanager/view-sort-name': {
    16: [H(ink, pix(2, 1, A16), pix(2, 9, Z16)), arrow[16]],
    32: [H(ink, pix(5, 4, A32), pix(5, 17, Z32)), arrow[32]],
  },
  'filemanager/view-sort-type': {
    16: [...smallPage(16, 2, 1, 7, 6, 2, b3), ...smallPage(16, 2, 8, 7, 6, 2, gr2), arrow[16]],
    32: [...smallPage(32, 4, 3, 12, 11, 3, b3), ...smallPage(32, 4, 16, 12, 11, 3, gr2), arrow[32]],
  },
  'filemanager/view-sort-date-created': {
    16: [...calendar[16], H(gr2, r(7, 10, 1, 3), r(6, 11, 3, 1)), arrow[16]],
    32: [...calendar[32], H(gr2, r(14, 23, 2, 6), r(12, 25, 6, 2)), arrow[32]],
  },
  'filemanager/view-sort-date-updated': {
    16: [...calendar[16], H(ink, circle(5, 5, 10)), F(white, r(6, 11, 3, 3)), F(ink, r(7, 11, 1, 2), r(8, 12, 1, 1)), arrow[16]],
    32: [...calendar[32], H(ink, circle(8, 11, 22)), S(white, circle(6, 12, 23)), F(ink, r(14, 24, 1, 2), r(14, 25, 3, 1)), arrow[32]],
  },
  'filemanager/view-sort-size': {
    16: [H(ink, r(1, 4, 3, 1), r(1, 7, 5, 1), r(1, 10, 8, 1)), arrow[16]],
    32: [H(ink, r(2, 8, 6, 3), r(2, 14, 11, 3), r(2, 20, 16, 3)), arrow[32]],
  },
  'apps/icon-viewer': {
    16: [...frame(white, false), ...tile(b3, 4, 4, 4), ...tile(gr2, 9, 4, 4), ...tile(a3, 4, 9, 4), ...tile(r2, 9, 9, 4)],
    32: [...frame(white, true), ...tile(b3, 8, 10, 7), ...tile(gr2, 17, 10, 7), ...tile(a3, 8, 19, 7), ...tile(r2, 17, 19, 7)],
  },
  'apps/font-viewer': {
    16: [...frame(white, false), F(ink, pix(3, 5, serifA16), pix(9, 7, a16))],
    32: [...frame(white, true), F(ink, pix(4, 11, serifA32), pix(19, 15, a32))],
  },
  'apps/video-viewer': {
    16: [...frame(g1, false), ...wedge(16, white, 5, 5, 6, 2), F(g4, r(3, 12, 10, 1)), F(b3, r(3, 12, 4, 1))],
    32: [...frame(g1, true), ...wedge(32, white, 11, 10, 12, 2), F(g4, r(4, 24, 24, 2)), F(b3, r(4, 24, 10, 2))],
  },
}

write(process.argv[2], icons)
