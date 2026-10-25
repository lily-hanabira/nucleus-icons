// 3d scene primitives for the components domain: sphere, cylinder, cone, torus, pyramid, primitives group, texture,
// material ball, wireframe cage, camera and point light, all lit from the upper left like components/3d
import { ramps, ink, g3, g4, white, b2, b3, b4, b5, gr2, gr3, gr4, a2, a3, a4, r2, r3, r4, p2, p3, p4, r, circle, S, F, H, write, rasterise } from './lib.mjs'

const [t1, t2, t3, t4] = ramps.teal
// Tone triples, light to dark, one ramp per solid
const blue = [b5, b3, b2], green = [gr4, gr3, gr2], amber = [a4, a3, a2], purple = [p4, p3, p2], red = [r4, r3, r2]

// Mask helpers. Masks are Uint8Array size*size, paths are M h v z strings
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)
const blank = size => new Uint8Array(size * size)
const at = (m, size) => (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
const from = (size, d) => rasterise(d, size)
const union = (...ms) => ms[0].map((_, i) => (ms.some(m => m[i]) ? 1 : 0))
const sub = (m, n) => m.map((v, i) => (v && !n[i] ? 1 : 0))
const inter = (m, n) => m.map((v, i) => (v && n[i] ? 1 : 0))
const erode = (m, size) => {
  const out = blank(size), a = at(m, size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (a(x, y) && a(x - 1, y) && a(x + 1, y) && a(x, y - 1) && a(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
const dilate = (m, size) => {
  const out = blank(size), a = at(m, size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (a(x, y) || a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
const edge = (m, size) => sub(m, erode(m, size))
// Mask of pixels passing a predicate on pixel centre coordinates
const where = (size, fn) => {
  const m = blank(size)
  for (const y of range(0, size)) for (const x of range(0, size)) if (fn(x + 0.5, y + 0.5, x, y)) m[y * size + x] = 1
  return m
}
const ellipse = (size, cx, cy, rx, ry) => where(size, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1)
// Even odd polygon fill sampled at pixel centres
const poly = (size, pts) => where(size, (x, y) => {
  let inside = false
  for (const i of range(0, pts.length)) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]
    if (y0 > y !== y1 > y && x < x0 + ((y - y0) * (x1 - x0)) / (y1 - y0)) inside = !inside
  }
  return inside
})
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
// Layer from a mask, dropped when empty
const lay = (kind, fill, m, size) => (m.some(Boolean) ? [kind(fill, path(m, size))] : [])
// Ordered 2x2 Bayer dither: the pixels of a mask that cross to the far tone, p is the fraction toward it at a pixel centre
const dither = (size, m, p) => where(size, (x, y, px, py) => m[py * size + px] && p(x, y) > ([[0, 2], [3, 1]][py % 2][px % 2] + 0.5) / 4)

// Shading by the diagonal from the upper left. v runs from -1 at the top left corner to 1 at the bottom right
const diagV = (cx, cy, R) => (x, y) => (x - cx + y - cy) / (2 * R)

// Sphere: ink disc, b5 cap, b3 body, b2 shade split on diagonals. At 32 a 2x2 dither band softens both seams
const sphere = (size, d, ox, oy, soft, [hi, md, lo] = blue) => {
  const R = d / 2, cx = ox + R, cy = oy + R, v = diagV(cx, cy, R)
  const disc = from(size, circle(d, ox, oy)), inside = erode(disc, size)
  const cap = inter(inside, where(size, (x, y) => v(x, y) < -0.4))
  const shade = inter(inside, where(size, (x, y) => v(x, y) > 0.38))
  const body = sub(sub(inside, cap), shade)
  const out = [F(ink, path(edge(disc, size), size)), ...lay(S, md, body, size), ...lay(S, hi, cap, size), ...lay(S, lo, shade, size)]
  if (soft) {
    out.push(...lay(F, hi, dither(size, body, (x, y) => (-0.22 - v(x, y)) / 0.18), size))
    out.push(...lay(F, lo, dither(size, body, (x, y) => (v(x, y) - 0.2) / 0.18), size))
  }
  return out
}

// Standing cylinder between two ellipses. Body split left b3 right b2, seam dithered when asked
const cylinder = (size, cx, rx, ry, top, bottom, seam, [hi, md, lo] = green) => {
  const topE = ellipse(size, cx, top, rx, ry), botE = ellipse(size, cx, bottom, rx, ry)
  const whole = union(topE, botE, where(size, (x, y) => Math.abs(x - cx) <= rx - 0.5 + 1e-9 && y > top && y < bottom))
  const outline = union(edge(whole, size), edge(topE, size))
  const body = sub(sub(whole, outline), topE)
  const left = inter(body, where(size, x => x < cx)), right = sub(body, left)
  const out = [F(ink, path(outline, size)), ...lay(S, hi, erode(topE, size), size), ...lay(S, md, left, size), ...lay(S, lo, right, size)]
  if (seam) out.push(...lay(F, lo, dither(size, left, x => (x - cx + seam) / seam), size))
  return out
}

// Cone: apex at the top, elliptical base, left b3 right b2 with an optional dithered seam, lighter base curve in front
const cone = (size, cx, apex, base, rx, ry, seam, [hi, md, lo] = amber) => {
  const botE = ellipse(size, cx, base, rx, ry)
  const tri = poly(size, [[cx, apex], [cx + rx, base], [cx - rx, base]])
  const whole = union(tri, botE)
  const outline = edge(whole, size), inside = sub(whole, outline)
  const rim = inter(inside, inter(edge(botE, size), where(size, (x, y) => y > base)))
  const faces = sub(inside, rim)
  const left = inter(faces, where(size, x => x < cx)), right = sub(faces, left)
  const out = [F(ink, path(outline, size)), ...lay(S, md, left, size), ...lay(S, lo, right, size), ...lay(F, hi, rim, size)]
  if (seam) out.push(...lay(F, lo, dither(size, left, x => (x - cx + seam) / seam), size))
  return out
}

// Torus: elliptical ring with an elliptical hole, b5 band over the top, b2 along the near inner rim and lower right
const torus = (size, cx, cy, rx, ry, hx, hy, [hi, md, lo] = purple) => {
  const outer = ellipse(size, cx, cy, rx, ry), hole = ellipse(size, cx, cy, hx, hy)
  const ring = sub(outer, hole)
  const outline = edge(ring, size), inside = sub(ring, outline)
  const v = diagV(cx, cy, rx)
  const top = inter(inside, where(size, (x, y) => y < cy - hy + 0.5 && v(x, y) < 0.05))
  const under = inter(inside, where(size, (x, y) => (y > cy + hy - 1 && Math.abs(x - cx) < hx + 1) || v(x, y) > 0.42))
  const body = sub(sub(inside, top), under)
  return [F(ink, path(outline, size)), ...lay(S, md, body, size), ...lay(S, hi, top, size), ...lay(S, lo, under, size)]
}

// Square based pyramid: apex above, base corners left, front and right. Left face b3, right face b2, ink ridge
const pyramid = (size, cx, apex, lx, ly, fy, [hi, md, lo] = red) => {
  const rx = 2 * cx - lx
  const whole = poly(size, [[cx, apex], [rx + 1, ly], [cx + 0.5, fy], [cx - 0.5, fy], [lx, ly]])
  const outline = union(edge(whole, size), where(size, (x, y) => x > cx - 1 && x < cx + 1 && y > apex && y < fy))
  const inside = sub(whole, outline)
  const left = inter(inside, where(size, x => x < cx)), right = sub(inside, left)
  // highlight along the lit left edge of the left face
  const glow = inter(left, dilate(inter(edge(whole, size), where(size, (x, y) => x < cx && y < ly)), size))
  return [F(ink, path(outline, size)), ...lay(S, md, left, size), ...lay(S, lo, right, size), ...lay(F, hi, glow, size)]
}

// Isometric cube masks, same construction as components/3d: top vertex at cx, top, half width in two pixel steps
const cubeMasks = (size, cx, top, half, side) => {
  const wide = top + half, mid = wide + half, xl = cx - 2 * half, xr = cx + 2 * half, bottom = mid + side + half
  const topF = poly(size, [[cx + 0.5, top], [xr + 1, wide + 0.5], [cx + 0.5, mid + 1], [cx - 0.5, mid + 1], [xl, wide + 0.5], [cx - 0.5, top]])
  const whole = union(topF, poly(size, [[xl, wide + 0.5], [cx + 0.5, mid + 1], [xr + 1, wide + 0.5], [xr + 1, bottom - half + 0.5], [cx + 0.5, bottom + 1], [cx - 0.5, bottom + 1], [xl, bottom - half + 0.5]]))
  const outline = union(edge(whole, size), edge(topF, size), where(size, (x, y) => x > cx - 1 && x < cx + 1 && y > mid && y < bottom + 1))
  const inside = sub(whole, outline)
  const topI = inter(inside, erode(topF, size))
  const sides = sub(inside, topF)
  const left = inter(sides, where(size, x => x < cx)), right = sub(sides, left)
  // hidden edges: the back vertical and the two far bottom edges, the top rhombus shifted down by the side height
  const drop = side + half
  const hidden = where(size, (x, y) => x > cx - 1 && x < cx + 1 && y > top && y < top + drop + 1)
  const topEdge = inter(edge(topF, size), where(size, (x, y) => y < wide + 1))
  topEdge.forEach((v, i) => { if (v && i + drop * size < size * size) hidden[i + drop * size] = 1 })
  const corners = [[cx, top], [xl, wide], [xr, wide], [cx, mid], [xl, bottom - half], [xr, bottom - half], [cx, bottom], [cx, top + drop]]
  return { outline, topI, left, right, hidden: sub(hidden, outline), corners, xl, xr, bottom }
}
const cube = (size, cx, top, half, side, [hi, md, lo] = blue) => {
  const c = cubeMasks(size, cx, top, half, side)
  return [F(ink, path(c.outline, size)), ...lay(S, hi, c.topI, size), ...lay(S, md, c.left, size), ...lay(S, lo, c.right, size)]
}

// Checkerboard tile in perspective: a parallelogram of cells, shifting right one pixel every skew rows going up
const texture = (size, x0, y0, n, cw, ch, skew) => {
  const h = n * ch
  const cell = (x, y) => Math.floor((x - x0 - Math.floor((h - 1 - (y - y0)) / skew)) / cw) + Math.floor((y - y0) / ch)
  const tile = where(size, (_, __, x, y) => {
    const yr = y - y0
    if (yr < 0 || yr >= h) return false
    const xr = x - x0 - Math.floor((h - 1 - yr) / skew)
    return xr >= 0 && xr < n * cw
  })
  const dark = where(size, (_, __, x, y) => tile[y * size + x] && cell(x, y) % 2 === 0)
  const outline = sub(dilate(tile, size), tile)
  return [F(ink, path(outline, size)), F(white, path(sub(tile, dark), size)), F(g4, path(dark, size))]
}

// Material ball: the sphere with a teal and white checker wrapped on its surface, dimmed on the lower right
const material = (size, d, ox, oy, cells) => {
  const R = d / 2, cx = ox + R, cy = oy + R, v = diagV(cx, cy, R)
  const disc = from(size, circle(d, ox, oy)), inside = erode(disc, size)
  const by = new Map([[white, ''], [t4, ''], [t3, ''], [t2, ''], [t1, '']])
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (!inside[y * size + x]) continue
    const nx = Math.max(-1, Math.min(1, (x + 0.5 - cx) / (R - 1))), ny = Math.max(-1, Math.min(1, (y + 0.5 - cy) / (R - 1)))
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))
    const lon = Math.atan2(nx, nz), lat = Math.asin(ny)
    const odd = (Math.floor(lon / (Math.PI / cells) + cells) + Math.floor(lat / (Math.PI / cells) + cells)) % 2 === 1
    const dim = v(x + 0.5, y + 0.5) > 0.4, lit = v(x + 0.5, y + 0.5) < -0.55
    const c = odd ? (dim ? t2 : lit ? t4 : t3) : dim ? t4 : lit ? white : t4
    by.set(c, by.get(c) + r(x, y, 1, 1))
  }
  return [F(ink, path(edge(disc, size), size)), ...[...by].filter(([, p]) => p).map(([c, p]) => F(c, p))]
}

// Wire cage: every edge of the cube as a haloed ink line, hidden edges included, with vertex dots at 32
const wireframe = (size, cx, top, half, side, dots) => {
  const c = cubeMasks(size, cx, top, half, side)
  const out = [H(ink, path(union(c.outline, c.hidden), size))]
  if (dots) out.push(F(r2, ...c.corners.map(([x, y]) => r(x - (x === c.xl ? 0 : 1), y - (y === c.bottom ? 1 : 0), 2, 2))))
  return out
}

// Movie camera: g4 box, a lens cone opening to the right with a b4 glint, reels on top at 32
const camera = {
  16: [
    F(ink, r(2, 3, 5, 3), r(4, 5, 1, 1)),
    S(g3, r(3, 4, 3, 1)),
    F(ink, r(1, 5, 9, 8)),
    S(g4, r(2, 6, 7, 6)),
    F(ink, r(10, 7, 1, 4), r(11, 6, 1, 6), r(12, 5, 1, 8), r(13, 4, 1, 10), r(14, 4, 1, 10)),
    F(g3, r(11, 7, 1, 4), r(12, 6, 1, 6), r(13, 5, 1, 8)),
    F(b4, r(13, 6, 1, 6), r(12, 7, 1, 4)),
    F(b5, r(13, 7, 1, 1)),
  ],
  32: [
    F(ink, circle(8, 3, 2), circle(8, 10, 2)),
    S(g3, circle(6, 4, 3), circle(6, 11, 3)),
    F(ink, r(6, 5, 2, 2), r(13, 5, 2, 2)),
    F(ink, r(2, 9, 18, 18)),
    S(g4, r(3, 10, 16, 16)),
    F(ink, r(5, 12, 6, 4)),
    S(g3, r(6, 13, 4, 2)),
    F(ink, r(20, 13, 2, 10), r(22, 12, 1, 12), r(23, 11, 1, 14), r(24, 10, 1, 16), r(25, 9, 1, 18), r(26, 8, 1, 20), r(27, 8, 1, 20), r(28, 8, 1, 20)),
    F(g3, r(21, 14, 1, 8), r(22, 13, 1, 10), r(23, 12, 1, 12), r(24, 11, 1, 14), r(25, 10, 1, 16), r(26, 9, 1, 18)),
    F(ink, r(27, 9, 1, 18)),
    F(b4, r(24, 12, 1, 12), r(25, 11, 1, 14), r(26, 10, 1, 16)),
    F(b5, r(25, 12, 1, 4), r(24, 13, 1, 2)),
    F(b3, r(24, 21, 1, 3), r(25, 20, 1, 5), r(26, 19, 1, 7)),
  ],
}

// Point light: a3 disc with four a2 rays over a g4 ground shadow
const light = {
  16: [
    F(g4, r(4, 13, 8, 1), r(3, 12, 10, 1), r(4, 11, 8, 1)),
    H(a2, r(7, 1, 2, 1), r(2, 6, 1, 2), r(13, 6, 1, 2), r(3, 2, 1, 1), r(12, 2, 1, 1)),
    F(ink, circle(8, 4, 3)),
    S(a3, circle(6, 5, 4)),
    F(white, r(6, 5, 1, 1)),
  ],
  32: [
    F(g4, r(8, 28, 16, 1), r(6, 27, 20, 1), r(5, 26, 22, 1), r(7, 25, 18, 1)),
    H(a2, r(15, 2, 2, 3), r(3, 13, 3, 2), r(26, 13, 3, 2), r(6, 5, 1, 1), r(7, 6, 1, 1), r(8, 7, 1, 1), r(25, 5, 1, 1), r(24, 6, 1, 1), r(23, 7, 1, 1), r(7, 21, 1, 1), r(8, 20, 1, 1), r(24, 21, 1, 1), r(23, 20, 1, 1)),
    F(ink, circle(16, 8, 6)),
    S(a3, circle(14, 9, 7)),
    F(white, r(12, 9, 2, 1), r(12, 10, 1, 1)),
  ],
}

const icons = {
  'components/sphere': { 16: sphere(16, 14, 1, 1, false), 32: sphere(32, 28, 2, 2, true) },
  'components/cylinder': { 16: cylinder(16, 8, 5.5, 2, 3, 12, 0), 32: cylinder(32, 16, 11.5, 4, 6, 25, 5) },
  'components/cone': { 16: cone(16, 8, 1, 12, 6, 2, 0), 32: cone(32, 16, 2, 25, 12, 4, 5) },
  'components/torus': { 16: torus(16, 8, 8, 7, 5, 3, 2), 32: torus(32, 16, 16, 14, 9, 6.5, 3.6) },
  'components/pyramid': { 16: pyramid(16, 8, 1, 1, 11, 14), 32: pyramid(32, 16, 2, 2, 22, 29) },
  'components/primitives': {
    16: [...cube(16, 5, 1, 2, 3), ...sphere(16, 8, 7, 6, false, red)],
    32: [...cube(32, 10, 2, 4, 5), ...sphere(32, 12, 18, 5, false, red), ...cylinder(32, 15, 6.5, 2.5, 18, 27, 4)],
  },
  'components/texture': {
    16: [...texture(16, 2, 3, 3, 3, 3, 3), F(ink, r(10, 10, 5, 5)), S(a3, r(11, 11, 3, 3))],
    32: [...texture(32, 3, 7, 5, 4, 3, 3), F(ink, r(20, 20, 9, 9)), S(a3, r(21, 21, 7, 7))],
  },
  'components/material': { 16: material(16, 14, 1, 1, 3), 32: material(32, 28, 2, 2, 4) },
  'components/wireframe': { 16: wireframe(16, 7, 1, 3, 4, false), 32: wireframe(32, 16, 2, 6, 9, true) },
  'components/camera': camera,
  'components/light': light,
}

write(process.argv[2] || 'out', icons)
