// Device icons: laptops and desktops with OS badges, cpu, audio, controller, host, display, port, graphics, disk, network, mouse, acpi and cdrom
import { ink, g1, g2, g3, g4, g5, g6, white, b2, b3, b4, b5, gr2, gr3, a2, a3, r2, r3, n2, n3, r, circle, diag, S, F, S1, write, rasterise } from './lib.mjs'

// Trapezoid connector face: rows is a list of [y, x0, x1] spans
const spans = rows => rows.map(([y, x0, x1]) => r(x0, y, x1 - x0 + 1, 1)).join('')
// Rows y0 to y1 all spanning x0 to x1
const band = (y0, y1, x0, x1) => Array.from({ length: y1 - y0 + 1 }, (_, i) => [y0 + i, x0, x1])
// Ring between two concentric circles, even odd fill
const ring = (d0, x0, y0, d1, x1, y1) => circle(d0, x0, y0) + circle(d1, x1, y1)

// Shared expansion card body with a gold edge connector, as used by device-network
const card = {
  16: [
    F(ink, r(1, 2, 14, 10)),
    S(g4, r(2, 3, 12, 8)),
    F(ink, r(4, 11, 9, 3)),
    F(n3, r(5, 12, 7, 1)),
    F(n2, r(6, 12, 1, 1), r(8, 12, 1, 1), r(10, 12, 1, 1)),
  ],
  32: [
    F(ink, r(2, 3, 28, 22)),
    S(g4, r(3, 4, 26, 20)),
    F(ink, r(6, 24, 16, 4)),
    F(n3, r(7, 25, 14, 2)),
    F(n2, r(9, 25, 1, 2), r(12, 25, 1, 2), r(15, 25, 1, 2), r(18, 25, 1, 2)),
  ],
}
// Round jack socket in colour c at row y
const jack = (y, c) => [F(ink, circle(5, 5, y)), F(c, circle(3, 6, y + 1)), F(ink, r(7, y + 2, 1, 1))]

// Pins around a square package: n pins of width w with gaps of w, starting at s, length l
const pins = (s, n, w, l, lo, hi) => Array.from({ length: n }, (_, i) => s + i * 2 * w)
  .map(p => r(p, lo, w, l) + r(p, hi, w, l) + r(lo, p, l, w) + r(hi, p, l, w)).join('')

// One pixel halo around a glyph, as row runs of the dilated mask
const halo = (d, size) => {
  const m = rasterise(d, size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x]
  const on = (x, y) => [-1, 0, 1].some(dy => [-1, 0, 1].some(dx => at(x + dx, y + dy)))
  const rows = Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => on(x, y) ? r(x, y, 1, 1) : '').join(''))
  return rows.join('')
}
// Audio jack mark for devices audio at 32
const mark32 = r(13, 6, 6, 1) + r(12, 7, 8, 1) + r(12, 8, 2, 2) + r(18, 8, 2, 3) + r(17, 11, 2, 1) + r(16, 12, 2, 1) + r(15, 13, 2, 4) + r(15, 18, 2, 2)

// Open clamshell and monitor on a desktop case, shared by the OS variants
const laptop = {
  16: [
    F(ink, r(2, 1, 12, 9)),
    S(g4, r(3, 2, 10, 7)),
    F(ink, r(4, 3, 8, 4)),
    S(b3, r(5, 4, 6, 2)),
    F(b5, r(6, 5, 1, 1)),
    F(ink, r(1, 9, 14, 6)),
    S(g4, r(2, 10, 12, 4)),
    F(g2, r(3, 11, 10, 1)),
  ],
  32: [
    F(ink, r(5, 2, 22, 18)),
    S(g4, r(6, 3, 20, 16)),
    F(ink, r(8, 5, 16, 12)),
    S(b3, r(9, 6, 14, 10)),
    F(b5, r(11, 8, 3, 1), r(11, 9, 1, 2)),
    F(ink, r(2, 19, 28, 9)),
    S(g4, r(3, 20, 26, 7)),
    F(g2, r(5, 22, 22, 2)),
    F(g3, r(13, 25, 6, 1)),
  ],
}
// Monitor over a desktop case
const desktop = {
  16: [
    F(ink, r(2, 1, 12, 8)),
    S(g4, r(3, 2, 10, 6)),
    F(ink, r(4, 3, 8, 4)),
    S(b3, r(5, 4, 6, 2)),
    F(b5, r(6, 5, 1, 1)),
    F(ink, r(7, 9, 2, 1)),
    F(ink, r(1, 10, 14, 5)),
    S(g4, r(2, 11, 12, 3)),
    F(g2, r(3, 12, 7, 1)),
    F(gr3, r(12, 12, 1, 1)),
  ],
  32: [
    F(ink, r(5, 2, 22, 16)),
    S(g4, r(6, 3, 20, 14)),
    F(ink, r(8, 5, 16, 10)),
    S(b3, r(9, 6, 14, 8)),
    F(b5, r(11, 8, 3, 1), r(11, 9, 1, 2)),
    F(ink, r(13, 18, 6, 3)),
    F(g3, r(14, 18, 4, 3)),
    F(ink, r(2, 21, 28, 8)),
    S(g4, r(3, 22, 26, 6)),
    F(g2, r(5, 24, 12, 1), r(5, 26, 8, 1)),
    F(gr3, r(25, 24, 2, 2)),
  ],
}
// OS badge: white disc with ink rim in the lower right corner, then the mark
const badge = {
  16: [F(ink, r(9, 8, 5, 1), r(8, 9, 1, 5), r(14, 9, 1, 5), r(9, 14, 5, 1)), F(white, r(9, 9, 5, 5))],
  32: [F(ink, circle(12, 18, 17)), F(white, circle(10, 19, 18))],
}
// OS marks drawn inside the badge
const marks = {
  linux: {
    16: [
      F(ink, r(10, 9, 3, 2), r(9, 11, 1, 2), r(13, 11, 1, 2)),
      F(a2, r(11, 10, 1, 1), r(10, 13, 1, 1), r(12, 13, 1, 1)),
    ],
    32: [
      F(ink, r(23, 18, 2, 1), r(22, 19, 4, 1), r(22, 20, 1, 2), r(25, 20, 1, 2), r(21, 22, 1, 1), r(26, 22, 1, 1), r(20, 23, 1, 2), r(27, 23, 1, 2), r(21, 25, 6, 1)),
      F(a2, r(23, 21, 2, 1), r(21, 26, 2, 1), r(25, 26, 2, 1)),
    ],
  },
  win: {
    16: [F(b3, r(9, 9, 5, 5)), F(ink, r(11, 9, 1, 5), r(9, 11, 5, 1))],
    32: [F(b3, r(20, 19, 7, 7)), F(ink, r(23, 19, 1, 7), r(20, 22, 7, 1))],
  },
  mac: {
    16: [F(r2, r(9, 10, 3, 1), r(9, 11, 4, 3)), F(ink, r(10, 9, 1, 1)), F(gr3, r(11, 9, 1, 1))],
    32: [
      F(ink, r(21, 19, 2, 1), r(24, 19, 2, 1), r(21, 20, 5, 1), r(20, 21, 5, 2), r(20, 23, 7, 2), r(21, 25, 5, 1), r(21, 26, 2, 1), r(24, 26, 2, 1)),
      F(r2, r(22, 20, 1, 1), r(24, 20, 1, 1), r(21, 21, 3, 2), r(21, 23, 4, 1), r(21, 24, 5, 1), r(22, 25, 1, 1), r(24, 25, 1, 1)),
      F(ink, r(24, 18, 1, 1), r(23, 19, 1, 1)),
      F(gr3, r(22, 18, 2, 1)),
    ],
  },
}
// Body plus OS badge and mark
const variant = (body, os) => ({ 16: [...body[16], ...badge[16], ...marks[os][16]], 32: [...body[32], ...badge[32], ...marks[os][32]] })

const icons = {
  'devices/laptop': laptop,
  'devices/laptop-linux': variant(laptop, 'linux'),
  'devices/laptop-win': variant(laptop, 'win'),
  'devices/laptop-mac': variant(laptop, 'mac'),
  'devices/desktop': desktop,
  'devices/desktop-linux': variant(desktop, 'linux'),
  'devices/desktop-win': variant(desktop, 'win'),
  'devices/desktop-mac': variant(desktop, 'mac'),
  'devices/unknown': {
    16: [
      ...card[16],
      F(a2, r(6, 3, 3, 1), r(5, 4, 1, 1), r(9, 4, 1, 2), r(8, 6, 1, 1), r(7, 7, 1, 1), r(7, 9, 1, 1)),
    ],
    32: [
      ...card[32],
      F(ink, halo(mark32, 32)),
      F(a3, mark32),
    ],
  },
  'devices/cpu': {
    16: [
      F(ink, pins(4, 4, 1, 1, 2, 13)),
      F(ink, r(3, 3, 10, 10)),
      S(g2, r(4, 4, 8, 8)),
      F(ink, r(5, 5, 6, 6)),
      S(g4, r(6, 6, 4, 4)),
    ],
    32: [
      F(ink, pins(7, 5, 2, 3, 2, 27)),
      F(ink, r(5, 5, 22, 22)),
      S(g2, r(6, 6, 20, 20)),
      F(ink, r(11, 11, 10, 10)),
      S(g4, r(12, 12, 8, 8)),
      F(g5, r(13, 13, 2, 1), r(13, 14, 1, 1)),
    ],
  },
  'devices/audio': {
    16: [
      ...card[16],
      F(ink, r(3, 3, 3, 7)),
      F(gr3, r(4, 4, 1, 1)),
      F(b3, r(4, 6, 1, 1)),
      F(r3, r(4, 8, 1, 1)),
      F(ink, r(10, 4, 1, 5), r(8, 5, 2, 3), r(12, 5, 1, 1), r(13, 6, 1, 1), r(12, 7, 1, 1)),
    ],
    32: [
      ...card[32],
      ...jack(4, gr3),
      ...jack(11, b3),
      ...jack(18, r3),
      F(ink, r(15, 12, 3, 6), r(18, 11, 1, 8), r(19, 10, 1, 10), r(20, 9, 1, 12)),
      F(ink, r(22, 11, 1, 1), r(23, 12, 1, 6), r(22, 18, 1, 1)),
      F(ink, r(24, 9, 1, 1), r(25, 10, 1, 2), r(26, 12, 1, 6), r(25, 18, 1, 2), r(24, 20, 1, 1)),
    ],
  },
  'devices/controller': {
    16: [
      ...card[16],
      F(ink, r(3, 4, 7, 3)),
      F(g1, r(4, 5, 5, 1)),
      F(g2, r(3, 8, 3, 2), r(7, 8, 3, 2)),
      F(gr3, r(11, 5, 2, 2)),
    ],
    32: [
      ...card[32],
      F(ink, r(5, 7, 16, 6)),
      F(g1, r(6, 8, 14, 4)),
      F(g3, r(7, 9, 12, 1), r(7, 11, 9, 1)),
      F(ink, r(5, 15, 7, 6), r(14, 15, 7, 6)),
      S1(g2, r(6, 16, 5, 4), r(15, 16, 5, 4)),
      F(gr3, r(24, 9, 3, 2)),
      F(g3, r(23, 16, 4, 1), r(23, 18, 4, 1), r(23, 20, 4, 1)),
    ],
  },
  'devices/host': {
    16: [
      ...card[16],
      F(ink, r(3, 4, 4, 3)),
      F(g1, r(4, 5, 2, 1)),
      F(ink, r(10, 3, 1, 6), diag(9, 6, 2, -1, -1, 1), diag(11, 7, 2, 1, -1, 1), r(9, 9, 3, 2)),
    ],
    32: [
      ...card[32],
      F(ink, r(5, 8, 9, 7)),
      F(g1, r(6, 9, 7, 5)),
      F(g5, r(7, 10, 5, 2)),
      F(ink, r(20, 5, 2, 2), r(19, 7, 4, 2), r(20, 9, 2, 10)),
      F(ink, diag(19, 14, 3, -1, -1, 2), r(15, 9, 3, 3)),
      F(ink, diag(22, 12, 3, 1, -1, 2), circle(4, 24, 7)),
      F(ink, ring(6, 18, 18, 2, 20, 20)),
    ],
  },
  'devices/display': {
    16: [
      F(ink, r(1, 1, 14, 10)),
      S(g4, r(2, 2, 12, 8)),
      F(ink, r(3, 3, 10, 6)),
      S(b3, r(4, 4, 8, 4)),
      F(b5, r(5, 5, 2, 1), r(5, 6, 1, 1)),
      F(gr3, r(12, 9, 1, 1)),
      F(ink, r(7, 11, 2, 1), r(4, 12, 8, 3)),
      F(g4, r(5, 13, 6, 1)),
    ],
    32: [
      F(ink, r(2, 2, 28, 22)),
      S(g4, r(3, 3, 26, 20)),
      F(ink, r(5, 5, 22, 16)),
      S(b3, r(6, 6, 20, 14)),
      F(b5, r(8, 8, 4, 1), r(8, 9, 1, 3)),
      F(gr3, r(25, 21, 2, 1)),
      F(ink, r(12, 24, 8, 3)),
      F(g3, r(13, 24, 6, 3)),
      F(ink, r(7, 27, 18, 3)),
      F(g4, r(8, 28, 16, 1)),
    ],
  },
  'devices/port': {
    16: [
      F(ink, spans([...band(4, 5, 1, 14), ...band(6, 8, 2, 13), ...band(9, 12, 3, 12)])),
      S(g4, spans([[5, 2, 13], ...band(6, 8, 3, 12), ...band(9, 11, 4, 11)])),
      F(ink, r(4, 7, 1, 1), r(6, 7, 1, 1), r(8, 7, 1, 1), r(10, 7, 1, 1), r(5, 10, 1, 1), r(7, 10, 1, 1), r(9, 10, 1, 1)),
    ],
    32: [
      F(ink, spans([...band(8, 9, 2, 29), ...band(10, 12, 3, 28), ...band(13, 15, 4, 27), ...band(16, 18, 5, 26), ...band(19, 23, 6, 25)])),
      S(g4, spans([[9, 3, 28], ...band(10, 12, 4, 27), ...band(13, 15, 5, 26), ...band(16, 18, 6, 25), ...band(19, 22, 7, 24)])),
      S(g5, spans([...band(11, 12, 5, 26), ...band(13, 15, 6, 25), ...band(16, 18, 7, 24), ...band(19, 20, 8, 23)])),
      F(ink, r(9, 13, 2, 2), r(12, 13, 2, 2), r(15, 13, 2, 2), r(18, 13, 2, 2), r(21, 13, 2, 2), r(11, 18, 2, 2), r(14, 18, 2, 2), r(17, 18, 2, 2), r(20, 18, 2, 2)),
    ],
  },
  'devices/graphics': {
    16: [
      F(ink, r(1, 1, 3, 13)),
      F(g5, r(2, 2, 1, 11)),
      F(ink, r(3, 2, 12, 9)),
      S(g4, r(4, 3, 10, 7)),
      F(ink, circle(7, 4, 3)),
      S(g5, circle(5, 5, 4)),
      F(ink, r(7, 6, 1, 1)),
      F(g2, r(11, 4, 2, 2)),
      F(ink, r(6, 10, 7, 4)),
      F(n3, r(7, 11, 5, 2)),
      F(n2, r(8, 11, 1, 2), r(10, 11, 1, 2)),
    ],
    32: [
      F(ink, r(2, 2, 5, 28)),
      S(g5, r(3, 3, 3, 26)),
      F(ink, r(6, 5, 24, 19)),
      S(g4, r(7, 6, 22, 17)),
      F(ink, circle(13, 8, 7)),
      S(g5, circle(11, 9, 8)),
      F(g3, diag(10, 9, 3, 1, 1, 1), diag(18, 9, 3, -1, 1, 1), diag(10, 17, 3, 1, -1, 1), diag(18, 17, 3, -1, -1, 1)),
      F(ink, circle(3, 13, 12)),
      F(ink, r(22, 8, 5, 5)),
      S1(g2, r(23, 9, 3, 3)),
      F(g3, r(22, 15, 5, 1), r(22, 17, 5, 1), r(22, 19, 5, 1)),
      F(ink, r(10, 23, 16, 5)),
      F(n3, r(11, 24, 14, 3)),
      F(n2, r(13, 24, 1, 3), r(16, 24, 1, 3), r(19, 24, 1, 3), r(22, 24, 1, 3)),
    ],
  },
  'devices/disk': {
    16: [
      F(ink, r(1, 2, 14, 12)),
      S(g4, r(2, 3, 12, 10)),
      F(ink, circle(9, 3, 3)),
      S(g5, circle(7, 4, 4)),
      F(ink, r(7, 7, 1, 1)),
      F(ink, diag(9, 7, 4, 1, 1, 1), r(12, 10, 2, 2)),
      F(gr3, r(12, 4, 1, 1)),
    ],
    32: [
      F(ink, r(2, 3, 28, 26)),
      S(g4, r(3, 4, 26, 24)),
      F(ink, circle(19, 5, 7)),
      S(g5, circle(17, 6, 8)),
      F(g4, ring(11, 9, 11, 9, 10, 12)),
      F(ink, circle(3, 13, 15)),
      F(ink, diag(17, 19, 7, 1, 1, 2), r(16, 18, 2, 2)),
      F(ink, circle(5, 23, 22)),
      S1(g3, circle(3, 24, 23)),
      F(gr3, r(25, 6, 2, 2)),
    ],
  },
  'devices/network': {
    16: [
      F(ink, r(1, 2, 14, 10)),
      S(g4, r(2, 3, 12, 8)),
      F(ink, r(3, 4, 7, 6)),
      F(g1, r(4, 5, 5, 3), r(5, 8, 3, 1)),
      F(gr3, r(11, 4, 2, 2)),
      F(g2, r(11, 7, 2, 2)),
      F(ink, r(4, 11, 9, 3)),
      F(n3, r(5, 12, 7, 1)),
      F(n2, r(6, 12, 1, 1), r(8, 12, 1, 1), r(10, 12, 1, 1)),
    ],
    32: [
      F(ink, r(2, 3, 28, 22)),
      S(g4, r(3, 4, 26, 20)),
      F(ink, r(5, 6, 13, 11)),
      S(g5, r(6, 7, 11, 9)),
      F(ink, r(8, 9, 7, 5), r(10, 14, 3, 1)),
      F(g1, r(9, 10, 5, 3)),
      F(gr3, r(22, 8, 3, 2)),
      F(a3, r(22, 12, 3, 2)),
      F(ink, r(20, 16, 7, 6)),
      S1(g2, r(21, 17, 5, 4)),
      F(ink, r(6, 24, 16, 4)),
      F(n3, r(7, 25, 14, 2)),
      F(n2, r(9, 25, 1, 2), r(12, 25, 1, 2), r(15, 25, 1, 2), r(18, 25, 1, 2)),
    ],
  },
  'devices/mouse': {
    16: [
      F(ink, r(8, 1, 1, 4)),
      F(ink, r(6, 5, 5, 1), r(5, 6, 1, 1), r(11, 6, 1, 1), r(4, 7, 1, 6), r(12, 7, 1, 6), r(5, 13, 1, 1), r(11, 13, 1, 1), r(6, 14, 5, 1)),
      S(g4, r(6, 6, 5, 1), r(5, 7, 7, 6), r(6, 13, 5, 1)),
      F(ink, r(8, 6, 1, 4), r(5, 10, 7, 1)),
    ],
    32: [
      F(ink, r(15, 2, 1, 6)),
      F(ink, r(11, 8, 9, 1), r(9, 9, 14, 1), r(8, 10, 16, 18), r(9, 28, 14, 1), r(11, 29, 9, 1)),
      S(g4, r(11, 9, 9, 1), r(9, 10, 13, 18), r(11, 28, 9, 1)),
      F(ink, r(15, 9, 1, 9), r(9, 17, 13, 1)),
    ],
  },
  'devices/acpi': {
    16: [
      F(ink, r(1, 4, 12, 8), r(13, 6, 2, 4)),
      S(gr2, r(2, 5, 10, 6)),
      F(g4, r(13, 7, 1, 2)),
      F(a3, r(8, 5, 2, 1), r(7, 6, 2, 1), r(6, 7, 4, 1), r(5, 8, 4, 1), r(6, 9, 2, 1), r(5, 10, 2, 1)),
    ],
    32: [
      F(ink, r(2, 9, 25, 14), r(27, 13, 3, 6)),
      S(gr2, r(3, 10, 23, 12)),
      F(g4, r(27, 14, 2, 4)),
      F(a3, r(16, 10, 3, 1), r(15, 11, 3, 1), r(14, 12, 3, 1), r(13, 13, 3, 1), r(12, 14, 8, 1), r(11, 15, 7, 1), r(14, 16, 3, 1), r(13, 17, 3, 1), r(12, 18, 3, 1), r(11, 19, 3, 1), r(10, 20, 3, 1), r(9, 21, 3, 1)),
    ],
  },
  'devices/cdrom': {
    16: [
      F(ink, circle(14, 1, 1) + r(7, 7, 2, 2)),
      S(g5, circle(12, 2, 2) + r(7, 7, 2, 2)),
      F(g6, ring(10, 3, 3, 8, 4, 4)),
      F(g4, ring(6, 5, 5, 4, 6, 6)),
      F(ink, circle(4, 6, 6) + r(7, 7, 2, 2)),
    ],
    32: [
      F(ink, circle(28, 2, 2) + circle(4, 14, 14)),
      S(g5, circle(26, 3, 3) + circle(4, 14, 14)),
      F(g6, ring(20, 6, 6, 16, 8, 8)),
      F(g4, ring(12, 10, 10, 10, 11, 11)),
      F(ink, ring(6, 13, 13, 4, 14, 14)),
    ],
  },
}

write(process.argv[2], icons)
