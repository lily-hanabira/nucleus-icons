// Component icons: database, tensors, 3d cube, package, container, service, library, font and index
import { ramps, ink, g3, g5, white, b2, b3, b5, gr2, gr4, r2, r4, p3, p4, n3, n4, r, circle, diag, S, F, S1, write, page } from './lib.mjs'

const [t1, t2, t3, t4] = ramps.teal

// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)

// one pixel tall run from x0 to x1 inclusive
const seg = (y, x0, x1) => r(x0, y, x1 - x0 + 1, 1)

// Isometric cube. Rows step two pixels per row, vertex column cx, left and right faces split by a centre edge.
// top: first row, half: half width in two pixel steps, side: rows of straight side edge
const cube = (cx, top, half, side) => {
  const inkP = [seg(top, cx, cx)], topF = [], left = [], right = []
  for (const k of range(1, half + 1)) {
    const y = top + k, x0 = cx - 2 * k, x1 = cx + 2 * k
    inkP.push(seg(y, x0, x0 + 1), seg(y, x1 - 1, x1))
    topF.push(seg(y, x0 + 2, x1 - 2))
  }
  const wide = top + half, xl = cx - 2 * half, xr = cx + 2 * half
  const mid = wide + half
  for (const k of range(1, half)) {
    const y = wide + k, a = xl + 2 * k - 1, b = xr - 2 * k + 1
    inkP.push(seg(y, a, a + 1), seg(y, b - 1, b))
    topF.push(seg(y, a + 2, b - 2))
    if (k > 1) {
      left.push(seg(y, xl + 1, a - 1))
      right.push(seg(y, b + 1, xr - 1))
    }
  }
  inkP.push(seg(mid, cx - 1, cx + 1))
  left.push(seg(mid, xl + 1, cx - 2))
  right.push(seg(mid, cx + 2, xr - 1))
  const bottom = mid + side + half
  inkP.push(r(xl, wide + 1, 1, side + half), r(xr, wide + 1, 1, side + half), r(cx, mid + 1, 1, bottom - mid - 1))
  left.push(r(xl + 1, mid + 1, cx - xl - 1, side))
  right.push(r(cx + 1, mid + 1, xr - cx - 1, side))
  for (const j of range(0, half)) {
    const y = mid + 1 + side + j, a = xl + 2 * j, b = xr - 2 * j
    inkP.push(seg(y, a, a + 1), seg(y, b - 1, b))
    if (a + 2 <= cx - 1) {
      left.push(seg(y, a + 2, cx - 1))
      right.push(seg(y, cx + 1, b - 2))
    }
  }
  inkP.push(seg(bottom, cx, cx))
  return { ink: inkP, top: topF, left, right }
}

const cube16 = cube(7, 1, 3, 4)
const cube32 = cube(16, 2, 6, 9)

// Standing book with a spine label
const book = (fill, light, x, top, w, bottom) => [
  F(ink, r(x, top, w, bottom - top + 1)),
  S(fill, r(x + 1, top + 1, w - 2, bottom - top - 1)),
  F(ink, r(x + 1, top + 3, w - 2, 1), r(x + 1, bottom - 4, w - 2, 1)),
  F(light, r(x + 3, top + 7, w - 6, 6)),
  F(ink, r(x + 4, top + 9, w - 8, 1), r(x + 4, top + 11, w - 8, 1)),
]

// Tensor cell, dark or light teal
const cell = (x, y, s, dark) => F(dark ? t2 : t3, r(x, y, s, s))

const icons = {
  'components/db': {
    16: [
      F(ink, seg(1, 4, 11), seg(2, 3, 12), r(2, 3, 12, 11), seg(14, 4, 11)),
      S(p3, seg(2, 4, 11), r(3, 3, 10, 10), seg(13, 4, 11)),
      F(p4, seg(2, 4, 11), seg(3, 3, 12)),
      F(ink, seg(4, 4, 11), seg(7, 3, 3), seg(7, 12, 12), seg(8, 4, 11), seg(11, 3, 3), seg(11, 12, 12), seg(12, 4, 11)),
    ],
    32: [
      F(ink, seg(2, 10, 21), seg(3, 7, 24), seg(4, 5, 26), r(4, 5, 24, 22), seg(27, 5, 26), seg(28, 7, 24), seg(29, 10, 21)),
      S(p3, seg(3, 10, 21), seg(4, 7, 24), r(5, 5, 22, 22), seg(27, 7, 24), seg(28, 10, 21)),
      S(p4, seg(3, 10, 21), seg(4, 7, 24), r(5, 5, 22, 3), seg(8, 7, 24), seg(9, 10, 21)),
      F(ink, seg(7, 5, 6), seg(7, 25, 26), seg(8, 7, 9), seg(8, 22, 24), seg(9, 10, 21)),
      F(ink, seg(14, 5, 6), seg(14, 25, 26), seg(15, 7, 9), seg(15, 22, 24), seg(16, 10, 21)),
      F(ink, seg(21, 5, 6), seg(21, 25, 26), seg(22, 7, 9), seg(22, 22, 24), seg(23, 10, 21)),
    ],
  },
  'components/tensors': {
    16: [
      ...page[16],
      ...[0, 1, 2].flatMap(i => [0, 1, 2].map(j => cell(4 + 3 * j, 5 + 3 * i, 2, (i === 0 && j === 0) || (i === 1 && j === 2) || (i === 2 && j === 1)))),
    ],
    32: [
      ...page[32],
      ...[0, 1, 2].flatMap(i => [0, 1, 2].map(j => cell(9 + 5 * j, 11 + 5 * i, 4, (i === 0 && j === 0) || (i === 1 && j === 2) || (i === 2 && j === 1)))),
    ],
  },
  'components/3d': {
    16: [
      F(ink, ...cube16.ink),
      S(b5, ...cube16.top),
      S(b3, ...cube16.left),
      S(b2, ...cube16.right),
    ],
    32: [
      F(ink, ...cube32.ink),
      S(b5, ...cube32.top),
      S(b3, ...cube32.left),
      S(b2, ...cube32.right),
    ],
  },
  'components/package': {
    16: [
      F(ink, r(2, 2, 12, 12)),
      S(n4, r(3, 3, 10, 4)),
      F(ink, r(3, 7, 10, 1), r(7, 3, 1, 4)),
      S(n3, r(3, 8, 10, 5)),
      F(white, r(5, 9, 3, 2)),
    ],
    32: [
      F(ink, r(3, 4, 26, 25)),
      S(n4, r(4, 5, 24, 8)),
      F(ink, r(4, 13, 24, 1), r(15, 5, 1, 8)),
      S(n3, r(4, 14, 24, 14)),
      F(ink, r(8, 17, 10, 7)),
      S1(white, r(9, 18, 8, 5)),
      F(g3, r(10, 19, 6, 1), r(10, 21, 4, 1)),
    ],
  },
  'components/container': {
    16: [
      F(ink, r(1, 3, 14, 10)),
      S(t2, r(2, 4, 12, 8)),
      F(ink, r(3, 5, 1, 6), r(6, 5, 1, 6), r(8, 4, 1, 8), r(10, 5, 1, 6), r(12, 5, 1, 6)),
    ],
    32: [
      F(ink, r(2, 7, 28, 18)),
      S(t2, r(3, 8, 26, 16)),
      F(ink, r(5, 9, 1, 14), r(8, 9, 1, 14), r(11, 9, 1, 14), r(14, 9, 1, 14), r(17, 9, 1, 14)),
      F(ink, r(20, 8, 1, 16), r(23, 9, 1, 14), r(26, 9, 1, 14)),
    ],
  },
  'components/service': {
    16: [
      F(ink, r(2, 1, 12, 1), r(1, 2, 1, 12), r(14, 2, 1, 12), r(2, 14, 12, 1)),
      S(g5, r(2, 2, 12, 12)),
      F(ink, circle(8, 4, 3), r(7, 2, 2, 1), r(7, 11, 2, 1), r(3, 6, 1, 2), r(12, 6, 1, 2)),
      S(g3, circle(6, 5, 4)),
      F(ink, r(7, 6, 2, 2)),
    ],
    32: [
      F(ink, seg(2, 4, 27), seg(3, 3, 3), seg(3, 28, 28), r(2, 4, 1, 24), r(29, 4, 1, 24), seg(28, 3, 3), seg(28, 28, 28), seg(29, 4, 27)),
      S(g5, seg(3, 4, 27), r(3, 4, 26, 24), seg(28, 4, 27)),
      F(ink, circle(18, 7, 7), r(14, 5, 4, 2), r(14, 25, 4, 2), r(5, 14, 2, 4), r(25, 14, 2, 4), r(8, 8, 3, 3), r(21, 8, 3, 3), r(8, 21, 3, 3), r(21, 21, 3, 3)),
      S(g3, circle(16, 8, 8), r(15, 6, 2, 2), r(15, 24, 2, 2), r(6, 15, 2, 2), r(24, 15, 2, 2), r(9, 9, 2, 2), r(21, 9, 2, 2), r(9, 21, 2, 2), r(21, 21, 2, 2)),
      F(ink, r(14, 14, 4, 4)),
      F(g5, r(15, 15, 2, 2)),
    ],
  },
  'components/library': {
    16: [
      F(ink, r(2, 3, 5, 12), r(6, 1, 5, 14), r(10, 4, 5, 11)),
      S(b3, r(3, 4, 3, 10)),
      S(gr2, r(7, 2, 3, 12)),
      S(r2, r(11, 5, 3, 9)),
      F(ink, r(3, 6, 3, 1), r(7, 4, 3, 1), r(11, 7, 3, 1), r(3, 12, 3, 1), r(7, 12, 3, 1), r(11, 12, 3, 1)),
    ],
    32: [
      ...book(b3, b5, 2, 6, 10, 29),
      ...book(gr2, gr4, 11, 2, 10, 29),
      ...book(r2, r4, 20, 8, 10, 29),
    ],
  },
  'components/font': {
    16: [
      ...page[16],
      F(ink, seg(5, 7, 8), r(6, 6, 1, 3), r(9, 6, 1, 3), seg(9, 6, 9), r(5, 10, 1, 3), r(10, 10, 1, 3), seg(12, 5, 6), seg(12, 9, 10)),
    ],
    32: [
      ...page[32],
      F(ink,
        seg(10, 15, 16), seg(11, 14, 17),
        r(14, 12, 2, 2), r(16, 12, 2, 2),
        r(13, 14, 2, 2), r(17, 14, 2, 2),
        r(12, 16, 2, 2), r(18, 16, 2, 2),
        r(11, 18, 10, 2),
        r(10, 20, 2, 2), r(20, 20, 2, 2),
        r(9, 22, 2, 3), r(21, 22, 2, 3),
        seg(25, 8, 11), seg(25, 20, 23),
      ),
    ],
  },
  'components/index': {
    16: [
      ...page[16],
      F(ink, circle(7, 6, 6)),
      S(b5, circle(5, 7, 7)),
      F(ink, diag(12, 12, 2, 1, 1, 2)),
    ],
    32: [
      ...page[32],
      F(g3, r(10, 6, 8, 2), r(10, 10, 5, 2)),
      F(ink, circle(14, 12, 12)),
      S(b5, circle(12, 13, 13)),
      F(white, r(15, 15, 1, 1)),
      F(ink, diag(25, 24, 4, 1, 1, 3)),
    ],
  },
}

write(process.argv[2], icons)
