// Emoji hands and gestures, people hugging, and the cat faces drawn on the shared cat grid
import { ink, white, b3, b4, gr2, a2, a3, r2, r3, n3, r, circle, S, F, H, write, rasterise, catFace, eyes, smile } from './lib.mjs'

// Pixel mask helpers: ink is the whole silhouette, the fill is the silhouette eroded by one pixel
const blank = size => new Uint8Array(size * size)
// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
// Mask of every pixel inside any of the paths
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Mask shrunk by n pixels on every side
const erode = (m, size, n = 1) => {
  let cur = m
  for (const _ of range(0, n)) {
    const out = blank(size)
    const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && cur[y * size + x] === 1
    for (const y of range(0, size)) for (const x of range(0, size)) {
      if (at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)) out[y * size + x] = 1
    }
    cur = out
  }
  return cur
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
// Move every pixel of each layer through fn
const mapMask = (size, layers, fn) => layers.map(l => {
  const m = rasterise(l.d, size), out = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) if (m[y * size + x]) {
    const [nx, ny] = fn(x, y)
    if (nx >= 0 && nx < size && ny >= 0 && ny < size) out[ny * size + nx] = 1
  }
  return { ...l, d: path(out, size) }
})
// Mirror layers top to bottom
const flipV = (size, layers) => mapMask(size, layers, (x, y) => [x, size - 1 - y])
// Mirror layers left to right
const flipH = (size, layers) => mapMask(size, layers, (x, y) => [size - 1 - x, y])
// Lean a drawing: rows above y0 slide right one pixel every k rows
const shear = (size, layers, k, y0) => mapMask(size, layers, (x, y) => [x + Math.max(0, Math.floor((y0 - y) / k)), y])
// Skin surface from a silhouette mask
const skin = (size, m) => [F(ink, path(m, size)), S(a3, path(erode(m, size), size))]
// Blue sleeve cuff
const cuff = (x, y, w, h) => [F(ink, r(x, y, w, h)), (h > 3 ? S : F)(b3, r(x + 1, y + 1, w - 2, h - 2))]
// Rounded block as an outlined bevelled a3 surface
const block = (x, y, w, h, fill = a3) => [F(ink, r(x + 1, y, w - 2, h), r(x, y + 1, w, h - 2)), S(fill, r(x + 1, y + 1, w - 2, h - 2))]
// Clear the topmost pixel of a column so a notch forms between finger bumps
const notch = (m, size, ...xs) => {
  const out = new Uint8Array(m)
  for (const x of xs) {
    const y = topOf(out, size, x)
    if (y < size) out[y * size + x] = 0
  }
  return out
}
// First set row in column x
const topOf = (m, size, x) => range(0, size).find(y => m[y * size + x]) ?? size
// Pixels of a mask in column x, n rows from row from
const column = (m, size, x, from, n) => and(m, rasterise(r(x, from, 1, n), size))

// Heart silhouette from two lobes and a point
const heart = (size, cxL, cxR, cy, R, apex) => {
  const m = blank(size)
  const cx = (cxL + cxR) / 2, half = cxR + R - cx
  for (const y of range(0, size)) for (const x of range(0, size)) {
    const px = x + 0.5, py = y + 0.5
    const inLobe = Math.hypot(px - cxL, py - cy) <= R || Math.hypot(px - cxR, py - cy) <= R
    const inPoint = py >= cy && py < apex && Math.abs(px - cx) <= half * (apex - py) / (apex - cy)
    if (inLobe || inPoint) m[y * size + x] = 1
  }
  return m
}

// Hands
const hand16 = union(16,
  r(3, 4, 3, 9), r(4, 3, 1, 1),
  r(6, 3, 3, 10), r(7, 2, 1, 1),
  r(9, 4, 3, 9), r(10, 3, 1, 1),
  r(12, 6, 3, 7), r(13, 5, 1, 1),
  r(3, 9, 12, 4), r(4, 13, 10, 1), r(6, 14, 6, 1),
  r(1, 8, 3, 3), r(2, 7, 2, 1),
)
const hand32 = union(32,
  r(7, 6, 5, 13), r(8, 5, 3, 1),
  r(12, 4, 5, 15), r(13, 3, 3, 1),
  r(17, 5, 5, 14), r(18, 4, 3, 1),
  r(22, 8, 5, 11), r(23, 7, 3, 1),
  r(7, 18, 20, 9), r(8, 27, 18, 1), r(10, 28, 14, 1), r(12, 29, 10, 1),
  r(5, 12, 2, 1), r(4, 13, 4, 1), r(3, 14, 5, 6), r(4, 20, 4, 1), r(5, 21, 3, 1),
)

// Fist from the side: four stacked finger segments, thumb leaning out, cuff at the wrist
const fist16 = sub(union(16,
  r(6, 6, 7, 9),
  r(3, 1, 3, 1), r(3, 2, 4, 2), r(4, 4, 4, 2), r(5, 6, 4, 1),
), union(16, r(12, 8, 1, 1), r(12, 10, 1, 1), r(12, 12, 1, 1)))
const fist32 = sub(union(32,
  r(9, 10, 17, 19),
  r(6, 3, 4, 1), r(5, 4, 6, 4), r(6, 8, 6, 1), r(7, 9, 6, 1), r(7, 10, 2, 1),
), union(32, ...[10, 13, 14, 15, 18, 19, 20, 23, 24, 25, 28].map(y => r(25, y, 1, 1))))
const thumbsUp = {
  16: [
    ...skin(16, fist16), F(a2, r(8, 7, 1, 1), r(7, 8, 4, 1), r(7, 10, 4, 1), r(7, 12, 4, 1)),
    F(ink, r(1, 9, 6, 5)), S(b3, r(2, 10, 4, 3)),
  ],
  32: [
    ...skin(32, fist32), F(a2, r(12, 10, 1, 4), r(13, 14, 11, 1), r(13, 19, 11, 1), r(13, 24, 11, 1)),
    F(ink, r(3, 17, 7, 11)), S(b3, r(4, 18, 5, 9)),
  ],
}

// Folded hands: two palms pressed together seen from the front, split by a centre ink line
const folded16 = union(16, r(4, 4, 2, 7), r(6, 3, 1, 8), r(7, 2, 3, 9), r(10, 3, 1, 8), r(11, 4, 2, 7), r(3, 5, 11, 6))
const folded32 = union(32,
  r(7, 6, 2, 16), r(9, 6, 1, 16), r(10, 4, 2, 18), r(12, 4, 1, 18), r(13, 3, 2, 19),
  r(15, 3, 1, 19), r(16, 3, 2, 19), r(18, 4, 1, 18), r(19, 4, 2, 18), r(21, 6, 1, 16), r(22, 6, 2, 16),
  r(6, 7, 19, 16),
)
const foldedHands = {
  16: [
    F(ink, path(folded16, 16)), S(a3, path(sub(erode(folded16, 16), rasterise(r(8, 0, 1, 16), 16)), 16)),
    F(a2, r(6, 4, 1, 3), r(10, 4, 1, 3)),
    ...block(4, 6, 5, 4), ...block(7, 7, 5, 4),
    ...cuff(3, 11, 5, 4), ...cuff(9, 11, 5, 4),
  ],
  32: [
    F(ink, path(folded32, 32)), S(a3, path(sub(erode(folded32, 32), rasterise(r(15, 0, 1, 32), 32)), 32)),
    F(a2, r(9, 7, 1, 8), r(12, 5, 1, 10), r(18, 5, 1, 10), r(21, 7, 1, 8)),
    ...block(8, 12, 9, 5), ...block(14, 15, 9, 5),
    ...cuff(7, 22, 8, 7), ...cuff(16, 22, 8, 7),
  ],
}

// Heart hands: two hands from the lower corners, finger bumps along the lobes, a small heart in the gap
const heartRing = (size, outer, depth, wrists, fingers, creaseLen, split) => {
  let m = union(size, path(sub(outer, erode(outer, size, depth)), size), ...wrists)
  m = notch(m, size, ...fingers)
  const fill = erode(m, size)
  const creases = fingers.map(x => column(fill, size, x, topOf(m, size, x) + 1, creaseLen))
  return [F(ink, path(m, size)), S(a3, path(fill, size)), F(a2, creases.map(c => path(c, size)).join('')), F(ink, path(and(m, rasterise(split, size)), size))]
}
// Rects plus their mirror across the canvas
const mirrorRects = (size, rects) => [...rects, ...rects.map(([x, y, w, h]) => [size - x - w, y, w, h])].map(q => r(...q))
const wrists16 = mirrorRects(16, [[1, 8, 3, 1], [1, 9, 4, 1], [2, 10, 4, 1], [3, 11, 4, 1]])
const wrists32 = mirrorRects(32, [[3, 19, 8, 1], [3, 20, 9, 1], [4, 21, 9, 1], [5, 22, 9, 1], [6, 23, 8, 1], [7, 24, 7, 1]])
const heartHands = {
  16: [
    ...heartRing(16, heart(16, 5, 11, 5.5, 4, 15.5), 3, wrists16, [3, 5, 10, 12], 2, r(7, 9, 2, 6)),
    F(ink, r(6, 5, 1, 1), r(9, 5, 1, 1), r(5, 6, 6, 1), r(6, 7, 4, 1), r(7, 8, 2, 1)), F(r2, r(6, 6, 4, 1), r(7, 7, 2, 1)),
  ],
  32: [
    ...heartRing(32, heart(32, 10, 22, 10.5, 7, 29), 5, wrists32, [6, 9, 12, 19, 22, 25], 4, r(15, 18, 2, 11)),
    F(ink, path(heart(32, 13.5, 18.5, 12.5, 3, 20), 32)), S(r2, path(erode(heart(32, 13.5, 18.5, 12.5, 3, 20), 32), 32)),
  ],
}

// Open palm with the fingers together and a cuff, the basis for several gestures
const palm16 = union(16,
  r(3, 4, 3, 5), r(4, 3, 1, 1), r(6, 3, 3, 6), r(7, 2, 1, 1), r(9, 4, 3, 5), r(10, 3, 1, 1), r(12, 6, 3, 3), r(13, 5, 1, 1),
  r(3, 8, 12, 4), r(4, 12, 10, 1), r(1, 8, 3, 3), r(2, 7, 2, 1),
)
const palm32 = union(32,
  r(7, 6, 5, 12), r(8, 5, 3, 1), r(12, 4, 5, 14), r(13, 3, 3, 1), r(17, 5, 5, 13), r(18, 4, 3, 1), r(22, 8, 5, 10), r(23, 7, 3, 1),
  r(7, 16, 20, 7), r(8, 23, 18, 1), r(5, 12, 2, 1), r(4, 13, 4, 1), r(3, 14, 5, 6), r(4, 20, 4, 1), r(5, 21, 3, 1),
)
const palmCreases = {
  16: F(a2, r(5, 5, 1, 5), r(8, 4, 1, 6), r(11, 7, 1, 3), r(3, 8, 1, 3)),
  32: [F(a2, r(11, 7, 1, 11), r(16, 5, 1, 13), r(21, 8, 1, 10), r(7, 13, 1, 9)), F(ink, r(7, 12, 1, 1))],
}
const handRaised = {
  16: [...skin(16, palm16), palmCreases[16], ...cuff(5, 12, 8, 3)],
  32: [...skin(32, palm32), ...palmCreases[32], ...cuff(9, 23, 14, 6)],
}
const wave16 = union(16, r(4, 4, 3, 4), r(5, 3, 1, 1), r(7, 3, 3, 5), r(8, 2, 1, 1), r(10, 5, 3, 3), r(11, 4, 1, 1), r(4, 8, 9, 4), r(5, 12, 7, 1), r(2, 7, 3, 3), r(3, 6, 2, 1))
// Wavy mouth at 32 from a list of row positions
const wave32 = union(32,
  r(6, 7, 5, 11), r(7, 6, 3, 1), r(11, 5, 5, 13), r(12, 4, 3, 1), r(16, 6, 5, 12), r(17, 5, 3, 1), r(21, 9, 5, 9), r(22, 8, 3, 1),
  r(6, 17, 20, 8), r(7, 25, 18, 1), r(9, 26, 14, 1), r(2, 13, 5, 7), r(3, 12, 3, 1), r(3, 20, 3, 1),
)
const handWaving = {
  16: [
    H(ink, r(2, 1, 1, 1), r(1, 2, 1, 3), r(2, 5, 1, 1)),
    ...shear(16, [...skin(16, wave16), F(a2, r(6, 5, 1, 5), r(9, 4, 1, 6), r(4, 8, 1, 2))], 5, 13),
  ],
  32: [
    H(ink, r(4, 3, 1, 1), r(3, 4, 1, 6), r(4, 10, 1, 1)), H(ink, r(6, 5, 1, 1), r(5, 6, 1, 3), r(6, 9, 1, 1)),
    ...shear(32, [...skin(32, wave32), F(a2, r(10, 8, 1, 10), r(15, 7, 1, 11), r(20, 10, 1, 8), r(6, 14, 1, 6))], 6, 26),
  ],
}
const splay16 = union(16,
  r(3, 4, 3, 5), r(4, 3, 1, 1), r(7, 3, 3, 6), r(8, 2, 1, 1), r(11, 5, 3, 4), r(12, 4, 1, 1),
  r(3, 9, 11, 3), r(4, 12, 9, 1), r(5, 13, 7, 1), r(1, 8, 3, 3), r(2, 7, 2, 1),
)
const splay32 = union(32,
  r(8, 7, 4, 10), r(9, 6, 2, 1), r(13, 5, 4, 12), r(14, 4, 2, 1), r(18, 6, 4, 11), r(19, 5, 2, 1), r(23, 9, 4, 8), r(24, 8, 2, 1),
  r(8, 17, 19, 8), r(9, 25, 17, 1), r(11, 26, 13, 1), r(5, 12, 2, 1), r(4, 13, 4, 1), r(3, 14, 5, 6), r(4, 20, 4, 1), r(5, 21, 3, 1),
)
const handSplayed = {
  16: [...skin(16, splay16), F(a2, r(6, 10, 1, 2), r(10, 10, 1, 2), r(3, 8, 1, 3))],
  32: [...skin(32, splay32), F(a2, r(12, 18, 1, 3), r(17, 18, 1, 3), r(22, 18, 1, 3), r(8, 13, 1, 9))],
}
const vulcan16 = union(16,
  r(2, 4, 6, 5), r(2, 3, 5, 1), r(3, 2, 3, 1), r(9, 4, 6, 5), r(10, 3, 5, 1), r(11, 2, 3, 1),
  r(2, 9, 13, 4), r(3, 13, 11, 1),
)
const vulcan32 = union(32,
  r(7, 6, 5, 11), r(8, 5, 3, 1), r(12, 8, 5, 9), r(12, 5, 4, 3), r(13, 4, 2, 1),
  r(18, 8, 5, 9), r(19, 5, 4, 3), r(19, 4, 2, 1), r(23, 8, 5, 9), r(24, 7, 3, 1),
  r(7, 17, 21, 7), r(8, 24, 19, 1), r(10, 25, 15, 1), r(5, 12, 2, 1), r(4, 13, 4, 1), r(3, 14, 5, 6), r(4, 20, 4, 1), r(5, 21, 3, 1),
)
const handVulcan = {
  16: [...skin(16, vulcan16), F(a2, r(4, 4, 1, 6), r(12, 4, 1, 6), r(8, 10, 1, 2))],
  32: [...skin(32, vulcan32), F(a2, r(11, 7, 1, 12), r(22, 9, 1, 10), r(17, 18, 1, 3), r(7, 13, 1, 9)), F(ink, r(7, 12, 1, 1))],
}
const ok16 = union(16,
  r(6, 3, 3, 6), r(7, 2, 1, 1), r(9, 4, 3, 5), r(10, 3, 1, 1), r(12, 6, 3, 3), r(13, 5, 1, 1),
  r(6, 8, 9, 4), r(7, 12, 7, 1), circle(8, 1, 7),
)
const ok32 = union(32,
  r(12, 5, 5, 13), r(13, 4, 3, 1), r(17, 6, 5, 12), r(18, 5, 3, 1), r(22, 9, 5, 9), r(23, 8, 3, 1),
  r(10, 17, 17, 8), r(11, 25, 15, 1), r(13, 26, 11, 1), circle(10, 3, 12),
)
const handOk = {
  16: [...skin(16, sub(ok16, rasterise(r(3, 9, 3, 3), 16))), F(a2, r(8, 4, 1, 6), r(11, 7, 1, 3))],
  32: [...skin(32, sub(ok32, rasterise(circle(4, 6, 15), 32))), F(a2, r(16, 7, 1, 12), r(21, 10, 1, 9))],
}
const victory16 = union(16,
  r(3, 2, 3, 3), r(4, 1, 1, 1), r(4, 5, 3, 4), r(10, 2, 3, 3), r(11, 1, 1, 1), r(9, 5, 3, 4),
  r(4, 9, 9, 3), r(2, 9, 3, 3), r(3, 8, 1, 1),
)
const victory32 = union(32,
  r(6, 5, 5, 2), r(7, 4, 3, 1), r(7, 7, 5, 3), r(8, 10, 5, 3), r(9, 13, 5, 3),
  r(19, 5, 5, 2), r(20, 4, 3, 1), r(18, 7, 5, 3), r(17, 10, 5, 3), r(16, 13, 5, 3),
  r(8, 16, 18, 9), r(10, 25, 14, 1), r(5, 17, 4, 5), r(6, 16, 2, 1), r(6, 22, 2, 1),
)
const handVictory = {
  16: [...skin(16, victory16), F(a2, r(4, 9, 1, 2), r(10, 10, 3, 1)), ...cuff(5, 12, 7, 3)],
  32: [...skin(32, sub(victory32, rasterise(r(25, 20, 1, 1), 32))), F(a2, r(8, 17, 1, 5), r(20, 17, 1, 8), r(21, 20, 4, 1)), ...cuff(10, 25, 12, 5)],
}
const horns16 = union(16,
  r(3, 3, 3, 6), r(4, 2, 1, 1), r(12, 4, 3, 5), r(13, 3, 1, 1), r(6, 7, 6, 2), r(7, 6, 1, 1), r(10, 6, 1, 1),
  r(3, 9, 12, 3), r(1, 9, 3, 3), r(2, 8, 1, 1),
)
const horns32 = union(32,
  r(7, 5, 5, 12), r(8, 4, 3, 1), r(22, 7, 5, 10), r(23, 6, 3, 1), r(12, 13, 10, 4), r(13, 12, 3, 1), r(18, 12, 3, 1),
  r(7, 17, 20, 8), r(9, 25, 16, 1), r(4, 16, 4, 6), r(5, 15, 2, 1), r(5, 22, 2, 1),
)
const handHorns = {
  16: [...skin(16, horns16), F(a2, r(5, 8, 1, 3), r(11, 8, 1, 3), r(8, 8, 1, 3), r(3, 10, 1, 2)), ...cuff(5, 12, 8, 3)],
  32: [...skin(32, horns32), F(a2, r(11, 14, 1, 7), r(16, 14, 1, 7), r(21, 14, 1, 7), r(7, 17, 1, 5)), ...block(8, 18, 12, 5), ...cuff(10, 25, 14, 5)],
}
// Pointing: an index finger out of a side view fist, the folded fingers stacked as segments
const point16 = union(16, r(4, 2, 3, 5), r(5, 1, 1, 1), r(4, 6, 9, 8), r(2, 8, 3, 3), r(3, 7, 1, 1))
const point32 = sub(union(32,
  r(9, 4, 5, 10), r(10, 3, 3, 1), r(10, 13, 15, 1), r(9, 14, 17, 13), r(10, 27, 15, 1), r(4, 16, 5, 6), r(5, 15, 3, 1), r(5, 22, 3, 1),
), union(32, ...[14, 17, 18, 21, 22, 23, 26].map(y => r(25, y, 1, 1))))
const indexUp = {
  16: [...skin(16, point16), F(a2, r(6, 6, 1, 2), r(5, 8, 7, 1), r(5, 10, 7, 1), r(4, 9, 1, 2))],
  32: [...skin(32, point32), F(a2, r(13, 13, 1, 4), r(10, 17, 14, 1), r(10, 22, 14, 1), r(8, 17, 1, 4))],
}
const side16 = union(16, r(2, 6, 5, 3), r(1, 7, 1, 1), r(6, 6, 7, 8), r(7, 3, 3, 3), r(8, 2, 1, 1))
const side32 = sub(union(32,
  r(5, 11, 9, 1), r(4, 12, 10, 1), r(3, 13, 11, 1), r(4, 14, 10, 1), r(5, 15, 9, 1),
  r(14, 11, 13, 16), r(16, 6, 6, 5), r(17, 5, 4, 1),
), union(32, r(26, 11, 1, 1), r(26, 26, 1, 1), ...[16, 17, 20, 21, 22, 25].map(y => r(14, y, 1, 1))))
const indexLeft = {
  16: [...skin(16, side16), F(a2, r(6, 7, 1, 1), r(7, 9, 5, 1), r(7, 11, 5, 1), r(8, 6, 1, 1)), ...cuff(12, 7, 3, 6)],
  32: [...skin(32, side32), F(a2, r(14, 12, 1, 3), r(15, 16, 11, 1), r(15, 21, 11, 1), r(17, 11, 4, 1)), ...cuff(25, 13, 5, 12)],
}
const middle16 = union(16, r(7, 2, 3, 5), r(8, 1, 1, 1), r(4, 7, 3, 2), r(5, 6, 1, 1), r(10, 7, 3, 2), r(11, 6, 1, 1), r(4, 9, 9, 3), r(2, 9, 3, 3), r(3, 8, 1, 1))
const middle32 = union(32,
  r(12, 4, 5, 12), r(13, 3, 3, 1), r(7, 13, 5, 3), r(8, 12, 3, 1), r(17, 13, 5, 3), r(18, 12, 3, 1), r(22, 14, 5, 2), r(23, 13, 3, 1),
  r(7, 16, 20, 9), r(9, 25, 16, 1), r(3, 17, 5, 5), r(4, 16, 3, 1), r(4, 22, 3, 1),
)
const handMiddle = {
  16: [...skin(16, middle16), F(a2, r(6, 7, 1, 4), r(9, 7, 1, 4), r(12, 9, 1, 2), r(4, 9, 1, 2)), ...cuff(5, 12, 7, 3)],
  32: [...skin(32, middle32), F(a2, r(11, 14, 1, 6), r(16, 13, 1, 7), r(21, 14, 1, 6), r(7, 17, 1, 5)), ...cuff(9, 25, 14, 5)],
}
const fistFront16 = union(16, r(3, 4, 3, 3), r(4, 3, 1, 1), r(6, 3, 3, 4), r(7, 2, 1, 1), r(9, 4, 3, 3), r(10, 3, 1, 1), r(12, 5, 3, 2), r(13, 4, 1, 1), r(3, 6, 12, 6))
const fistFront32 = union(32,
  r(7, 8, 5, 5), r(8, 7, 3, 1), r(12, 7, 5, 6), r(13, 6, 3, 1), r(17, 8, 5, 5), r(18, 7, 3, 1), r(22, 10, 5, 3), r(23, 9, 3, 1),
  r(7, 12, 20, 12), r(8, 24, 18, 1),
)
const raisedFist = {
  16: [...skin(16, fistFront16), F(a2, r(5, 5, 1, 3), r(8, 4, 1, 4), r(11, 6, 1, 2)), ...block(2, 8, 8, 4), ...cuff(4, 12, 8, 3)],
  32: [...skin(32, fistFront32), F(a2, r(11, 9, 1, 8), r(16, 8, 1, 9), r(21, 11, 1, 6)), ...block(5, 17, 14, 6), ...cuff(9, 24, 14, 6)],
}
const fistFace16 = union(16, r(3, 3, 3, 7), r(4, 2, 1, 1), r(6, 2, 3, 8), r(7, 1, 1, 1), r(9, 3, 3, 7), r(10, 2, 1, 1), r(12, 4, 3, 6), r(13, 3, 1, 1))
const fistFace32 = union(32,
  r(6, 6, 5, 14), r(7, 5, 3, 1), r(11, 5, 5, 15), r(12, 4, 3, 1), r(16, 6, 5, 14), r(17, 5, 3, 1), r(21, 8, 5, 12), r(22, 7, 3, 1),
)
const oncomingFist = {
  16: [...skin(16, fistFace16), F(a2, r(5, 4, 1, 5), r(8, 3, 1, 6), r(11, 5, 1, 4), r(4, 6, 10, 1)), ...block(2, 9, 12, 4)],
  32: [...skin(32, fistFace32), F(a2, r(10, 7, 1, 11), r(15, 6, 1, 12), r(20, 9, 1, 9), r(7, 12, 18, 1)), ...block(5, 19, 19, 7)],
}
const clap16L = union(16, r(1, 5, 3, 4), r(2, 4, 1, 1), r(4, 4, 3, 5), r(5, 3, 1, 1), r(1, 8, 7, 6))
const clap32L = union(32,
  r(3, 10, 3, 7), r(4, 9, 1, 1), r(6, 8, 3, 9), r(7, 7, 1, 1), r(9, 9, 3, 8), r(10, 8, 1, 1),
  r(3, 16, 10, 10), r(4, 26, 8, 1), r(6, 27, 4, 1),
)
const clapHand = {
  16: shear(16, [...skin(16, clap16L), F(a2, r(3, 6, 1, 4), r(6, 5, 1, 5))], 5, 14),
  32: shear(32, [...skin(32, clap32L), F(a2, r(5, 11, 1, 8), r(8, 9, 1, 10), r(11, 10, 1, 9))], 5, 26),
}
const handClapping = {
  16: [H(ink, r(7, 1, 2, 2)), H(ink, r(5, 2, 1, 1)), H(ink, r(10, 2, 1, 1)), ...clapHand[16], ...flipH(16, clapHand[16])],
  32: [H(ink, r(15, 2, 2, 3)), H(ink, r(11, 3, 1, 1), r(12, 4, 1, 1)), H(ink, r(20, 3, 1, 1), r(19, 4, 1, 1)), ...clapHand[32], ...flipH(32, clapHand[32])],
}
const open16L = union(16, r(1, 4, 3, 4), r(2, 3, 1, 1), r(4, 3, 3, 5), r(5, 2, 1, 1), r(1, 7, 6, 5), r(2, 12, 4, 1))
const open32L = union(32,
  r(4, 6, 3, 10), r(5, 5, 1, 1), r(7, 5, 3, 11), r(8, 4, 1, 1), r(10, 6, 3, 10), r(11, 5, 1, 1), r(13, 13, 3, 6), r(14, 12, 1, 1),
  r(4, 15, 9, 9), r(5, 24, 7, 1),
)
const openHand = {
  16: [...skin(16, open16L), F(a2, r(3, 5, 1, 4)), ...cuff(2, 11, 4, 4)],
  32: [...skin(32, open32L), F(a2, r(6, 7, 1, 9), r(9, 6, 1, 10), r(12, 15, 1, 4)), ...cuff(5, 23, 7, 6)],
}
const handOpened = { 16: [...openHand[16], ...flipH(16, openHand[16])], 32: [...openHand[32], ...flipH(32, openHand[32])] }
// Pencil as a 45 degree band: ink outline, n3 body, pointed tip at the lower left
const pencil = (size, x0, y0, n, w) => {
  const outer = union(size, ...range(0, n).map(t => r(x0 - t - 1, y0 + t, w + 2, 1)), r(x0 - n, y0 + n, w, 1), r(x0 - n, y0 + n + 1, w - 2, 1))
  const inner = union(size, ...range(0, n - 1).map(t => r(x0 - t, y0 + t + 1, w, 1)))
  return [F(ink, path(outer, size)), S(n3, path(and(inner, erode(outer, size)), size))]
}
const writeFist16 = union(16, r(7, 6, 6, 7), r(8, 5, 4, 1))
const writeFist32 = sub(union(32, r(13, 10, 13, 15), r(14, 9, 11, 1), r(14, 25, 11, 1)), union(32, ...[14, 18, 22].map(y => r(13, y, 1, 1))))
const handWriting = {
  16: [...pencil(16, 12, 1, 10, 2), ...skin(16, writeFist16), F(a2, r(8, 8, 4, 1), r(8, 10, 4, 1)), ...cuff(12, 7, 3, 5)],
  32: [...pencil(32, 25, 3, 20, 3), ...skin(32, writeFist32), F(a2, r(14, 14, 8, 1), r(14, 18, 8, 1), r(14, 22, 8, 1)), ...cuff(25, 12, 5, 11)],
}
const nails16 = union(16, r(3, 3, 7, 1), r(2, 4, 8, 5), r(4, 9, 6, 3), r(8, 2, 6, 11), r(9, 1, 4, 1), r(9, 13, 4, 1))
const nails32 = union(32,
  r(5, 5, 11, 1), r(4, 6, 12, 3), r(5, 9, 11, 1), r(4, 10, 12, 1), r(3, 11, 13, 2), r(4, 13, 12, 1),
  r(5, 14, 11, 1), r(4, 15, 12, 2), r(5, 17, 11, 1), r(8, 18, 8, 1), r(7, 19, 9, 2), r(8, 21, 8, 1),
  r(15, 4, 12, 19), r(16, 3, 10, 1), r(16, 23, 10, 1), r(20, 2, 5, 1), r(19, 3, 7, 1),
)
const handNailPolish = {
  16: [...skin(16, nails16), F(a2, r(4, 5, 5, 1), r(4, 7, 5, 1), r(5, 9, 4, 1)), F(r2, r(3, 4, 1, 1), r(3, 6, 1, 1), r(3, 8, 1, 1), r(5, 10, 1, 1)), ...cuff(12, 4, 3, 7)],
  32: [
    ...skin(32, nails32), F(a2, r(6, 9, 10, 1), r(5, 13, 11, 1), r(6, 17, 10, 1), r(9, 21, 7, 1)),
    F(r2, r(5, 6, 2, 3), r(4, 11, 2, 2), r(5, 15, 2, 2), r(8, 19, 2, 2)), ...cuff(26, 8, 4, 12),
  ],
}

// People: two figures seen from behind
const bodyL32 = union(32, r(3, 14, 15, 16), r(4, 13, 13, 1), r(5, 12, 11, 1), r(6, 11, 9, 1))
const bodyR32 = union(32, r(14, 14, 15, 16), r(15, 13, 13, 1), r(16, 12, 11, 1), r(17, 11, 9, 1))
const bodyL16 = union(16, r(1, 6, 7, 9), r(2, 5, 5, 1))
const bodyR16 = union(16, r(7, 6, 8, 9), r(8, 5, 6, 1))

// Cat parts on the shared face grid
const nose = { 16: F(ink, r(7, 8, 2, 1)), 32: F(ink, r(14, 16, 4, 1), r(15, 17, 2, 1)) }
const whiskers = F(ink, r(4, 18, 3, 1), r(5, 21, 3, 1), r(25, 18, 3, 1), r(24, 21, 3, 1))
// Cat face with parts per size
const cat = (parts16, parts32) => ({ 16: [...catFace[16], nose[16], ...parts16], 32: [...catFace[32], nose[32], whiskers, ...parts32] })
// Rects mirrored across the face centre
const mirror32 = (...rects) => rects.map(([x, y, w, h]) => r(31 - x - w + 1, y, w, h)).join('')
const both32 = (...rects) => rects.map(([x, y, w, h]) => r(x, y, w, h)).join('') + mirror32(...rects)
const both16 = (...rects) => rects.map(([x, y, w, h]) => r(x, y, w, h) + r(15 - x - w + 1, y, w, h)).join('')

const openSmile = {
  16: [F(ink, r(4, 10, 8, 2), r(5, 12, 6, 1)), F(white, r(5, 11, 6, 1))],
  32: [F(ink, r(9, 20, 14, 3), r(10, 23, 12, 1), r(11, 24, 10, 1), r(12, 25, 8, 1)), F(white, r(10, 21, 12, 2))],
}
const laugh = {
  16: [F(ink, r(4, 10, 8, 2), r(5, 12, 6, 1)), F(white, r(5, 11, 6, 1)), F(r3, r(6, 12, 4, 1))],
  32: [F(ink, r(9, 20, 14, 3), r(10, 23, 12, 1), r(11, 24, 10, 1), r(12, 25, 8, 1)), F(white, r(10, 21, 12, 1)), F(r3, r(12, 24, 8, 1), r(13, 25, 6, 1))],
}
const openGrin = {
  16: [F(ink, r(5, 10, 6, 2), r(6, 12, 4, 1)), F(r3, r(7, 12, 2, 1))],
  32: [F(ink, r(10, 20, 12, 3), r(11, 23, 10, 1), r(12, 24, 8, 1), r(13, 25, 6, 1)), F(r3, r(13, 24, 6, 1), r(14, 25, 4, 1))],
}
const grin = {
  16: [F(ink, r(4, 10, 8, 1), r(4, 11, 1, 1), r(11, 11, 1, 1), r(5, 12, 6, 1)), F(white, r(5, 11, 6, 1))],
  32: [F(ink, r(8, 19, 2, 2), r(22, 19, 2, 2), r(9, 20, 14, 5), r(11, 25, 10, 1)), F(white, r(10, 21, 12, 3))],
}
const openFrown = {
  16: [F(ink, r(6, 10, 4, 1), r(5, 11, 6, 2))],
  32: [F(ink, r(13, 19, 6, 1), r(11, 20, 10, 1), r(10, 21, 12, 4), r(11, 25, 10, 1))],
}
const frown = {
  16: F(ink, r(4, 12, 1, 1), r(5, 11, 6, 1), r(11, 12, 1, 1)),
  32: F(ink, r(8, 24, 2, 2), r(10, 22, 2, 2), r(12, 20, 8, 2), r(20, 22, 2, 2), r(22, 24, 2, 2)),
}
const pout = {
  16: F(ink, r(5, 12, 1, 1), r(6, 11, 4, 1), r(10, 12, 1, 1)),
  32: F(ink, r(10, 23, 2, 2), r(12, 22, 8, 2), r(20, 23, 2, 2)),
}
const smirk = {
  16: F(ink, r(5, 12, 4, 1), r(9, 11, 1, 1), r(10, 10, 1, 1)),
  32: F(ink, r(10, 23, 8, 2), r(18, 22, 2, 2), r(20, 20, 2, 2)),
}
const pucker = {
  16: F(ink, r(6, 10, 2, 2)),
  32: F(ink, r(13, 21, 2, 1), r(12, 22, 4, 2), r(13, 24, 2, 1)),
}
const squeezedEyes = {
  16: F(ink, both16([4, 7, 1, 1], [5, 6, 2, 1], [7, 7, 1, 1])),
  32: F(ink, both32([9, 13, 1, 2], [10, 12, 1, 2], [11, 11, 1, 2], [12, 12, 1, 2], [13, 13, 1, 2])),
}
const arcEyes = {
  16: F(ink, both16([4, 7, 1, 1], [5, 6, 2, 1], [7, 7, 1, 1])),
  32: F(ink, both32([10, 11, 3, 1], [9, 12, 2, 1], [12, 12, 2, 1], [9, 13, 1, 1], [13, 13, 1, 1])),
}
const heartEyes = {
  16: F(r2, both16([4, 5, 1, 1], [6, 5, 1, 1], [4, 6, 3, 1], [5, 7, 1, 1])),
  32: F(r2, both32([9, 10, 2, 1], [12, 10, 2, 1], [8, 11, 7, 1], [9, 12, 5, 1], [10, 13, 3, 1], [11, 14, 1, 1])),
}
const scrunchedEyes = {
  16: F(ink, both16([4, 5, 2, 1], [5, 6, 2, 1], [4, 7, 2, 1])),
  32: F(ink, both32([9, 10, 2, 1], [10, 11, 2, 1], [11, 12, 2, 1], [10, 13, 2, 1], [9, 14, 2, 1])),
}
const closedEyes = {
  16: F(ink, both16([4, 7, 3, 1])),
  32: F(ink, both32([9, 13, 1, 1], [10, 12, 3, 1], [13, 13, 1, 1])),
}
const glanceEyes = {
  16: [F(white, r(5, 6, 1, 2), r(9, 6, 1, 2)), F(ink, r(6, 6, 1, 2), r(10, 6, 1, 2))],
  32: [F(ink, r(8, 10, 7, 5), r(17, 10, 7, 5)), F(white, r(9, 11, 5, 3), r(18, 11, 5, 3)), F(ink, r(12, 11, 2, 3), r(21, 11, 2, 3))],
}
const brows = {
  16: F(ink, both16([4, 4, 2, 1], [6, 5, 1, 1])),
  32: F(ink, both32([7, 7, 2, 2], [9, 8, 2, 2], [11, 9, 2, 2])),
}
const lowerFace = {
  16: F(a2, path(and(rasterise(circle(10, 3, 3), 16), rasterise(r(0, 11, 16, 5), 16)), 16)),
  32: F(a2, path(and(rasterise(circle(24, 4, 4), 32), rasterise(r(0, 22, 32, 10), 32)), 32)),
}
const paws = {
  16: [F(ink, circle(4, 1, 10), circle(4, 11, 10)), S(a3, r(2, 11, 2, 2), r(12, 11, 2, 2))],
  32: [F(ink, circle(8, 2, 22), circle(8, 22, 22)), S(a3, circle(6, 3, 23), circle(6, 23, 23)), F(a2, r(5, 24, 1, 2), r(26, 24, 1, 2))],
}

const icons = {
  'emoji/hand': {
    16: [...skin(16, hand16), F(a2, r(5, 5, 1, 5), r(8, 4, 1, 6), r(11, 7, 1, 3), r(3, 8, 1, 4))],
    32: [...skin(32, hand32), F(a2, r(11, 7, 1, 11), r(16, 5, 1, 13), r(21, 8, 1, 10), r(7, 13, 1, 9)), F(ink, r(7, 12, 1, 1))],
  },
  'emoji/thumbs-up': thumbsUp,
  'emoji/thumbs-down': { 16: flipV(16, thumbsUp[16]), 32: flipV(32, thumbsUp[32]) },
  'emoji/folded-hands': foldedHands,
  'emoji/heart-hands': heartHands,
  'emoji/hand-raised': handRaised,
  'emoji/hand-waving': handWaving,
  'emoji/hand-splayed-fingers': handSplayed,
  'emoji/hand-vulcan': handVulcan,
  'emoji/hand-ok': handOk,
  'emoji/hand-victory': handVictory,
  'emoji/hand-horns': handHorns,
  'emoji/hand-index-up': indexUp,
  'emoji/hand-index-down': { 16: flipV(16, indexUp[16]), 32: flipV(32, indexUp[32]) },
  'emoji/hand-index-left': indexLeft,
  'emoji/hand-index-right': { 16: flipH(16, indexLeft[16]), 32: flipH(32, indexLeft[32]) },
  'emoji/hand-middle-finger': handMiddle,
  'emoji/hand-raised-fist': raisedFist,
  'emoji/hand-oncoming-fist': oncomingFist,
  'emoji/hand-clapping': handClapping,
  'emoji/hand-opened': handOpened,
  'emoji/hand-writing': handWriting,
  'emoji/hand-nail-polish': handNailPolish,
  'emoji/people-hugging': {
    16: [
      F(ink, path(bodyL16, 16)), S(b3, path(erode(bodyL16, 16), 16)),
      F(ink, path(bodyR16, 16)), S(gr2, path(erode(bodyR16, 16), 16)),
      F(ink, r(8, 8, 6, 1), r(8, 10, 6, 1), r(13, 9, 1, 1)), S(b3, r(7, 9, 6, 1)),
      F(ink, r(2, 10, 6, 1), r(2, 12, 6, 1), r(1, 11, 1, 1)), S(gr2, r(2, 11, 7, 1)),
      F(ink, circle(4, 3, 1), circle(4, 9, 1)), S(a3, r(4, 2, 2, 2), r(10, 2, 2, 2)),
    ],
    32: [
      F(ink, path(bodyL32, 32)), S(b3, path(erode(bodyL32, 32), 32)),
      F(ink, path(bodyR32, 32)), S(gr2, path(erode(bodyR32, 32), 32)),
      F(ink, r(16, 15, 10, 6), r(26, 16, 1, 4)), S(b3, r(15, 16, 10, 4), r(25, 17, 1, 2)),
      F(ink, r(6, 20, 10, 6), r(5, 21, 1, 4)), S(gr2, r(7, 21, 10, 4), r(6, 22, 1, 2)),
      F(ink, circle(8, 7, 3), circle(8, 17, 3)), S(a3, circle(6, 8, 4), circle(6, 18, 4)),
    ],
  },
  'emoji/cat-grinning': cat([eyes[16], ...openSmile[16]], [eyes[32], ...openSmile[32]]),
  'emoji/cat-tears-of-joy': cat(
    [squeezedEyes[16], ...laugh[16], F(b4, r(3, 8, 1, 2), r(12, 8, 1, 2))],
    [squeezedEyes[32], ...laugh[32], F(b4, both32([7, 13, 1, 1], [6, 14, 3, 4], [7, 18, 1, 1]))],
  ),
  'emoji/cat-heart-eyes': cat([heartEyes[16], ...openGrin[16]], [heartEyes[32], ...openGrin[32]]),
  'emoji/cat-smiling-eyes': cat(
    [arcEyes[16], ...grin[16], F(r3, r(3, 8, 1, 1), r(12, 8, 1, 1))],
    [arcEyes[32], ...grin[32], F(r3, both32([5, 14, 3, 2]))],
  ),
  'emoji/cat-weary': cat([scrunchedEyes[16], ...openFrown[16], ...paws[16]], [scrunchedEyes[32], ...openFrown[32], ...paws[32]]),
  'emoji/cat-crying': cat(
    [eyes[16], frown[16], F(b4, r(5, 8, 1, 2))],
    [eyes[32], frown[32], F(b4, r(11, 14, 1, 1), r(10, 15, 3, 3), r(11, 18, 1, 1))],
  ),
  'emoji/cat-kissing': cat(
    [closedEyes[16], pucker[16], F(r2, r(9, 10, 1, 1), r(11, 10, 1, 1), r(9, 11, 3, 1), r(10, 12, 1, 1))],
    [closedEyes[32], pucker[32], F(r2, r(18, 20, 2, 1), r(21, 20, 2, 1), r(18, 21, 6, 1), r(19, 22, 4, 1), r(20, 23, 2, 1))],
  ),
  'emoji/cat-wry': cat([...glanceEyes[16], smirk[16]], [...glanceEyes[32], smirk[32]]),
  'emoji/cat-pout': {
    16: [...catFace[16], lowerFace[16], nose[16], eyes[16], brows[16], pout[16]],
    32: [...catFace[32], lowerFace[32], nose[32], whiskers, eyes[32], brows[32], pout[32]],
  },
}

write(process.argv[2], icons)
