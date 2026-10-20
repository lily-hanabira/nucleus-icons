// Audio icons: speakers and volume states, mixer, headphones, subwoofer, surround, config and asio,
// plus the network connected and disconnected nodes and the status speech bubbles
import { ink, g1, g2, g3, g4, g5, white, b3, gr2, gr3, a3, r2, r, circle, diag, S, S1, F, H, write, rasterise } from './lib.mjs'

// One pixel outline around a glyph, as the dilated mask
const outline = (d, size) => {
  const m = rasterise(d, size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x]
  const on = (x, y) => [-1, 0, 1].some(dy => [-1, 0, 1].some(dx => at(x + dx, y + dy)))
  return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => on(x, y) ? r(x, y, 1, 1) : '').join('')).join('')
}

// Miniature gear badge as in control.mjs, 7px at 16 and 11px at 32
const badge = {
  16: (ox, oy) => [
    F(ink, circle(5, ox + 1, oy + 1), r(ox + 3, oy, 1, 1), r(ox + 3, oy + 6, 1, 1), r(ox, oy + 3, 1, 1), r(ox + 6, oy + 3, 1, 1)),
    F(g4, r(ox + 2, oy + 2, 3, 3)),
    F(ink, r(ox + 3, oy + 3, 1, 1)),
  ],
  32: (ox, oy) => [
    F(ink, circle(9, ox + 1, oy + 1), r(ox + 4, oy, 3, 2), r(ox + 4, oy + 9, 3, 2), r(ox, oy + 4, 2, 3), r(ox + 9, oy + 4, 2, 3)),
    S1(g3, circle(7, ox + 2, oy + 2), r(ox + 5, oy + 1, 1, 1), r(ox + 5, oy + 9, 1, 1), r(ox + 1, oy + 5, 1, 1), r(ox + 9, oy + 5, 1, 1)),
    F(ink, r(ox + 4, oy + 4, 3, 3)),
    F(g5, r(ox + 5, oy + 5, 1, 1)),
  ],
}

// Lightning bolt for asio
const bolt16 = r(13, 5, 2, 1) + r(12, 6, 2, 1) + r(11, 7, 4, 1) + r(10, 8, 4, 1) + r(11, 9, 2, 1) + r(10, 10, 2, 1)
const bolt32 = r(25, 11, 3, 1) + r(24, 12, 3, 1) + r(23, 13, 3, 1) + r(21, 14, 7, 1) + r(20, 15, 6, 1) + r(23, 16, 3, 1) + r(22, 17, 3, 1) + r(21, 18, 3, 1) + r(20, 19, 3, 1)

// Speaker cabinet with one ink ringed driver, as used by the stereo pair
const cabinet = {
  16: x => [
    F(ink, r(x, 2, 6, 12)),
    S(g4, r(x + 1, 3, 4, 10)),
    F(ink, circle(4, x + 1, 8)),
    F(g2, r(x + 2, 9, 2, 2)),
    F(ink, r(x + 2, 5, 2, 1)),
  ],
  32: x => [
    F(ink, r(x, 3, 13, 26)),
    S(g4, r(x + 1, 4, 11, 24)),
    F(ink, circle(5, x + 4, 7)),
    F(g2, circle(3, x + 5, 8)),
    F(ink, circle(9, x + 2, 15)),
    S(g2, circle(7, x + 3, 16)),
    F(ink, r(x + 6, 19, 1, 1)),
  ],
}

// rows is a list of [y, x0, x1] inclusive spans
const spans = rows => rows.map(([y, x0, x1]) => r(x0, y, x1 - x0 + 1, 1)).join('')
// Rows y0 to y1 all spanning x0 to x1
const band = (y0, y1, x0, x1) => Array.from({ length: y1 - y0 + 1 }, (_, i) => [y0 + i, x0, x1])

// Shared speaker: gray box on the left, stepped cone opening to the right
const speaker = {
  16: [
    F(ink, spans([[2, 7, 8], [3, 6, 8], [4, 5, 8], ...band(5, 10, 1, 8), [11, 5, 8], [12, 6, 8], [13, 7, 8]])),
    S(g4, r(2, 6, 2, 4)),
    S(g4, spans([[3, 7, 7], [4, 6, 7], ...band(5, 10, 5, 7), [11, 6, 7], [12, 7, 7]])),
  ],
  32: [
    F(ink, spans([[4, 16, 17], [5, 15, 17], [6, 13, 17], [7, 12, 17], [8, 10, 17], [9, 9, 17], ...band(10, 21, 2, 17),
      [22, 9, 17], [23, 10, 17], [24, 12, 17], [25, 13, 17], [26, 15, 17], [27, 16, 17]])),
    S(g4, r(3, 11, 5, 10)),
    F(g3, r(4, 13, 3, 1), r(4, 15, 3, 1), r(4, 17, 3, 1)),
    S(g4, spans([[5, 16, 16], [6, 15, 16], [7, 13, 16], [8, 12, 16], [9, 10, 16], ...band(10, 21, 9, 16),
      [22, 10, 16], [23, 12, 16], [24, 13, 16], [25, 15, 16], [26, 16, 16]])),
    F(g3, spans([[9, 13, 13], [10, 12, 12], [11, 11, 11], ...band(12, 19, 10, 10), [20, 11, 11], [21, 12, 12], [22, 13, 13]])),
  ],
}

// Sound arcs, each a 1px ink curve to the right of the speaker
const arc16 = [
  F(ink, r(10, 6, 1, 1), r(11, 7, 1, 2), r(10, 9, 1, 1)),
  F(ink, r(12, 4, 1, 1), r(13, 5, 1, 1), r(14, 6, 1, 4), r(13, 10, 1, 1), r(12, 11, 1, 1)),
]
// 32 arcs are 2px thick with 2px gaps between them
const arc32 = [
  F(ink, r(19, 13, 1, 2), r(20, 14, 2, 4), r(19, 17, 1, 2)),
  F(ink, diag(21, 7, 3, 1, 1, 2), r(24, 10, 2, 12), diag(21, 23, 3, 1, -1, 2)),
  F(ink, diag(24, 4, 4, 1, 1, 2), r(28, 8, 2, 16), diag(24, 26, 4, 1, -1, 2)),
]

// Network node: gray box with a blue screen
const node = {
  16: x => [
    F(ink, r(x, 4, 5, 8)),
    S(b3, r(x + 1, 5, 3, 3)),
    S(g4, r(x + 1, 8, 3, 3)),
    F(gr3, r(x + 2, 9, 1, 1)),
  ],
  32: x => [
    F(ink, r(x, 8, 9, 16)),
    S(g4, r(x + 1, 9, 7, 14)),
    F(ink, r(x + 1, 9, 7, 8)),
    S(b3, r(x + 2, 10, 5, 6)),
    F(gr3, r(x + 2, 18, 2, 1)),
    F(g2, r(x + 2, 20, 5, 1)),
  ],
}

// Speech bubble with a tail at the bottom left
const bubble = {
  16: [
    F(ink, spans([[1, 2, 13], ...band(2, 10, 1, 14), [11, 2, 13], [12, 2, 5], [13, 2, 4], [14, 2, 3]])),
    S(white, r(2, 2, 12, 9), r(3, 11, 3, 1), r(3, 12, 2, 1), r(3, 13, 1, 1)),
  ],
  32: [
    F(ink, spans([[2, 4, 27], [3, 3, 28], ...band(4, 21, 2, 29), [22, 3, 28], [23, 4, 27],
      [24, 5, 10], [25, 5, 9], [26, 5, 8], [27, 5, 7], [28, 5, 6]])),
    S(white, r(4, 3, 24, 1), r(3, 4, 26, 18), r(4, 22, 24, 1), r(6, 23, 5, 1), r(6, 24, 4, 1), r(6, 25, 3, 1), r(6, 26, 2, 1), r(6, 27, 1, 1)),
  ],
}

// Mixer knob at 32
const knob32 = (x, y) => [
  F(ink, r(x - 3, y, 7, 5)),
  S(g4, r(x - 2, y + 1, 5, 3)),
  F(g2, r(x - 1, y + 2, 3, 1)),
]

const icons = {
  'audio/speaker': {
    16: [...speaker[16]],
    32: [...speaker[32]],
  },
  'audio/speaker-low': {
    16: [...speaker[16], arc16[0]],
    32: [...speaker[32], arc32[0]],
  },
  'audio/speaker-max': {
    16: [...speaker[16], ...arc16],
    32: [...speaker[32], ...arc32],
  },
  'audio/speaker-muted': {
    16: [...speaker[16], F(r2, diag(10, 5, 5, 1, 1, 1), diag(10, 9, 5, 1, -1, 1))],
    32: [...speaker[32], F(r2, diag(20, 11, 9, 1, 1, 2), diag(20, 19, 9, 1, -1, 2))],
  },
  'audio/mixer': {
    16: [
      F(ink, r(1, 1, 14, 14)),
      S(g5, r(2, 2, 12, 12)),
      F(ink, r(4, 3, 1, 10), r(8, 3, 1, 10), r(12, 3, 1, 10)),
      F(ink, r(3, 4, 3, 3), r(7, 8, 3, 3), r(11, 6, 3, 3)),
      F(g4, r(4, 5, 1, 1), r(8, 9, 1, 1), r(12, 7, 1, 1)),
    ],
    32: [
      F(ink, r(2, 2, 28, 28)),
      S(g5, r(3, 3, 26, 26)),
      F(ink, r(5, 4, 22, 4)),
      F(g1, r(6, 5, 20, 2)),
      F(gr3, r(7, 5, 2, 2), r(10, 5, 2, 2), r(13, 5, 2, 2), r(16, 5, 2, 2), r(19, 5, 2, 2), r(22, 5, 2, 2)),
      F(ink, r(9, 10, 1, 18), r(16, 10, 1, 18), r(23, 10, 1, 18)),
      F(g3, r(7, 11, 1, 1), r(7, 18, 1, 1), r(7, 25, 1, 1), r(14, 11, 1, 1), r(14, 18, 1, 1), r(14, 25, 1, 1), r(21, 11, 1, 1), r(21, 18, 1, 1), r(21, 25, 1, 1)),
      ...knob32(9, 12),
      ...knob32(16, 20),
      ...knob32(23, 15),
    ],
  },
  'network/connected': {
    16: [
      ...node[16](1),
      ...node[16](10),
      F(gr2, r(6, 7, 4, 1), r(7, 6, 2, 3)),
      F(gr3, r(7, 6, 1, 1)),
    ],
    32: [
      ...node[32](2),
      ...node[32](21),
      F(gr2, r(11, 15, 10, 2)),
      F(ink, circle(6, 13, 13)),
      S(gr2, circle(4, 14, 14)),
    ],
  },
  'network/disconnected': {
    16: [
      ...node[16](1),
      ...node[16](10),
      F(r2, diag(6, 6, 4, 1, 1, 1), diag(6, 9, 4, 1, -1, 1)),
    ],
    32: [
      ...node[32](2),
      ...node[32](21),
      F(gr2, r(11, 15, 2, 2), r(19, 15, 2, 2)),
      F(r2, diag(13, 13, 5, 1, 1, 2), diag(13, 17, 5, 1, -1, 2)),
    ],
  },
  'audio/headphones': {
    16: [
      H(ink, r(1, 5, 1, 3), r(2, 4, 1, 1), r(3, 3, 1, 1), r(4, 2, 8, 1), r(12, 3, 1, 1), r(13, 4, 1, 1), r(14, 5, 1, 3)),
      F(ink, r(1, 8, 5, 6), r(10, 8, 5, 6)),
      S(g4, r(2, 9, 3, 4), r(11, 9, 3, 4)),
    ],
    32: [
      H(ink, r(11, 3, 10, 2), r(9, 4, 2, 2), r(7, 6, 2, 2), r(6, 8, 2, 2), r(5, 10, 2, 2), r(4, 12, 2, 6),
        r(21, 4, 2, 2), r(23, 6, 2, 2), r(24, 8, 2, 2), r(25, 10, 2, 2), r(26, 12, 2, 6)),
      F(ink, r(2, 18, 8, 10), r(22, 18, 8, 10)),
      S(g4, r(3, 19, 6, 8), r(23, 19, 6, 8)),
      F(g3, r(4, 21, 4, 4), r(24, 21, 4, 4)),
    ],
  },
  'audio/subwoofer': {
    16: [
      F(ink, r(2, 1, 12, 14)),
      S(g4, r(3, 2, 10, 12)),
      F(ink, circle(8, 4, 5)),
      S(g2, circle(6, 5, 6)),
      F(ink, r(7, 8, 2, 2)),
      F(gr3, r(4, 3, 1, 1)),
    ],
    32: [
      F(ink, r(4, 2, 24, 28)),
      S(g4, r(5, 3, 22, 26)),
      F(ink, circle(18, 7, 9)),
      S(g2, circle(16, 8, 10)),
      F(ink, circle(4, 14, 16)),
      F(ink, circle(5, 20, 4)),
      F(g1, circle(3, 21, 5)),
      F(gr3, r(7, 5, 2, 1)),
    ],
  },
  'audio/speakers': {
    16: [...cabinet[16](1), ...cabinet[16](9)],
    32: [...cabinet[32](2), ...cabinet[32](17)],
  },
  'audio/surround': {
    16: [
      F(ink, r(1, 1, 3, 3), r(12, 1, 3, 3), r(1, 12, 3, 3), r(12, 12, 3, 3)),
      F(g3, r(2, 2, 1, 1), r(13, 2, 1, 1), r(2, 13, 1, 1), r(13, 13, 1, 1)),
      F(ink, r(6, 6, 4, 4)),
      S(g4, r(7, 7, 2, 2)),
    ],
    32: [
      H(ink, r(10, 7, 1, 4), r(7, 10, 4, 1), r(21, 7, 1, 4), r(21, 10, 4, 1), r(10, 21, 1, 4), r(7, 21, 4, 1), r(21, 21, 1, 4), r(21, 21, 4, 1)),
      F(ink, r(3, 3, 5, 5), r(24, 3, 5, 5), r(3, 24, 5, 5), r(24, 24, 5, 5)),
      S(g3, r(4, 4, 3, 3), r(25, 4, 3, 3), r(4, 25, 3, 3), r(25, 25, 3, 3)),
      F(ink, r(12, 12, 8, 8)),
      S(g4, r(13, 13, 6, 6)),
      F(ink, circle(4, 14, 14)),
      F(g2, r(15, 15, 2, 2)),
    ],
  },
  'audio/config': {
    16: [...speaker[16], ...badge[16](8, 8)],
    32: [...speaker[32], ...badge[32](19, 18)],
  },
  'audio/asio': {
    16: [...speaker[16], F(a3, bolt16)],
    32: [...speaker[32], F(ink, outline(bolt32, 32)), F(a3, bolt32)],
  },
  'status/bubble-question': {
    16: [
      ...bubble[16],
      F(ink, r(6, 3, 3, 1), r(5, 4, 1, 1), r(9, 4, 1, 2), r(8, 6, 1, 1), r(7, 7, 1, 1), r(7, 9, 1, 1)),
    ],
    32: [
      ...bubble[32],
      F(ink, r(12, 5, 8, 2), r(11, 7, 2, 2), r(19, 7, 2, 3), r(18, 10, 2, 2), r(16, 12, 2, 2), r(15, 14, 2, 2), r(15, 18, 2, 2)),
    ],
  },
  'status/bubble-exclamation': {
    16: [
      ...bubble[16],
      F(ink, r(7, 3, 2, 5), r(7, 9, 2, 1)),
    ],
    32: [
      ...bubble[32],
      F(ink, r(14, 5, 4, 10), r(14, 17, 4, 3)),
    ],
  },
}

write(process.argv[2], icons)
