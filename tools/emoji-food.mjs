// Emoji food: fruit, bread, pizza, hot dog, hamburger, birthday cake, cookie, candy, wine glass, hot beverage and kitchen knife
import { ink, g1, g2, g3, g4, g5, g6, white, gr1, gr2, gr3, gr4, a2, a3, r1, r2, r4, p2, n1, n2, n3, n4, r, circle, diag, S, F, H, write, rasterise } from './lib.mjs'

// Mask helpers. A silhouette mask gives the ink outline, its erosion gives the surface fill
const blank = size => new Uint8Array(size * size)
// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
// Mask of every pixel inside any of the paths
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Mask from a predicate over pixel centres
const fn = (size, f) => {
  const m = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) if (f(x + 0.5, y + 0.5, x, y)) m[y * size + x] = 1
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
// Pixels in either mask
const or = (a, b) => a.map((v, i) => v || b[i] ? 1 : 0)
// Pixels in the first mask and not the second
const sub = (a, b) => a.map((v, i) => v && !b[i] ? 1 : 0)
// Pixels in both masks
const and = (a, b) => a.map((v, i) => v && b[i] ? 1 : 0)
// Rows y0 to y1 of a mask
const rows = (m, size, y0, y1) => m.map((v, i) => v && Math.floor(i / size) >= y0 && Math.floor(i / size) <= y1 ? 1 : 0)
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
// Stepped ellipse path w by h with its top left at ox, oy
const ellipse = (w, h, ox, oy) => {
  const s = []
  for (const y of range(0, h)) {
    const dy = (y + 0.5 - h / 2) / (h / 2), hw = (w / 2) * Math.sqrt(Math.max(0, 1 - dy * dy))
    const x = Math.round(w / 2 - hw), ww = w - 2 * x
    if (ww > 0) s.push(r(ox + x, oy + y, ww, 1))
  }
  return s.join('')
}
// Point inside an ellipse
const inEllipse = (px, py, cx, cy, rx, ry) => ((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1
// Outline plus bevelled fill from a silhouette mask
const body = (size, col, m) => [F(ink, path(m, size)), S(col, path(erode(m, size), size))]
// Shorthand for path
const P = (size, m) => path(m, size)

// Grapes: round grapes stacked in a triangle under a stem and leaf
const grape = (d, x, y) => [F(ink, circle(d, x, y)), S(p2, circle(d - 2, x + 1, y + 1))]
const grapes = {
  16: [
    H(ink, r(8, 2, 1, 3)),
    F(ink, r(9, 2, 4, 1), r(9, 3, 5, 1), r(10, 4, 3, 1)),
    F(gr2, r(10, 3, 3, 1), r(11, 4, 1, 1)),
    ...grape(5, 2, 4), ...grape(5, 10, 4), ...grape(5, 6, 4),
    ...grape(5, 4, 7), ...grape(5, 8, 7),
    ...grape(5, 6, 10),
  ],
  32: [
    H(ink, r(15, 3, 2, 6)),
    F(ink, r(17, 3, 5, 1), r(17, 4, 8, 1), r(18, 5, 9, 1), r(19, 6, 8, 1), r(21, 7, 4, 1)),
    S(gr2, r(18, 4, 6, 1), r(19, 5, 7, 1), r(20, 6, 6, 1), r(22, 7, 2, 1)),
    F(gr1, r(19, 5, 1, 1), r(20, 6, 1, 1), r(21, 6, 1, 1), r(22, 7, 1, 1)),
    ...grape(9, 2, 7), ...grape(9, 20, 7), ...grape(9, 11, 7),
    ...grape(9, 6, 13), ...grape(9, 15, 13),
    ...grape(9, 11, 19),
  ],
}

// Melon: striped oval with a short stem
const melonM = { 16: union(16, ellipse(12, 10, 2, 4)), 32: union(32, ellipse(24, 20, 4, 8)) }
const melon = {
  16: [
    H(ink, r(7, 2, 2, 2)),
    ...body(16, gr3, melonM[16]),
    F(gr1, P(16, and(erode(melonM[16], 16, 2), union(16, r(5, 0, 1, 16), r(8, 0, 1, 16), r(11, 0, 1, 16))))),
  ],
  32: [
    H(ink, r(14, 4, 4, 4)),
    F(ink, r(13, 3, 6, 1), r(14, 4, 1, 1)),
    ...body(32, gr3, melonM[32]),
    F(gr1, P(32, and(erode(melonM[32], 32, 2), union(32, r(8, 0, 1, 32), r(12, 0, 1, 32), r(16, 0, 1, 32), r(20, 0, 1, 32), r(24, 0, 1, 32))))),
    F(gr4, r(9, 12, 1, 3)),
  ],
}

// Watermelon: wedge with the point up and a rind along the curved bottom edge
const wedge = (size, ax, ay, R, half) => fn(size, (px, py) => py >= ay && Math.hypot(px - ax, py - ay) <= R && Math.abs(px - ax) <= half * (py - ay) / R)
const watermelon16 = (() => {
  const m = wedge(16, 8, 1, 13.4, 7.4)
  const flesh = and(erode(m, 16), wedge(16, 8, 1, 10.6, 7.4))
  return [
    ...body(16, gr2, m),
    S(r2, P(16, flesh)),
    F(ink, r(7, 6, 1, 1), r(9, 8, 1, 1), r(6, 9, 1, 1)),
  ]
})()
const watermelon32 = (() => {
  const m = wedge(32, 16, 2, 27, 14.6)
  const inner = erode(m, 32)
  const flesh = and(inner, wedge(32, 16, 2, 22.4, 14.6))
  const pith = sub(and(inner, wedge(32, 16, 2, 23.6, 14.6)), flesh)
  return [
    ...body(32, gr2, m),
    F(gr4, P(32, pith)),
    S(r2, P(32, flesh)),
    F(ink, r(15, 9, 1, 2), r(12, 13, 1, 2), r(18, 14, 1, 2), r(15, 17, 1, 2), r(10, 18, 1, 2), r(21, 19, 1, 2)),
  ]
})()
const watermelon = { 16: watermelon16, 32: watermelon32 }

// Banana: an arc of an annulus around the top left corner, fat in the middle and narrow at the tips
const arc = (size, cx, cy, R, T, t0, t1, minT, pick) => fn(size, (px, py) => {
  const d = Math.hypot(px - cx, py - cy), th = Math.atan2(py - cy, px - cx) * 180 / Math.PI
  const phi = (th - t0) / (t1 - t0)
  if (phi < 0 || phi > 1) return false
  const t = Math.max(minT, T * Math.sqrt(Math.sin(Math.PI * phi)))
  return pick(d, R, t, phi)
})
const bananaArc = { 16: [16, 4.5, 4.5, 10.1, 4.8, -6, 96, 2.8], 32: [32, 9, 9, 20.6, 9.8, -6, 96, 4] }
// Banana body, tips and ridge masks
const bananaM = {
  16: arc(...bananaArc[16], (d, R, t) => d <= R && d >= R - t),
  32: arc(...bananaArc[32], (d, R, t) => d <= R && d >= R - t),
}
const bananaTip = {
  16: arc(...bananaArc[16], (d, R, t, phi) => d <= R && d >= R - t && (phi < 0.1 || phi > 0.9)),
  32: arc(...bananaArc[32], (d, R, t, phi) => d <= R && d >= R - t && (phi < 0.08 || phi > 0.92)),
}
const bananaRidge = {
  32: arc(...bananaArc[32], (d, R, t, phi) => phi > 0.14 && phi < 0.86 && Math.abs(d - (R - t * 0.55)) <= 0.5),
}
const banana = {
  16: [
    ...body(16, a3, bananaM[16]),
    F(n2, P(16, and(erode(bananaM[16], 16), bananaTip[16]))),
  ],
  32: [
    ...body(32, a3, bananaM[32]),
    F(a2, P(32, and(erode(bananaM[32], 32, 2), bananaRidge[32]))),
    F(n2, P(32, and(erode(bananaM[32], 32), bananaTip[32]))),
  ],
}

// Lemon: oval with pointed ends and a leaf
const lemonM = {
  16: union(16, ellipse(12, 8, 2, 5), r(1, 8, 1, 2), r(14, 8, 1, 2)),
  32: union(32, ellipse(24, 16, 4, 10), r(2, 16, 2, 4), r(28, 16, 2, 4), r(3, 15, 1, 6), r(28, 15, 1, 6)),
}
const lemon = {
  16: [
    F(ink, r(7, 2, 1, 1), r(8, 1, 4, 1), r(8, 2, 5, 1), r(9, 3, 4, 1), r(10, 4, 2, 1)),
    F(gr2, r(9, 2, 3, 1), r(10, 3, 2, 1)),
    ...body(16, a3, lemonM[16]),
    F(white, r(4, 7, 2, 1), r(4, 8, 1, 1)),
  ],
  32: [
    H(ink, r(15, 5, 2, 6)),
    F(ink, r(17, 3, 6, 1), r(17, 4, 9, 1), r(18, 5, 10, 1), r(19, 6, 9, 1), r(21, 7, 7, 1), r(24, 8, 3, 1)),
    S(gr2, r(18, 4, 7, 1), r(19, 5, 8, 1), r(20, 6, 7, 1), r(22, 7, 5, 1)),
    F(gr1, r(20, 5, 1, 1), r(21, 6, 1, 1), r(22, 6, 1, 1), r(23, 7, 1, 1)),
    ...body(32, a3, lemonM[32]),
    F(white, r(8, 14, 3, 1), r(7, 15, 2, 1), r(7, 16, 1, 1)),
  ],
}

// Apples: a wide round body with a notch at the top, a stem and a leaf
const appleM = {
  16: sub(union(16, ellipse(12, 10, 2, 4)), union(16, r(7, 4, 2, 1))),
  32: sub(union(32, ellipse(24, 20, 4, 9), ellipse(12, 10, 4, 10), ellipse(12, 10, 16, 10)), union(32, r(14, 9, 4, 1), r(15, 10, 2, 1))),
}
const apple = (col, leaf) => ({
  16: [
    H(ink, r(7, 2, 1, 3)),
    F(ink, r(8, 2, 4, 1), r(8, 3, 5, 1), r(9, 4, 3, 1)),
    F(leaf, r(9, 3, 3, 1), r(10, 4, 1, 1)),
    ...body(16, col, appleM[16]),
    F(white, r(4, 7, 2, 1), r(4, 8, 1, 1)),
  ],
  32: [
    H(ink, r(15, 3, 2, 7)),
    F(ink, r(17, 4, 5, 1), r(17, 5, 8, 1), r(18, 6, 9, 1), r(19, 7, 8, 1), r(21, 8, 4, 1)),
    S(leaf, r(18, 5, 6, 1), r(19, 6, 7, 1), r(20, 7, 6, 1), r(22, 8, 2, 1)),
    ...body(32, col, appleM[32]),
    F(white, r(8, 13, 3, 1), r(7, 14, 2, 1), r(7, 15, 1, 2)),
  ],
})

// Cherries: two round fruits on stems that join under a leaf
const cherry = (d, x, y) => [F(ink, circle(d, x, y)), S(r2, circle(d - 2, x + 1, y + 1))]
const cherries = {
  16: [
    H(ink, diag(3, 8, 5, 1, -1, 1), r(7, 2, 1, 2), diag(10, 7, 3, 1, 1, 1), r(8, 2, 2, 1), r(9, 3, 1, 3)),
    F(ink, r(9, 1, 4, 1), r(10, 2, 4, 1), r(11, 3, 2, 1)),
    F(gr2, r(10, 1, 2, 1), r(11, 2, 2, 1)),
    ...cherry(7, 1, 8), ...cherry(7, 8, 8),
    F(white, r(3, 10, 1, 1), r(10, 10, 1, 1)),
  ],
  32: [
    H(ink, diag(7, 17, 9, 1, -1, 2), r(16, 4, 2, 5), diag(16, 11, 7, 1, 1, 2), r(14, 3, 4, 1)),
    F(ink, r(19, 2, 7, 1), r(19, 3, 9, 1), r(20, 4, 9, 1), r(21, 5, 8, 1), r(23, 6, 5, 1), r(25, 7, 2, 1)),
    S(gr2, r(20, 3, 7, 1), r(21, 4, 7, 1), r(22, 5, 6, 1), r(24, 6, 3, 1)),
    F(gr1, r(21, 4, 1, 1), r(22, 5, 2, 1), r(24, 6, 1, 1)),
    ...cherry(13, 2, 16), ...cherry(13, 16, 15),
    F(white, r(5, 19, 2, 1), r(5, 20, 1, 1), r(19, 18, 2, 1), r(19, 19, 1, 1)),
  ],
}

// Strawberry: a rounded cone with seeds and a leafy crown
const berryM = {
  16: fn(16, (px, py) => py >= 4 && py <= 15 && Math.abs(px - 8) <= 6 * (1 - ((py - 4) / 11) ** 1.7) + 0.3),
  32: fn(32, (px, py) => py >= 8 && py <= 30 && Math.abs(px - 16) <= 12.5 * (1 - ((py - 8) / 22) ** 1.7) + 0.3),
}
const strawberry = {
  16: [
    ...body(16, r2, berryM[16]),
    F(a3, r(6, 7, 1, 1), r(9, 7, 1, 1), r(5, 9, 1, 1), r(8, 9, 1, 1), r(10, 9, 1, 1), r(7, 11, 1, 1)),
    F(ink, r(7, 1, 2, 1), r(4, 2, 2, 1), r(7, 2, 2, 1), r(10, 2, 2, 1), r(3, 3, 10, 1), r(4, 4, 8, 1), r(5, 5, 6, 1)),
    F(gr2, r(5, 3, 2, 1), r(8, 3, 1, 1), r(10, 3, 2, 1), r(5, 4, 6, 1)),
    F(gr1, r(7, 4, 1, 1), r(8, 4, 1, 1)),
  ],
  32: [
    ...body(32, r2, berryM[32]),
    F(a3, r(11, 13, 1, 2), r(16, 13, 1, 2), r(21, 13, 1, 2), r(8, 17, 1, 2), r(13, 17, 1, 2), r(18, 17, 1, 2), r(23, 17, 1, 2), r(11, 21, 1, 2), r(16, 21, 1, 2), r(21, 21, 1, 2), r(13, 25, 1, 2), r(18, 25, 1, 2)),
    H(ink, r(15, 3, 2, 2)),
    F(ink, r(6, 5, 3, 1), r(5, 6, 5, 1), r(11, 5, 3, 1), r(11, 6, 4, 1), r(18, 5, 3, 1), r(17, 6, 4, 1), r(23, 5, 3, 1), r(22, 6, 5, 1), r(4, 7, 24, 1), r(5, 8, 22, 1), r(7, 9, 18, 1), r(10, 10, 12, 1), r(14, 11, 4, 1)),
    S(gr2, r(6, 6, 3, 1), r(12, 6, 2, 1), r(18, 6, 2, 1), r(23, 6, 3, 1), r(5, 7, 22, 1), r(6, 8, 20, 1), r(8, 9, 16, 1), r(11, 10, 10, 1)),
    F(gr1, r(9, 8, 1, 1), r(10, 9, 1, 1), r(21, 8, 1, 1), r(22, 9, 1, 1), r(15, 8, 2, 2)),
  ],
}

// Tomato: wide oval with a star calyx
const tomatoM = { 16: union(16, ellipse(12, 10, 2, 4)), 32: union(32, ellipse(24, 20, 4, 8)) }
const tomato = {
  16: [
    H(ink, r(7, 2, 2, 1)),
    ...body(16, r2, tomatoM[16]),
    F(ink, r(6, 3, 4, 1)),
    F(gr2, r(7, 3, 2, 2), r(5, 4, 1, 1), r(10, 4, 1, 1), r(4, 5, 1, 1), r(6, 5, 1, 1), r(9, 5, 1, 1), r(11, 5, 1, 1)),
    F(gr1, r(8, 4, 1, 1)),
    F(white, r(4, 7, 2, 1), r(4, 8, 1, 1)),
  ],
  32: [
    H(ink, r(15, 3, 2, 4)),
    ...body(32, r2, tomatoM[32]),
    F(ink, r(13, 6, 6, 1), r(12, 7, 8, 1)),
    F(gr2, r(14, 7, 4, 2), r(13, 9, 6, 1), r(12, 10, 8, 1), r(14, 11, 4, 1), r(11, 8, 2, 1), r(19, 8, 2, 1), r(9, 9, 3, 1), r(20, 9, 3, 1), r(8, 10, 2, 1), r(22, 10, 2, 1), r(7, 11, 1, 1), r(24, 11, 1, 1), r(11, 12, 2, 1), r(19, 12, 2, 1), r(10, 13, 1, 1), r(21, 13, 1, 1)),
    F(gr1, r(16, 8, 2, 1), r(17, 9, 2, 1), r(18, 10, 2, 1), r(19, 11, 1, 1)),
    F(white, r(8, 12, 3, 1), r(7, 13, 2, 1), r(7, 14, 1, 2)),
  ],
}

// Bread: a loaf with a rounded crust on top and diagonal score lines
const loafM = {
  16: union(16, ellipse(12, 8, 2, 3), r(2, 7, 12, 7)),
  32: union(32, ellipse(26, 16, 3, 5), r(3, 13, 26, 15)),
}
const bread = {
  16: [
    ...body(16, n3, loafM[16]),
    S(n4, P(16, rows(erode(loafM[16], 16), 16, 0, 7))),
    F(ink, diag(4, 5, 2, 1, 1, 1), diag(7, 5, 2, 1, 1, 1), diag(10, 5, 2, 1, 1, 1)),
  ],
  32: [
    ...body(32, n3, loafM[32]),
    S(n4, P(32, rows(erode(loafM[32], 32), 32, 0, 15))),
    F(ink, diag(7, 9, 4, 1, 1, 1), diag(13, 8, 4, 1, 1, 1), diag(19, 8, 4, 1, 1, 1)),
  ],
}

// Pizza: a slice with the point down, crust across the top
const sliceM = {
  16: fn(16, (px, py) => py >= 1 && py <= 15 && Math.abs(px - 8) <= 7 * (15 - py) / 14 + 0.2),
  32: fn(32, (px, py) => py >= 2 && py <= 30 && Math.abs(px - 16) <= 14 * (30 - py) / 28 + 0.2),
}
const pizza = {
  16: [
    ...body(16, a3, sliceM[16]),
    S(n3, P(16, rows(erode(sliceM[16], 16), 16, 0, 3))),
    F(r2, P(16, rows(erode(sliceM[16], 16), 16, 4, 4))),
    F(r2, r(4, 6, 2, 2), r(9, 7, 2, 2), r(6, 10, 2, 2)),
    F(r1, r(5, 7, 1, 1), r(10, 8, 1, 1), r(7, 11, 1, 1)),
  ],
  32: [
    ...body(32, a3, sliceM[32]),
    S(n3, P(32, rows(erode(sliceM[32], 32), 32, 0, 7))),
    F(n4, r(8, 4, 2, 1), r(15, 4, 3, 1), r(22, 4, 2, 1)),
    F(r2, P(32, rows(erode(sliceM[32], 32), 32, 8, 9))),
    F(ink, circle(5, 7, 11), circle(5, 18, 12), circle(5, 12, 17), circle(5, 15, 23)),
    S(r2, circle(3, 8, 12), circle(3, 19, 13), circle(3, 13, 18), circle(3, 16, 24)),
  ],
}

// Hot dog: sausage in a bun with a mustard zigzag
const hotDog = {
  16: [
    F(ink, ellipse(14, 10, 1, 5)),
    S(n3, ellipse(12, 8, 2, 6)),
    F(ink, ellipse(12, 6, 2, 3)),
    S(r2, ellipse(10, 4, 3, 4)),
    F(a3, diag(4, 5, 2, 1, 1, 1), diag(6, 5, 2, 1, 1, 1), diag(8, 5, 2, 1, 1, 1), diag(10, 5, 2, 1, 1, 1)),
    F(ink, ellipse(14, 6, 1, 9)),
    S(n3, ellipse(12, 4, 2, 10)),
  ],
  32: [
    F(ink, ellipse(28, 20, 2, 10)),
    S(n3, ellipse(26, 18, 3, 11)),
    F(ink, ellipse(26, 12, 3, 6)),
    S(r2, ellipse(24, 10, 4, 7)),
    F(a3, diag(7, 10, 3, 1, 1, 2), diag(10, 12, 3, 1, -1, 2), diag(13, 10, 3, 1, 1, 2), diag(16, 12, 3, 1, -1, 2), diag(19, 10, 3, 1, 1, 2), diag(22, 12, 3, 1, -1, 2)),
    F(ink, ellipse(28, 12, 2, 18)),
    S(n3, ellipse(26, 10, 3, 19)),
    F(n2, r(6, 24, 6, 1), r(14, 25, 7, 1)),
  ],
}

// Hamburger: a stack of bands inside one silhouette
const burgerM = {
  16: union(16, ellipse(14, 10, 1, 1), r(1, 6, 14, 8), r(2, 14, 12, 1)),
  32: union(32, ellipse(28, 20, 2, 2), r(2, 12, 28, 15), r(3, 27, 26, 2), r(4, 29, 24, 1)),
}
const band = (size, m, y0, y1) => P(size, rows(erode(m, size), size, y0, y1))
const hamburger = {
  16: [
    F(ink, P(16, burgerM[16])),
    S(n3, band(16, burgerM[16], 2, 5)),
    F(white, r(5, 3, 1, 1), r(8, 3, 1, 1), r(4, 4, 1, 1), r(10, 4, 1, 1), r(7, 4, 1, 1)),
    F(gr3, band(16, burgerM[16], 6, 6), r(3, 5, 1, 1), r(6, 5, 1, 1), r(10, 5, 1, 1), r(1, 7, 1, 1), r(14, 6, 1, 1)),
    F(r2, band(16, burgerM[16], 7, 7)),
    S(n1, band(16, burgerM[16], 8, 9)),
    F(a3, band(16, burgerM[16], 10, 10), r(4, 11, 1, 1), r(9, 11, 1, 1)),
    S(n3, band(16, burgerM[16], 11, 13)),
    F(n3, r(4, 11, 1, 1), r(9, 11, 1, 1)),
    F(a3, r(4, 11, 1, 1), r(9, 11, 1, 1)),
  ],
  32: [
    F(ink, P(32, burgerM[32])),
    S(n3, band(32, burgerM[32], 3, 11)),
    F(white, r(9, 5, 2, 1), r(15, 4, 2, 1), r(21, 5, 2, 1), r(6, 8, 2, 1), r(12, 8, 2, 1), r(18, 8, 2, 1), r(24, 8, 2, 1)),
    F(gr3, band(32, burgerM[32], 12, 13), r(5, 11, 2, 1), r(11, 11, 2, 1), r(19, 11, 2, 1), r(25, 11, 2, 1), r(8, 14, 2, 1), r(16, 14, 2, 1), r(23, 14, 2, 1)),
    S(r2, band(32, burgerM[32], 14, 16)),
    S(n1, band(32, burgerM[32], 17, 20)),
    F(a3, band(32, burgerM[32], 21, 22), r(7, 23, 2, 2), r(7, 25, 1, 1), r(16, 23, 2, 1), r(24, 23, 2, 2)),
    S(n3, band(32, burgerM[32], 23, 28)),
    F(a3, r(7, 23, 2, 2), r(7, 25, 1, 1), r(16, 23, 2, 1), r(24, 23, 2, 2)),
  ],
}

// Birthday cake: iced cake with jam layers on a plate, three candles
const candle16 = (x, col) => [H(col, r(x, 4, 1, 3)), H(a3, r(x, 2, 1, 2))]
const candle32 = (x, col) => [F(ink, r(x - 1, 9, 4, 6)), S(col, r(x, 10, 2, 4)), F(ink, r(x, 7, 2, 2)), H(a3, r(x, 3, 2, 1), r(x - 1, 4, 4, 2), r(x, 6, 2, 1)), F(a2, r(x, 5, 1, 1))]
const birthdayCake = {
  16: [
    ...candle16(4, r2), ...candle16(7, gr3), ...candle16(10, r2),
    F(ink, r(3, 7, 10, 6)),
    S(white, r(4, 8, 8, 4)),
    F(r4, r(4, 10, 8, 1)),
    F(ink, r(1, 13, 14, 2)),
    F(g5, r(2, 13, 12, 1)),
  ],
  32: [
    ...candle32(10, r2), ...candle32(15, gr3), ...candle32(20, r2),
    F(ink, r(6, 15, 20, 12), r(7, 14, 2, 1), r(10, 14, 3, 1), r(14, 14, 3, 1), r(18, 14, 3, 1), r(22, 14, 3, 1)),
    S(white, r(7, 16, 18, 10)),
    F(r4, r(7, 20, 18, 1), r(7, 24, 18, 1)),
    F(white, r(8, 15, 1, 1), r(11, 15, 1, 1), r(15, 15, 1, 1), r(19, 15, 1, 1), r(23, 15, 1, 1)),
    F(ink, r(3, 27, 26, 3), r(2, 28, 1, 1), r(29, 28, 1, 1)),
    S(g5, r(3, 28, 26, 1)),
  ],
}

// Cookie: round biscuit with chips and a bite from the upper right
const cookieM = {
  16: sub(union(16, circle(13, 1, 2)), union(16, circle(6, 10, 0))),
  32: sub(union(32, circle(27, 2, 3)), union(32, circle(11, 21, 0))),
}
const cookie = {
  16: [
    ...body(16, n3, cookieM[16]),
    F(n1, r(4, 5, 1, 1), r(7, 7, 2, 1), r(4, 9, 1, 1), r(9, 11, 1, 1), r(6, 12, 1, 1), r(11, 8, 1, 1)),
    F(n2, r(5, 4, 1, 1), r(10, 5, 1, 1)),
  ],
  32: [
    ...body(32, n3, cookieM[32]),
    F(n1, r(7, 9, 2, 2), r(13, 7, 2, 2), r(10, 15, 2, 2), r(18, 13, 2, 2), r(24, 17, 2, 2), r(7, 21, 2, 2), r(14, 23, 2, 2), r(21, 25, 2, 2), r(17, 19, 1, 1), r(12, 11, 1, 1)),
    F(n2, r(6, 8, 1, 1), r(12, 6, 1, 1), r(9, 14, 1, 1), r(17, 12, 1, 1), r(23, 16, 1, 1), r(6, 20, 1, 1), r(13, 22, 1, 1), r(20, 24, 1, 1)),
  ],
}

// Candy: striped sweet in a wrapper with twisted ends
const candyM = {
  16: union(16, ellipse(8, 8, 4, 4)),
  32: union(32, ellipse(14, 14, 9, 9)),
}
const candyEndM = {
  16: fn(16, (px, py) => (px >= 1 && px < 4 && Math.abs(py - 8) <= 4 - px) || (px > 12 && px <= 15 && Math.abs(py - 8) <= px - 12)),
  32: fn(32, (px, py) => (px >= 2 && px < 9 && Math.abs(py - 16) <= (9 - px) * 0.7 + 1.2) || (px > 23 && px <= 30 && Math.abs(py - 16) <= (px - 23) * 0.7 + 1.2)),
}
const candy = {
  16: [
    F(ink, P(16, candyEndM[16])),
    F(g5, r(2, 7, 1, 2), r(1, 6, 1, 4), r(13, 7, 1, 2), r(14, 6, 1, 4)),
    F(g4, r(1, 8, 1, 2), r(14, 8, 1, 2)),
    ...body(16, a3, candyM[16]),
    F(r2, P(16, and(erode(candyM[16], 16, 2), union(16, diag(5, 9, 4, 1, -1, 1), diag(8, 10, 3, 1, -1, 1), diag(5, 10, 1, 1, -1, 1))))),
  ],
  32: [
    F(ink, P(32, candyEndM[32])),
    S(g5, P(32, erode(candyEndM[32], 32))),
    F(ink, r(5, 13, 1, 1), r(5, 18, 1, 1), r(26, 13, 1, 1), r(26, 18, 1, 1)),
    F(g4, r(5, 14, 1, 4), r(26, 14, 1, 4)),
    ...body(32, a3, candyM[32]),
    F(r2, P(32, and(erode(candyM[32], 32, 2), union(32, diag(9, 17, 9, 1, -1, 2), diag(10, 21, 9, 1, -1, 2), diag(14, 25, 8, 1, -1, 2))))),
  ],
}

// Wine glass: a bowl of wine on a stem and foot
const bowlM = {
  16: and(union(16, r(3, 1, 10, 3), ellipse(10, 10, 3, -2)), union(16, r(0, 1, 16, 15))),
  32: and(union(32, r(8, 2, 16, 6), ellipse(16, 18, 8, -2)), union(32, r(0, 2, 32, 30))),
}
const wineGlass = {
  16: [
    F(ink, r(6, 8, 4, 4), r(4, 12, 8, 2)),
    F(g5, r(7, 8, 2, 4), r(5, 12, 6, 1)),
    F(g4, r(8, 8, 1, 4)),
    ...body(16, g6, bowlM[16]),
    S(r1, P(16, rows(erode(bowlM[16], 16), 16, 4, 7))),
  ],
  32: [
    F(ink, r(13, 16, 6, 10), r(9, 26, 14, 3), r(8, 27, 1, 2), r(23, 27, 1, 2)),
    S(g5, r(14, 17, 4, 9), r(10, 27, 12, 1)),
    ...body(32, g6, bowlM[32]),
    S(r1, P(32, rows(erode(bowlM[32], 32), 32, 7, 15))),
    F(white, r(10, 4, 1, 4)),
  ],
}

// Hot beverage: cup with a handle on a saucer, coffee at the brim, steam curls
const hotBeverage = {
  16: [
    H(g5, r(5, 2, 1, 1), r(4, 3, 1, 1), r(5, 4, 1, 1), r(9, 2, 1, 1), r(8, 3, 1, 1), r(9, 4, 1, 1)),
    F(ink, r(10, 7, 4, 4)),
    F(g6, r(11, 8, 2, 2)),
    F(ink, r(11, 8, 1, 2)),
    F(ink, r(3, 5, 8, 8)),
    S(white, r(4, 6, 6, 6)),
    F(n1, r(4, 6, 6, 1)),
    F(ink, r(1, 13, 14, 2)),
    F(g5, r(2, 13, 12, 1)),
    F(ink, r(10, 8, 1, 2)),
  ],
  32: [
    H(g5, r(10, 3, 1, 2), r(9, 5, 1, 2), r(10, 7, 1, 1), r(17, 3, 1, 2), r(16, 5, 1, 2), r(17, 7, 1, 1)),
    F(ink, r(21, 12, 7, 9)),
    F(white, r(23, 14, 3, 5)),
    F(ink, r(23, 14, 1, 5)),
    F(ink, r(6, 9, 16, 16), r(7, 25, 14, 1)),
    S(white, r(7, 10, 14, 14), r(8, 24, 12, 1)),
    F(ink, r(7, 10, 14, 1)),
    S(n1, r(8, 10, 12, 2)),
    F(ink, r(2, 26, 28, 3), r(3, 29, 26, 1)),
    S(g5, r(3, 27, 26, 1)),
    F(g6, r(4, 27, 10, 1)),
  ],
}

// Kitchen knife: diagonal, tip to the upper right. t runs along the axis, s across it
const knifeM = (size, L, hw, tipLen, handleLen, spine) => fn(size, (px, py) => {
  const ox = size === 16 ? 1 : 2, oy = size - 1 - ox
  const t = ((px - ox) + (oy + 1 - py)) / 2, s = ((px - ox) - (oy + 1 - py)) / 2
  if (t < 0 || t > L || px < ox || px > size - ox || py < ox || py > size - ox) return false
  if (t < handleLen) return Math.abs(s) <= hw
  const edge = t > L - tipLen ? hw * (L - t) / tipLen : hw
  return s >= -spine && s <= edge
})
// Knife split into ink, blade and handle layers
const knifeParts = (size, L, hw, tipLen, handleLen, spine) => {
  const m = knifeM(size, L, hw, tipLen, handleLen, spine)
  const inner = erode(m, size)
  const ox = size === 16 ? 1 : 2, oy = size - 1 - ox
  const handle = and(inner, fn(size, (px, py) => ((px - ox) + (oy + 1 - py)) / 2 < handleLen))
  const blade = and(inner, fn(size, (px, py) => ((px - ox) + (oy + 1 - py)) / 2 >= handleLen + 0.5))
  return [F(ink, P(size, m)), S(g5, P(size, blade)), S(n1, P(size, handle))]
}
const kitchenKnife = {
  16: knifeParts(16, 13.5, 1.6, 4, 5.5, 1.6),
  32: knifeParts(32, 27.5, 3, 9, 11, 2.6),
}

const icons = {
  'emoji/grapes': grapes,
  'emoji/melon': melon,
  'emoji/watermelon': watermelon,
  'emoji/banana': banana,
  'emoji/lemon': lemon,
  'emoji/red-apple': apple(r2, gr3),
  'emoji/green-apple': apple(gr3, gr2),
  'emoji/cherries': cherries,
  'emoji/strawberry': strawberry,
  'emoji/tomato': tomato,
  'emoji/bread': bread,
  'emoji/pizza': pizza,
  'emoji/hot-dog': hotDog,
  'emoji/hamburger': hamburger,
  'emoji/birthday-cake': birthdayCake,
  'emoji/cookie': cookie,
  'emoji/candy': candy,
  'emoji/wine-glass': wineGlass,
  'emoji/hot-beverage': hotBeverage,
  'emoji/kitchen-knife': kitchenKnife,
}

write(process.argv[2], icons)
