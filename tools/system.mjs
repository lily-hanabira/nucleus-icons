// System icons: folders, pages, generic executable, settings and terminal
import { ink, g1, g2, n2, g3, g4, g5, g6, b2, b3, b4, b6, gr2, gr3, r2, n3, n4, r, circle, tri, diag, S, F, S1, write, page } from './lib.mjs'

// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)

// Slanted front flap of an open folder. Left edge runs from l0 at the top to l1 at the bottom
const flap = (top, bottom, right, l0, l1) => {
  const left = y => Math.round(l0 + ((l1 - l0) * (y - top)) / (bottom - top))
  let outline = r(left(top), top, right - left(top) + 1, 1) + r(left(bottom), bottom, right - left(bottom) + 1, 1)
  let fill = ''
  for (const y of range(top + 1, bottom)) {
    outline += r(left(y), y, 1, 1) + r(right, y, 1, 1)
    fill += r(left(y) + 1, y, right - left(y) - 1, 1)
  }
  return [outline, fill]
}

// Closed folder, the base of the folder variants
const closed = {
  16: [
    F(ink, r(1, 2, 7, 3), r(1, 4, 14, 10)),
    F(n3, r(2, 3, 5, 2)),
    S(n4, r(2, 5, 12, 8)),
    F(ink, r(1, 7, 14, 7)),
    S(n3, r(2, 8, 12, 5)),
  ],
  32: [
    F(ink, r(2, 4, 13, 5), r(2, 8, 28, 20)),
    S1(n3, r(3, 5, 11, 4)),
    S(n4, r(3, 9, 26, 18)),
    F(ink, r(2, 13, 28, 15)),
    S(n3, r(3, 14, 26, 13)),
  ],
}

const [flap16o, flap16f] = flap(7, 13, 14, 6, 1)
const [flap32o, flap32f] = flap(14, 27, 29, 12, 2)

const icons = {
  'system/folder-closed': closed,
  'system/folder-open': {
    16: [
      F(ink, r(1, 2, 7, 3), r(1, 4, 14, 10)),
      F(n3, r(2, 3, 5, 2)),
      S(n4, r(2, 5, 12, 8)),
      F(n2, r(2, 5, 12, 2)),
      F(ink, flap16o),
      S(n3, flap16f),
    ],
    32: [
      F(ink, r(2, 4, 13, 5), r(2, 8, 28, 20)),
      S1(n3, r(3, 5, 11, 4)),
      S(n4, r(3, 9, 26, 18)),
      F(n2, r(3, 9, 26, 5)),
      F(ink, flap32o),
      S(n3, flap32f),
    ],
  },
  'system/folder-system': {
    16: [...closed[16], F(ink, r(8, 8, 5, 5)), F(b2, r(9, 9, 3, 1)), F(b6, r(9, 10, 3, 2))],
    32: [...closed[32], F(ink, r(17, 16, 9, 9)), F(b3, r(18, 17, 7, 2)), S1(b6, r(18, 19, 7, 5))],
  },
  'system/page-blank': page,
  'system/page-text': {
    16: [...page[16], F(g3, r(5, 7, 6, 1), r(5, 9, 6, 1), r(5, 11, 4, 1))],
    32: [...page[32], F(g3, r(10, 13, 12, 2), r(10, 17, 12, 2), r(10, 21, 8, 2))],
  },
  'system/page-media': {
    16: [
      ...page[16],
      F(b3, r(5, 6, 3, 3)),
      F(r2, r(10, 6, 1, 3), r(9, 7, 3, 1)),
      F(gr2, r(7, 10, 2, 1), r(6, 11, 4, 1), r(5, 12, 6, 1)),
    ],
    32: [
      ...page[32],
      F(ink, r(8, 11, 7, 7)),
      S1(b3, r(9, 12, 5, 5)),
      F(ink, circle(7, 17, 11)),
      S1(r2, circle(5, 18, 12)),
      F(ink, tri(15, 19, 4)),
      S1(gr2, tri(15, 21, 3, 1)),
    ],
  },
  'system/page-config': {
    16: [
      ...page[16],
      F(ink, r(5, 6, 5, 5), r(6, 5, 3, 1), r(6, 11, 3, 1), r(4, 7, 1, 3), r(10, 7, 1, 3)),
      F(g4, r(6, 7, 3, 3)),
      F(ink, r(7, 8, 1, 1)),
    ],
    32: [
      ...page[32],
      F(ink, circle(12, 10, 12), r(14, 10, 4, 2), r(14, 24, 4, 2), r(8, 14, 2, 4), r(22, 14, 2, 4)),
      S1(g3, circle(10, 11, 13)),
      F(ink, r(14, 16, 4, 4)),
      F(g5, r(15, 17, 2, 2)),
    ],
  },
  'system/page-code': {
    16: [...page[16], F(b2, diag(6, 6, 2, -1, 1, 1) + diag(5, 8, 2, 1, 1, 1) + diag(9, 6, 2, 1, 1, 1) + diag(10, 8, 2, -1, 1, 1))],
    32: [
      ...page[32],
      F(b2, diag(14, 10, 4, -1, 1, 2) + diag(11, 15, 4, 1, 1, 2) + diag(17, 10, 4, 1, 1, 2) + diag(20, 15, 4, -1, 1, 2)),
    ],
  },
  'system/executable-generic': {
    16: [
      F(ink, r(1, 1, 14, 14)),
      S(b2, r(2, 2, 12, 2)),
      S(g5, r(2, 4, 12, 10)),
      F(ink, r(4, 7, 8, 4)),
      S(g4, r(5, 8, 6, 2)),
    ],
    32: [
      F(ink, r(1, 3, 30, 26)),
      S1(b3, r(2, 4, 28, 4)),
      F(g6, r(23, 5, 2, 2), r(26, 5, 2, 2)),
      S(g5, r(2, 8, 28, 20)),
      F(ink, r(8, 14, 16, 8)),
      S1(g4, r(9, 15, 14, 6)),
      F(g2, r(12, 17, 8, 2)),
    ],
  },
  'system/settings': {
    16: [
      F(ink, circle(12, 2, 2), r(6, 0, 4, 3), r(6, 13, 4, 3), r(0, 6, 3, 4), r(13, 6, 3, 4)),
      S(g3, circle(10, 3, 3), r(7, 1, 2, 3), r(7, 12, 2, 3), r(1, 7, 3, 2), r(12, 7, 3, 2)),
      F(ink, r(6, 6, 4, 4)),
      F(g5, r(7, 7, 2, 2)),
    ],
    32: [
      F(ink, circle(26, 3, 3), r(13, 0, 6, 4), r(13, 28, 6, 4), r(0, 13, 4, 6), r(28, 13, 4, 6), r(5, 5, 5, 5), r(22, 5, 5, 5), r(5, 22, 5, 5), r(22, 22, 5, 5)),
      S(g3, circle(24, 4, 4), r(14, 1, 4, 4), r(14, 27, 4, 4), r(1, 14, 4, 4), r(27, 14, 4, 4), r(6, 6, 3, 3), r(23, 6, 3, 3), r(6, 23, 3, 3), r(23, 23, 3, 3)),
      F(ink, r(11, 11, 10, 10)),
      S1(g5, r(12, 12, 8, 8)),
    ],
  },
  'system/terminal': {
    16: [
      F(ink, r(1, 1, 14, 14)),
      S(b2, r(2, 2, 12, 2)),
      S(g1, r(2, 4, 12, 10)),
      F(gr3, 'M4 6h1v1h1v1h-1v1h-1z'),
      F(g5, r(7, 9, 3, 1)),
    ],
    32: [
      F(ink, r(1, 3, 30, 26)),
      S1(b3, r(2, 4, 28, 4)),
      F(g6, r(23, 5, 2, 2), r(26, 5, 2, 2)),
      S(g1, r(2, 8, 28, 20)),
      F(gr3, 'M6 12h2v2h2v2h-2v2h-2v-2h2v-2h-2z'),
      F(g5, r(13, 18, 6, 2)),
    ],
  },
}

write(process.argv[2], icons)
