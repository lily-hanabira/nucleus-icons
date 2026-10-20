// Label icons: numbered boxes 1 to 5 in blue and lettered boxes a to e in green
import { ink, white, b3, gr2, r, S, F, write } from './lib.mjs'

// 5x7 pixel font, 1 = lit
const font = {
  1: ['00100', '01100', '10100', '00100', '00100', '00100', '11111'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  a: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  b: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  c: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  d: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  e: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
}

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

const box = (fill, rows) => ({
  16: [
    F(ink, r(1, 1, 14, 14)),
    S(fill, r(2, 2, 12, 12)),
    F(white, glyph(rows, 1, 6, 4)),
  ],
  32: [
    F(ink, r(2, 2, 28, 28)),
    S(fill, r(3, 3, 26, 26)),
    F(white, glyph(rows, 2, 11, 9)),
  ],
})

const icons = {}
for (const [name, rows] of Object.entries(font)) {
  icons[`labels/${name}`] = box(/\d/.test(name) ? b3 : gr2, rows)
}

write(process.argv[2], icons)
