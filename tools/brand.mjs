// Brand marks: the Bastion Nucleus orb, a faceted gold sphere with two chrome orbital rings, at 16, 32 and 64
import { ink, g3, g4, g5, white, a1, a2, a3, a4, n5, r, circle, S, F, H, write, rasterise } from './lib.mjs'

// Mask helpers, masks are Uint8Array size*size
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)
const blank = size => new Uint8Array(size * size)
const at = (m, size) => (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
const erode = (m, size) => {
  const out = blank(size), a = at(m, size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (a(x, y) && a(x - 1, y) && a(x + 1, y) && a(x, y - 1) && a(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
const sub = (m, n) => m.map((v, i) => (v && !n[i] ? 1 : 0))
const inter = (m, n) => m.map((v, i) => (v && n[i] ? 1 : 0))
const edge = (m, size) => sub(m, erode(m, size))
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
// Band of constant width w along an ellipse rotated by deg, and the half of the plane on the near side of its major axis
const ellipse = (size, cx, cy, rx, ry, w, deg) => {
  const m = blank(size), c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180)
  const pts = range(0, 720).map(i => {
    const t = (i * Math.PI) / 360, px = rx * Math.cos(t), py = ry * Math.sin(t)
    return [cx + px * c - py * s, cy + px * s + py * c]
  })
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (pts.some(([px, py]) => Math.hypot(x + 0.5 - px, y + 0.5 - py) < w / 2)) m[y * size + x] = 1
  }
  return m
}
const near = (size, cx, cy, deg) => {
  const m = blank(size), c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (-(x + 0.5 - cx) * s + (y + 0.5 - cy) * c > 0) m[y * size + x] = 1
  }
  return m
}

// Gold ramp from shade to light
const gold = [a1, a2, a3, a4, n5]
const step = (c, k) => gold[Math.max(0, Math.min(gold.length - 1, gold.indexOf(c) + k))]

// Faceted sphere: ink disc, Voronoi facets from seeds [x, y, colour] clipped to the disc. The lighter facet at each
// seam shades into its darker neighbour through a 2x2 Bayer band, the darker side stays crisp so the edge still reads.
// A one pixel rim is one step lighter top left and one step darker bottom right
const sphere = (size, d, ox, oy, seeds, band) => {
  const disc = rasterise(circle(d, ox, oy), size), inside = erode(disc, size), rim = edge(inside, size)
  const cx = ox + d / 2, cy = oy + d / 2
  const by = new Map(gold.map(c => [c, '']))
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (!inside[y * size + x]) continue
    const ds = seeds.map(([sx, sy, c]) => [Math.hypot(x + 0.5 - sx, y + 0.5 - sy), c]).sort((p, q) => p[0] - q[0])
    const [[d1, c1], [d2, c2]] = ds
    let c = c1
    if (gold.indexOf(c2) < gold.indexOf(c1) && d2 - d1 < band) {
      const t = ([[0, 2], [3, 1]][y % 2][x % 2] + 0.5) / 4
      if (t < 0.5 * (1 - (d2 - d1) / band)) c = c2
    }
    if (rim[y * size + x]) c = step(c, x + 0.5 - cx + y + 0.5 - cy < 0 ? 1 : -1)
    by.set(c, by.get(c) + r(x, y, 1, 1))
  }
  return [F(ink, path(edge(disc, size), size)), ...[...by].filter(([, p]) => p).map(([c, p]) => F(c, p))]
}

// Chrome ring as a band between two ellipses, split into the half behind the sphere and the half in front.
// Thick rings carry ink edges and a bevelled g4 body, thin rings are a g4 line with a g5 run on the top arc
const ring = (size, cx, cy, rx, ry, w, deg, body = g4) => {
  const band = ellipse(size, cx, cy, rx, ry, w, deg)
  const front = near(size, cx, cy, deg)
  const half = m => (w > 1
    ? [F(ink, path(edge(m, size), size)), S(body, path(erode(m, size), size))]
    : [F(body, path(m, size)), F(g5, path(m.map((v, i) => (v && i % size < cx && Math.floor(i / size) < cy ? 1 : 0)), size))])
  return { back: half(sub(band, front)), front: half(inter(band, front)) }
}

// Bevelled orb of diameter d with an ink outline and a glint
const orb = (d, ox, oy, fill) => [
  F(ink, circle(d, ox, oy)),
  S(fill, circle(d - 2, ox + 1, oy + 1)),
  F(white, d > 7 ? r(ox + 2, oy + 2, 2, 1) + r(ox + 2, oy + 3, 1, 1) : r(ox + 2, oy + 2, 1, 1)),
]
// Floating dust: single g4 pixels with a g6 halo
const dots = pts => H(g4, ...pts.map(([x, y]) => r(x, y, 1, 1)))

const big = () => {
  const size = 64, cx = 30, cy = 32
  const a = ring(size, cx, cy, 28, 11, 5, -30), b = ring(size, cx, cy, 28, 14, 5, 240)
  const seeds = [
    [18, 20, n5], [31, 16, a4], [43, 22, a3], [14, 32, a3], [27, 30, a4], [41, 34, a2],
    [19, 43, a2], [31, 45, a3], [44, 46, a1],
  ]
  return [
    dots([[8, 14], [38, 5], [52, 8], [59, 36], [55, 57], [12, 58]]),
    ...a.back, ...b.back,
    ...sphere(size, 38, 11, 13, seeds, 1.5),
    F(white, r(17, 19, 4, 2), r(18, 18, 2, 1), r(18, 21, 2, 1)),
    ...a.front, ...b.front,
    ...orb(9, 50, 13, a3),
    ...orb(9, 2, 42, g4),
    ...orb(7, 43, 44, g4),
  ]
}

const mid = () => {
  const size = 32, cx = 16, cy = 16
  const a = ring(size, cx, cy, 12.5, 5, 1, -30), b = ring(size, cx, cy, 12.5, 5, 1, 240)
  const seeds = [[10, 10, n5], [17, 8, a4], [9, 18, a3], [16, 16, a3], [22, 14, a2], [14, 24, a2], [23, 23, a1]]
  return [
    ...a.back, ...b.back,
    ...sphere(size, 20, 6, 6, seeds, 2),
    F(white, r(9, 10, 2, 1), r(9, 11, 1, 1)),
    ...a.front, ...b.front,
    ...orb(7, 23, 7, a3),
    ...orb(7, 2, 19, g4),
  ]
}

const small = () => {
  const size = 16
  const a = ring(size, 8, 8, 7, 2.5, 1, -30, g3)
  return [
    ...a.back,
    F(ink, circle(10, 3, 3)),
    S(a3, circle(8, 4, 4)),
    F(a4, r(5, 5, 3, 1), r(5, 6, 2, 2)),
    F(white, r(5, 5, 1, 1)),
    ...a.front,
    F(ink, r(13, 3, 1, 1), r(12, 4, 3, 1), r(13, 5, 1, 1)),
    F(g5, r(13, 4, 1, 1)),
  ]
}

write(process.argv[2] || 'out', { 'brand/nucleus': { 16: small(), 32: mid(), 64: big() } })
