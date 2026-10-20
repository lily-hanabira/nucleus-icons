// Emoji people: ear, nose, eye, biceps, tongue, mouth, and busts from baby to old woman
import { ink, g2, g5, g6, white, b3, b5, gr2, a2, a3, r1, r2, r3, p2, p3, n1, r, circle, diag, S, F, write, rasterise } from './lib.mjs'

// Pixel mask helpers: ink is the whole silhouette, the fill is the silhouette eroded by one pixel
const blank = size => new Uint8Array(size * size)
// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
// Mask of every pixel inside any of the paths
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) (typeof p === 'string' ? rasterise(p, size) : p).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Pixels of a mask whose four neighbours are all set
const erode = (m, size) => {
  const out = blank(size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
// Pixels in the first mask and not the second
const sub = (a, b) => a.map((v, i) => v && !b[i] ? 1 : 0)
// Pixels in both masks
const and = (a, b) => a.map((v, i) => v && b[i] ? 1 : 0)
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
// Outlined surface from a silhouette mask
const solid = (size, fill, m) => [F(ink, path(m, size)), S(fill, path(erode(m, size), size))]
// Symmetric lens: rows of given widths centred on cx
const lens = (size, cx, top, widths) => union(size, ...widths.map((w, i) => r(cx - w / 2, top + i, w, 1)))

// Bust geometry. 32: d14 head at (9,3) on 20 wide shoulders. 16: d7 head at (5,1) on 10 wide shoulders
const shoulders = {
  16: union(16, r(5, 9, 8, 1), r(4, 10, 10, 5)),
  32: union(32, r(10, 18, 12, 1), r(8, 19, 16, 1), r(7, 20, 18, 1), r(6, 21, 20, 9)),
}
const head = {
  16: [F(ink, circle(7, 5, 1)), S(a3, circle(5, 6, 2))],
  32: [F(ink, circle(14, 9, 3)), S(a3, circle(12, 10, 4))],
}
const neck = {
  16: [F(ink, r(6, 8, 1, 1), r(10, 8, 1, 1)), F(a3, r(7, 8, 3, 1))],
  32: [F(ink, r(12, 16, 1, 3), r(19, 16, 1, 3)), F(a3, r(13, 16, 6, 3)), F(a2, r(18, 17, 1, 2))],
}
const look = {
  16: [F(ink, r(7, 3, 1, 1), r(9, 3, 1, 1), r(7, 5, 3, 1))],
  32: [F(ink, r(13, 8, 1, 2), r(18, 8, 1, 2), r(13, 12, 1, 1), r(18, 12, 1, 1), r(14, 13, 4, 1))],
}
const faceMask = { 16: union(16, circle(5, 6, 2)), 32: union(32, circle(12, 10, 4)) }
// Top rows of the face disc, for hair
const topOf = (size, rows) => and(faceMask[size], union(size, r(0, 0, size, rows)))
// Shoulders, neck and head with extra parts
const bust = (size, shirt, extras) => [...solid(size, shirt, shoulders[size]), ...neck[size], ...head[size], ...extras]
// Bust per size with a shirt colour and parts
const person = (shirt16, shirt32, parts16, parts32) => ({
  16: bust(16, shirt16, parts16),
  32: bust(32, shirt32, parts32),
})

// Hair caps
const shortHair = {
  16: F(n1, r(7, 2, 3, 1), r(6, 3, 1, 1), r(10, 3, 1, 1)),
  32: S(n1, path(union(32, topOf(32, 8), r(10, 8, 2, 2), r(20, 8, 2, 2)), 32)),
}
// Gray hair cap from a mask
const grayHair = (size, m) => S(g5, path(m, size))
const glasses = {
  16: [F(ink, r(6, 2, 5, 1), r(6, 3, 1, 2), r(8, 3, 1, 2), r(10, 3, 1, 2), r(6, 4, 5, 1)), F(white, r(7, 3, 1, 1), r(9, 3, 1, 1))],
  32: [
    F(ink, r(11, 7, 4, 1), r(11, 10, 4, 1), r(11, 8, 1, 2), r(14, 8, 1, 2), r(17, 7, 4, 1), r(17, 10, 4, 1), r(17, 8, 1, 2), r(20, 8, 1, 2), r(15, 8, 2, 1), r(10, 8, 1, 1), r(21, 8, 1, 1)),
    F(white, r(12, 8, 2, 2), r(18, 8, 2, 2)),
    F(ink, r(13, 8, 1, 2), r(18, 8, 1, 2)),
  ],
}

// Body parts
// Ear: wide round top lobe cut flat on the left, narrower lobe below. The helix is an ink C one pixel inside the fill
const ear16 = union(16, and(union(16, circle(8, 4, 1)), union(16, r(5, 0, 8, 10))), r(5, 7, 5, 4), circle(6, 5, 9))
const ear32 = union(32, and(union(32, circle(16, 8, 3)), union(32, r(10, 2, 14, 18))), r(11, 14, 10, 6), circle(10, 11, 19))
const helix16 = and(sub(union(16, circle(6, 5, 2)), union(16, circle(4, 6, 3))), union(16, r(7, 2, 4, 4)))
const helix32 = and(sub(union(32, circle(12, 10, 5)), union(32, circle(8, 12, 7))), union(32, r(12, 5, 10, 10)))
const nose16 = union(16, r(6, 2, 3, 6), r(5, 7, 5, 3), r(4, 9, 8, 4), r(5, 13, 6, 1))
const nose32 = union(32, r(13, 3, 6, 10), r(12, 10, 8, 6), r(11, 14, 10, 4), circle(10, 8, 18), circle(10, 14, 18), r(12, 18, 8, 8))
const eye16 = lens(16, 8, 4, [4, 8, 10, 12, 12, 10, 8, 4])
const eye32 = lens(32, 16, 9, [6, 12, 18, 22, 24, 26, 28, 28, 26, 24, 22, 18, 12, 6])
const arm16 = union(16, circle(5, 9, 1), r(10, 4, 4, 6), circle(6, 3, 5), r(2, 9, 12, 5), r(3, 14, 10, 1))
const arm32 = union(32, circle(10, 18, 3), r(19, 10, 8, 10), r(6, 18, 22, 9), circle(10, 6, 17), circle(12, 7, 10), r(8, 27, 18, 1))
const tongue16 = union(16, circle(8, 4, 2), r(5, 6, 6, 4), circle(6, 5, 8))
const tongue32 = union(32, circle(16, 8, 4), r(10, 10, 12, 8), circle(12, 10, 15))
const lips16 = sub(lens(16, 8, 4, [6, 10, 12, 14, 14, 12, 10, 6]), union(16, r(7, 4, 2, 1)))
const lips32 = sub(lens(32, 16, 9, [10, 16, 20, 24, 26, 28, 28, 28, 26, 24, 22, 18, 14, 8]), union(32, r(15, 9, 2, 1)))

const icons = {
  'emoji/ear': {
    16: [...solid(16, a3, ear16), F(ink, path(helix16, 16), r(7, 11, 1, 2))],
    32: [...solid(32, a3, ear32), F(ink, path(helix32, 32), r(14, 22, 1, 3))],
  },
  'emoji/nose': {
    16: [...solid(16, a3, nose16), F(a2, r(8, 3, 1, 5), r(5, 11, 2, 1), r(9, 11, 2, 1))],
    32: [...solid(32, a3, nose32), F(a2, r(17, 6, 1, 10), r(10, 24, 3, 1), r(9, 23, 1, 1), r(19, 24, 3, 1), r(22, 23, 1, 1), r(15, 22, 2, 1))],
  },
  'emoji/eye': {
    16: [...solid(16, white, eye16), F(b3, circle(4, 6, 6)), F(ink, r(7, 7, 2, 2)), F(white, r(6, 6, 1, 1))],
    32: [
      ...solid(32, white, eye32),
      F(ink, r(6, 7, 1, 2), r(5, 6, 1, 1), r(10, 5, 1, 3), r(15, 4, 2, 3), r(21, 5, 1, 3), r(25, 7, 1, 2), r(26, 6, 1, 1)),
      F(b3, circle(10, 11, 11)), F(ink, circle(4, 14, 14)), F(white, r(13, 13, 2, 1), r(13, 14, 1, 1)),
    ],
  },
  'emoji/biceps': {
    16: [...solid(16, a3, arm16), F(a2, r(4, 11, 5, 1), r(10, 6, 1, 4))],
    32: [...solid(32, a3, arm32), F(a2, r(8, 21, 10, 1), r(9, 22, 8, 1), r(19, 12, 1, 7), r(20, 19, 6, 1)), F(ink, r(20, 6, 1, 1), r(22, 6, 1, 1), r(24, 6, 1, 1))],
  },
  'emoji/tongue': {
    16: [...solid(16, r3, tongue16), F(r2, r(7, 4, 1, 8))],
    32: [...solid(32, r3, tongue32), F(r2, r(15, 7, 1, 16))],
  },
  'emoji/mouth': {
    16: [...solid(16, r2, lips16), F(ink, r(3, 7, 10, 2)), F(white, r(4, 7, 8, 1)), F(ink, r(6, 7, 1, 1), r(9, 7, 1, 1)), F(r1, r(4, 8, 8, 1))],
    32: [
      ...solid(32, r2, lips32),
      F(ink, r(8, 14, 16, 5)),
      F(white, r(9, 15, 14, 2)), F(ink, r(12, 15, 1, 2), r(15, 15, 1, 2), r(18, 15, 1, 2)),
      F(r1, r(9, 17, 14, 1)),
    ],
  },
  'emoji/baby': {
    16: [...solid(16, a3, shoulders[16]), F(ink, r(6, 8, 5, 5)), S(b5, r(7, 9, 3, 3)), ...neck[16], ...head[16], ...look[16], F(ink, r(8, 1, 1, 1), r(9, 2, 1, 1))],
    32: [
      ...solid(32, a3, shoulders[32]), F(ink, circle(14, 9, 14)), S(b5, circle(12, 10, 15)), ...neck[32], ...head[32],
      ...look[32], F(n1, r(16, 4, 2, 1), r(18, 5, 1, 1), r(15, 5, 1, 1)), F(ink, r(16, 2, 2, 1)),
    ],
  },
  'emoji/boy': person(gr2, gr2, [...look[16], shortHair[16]], [...look[32], shortHair[32]]),
  'emoji/girl': {
    16: [...bust(16, r3, [...look[16], F(n1, r(7, 2, 3, 1), r(6, 3, 1, 1), r(10, 3, 1, 1)), F(ink, r(3, 4, 2, 3), r(11, 4, 2, 3)), F(n1, r(3, 5, 1, 1), r(12, 5, 1, 1))])],
    32: [
      F(ink, circle(6, 4, 8), circle(6, 22, 8)), S(n1, circle(4, 5, 9), circle(4, 23, 9)),
      ...bust(32, r3, [...look[32], S(n1, path(union(32, topOf(32, 8), r(10, 8, 2, 4), r(20, 8, 2, 4)), 32))]),
    ],
  },
  'emoji/man': person(b3, b3,
    [...look[16], shortHair[16], F(a2, r(7, 6, 3, 1))],
    [...look[32], shortHair[32], F(a2, r(11, 11, 1, 3), r(20, 11, 1, 3), r(12, 13, 2, 1), r(18, 13, 2, 1), r(12, 14, 8, 1), r(14, 15, 4, 1))]),
  'emoji/woman': {
    16: [
      F(ink, r(4, 1, 9, 1), r(3, 2, 11, 1), r(3, 3, 2, 6), r(12, 3, 2, 6)), F(n1, r(4, 3, 1, 5), r(12, 3, 1, 5)),
      ...bust(16, p2, [...look[16], F(n1, r(7, 2, 3, 1), r(6, 3, 1, 1), r(10, 3, 1, 1))]),
    ],
    32: [
      ...solid(32, n1, union(32, circle(16, 8, 2), r(8, 10, 4, 10), r(20, 10, 4, 10))),
      ...bust(32, p2, [...look[32], S(n1, path(union(32, topOf(32, 8), r(10, 8, 2, 3), r(20, 8, 2, 3)), 32))]),
    ],
  },
  'emoji/old-man': person(g2, g2,
    [...glasses[16], F(ink, r(7, 5, 3, 1)), F(g5, r(6, 3, 1, 1), r(10, 3, 1, 1))],
    [...look[32], grayHair(32, union(32, r(10, 7, 2, 4), r(20, 7, 2, 4), r(11, 6, 1, 1), r(20, 6, 1, 1))), ...glasses[32], F(g6, r(14, 19, 4, 1), r(15, 20, 2, 1)), F(ink, r(15, 22, 2, 1), r(15, 25, 2, 1))]),
  'emoji/old-woman': {
    16: [
      F(ink, r(10, 1, 4, 2)), F(g5, r(11, 1, 2, 1)),
      ...bust(16, p3, [...glasses[16], F(ink, r(7, 5, 3, 1)), F(g5, r(7, 2, 3, 1), r(6, 3, 1, 1), r(10, 3, 1, 1))]),
    ],
    32: [
      F(ink, circle(7, 17, 2)), S(g5, circle(5, 18, 3)),
      ...bust(32, p3, [...look[32], grayHair(32, union(32, topOf(32, 8), r(10, 8, 2, 4), r(20, 8, 2, 4))), ...glasses[32]]),
    ],
  },
}

write(process.argv[2], icons)
