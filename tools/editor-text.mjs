// Editor text icons: bold, italic, underline, strikethrough, typeface, font size, alignment, lists, indent and spellcheck
import { ink, b3, gr2, r2, r, diag, F, H, write, rasterise } from './lib.mjs'

// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)

// bitmap to rect paths, one rect per run of lit pixels, scaled by k
const glyph = (rows, k, ox, oy) => {
  const out = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (row[x] === '1') {
        let w = 0
        while (row[x + w] === '1') w++
        out.push(r(ox + x * k, oy + y * k, w * k, k))
        x += w
      } else x++
    }
  })
  return out.join('')
}

// shear a bitmap one column left per two rows going down
const shear = rows => {
  const h = rows.length
  return rows.map((row, i) => '0'.repeat(Math.floor((h - 1 - i) / 2)) + row)
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
// Mirror a mask left to right
const flipX = (m, size) => {
  const out = new Uint8Array(size * size)
  for (const y of range(0, size)) for (const x of range(0, size)) out[y * size + size - 1 - x] = m[y * size + x]
  return out
}
// Mirror layers left to right
const mirror = (size, layers) => layers.map(l => ({ ...l, d: path(flipX(rasterise(l.d, size), size), size) }))

// Letter bitmaps, 1 is lit
const B16 = [
  '1111111100',
  '1111111110',
  '0011000011',
  '0011000011',
  '0011000110',
  '0011111100',
  '0011111110',
  '0011000011',
  '0011000011',
  '0011000011',
  '1111111110',
  '1111111100',
]
const B32 = [
  '11111111111111100000',
  '11111111111111111000',
  '11111111111111111100',
  '00011100000000111110',
  '00011100000000011110',
  '00011100000000001110',
  '00011100000000001110',
  '00011100000000011110',
  '00011100000000111100',
  '00011111111111111000',
  '00011111111111111100',
  '00011111111111111110',
  '00011100000000001111',
  '00011100000000000111',
  '00011100000000000111',
  '00011100000000000111',
  '00011100000000000111',
  '00011100000000000111',
  '00011100000000001111',
  '00011100000000011110',
  '00011100000000111110',
  '11111111111111111100',
  '11111111111111111000',
  '11111111111111100000',
]

const I16 = shear(Array.from({ length: 12 }, (_, i) => (i === 0 || i === 11 ? '11111' : '00100')))
const I32 = shear(Array.from({ length: 24 }, (_, i) => (i < 2 || i > 21 ? '11111111' : '00011000')))

const U16 = [
  '10000001',
  '10000001',
  '10000001',
  '10000001',
  '10000001',
  '10000001',
  '10000001',
  '11000011',
  '01111110',
]
const U32 = [
  ...Array(14).fill('1100000000000011'),
  '1110000000000111',
  '0111000000001110',
  '0011111111111100',
  '0000111111110000',
]

const S16 = [
  '0111110',
  '1000001',
  '1000000',
  '1000000',
  '0100000',
  '0011100',
  '0000010',
  '0000001',
  '0000001',
  '1000001',
  '0111110',
]
const S32 = [
  '00011111111000',
  '00111111111100',
  '01110000001110',
  '11100000000111',
  '11000000000011',
  '11000000000000',
  '11000000000000',
  '11100000000000',
  '01110000000000',
  '00111100000000',
  '00011111110000',
  '00000011111100',
  '00000000011100',
  '00000000001110',
  '00000000000111',
  '00000000000011',
  '11000000000011',
  '11100000000111',
  '01110000001110',
  '00111111111100',
  '00011111111000',
]

// capital A, serif and sans
const A16 = serif => [
  '0001000',
  '0001000',
  '0010100',
  '0010100',
  '0100010',
  '0111110',
  '0100010',
  '1000001',
  serif ? '1100011' : '1000001',
]
const A32 = serif => [
  '000000111000000',
  '000001111100000',
  '000001101100000',
  '000011000110000',
  '000011000110000',
  '000110000011000',
  '000110000011000',
  '001100000001100',
  '001100000001100',
  '001111111111100',
  '011111111111110',
  '011000000000110',
  '011000000000110',
  '110000000000011',
  '110000000000011',
  '110000000000011',
  '110000000000011',
  '110000000000011',
  serif ? '111100000001111' : '110000000000011',
  serif ? '111100000001111' : '110000000000011',
]

// lowercase, 16 at x height 5 and 32 at x height 10
const lo16 = {
  a: ['0110', '0001', '0111', '1001', '0111'],
  b: ['1000', '1000', '1110', '1001', '1001', '1001', '1110'],
  c: ['0110', '1001', '1000', '1001', '0110'],
}
const lo32 = {
  a: [
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
  ],
  b: [
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11011100',
    '11111110',
    '11100011',
    '11000011',
    '11000011',
    '11000011',
    '11000011',
    '11100011',
    '11111110',
    '11011100',
  ],
  c: [
    '00111100',
    '01111110',
    '11100011',
    '11000000',
    '11000000',
    '11000000',
    '11000000',
    '11100011',
    '01111110',
    '00111100',
  ],
}

const digits = {
  1: ['00100', '01100', '10100', '00100', '00100', '00100', '11111'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
}

// alignment bars. long and short lengths alternate from the top
const bars = (mode, size) => {
  const [full, short, x0, ys, h] = size === 16 ? [12, 8, 2, [3, 5, 7, 9, 11], 1] : [24, 16, 4, [5, 9, 13, 17, 21], 2]
  return H(ink, ...ys.map((y, i) => {
    const w = mode === 'justify' || i % 2 === 0 ? full : short
    const x = mode === 'right' ? x0 + full - w : mode === 'center' ? x0 + (full - w) / 2 : x0
    return r(x, y, w, h)
  }))
}
// Alignment icon at both sizes
const align = mode => ({ 16: [bars(mode, 16)], 32: [bars(mode, 32)] })

const arrowDown16 = r(12, 3, 1, 6) + r(10, 9, 5, 1) + r(11, 10, 3, 1) + r(12, 11, 1, 1)
const arrowUp16 = r(12, 3, 1, 1) + r(11, 4, 3, 1) + r(10, 5, 5, 1) + r(12, 6, 1, 6)
const arrowDown32 = r(23, 6, 2, 14) + r(19, 20, 10, 2) + r(21, 22, 6, 2) + r(23, 24, 2, 2)
const arrowUp32 = r(23, 6, 2, 2) + r(21, 8, 6, 2) + r(19, 10, 10, 2) + r(23, 12, 2, 14)

const indentMore = {
  16: [
    H(ink, r(2, 3, 12, 1), r(7, 7, 7, 1), r(7, 11, 7, 1)),
    H(ink, r(2, 4, 1, 7), r(3, 5, 1, 5), r(4, 6, 1, 3), r(5, 7, 1, 1)),
  ],
  32: [
    H(ink, r(4, 6, 24, 2), r(14, 15, 14, 2), r(14, 24, 14, 2)),
    H(ink, r(4, 9, 2, 13), r(6, 11, 2, 9), r(8, 13, 2, 5), r(10, 15, 2, 2)),
  ],
}

const icons = {
  'editor/bold': {
    16: [H(ink, glyph(B16, 1, 3, 2))],
    32: [H(ink, glyph(B32, 1, 6, 4))],
  },
  'editor/italic': {
    16: [H(ink, glyph(I16, 1, 3, 2))],
    32: [H(ink, glyph(I32, 1, 6, 4))],
  },
  'editor/underline': {
    16: [H(ink, glyph(U16, 1, 4, 2)), H(b3, r(3, 12, 10, 1))],
    32: [H(ink, glyph(U32, 1, 8, 4)), H(b3, r(6, 24, 20, 2))],
  },
  'editor/strikethrough': {
    16: [H(ink, glyph(S16, 1, 4, 2)), H(r2, r(2, 7, 12, 1))],
    32: [H(ink, glyph(S32, 1, 9, 5)), H(r2, r(5, 15, 22, 2))],
  },
  'editor/typeface': {
    16: [H(ink, glyph(A16(true), 1, 2, 3), glyph(lo16.a, 1, 10, 7))],
    32: [H(ink, glyph(A32(true), 1, 3, 5), glyph(lo32.a, 1, 20, 15))],
  },
  'editor/font-smaller': {
    16: [H(ink, glyph(A16(false), 1, 2, 3), arrowDown16)],
    32: [H(ink, glyph(A32(false), 1, 3, 5), arrowDown32)],
  },
  'editor/font-larger': {
    16: [H(ink, glyph(A16(false), 1, 2, 3), arrowUp16)],
    32: [H(ink, glyph(A32(false), 1, 3, 5), arrowUp32)],
  },
  'editor/align-left': align('left'),
  'editor/align-center': align('center'),
  'editor/align-right': align('right'),
  'editor/align-justify': align('justify'),
  'editor/ul': {
    16: [H(ink, ...[3, 7, 11].map(y => r(2, y, 2, 2) + r(5, y + 1, 9, 1)))],
    32: [H(ink, ...[6, 14, 22].map(y => r(4, y, 4, 4) + r(10, y + 1, 18, 2)))],
  },
  'editor/ol': {
    16: [H(ink, ...[2, 6, 10].map(y => r(2, y, 1, 3) + r(4, y + 2, 1, 1) + r(6, y + 1, 8, 1)))],
    32: [H(ink, ...[4, 13, 22].map((y, i) => glyph(digits[i + 1], 1, 4, y) + r(11, y + 3, 17, 2)))],
  },
  'editor/indent-more': indentMore,
  'editor/indent-less': { 16: mirror(16, indentMore[16]), 32: mirror(32, indentMore[32]) },
  'editor/spellcheck': {
    16: [
      H(ink, glyph(lo16.a, 1, 1, 4), glyph(lo16.b, 1, 6, 2), glyph(lo16.c, 1, 11, 4)),
      H(gr2, r(4, 10, 1, 1), r(5, 11, 1, 1), r(6, 12, 1, 1), r(7, 11, 1, 1), r(8, 10, 1, 1), r(9, 9, 1, 1), r(10, 8, 1, 1)),
    ],
    32: [
      H(ink, glyph(lo32.a, 1, 2, 7), glyph(lo32.b, 1, 12, 3), glyph(lo32.c, 1, 22, 7)),
      H(gr2, diag(9, 22, 3, 1, 1, 3), diag(12, 24, 7, 1, -1, 3)),
    ],
  },
}

write(process.argv[2], icons)
