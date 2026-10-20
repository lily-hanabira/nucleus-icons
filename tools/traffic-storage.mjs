// Traffic lights in six colours, badged storage drives, usb, and the bastion tower
import { ink, g1, g2, g3, g4, g5, g6, white, b1, b2, b3, b6, gr1, gr2, gr3, gr4, a2, a3, a4, r1, r2, r4, r, circle, diag, S, F, write, rasterise } from './lib.mjs'

// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)

// Pixels of a mask whose four neighbours are all inside it, as 1x1 rects
const inner = (d, size) => {
  const m = rasterise(d, size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x]
  let s = ''
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)) s += r(x, y, 1, 1)
  }
  return s
}
// Ring between two circles, filled even odd
const ring = (d0, x0, y0, d1, x1, y1) => circle(d0, x0, y0) + circle(d1, x1, y1)

// Indicator lamp: ink outline, bevelled disc, flat glint, dark inner rim at 32
const lamp = (base, glint, rim) => ({
  16: [F(ink, circle(12, 2, 2)), S(base, circle(10, 3, 3)), F(glint, r(5, 5, 2, 1))],
  32: [F(ink, circle(26, 3, 3)), F(rim, circle(24, 4, 4)), S(base, circle(22, 5, 5)), F(glint, r(8, 9, 4, 2))],
})

// Drive box with the slot shortened and the LED moved left to clear the badge
const drive = {
  16: [F(ink, r(1, 3, 14, 10)), S(g4, r(2, 4, 12, 8)), F(g3, r(3, 6, 6, 1)), F(g2, r(3, 9, 3, 1)), F(gr3, r(7, 9, 1, 1))],
  32: [
    F(ink, r(2, 7, 28, 18)), S(g4, r(3, 8, 26, 16)), F(g3, r(5, 11, 14, 2)),
    F(g2, r(5, 18, 9, 1), r(5, 20, 9, 1)), F(gr3, r(15, 18, 2, 2)), F(a3, r(15, 21, 2, 1)),
  ],
}
// White badge disc in the lower right, interior x9..13 y10..12 at 16 and x20..27 y16..23 at 32
const badged = (g16, g32) => ({
  16: [...drive[16], F(ink, circle(7, 8, 8)), S(white, circle(5, 9, 9)), ...g16],
  32: [...drive[32], F(ink, circle(12, 18, 14)), S(white, circle(10, 19, 15)), ...g32],
})

// Usb trident, 13 wide 9 tall, anchored at its top left
const trident = (x, y) => [
  ring(5, x, y + 2, 3, x + 1, y + 3),
  r(x + 5, y + 4, 6, 1), r(x + 11, y + 3, 1, 3), r(x + 12, y + 4, 1, 1),
  diag(x + 6, y + 3, 3, 1, -1, 1), r(x + 9, y, 2, 2),
  diag(x + 6, y + 5, 3, 1, 1, 1), r(x + 9, y + 7, 3, 1), r(x + 10, y + 8, 1, 1),
].join('')

// Bastion tower silhouettes
const tower16 = r(3, 5, 3, 2) + r(7, 5, 3, 2) + r(11, 5, 3, 2) + r(3, 7, 11, 8)
const tower32 = r(6, 10, 5, 4) + r(14, 10, 5, 4) + r(22, 10, 5, 4) + r(6, 14, 21, 16)

const icons = {
  'traffic/red': lamp(r2, r4, r1),
  'traffic/amber': lamp(a3, a4, a2),
  'traffic/green': lamp(gr2, gr4, gr1),
  'traffic/grey': lamp(g3, g6, g2),
  'traffic/blue': lamp(b3, b6, b2),
  'traffic/white': lamp(g6, white, g4),

  'storage/network-mount': badged(
    [F(gr2, r(10, 11, 3, 1)), F(ink, r(11, 10, 1, 1), r(10, 12, 1, 1), r(12, 12, 1, 1))],
    [F(gr2, r(23, 18, 2, 1), r(21, 19, 6, 1)), F(ink, r(23, 16, 2, 2), r(20, 20, 2, 2), r(26, 20, 2, 2))],
  ),
  'storage/symlink': badged(
    [F(b3, r(11, 9, 2, 1), r(11, 10, 2, 1), r(10, 11, 1, 1))],
    [F(b3, r(23, 17, 4, 1), r(24, 18, 3, 1), r(23, 19, 4, 1), r(22, 20, 3, 1), r(26, 20, 1, 1), r(22, 21, 2, 2))],
  ),
  'storage/readonly': badged(
    [F(ink, r(11, 9, 1, 1), r(10, 10, 1, 1), r(12, 10, 1, 1), r(10, 11, 3, 2))],
    [
      F(ink, r(23, 15, 3, 1), r(22, 16, 1, 2), r(26, 16, 1, 2), r(21, 18, 7, 6)),
      F(a3, r(22, 19, 5, 4)),
      F(ink, r(24, 20, 1, 2)),
    ],
  ),
  'storage/usb': {
    16: [
      F(ink, r(5, 4, 10, 9)), S(g4, r(6, 5, 8, 7)),
      F(ink, r(1, 5, 5, 7)), S(g5, r(2, 6, 3, 5)),
      F(ink, r(3, 7, 1, 1), r(3, 9, 1, 1)),
    ],
    32: [
      F(ink, r(11, 8, 19, 16)), S(g4, r(12, 9, 17, 14)),
      F(ink, r(2, 10, 10, 12)), S(g5, r(3, 11, 8, 10)),
      F(ink, r(5, 13, 4, 2), r(5, 17, 4, 2)),
      F(ink, trident(14, 11)),
    ],
  },

  'system/bastion': {
    16: [
      F(ink, tower16), S(g4, inner(tower16, 16)),
      F(ink, r(7, 1, 3, 3)), F(a3, r(8, 2, 1, 1)),
      F(ink, r(7, 9, 3, 1), r(6, 10, 1, 5), r(10, 10, 1, 5)),
      S(b3, r(8, 10, 1, 1), r(7, 11, 3, 3)),
    ],
    32: [
      F(ink, tower32), S(g4, inner(tower32, 32)),
      F(ink, circle(7, 13, 2)), S(a3, circle(5, 14, 3)),
      F(ink, r(16, 16, 1, 3)),
      F(ink, r(15, 20, 3, 1), r(14, 21, 1, 1), r(18, 21, 1, 1), r(13, 22, 1, 8), r(19, 22, 1, 8)),
      S(b3, r(15, 21, 3, 1), r(14, 22, 5, 7)),
    ],
  },
}

write(process.argv[2], icons)
