// System file icons: sound page, zip, gz, tar and 7z archives, and sh, bat, js and py scripts
import { ink, g1, g4, g5, g6, white, b2, b3, b6, gr3, a3, p3, n3, r, S, F, S1, write, page } from './lib.mjs'

// Zipper strip: alternating ink and g4 teeth, two columns of width w, running y0..y1
const zipper = (x, y0, y1, w) => {
  const a = [], b = []
  Array.from({ length: Math.floor((y1 - y0) / w) + 1 }, (_, i) => i).forEach(i => {
    const y = y0 + i * w
    const left = i % 2 === 0 ? a : b
    const right = i % 2 === 0 ? b : a
    left.push(r(x, y, w, w))
    right.push(r(x + w, y, w, w))
  })
  return [F(ink, ...a), F(g4, ...b)]
}

// Archive body: page, zipper down the centre, wrapped label band near the bottom carrying a mark at 32
const archive = (band, mark) => ({
  16: [...page[16], ...zipper(6, 2, 7, 1), F(ink, r(3, 8, 10, 5)), S(band, r(4, 9, 8, 3))],
  32: [...page[32], ...zipper(14, 3, 15, 2), F(ink, r(5, 17, 22, 10)), S(band, r(6, 18, 20, 8)), F(ink, mark)],
})

// Letter marks, 6 wide, 6 tall, 2px strokes, top left at (x, y)
const markZ = (x, y) => r(x, y, 6, 2) + r(x + 3, y + 2, 2, 1) + r(x + 1, y + 3, 2, 1) + r(x, y + 4, 6, 2)
const mark7 = (x, y) => r(x, y, 6, 2) + r(x + 4, y + 2, 2, 1) + r(x + 3, y + 3, 2, 1) + r(x + 2, y + 4, 2, 2)
const markG = (x, y) => r(x, y, 6, 2) + r(x, y + 2, 2, 3) + r(x + 3, y + 3, 3, 1) + r(x + 4, y + 4, 2, 1) + r(x, y + 5, 6, 1)
const markT = (x, y) => r(x, y, 6, 2) + r(x + 2, y + 2, 2, 4)

// Script banner across the lower page
const banner16 = fill => [F(ink, r(3, 6, 10, 7)), S(fill, r(4, 7, 8, 5))]
const banner32 = fill => [F(ink, r(5, 15, 22, 12)), S(fill, r(6, 16, 20, 10))]

const icons = {
  'system/page-sound': {
    16: [
      ...page[16],
      F(b2, r(4, 8, 1, 2), r(5, 7, 1, 4), r(6, 6, 1, 6)),
      F(b2, r(8, 7, 1, 1), r(9, 8, 1, 2), r(8, 10, 1, 1)),
      F(b2, r(10, 6, 1, 1), r(11, 7, 1, 4), r(10, 11, 1, 1)),
    ],
    32: [
      ...page[32],
      F(b2, r(9, 15, 3, 4), r(12, 13, 2, 8), r(14, 11, 2, 12)),
      F(b2, r(17, 13, 1, 2), r(17, 19, 1, 2), r(18, 14, 1, 6)),
      F(b2, r(20, 10, 1, 3), r(20, 21, 1, 3), r(21, 12, 1, 3), r(21, 19, 1, 3), r(22, 14, 1, 6)),
    ],
  },
  'system/archive-zip': archive(a3, markZ(13, 19)),
  'system/archive-gz': archive(gr3, markG(13, 19)),
  'system/archive-tar': archive(n3, markT(13, 19)),
  'system/archive-7z': archive(p3, mark7(13, 19)),
  'system/script-sh': {
    16: [...page[16], ...banner16(g1), F(gr3, 'M5 8h1v1h1v1h-1v1h-1z'), F(g5, r(8, 10, 2, 1))],
    32: [...page[32], ...banner32(g1), F(gr3, 'M9 17h2v2h2v2h-2v2h-2v-2h2v-2h-2z'), F(g5, r(15, 21, 6, 2))],
  },
  'system/script-bat': {
    16: [...page[16], F(ink, r(5, 6, 6, 6)), F(b2, r(6, 7, 4, 1)), F(b6, r(6, 8, 4, 3)), F(ink, r(7, 9, 1, 1))],
    32: [
      ...page[32],
      F(ink, r(9, 11, 14, 12)),
      F(b3, r(10, 12, 12, 2)),
      F(g6, r(19, 12, 1, 1), r(21, 12, 1, 1)),
      S1(b6, r(10, 14, 12, 8)),
      F(ink, 'M12 16h1v1h1v1h-1v1h-1z', r(15, 19, 3, 1)),
    ],
  },
  'system/script-js': {
    16: [...page[16], ...banner16(a3), F(ink, r(6, 8, 1, 3), r(5, 10, 1, 1), r(9, 8, 2, 1), r(9, 9, 1, 1), r(8, 10, 2, 1))],
    32: [
      ...page[32],
      ...banner32(a3),
      F(ink, r(13, 17, 2, 5), r(10, 22, 5, 2), r(10, 20, 2, 2)),
      F(ink, r(17, 17, 6, 2), r(17, 19, 2, 1), r(17, 20, 6, 1), r(21, 21, 2, 1), r(17, 22, 6, 2)),
    ],
  },
  'system/script-py': {
    16: [
      ...page[16],
      F(ink, r(3, 5, 10, 8)),
      S(b3, r(4, 6, 8, 3)),
      S(a3, r(4, 9, 8, 3)),
      F(white, r(5, 7, 3, 1), r(7, 8, 1, 1)),
      F(ink, r(8, 9, 1, 1), r(8, 10, 3, 1)),
    ],
    32: [
      ...page[32],
      F(ink, r(5, 15, 22, 12)),
      S(b3, r(6, 16, 20, 5)),
      S(a3, r(6, 21, 20, 5)),
      F(white, r(11, 17, 8, 2), r(17, 19, 2, 2)),
      F(ink, r(13, 21, 2, 2), r(13, 23, 8, 2)),
    ],
  },
}

write(process.argv[2], icons)
