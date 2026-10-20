// Science instrument icons: microscope, atom, molecule, flask, test tubes, dna, petri dish, telescope, planet, satellite, magnet,
// crystal, lattice, compass, calculator, thermometer, seismograph, balance, pcb, grid and calipers
import { ink, g1, g2, g3, g4, g5, g6, white, b2, b3, b4, b5, b6, gr2, gr3, a2, a3, r2, r3, p3, p4, r, circle, S, F, H, write, rasterise } from './lib.mjs'

// Mask helpers: masks are Uint8Array size*size, paths are M h v z strings
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
// Empty mask
const blank = size => new Uint8Array(size * size)
// Mask of every pixel inside any of the paths
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Bounds checked mask lookup
const at = (m, size) => (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
// Pixels of a mask whose four neighbours are all set
const erode = (m, size) => {
  const out = blank(size), a = at(m, size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (a(x, y) && a(x - 1, y) && a(x + 1, y) && a(x, y - 1) && a(x, y + 1)) out[y * size + x] = 1
  }
  return out
}
// Pixels in the first mask and not the second
const sub = (m, n) => m.map((v, i) => (v && !n[i] ? 1 : 0))
// Pixels in both masks
const inter = (m, n) => m.map((v, i) => (v && n[i] ? 1 : 0))
// Outer one pixel ring of a mask
const edge = (m, size) => sub(m, erode(m, size))
// Rows y0 to y1 of a mask
const rows = (m, size, y0, y1) => m.map((v, i) => (v && Math.floor(i / size) >= y0 && Math.floor(i / size) <= y1 ? 1 : 0))
// Columns x0 to x1 of a mask
const cols = (m, size, x0, x1) => m.map((v, i) => (v && i % size >= x0 && i % size <= x1 ? 1 : 0))
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
// Path of the union of paths, so overlaps fill solid
const solid = (size, ...paths) => path(union(size, ...paths), size)
const pix = (x0, y0, rws) => rws.flatMap((row, y) => [...row].map((c, x) => c === '#' ? r(x0 + x, y0 + y, 1, 1) : '').filter(Boolean)).join('')
// Ink outlined bevelled body from a union of paths
const body = (size, fill, ...paths) => {
  const m = union(size, ...paths)
  return [F(ink, path(m, size)), S(fill, path(erode(m, size), size))]
}
// Filled ellipse mask, optionally rotated by deg
const ellipse = (size, cx, cy, rx, ry, deg = 0) => {
  const m = blank(size), c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy
    const u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry
    if (u * u + v * v <= 1) m[y * size + x] = 1
  }
  return m
}
// Pixels below the major axis of a rotated ellipse, for the front half of a ring
const below = (size, cx, cy, deg) => {
  const m = blank(size), c = Math.cos((deg * Math.PI) / 180), s = Math.sin((deg * Math.PI) / 180)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy
    if (-dx * s + dy * c > 0) m[y * size + x] = 1
  }
  return m
}
// Bresenham line of single pixels
const line = (x0, y0, x1, y1) => {
  const out = [], dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
  let err = dx + dy, x = x0, y = y0
  while (true) {
    out.push(r(x, y, 1, 1))
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
  return out.join('')
}
// Curve sampled per row: x = f(y) for y in y0..y1, steps joined horizontally, t pixels wide
const curve = (f, y0, y1, t = 1) => {
  const out = []
  let prev = null
  for (const y of range(y0, y1 + 1)) {
    const x = Math.round(f(y))
    if (prev !== null && Math.abs(x - prev) > 1) {
      const lo = Math.min(x, prev), hi = Math.max(x, prev)
      out.push(r(lo + 1, y, hi - lo - 1, 1))
    }
    out.push(r(x, y, t, 1))
    prev = x
  }
  return out.join('')
}
// Ink outlined sphere
const sphere = (d, x, y, fill) => [F(ink, circle(d, x, y)), S(fill, circle(d - 2, x + 1, y + 1))]
// Vertical hexagon with points at top and bottom: rows from top to bottom
const hexagon = (cx, top, bottom, half) => {
  const out = []
  for (const y of range(top, bottom + 1)) {
    const d = Math.min(y - top, bottom - y) + 1
    const w = Math.min(2 * d, 2 * half)
    out.push(r(cx - w / 2 + 1, y, w, 1))
  }
  return out.join('')
}

// Canvas sizes
const sz = 16, SZ = 32
const icons = {}

// microscope
{
  const m16 = pix(0, 0, [
    '................',
    '....###.........',
    '....###.........',
    '.....###........',
    '.....###........',
    '......#########.',
    '......###...###.',
    '.......##...###.',
    '..#########.###.',
    '.##########.###.',
    '..#########.###.',
    '.....###....###.',
    '..############..',
    '.#############..',
    '.#############..',
    '................',
  ])
  const tube32 = range(0, 6).map(i => r(8 + i, 2 + 2 * i, 6, 2)).join('') + r(7, 2, 8, 2) + r(14, 14, 4, 3)
  const arm32 = r(17, 8, 9, 4) + r(22, 9, 5, 15) + r(23, 23, 4, 2)
  const stage32 = r(7, 17, 14, 1) + r(6, 18, 16, 2) + r(7, 20, 14, 1)
  const base32 = r(12, 21, 5, 3) + r(5, 24, 22, 1) + r(3, 25, 26, 4) + r(4, 29, 24, 1)
  icons['science/microscope'] = {
    16: [...body(sz, g2, m16), F(g4, r(4, 1, 3, 1)), F(g3, r(2, 9, 8, 1))],
    32: [
      ...body(SZ, g2, tube32, arm32, stage32, base32),
      F(g4, r(7, 2, 8, 1), r(8, 3, 6, 1)),
      F(g3, r(7, 18, 14, 1)),
      F(ink, circle(7, 23, 12)),
      S(g4, circle(5, 24, 13)),
      F(g5, r(15, 14, 2, 2)),
    ],
  }
}

// atom
{
  const ring = (size, cx, cy, rx, ry, deg) => path(edge(ellipse(size, cx, cy, rx, ry, deg), size), size)
  const dot = (size, cx, cy, rx, deg, t, k) => {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a)
    const x = Math.round(cx + rx * t * c) - k, y = Math.round(cy + rx * t * s) - k
    return r(x, y, 2 * k, 2 * k)
  }
  icons['science/atom'] = {
    16: [
      H(ink, ring(sz, 8, 8, 7, 2, 0), ring(sz, 8, 8, 7, 2, 60), ring(sz, 8, 8, 7, 2, 120)),
      F(ink, circle(4, 6, 6)),
      F(r2, circle(2, 7, 7)),
      F(b3, dot(sz, 8, 8, 7, 0, -1, 1), dot(sz, 8, 8, 7, 60, 1, 1), dot(sz, 8, 8, 7, 120, 1, 1)),
    ],
    32: [
      H(ink, ring(SZ, 16, 16, 13.5, 4, 0), ring(SZ, 16, 16, 13.5, 4, 60), ring(SZ, 16, 16, 13.5, 4, 120)),
      F(ink, circle(7, 12, 12)),
      S(r2, circle(5, 13, 13)),
      F(ink, circle(5, 2, 13), circle(5, 20, 3), circle(5, 20, 23)),
      F(b3, circle(3, 3, 14), circle(3, 21, 4), circle(3, 21, 24)),
    ],
  }
}

// molecule
icons['science/molecule'] = {
  16: [
    H(ink, line(4, 4, 11, 4), line(11, 4, 8, 11), line(4, 4, 8, 11)),
    ...sphere(6, 1, 1, b3),
    ...sphere(6, 8, 1, r2),
    ...sphere(6, 5, 8, g5),
    F(white, r(2, 2, 1, 1), r(9, 2, 1, 1), r(6, 9, 1, 1)),
  ],
  32: [
    H(ink, line(8, 8, 23, 8), line(9, 8, 23, 8), line(23, 8, 16, 22), line(24, 8, 17, 22), line(8, 8, 16, 22), line(9, 8, 17, 22)),
    ...sphere(11, 3, 3, b3),
    ...sphere(11, 18, 3, r2),
    ...sphere(11, 11, 17, g5),
    F(white, r(6, 5, 2, 1), r(5, 6, 1, 1), r(21, 5, 2, 1), r(20, 6, 1, 1), r(14, 19, 2, 1), r(13, 20, 1, 1)),
  ],
}

// flask
{
  const flask16 = r(5, 1, 6, 1) + r(6, 2, 4, 4) + r(5, 6, 6, 1) + r(4, 7, 8, 2) + r(3, 9, 10, 2) + r(2, 11, 12, 4)
  const m16 = union(sz, flask16), in16 = erode(m16, sz)
  const flask32 = r(12, 2, 8, 1) + r(13, 3, 6, 8) + range(0, 9).map(i => r(12 - i, 11 + 2 * i, 8 + 2 * i, 2)).join('') + r(4, 29, 24, 1)
  const m32 = union(SZ, flask32), in32 = erode(m32, SZ)
  icons['science/flask'] = {
    16: [
      F(ink, path(m16, sz)),
      S(g6, path(in16, sz)),
      F(b6, path(cols(rows(in16, sz, 7, 10), sz, 10, 11), sz)),
      S(gr3, path(rows(in16, sz, 11, 13), sz)),
      F(white, r(7, 2, 1, 3)),
    ],
    32: [
      F(ink, path(m32, SZ)),
      S(g6, path(in32, SZ)),
      F(b6, path(cols(rows(in32, SZ, 11, 21), SZ, 19, 21), SZ)),
      S(gr3, path(rows(in32, SZ, 22, 28), SZ)),
      F(white, r(14, 4, 1, 6), r(15, 4, 1, 2)),
      F(ink, r(16, 15, 2, 1), r(15, 18, 3, 1), r(16, 21, 2, 1)),
    ],
  }
}

// test-tubes
{
  const tube16 = x => r(x, 1, 4, 12) + r(x + 1, 13, 2, 1)
  const tube32 = x => r(x, 2, 6, 21) + r(x + 1, 23, 4, 1) + r(x + 2, 24, 2, 1)
  const liquid = (size, fill, m, y0, y1) => S(fill, path(rows(m, size, y0, y1), size))
  const t16 = [1, 6, 11].map(x => union(sz, tube16(x)))
  const t32 = [6, 13, 20].map(x => union(SZ, tube32(x)))
  const fills = [r3, b4, gr3]
  icons['science/test-tubes'] = {
    16: [
      ...t16.flatMap((m, i) => [F(ink, path(m, sz)), S(g6, path(erode(m, sz), sz)), liquid(sz, fills[i], erode(m, sz), 8, 12), F(white, r(2 + 5 * i, 2, 1, 2))]),
      ...body(sz, g4, r(1, 5, 14, 3)),
    ],
    32: [
      ...t32.flatMap((m, i) => [F(ink, path(m, SZ)), S(g6, path(erode(m, SZ), SZ)), F(b6, path(cols(rows(erode(m, SZ), SZ, 3, 13), SZ, 10 + 7 * i, 10 + 7 * i), SZ)), liquid(SZ, fills[i], erode(m, SZ), 14, 23), F(white, r(7 + 7 * i, 3, 1, 5))]),
      ...body(SZ, g4, r(2, 8, 28, 5), r(2, 25, 28, 5), r(2, 8, 3, 22), r(27, 8, 3, 22)),
    ],
  }
}

// dna
{
  const f16 = y => 7.5 + 4.5 * Math.cos((Math.PI * (y - 2.5)) / 5)
  const g16 = y => 7.5 - 4.5 * Math.cos((Math.PI * (y - 2.5)) / 5)
  const f32 = y => 15 + 9 * Math.cos((Math.PI * (y - 5)) / 10)
  const g32 = y => 15 - 9 * Math.cos((Math.PI * (y - 5)) / 10)
  const rung = (f, g, y, h = 1) => {
    const a = Math.round(f(y)), b = Math.round(g(y))
    return r(Math.min(a, b), y, Math.abs(a - b) + 1, h)
  }
  icons['science/dna'] = {
    16: [
      H(ink, rung(f16, g16, 2), rung(f16, g16, 7), rung(f16, g16, 8), rung(f16, g16, 13)),
      H(r2, curve(g16, 1, 14)),
      H(b3, curve(f16, 1, 14)),
    ],
    32: [
      H(ink, rung(f32, g32, 3), rung(f32, g32, 6), rung(f32, g32, 13), rung(f32, g32, 16), rung(f32, g32, 23), rung(f32, g32, 26)),
      H(r2, curve(g32, 2, 29, 2)),
      H(b3, curve(f32, 2, 29, 2)),
    ],
  }
}

// petri-dish
{
  const dish = (size, cx, cy, rx, ry, drop) => {
    const a = ellipse(size, cx, cy, rx, ry), b = ellipse(size, cx, cy + drop, rx, ry)
    const m = union(size, path(a, size), path(b, size))
    return [F(ink, path(m, size)), S(g5, path(erode(m, size), size)), F(ink, path(edge(a, size), size)), S(g6, path(erode(a, size), size))]
  }
  icons['science/petri-dish'] = {
    16: [
      ...dish(sz, 8, 7.5, 7, 4.5, 2),
      F(gr3, r(5, 5, 2, 2), r(9, 7, 2, 2), r(7, 9, 1, 1), r(10, 4, 1, 1)),
      F(white, r(3, 5, 2, 1)),
    ],
    32: [
      ...dish(SZ, 16, 14.5, 14, 9, 4),
      F(gr3, circle(4, 9, 11), circle(4, 17, 16), circle(4, 20, 9), r(13, 18, 2, 2), r(8, 16, 2, 2), r(22, 14, 2, 2), r(15, 9, 1, 1)),
      F(gr2, r(10, 12, 1, 1), r(18, 17, 1, 1), r(21, 10, 1, 1)),
      F(white, r(5, 10, 3, 1), r(4, 11, 1, 2)),
    ],
  }
}

// telescope
{
  const tube16 = range(0, 12).map(i => {
    const h = i < 4 ? 3 : i < 10 ? 4 : 5, top = 9 - Math.floor(i / 2) - (h - 3) / 2
    return r(2 + i, Math.round(top), 1, h)
  }).join('')
  const tube32 = range(0, 24).map(i => {
    const h = i < 6 ? 5 : i < 18 ? 7 : 9, top = 20 - Math.floor(i / 2) - (h - 5) / 2
    return r(4 + i, top, 1, h)
  }).join('')
  icons['science/telescope'] = {
    16: [
      H(ink, line(7, 10, 4, 14), line(7, 10, 7, 14), line(7, 10, 10, 14)),
      ...body(sz, g2, tube16),
      F(b5, r(12, 4, 1, 3)),
      F(g3, r(13, 3, 1, 5)),
    ],
    32: [
      H(ink, line(16, 23, 8, 29), line(17, 23, 9, 29), line(16, 23, 16, 29), line(17, 23, 17, 29), line(16, 23, 24, 29), line(17, 23, 25, 29)),
      ...body(SZ, g2, tube32),
      F(ink, r(15, 21, 4, 3)),
      F(b5, r(25, 8, 2, 7)),
      F(white, r(25, 9, 1, 2)),
      F(g3, r(27, 7, 1, 9)),
      F(g4, r(10, 15, 1, 3), r(21, 10, 1, 5)),
    ],
  }
}

// planet
{
  const planet = (size, d, ox, oy, cx, cy, rx, ry, ix, iy, deg, bands) => {
    const outer = ellipse(size, cx, cy, rx, ry, deg), inner = ellipse(size, cx, cy, ix, iy, deg)
    const ring = sub(outer, inner), front = below(size, cx, cy, deg)
    const back = sub(ring, front), fore = inter(ring, front)
    const part = m => [F(ink, path(edge(m, size), size)), F(g5, path(erode(m, size), size))]
    const disc = union(size, circle(d, ox, oy)), inside = erode(disc, size)
    return [
      ...part(back),
      F(ink, path(edge(disc, size), size)),
      S(a3, path(inside, size)),
      F(a2, path(inter(inside, union(size, ...bands)), size)),
      ...part(fore),
    ]
  }
  icons['science/planet'] = {
    16: planet(sz, 10, 3, 3, 8, 8, 7.5, 3, 5, 1.5, -25, [r(0, 5, 16, 1), r(0, 9, 16, 1)]),
    32: planet(SZ, 18, 7, 7, 16, 16, 14.5, 5.5, 10, 3, -25, [r(0, 11, 32, 2), r(0, 18, 32, 2), r(0, 22, 32, 1)]),
  }
}

// satellite
{
  const panel = (size, x, y, w, h, grid) => [F(ink, r(x, y, w, h)), S(b3, r(x + 1, y + 1, w - 2, h - 2)), F(ink, ...grid)]
  icons['science/satellite'] = {
    16: [
      ...panel(sz, 1, 4, 4, 8, [r(1, 7, 4, 1)]),
      ...panel(sz, 11, 4, 4, 8, [r(11, 7, 4, 1)]),
      F(ink, r(5, 7, 1, 1), r(10, 7, 1, 1)),
      F(ink, r(6, 6, 4, 4)),
      S(g4, r(7, 7, 2, 2)),
      F(ink, r(5, 3, 1, 1), r(10, 3, 1, 1), r(6, 4, 4, 1), r(7, 5, 2, 1), r(7, 1, 2, 2)),
      F(g5, r(6, 3, 4, 1)),
    ],
    32: [
      ...panel(SZ, 2, 8, 8, 18, [r(2, 13, 8, 1), r(2, 19, 8, 1), r(5, 8, 1, 18)]),
      ...panel(SZ, 22, 8, 8, 18, [r(22, 13, 8, 1), r(22, 19, 8, 1), r(25, 8, 1, 18)]),
      F(ink, r(10, 16, 2, 2), r(20, 16, 2, 2)),
      F(ink, r(11, 12, 10, 10)),
      S(g4, r(12, 13, 8, 8)),
      F(g2, r(14, 15, 4, 2)),
      F(ink, r(15, 9, 2, 3)),
      ...body(SZ, g5, r(9, 3, 14, 1), r(10, 4, 12, 1), r(11, 5, 10, 1), r(12, 6, 8, 1), r(14, 7, 4, 1)),
      F(ink, r(15, 2, 2, 1), r(15, 4, 2, 2)),
    ],
  }
}

// magnet
{
  const horse = (size, x0, x1, legW, legTop, d, ox, oy, hole, hx, hy, tipH) => {
    const m = sub(union(size, r(x0, legTop, x1 - x0 + 1, oy + d / 2 - legTop), circle(d, ox, oy)), union(size, r(x0 + legW, 0, x1 - x0 + 1 - 2 * legW, hy + hole / 2), circle(hole, hx, hy)))
    const tipL = r(x0, legTop, legW, tipH), tipR = r(x1 - legW + 1, legTop, legW, tipH)
    const tips = union(size, tipL, tipR)
    return [F(ink, path(m, size)), S(r2, path(erode(m, size), size)), F(ink, path(tips, size)), S(g5, path(erode(tips, size), size))]
  }
  icons['science/magnet'] = {
    16: horse(sz, 2, 13, 4, 1, 12, 2, 3, 4, 6, 6, 3),
    32: horse(SZ, 4, 27, 8, 2, 24, 4, 6, 8, 12, 14, 5),
  }
}

// crystal
icons['science/crystal'] = {
  16: [
    ...body(sz, p3, hexagon(8, 1, 14, 6)),
    F(ink, r(2, 6, 12, 1)),
    F(p4, r(5, 3, 2, 3), r(4, 7, 2, 4), r(6, 11, 1, 2)),
  ],
  32: [
    ...body(SZ, p3, hexagon(16, 2, 29, 12)),
    F(ink, r(4, 13, 24, 1), line(15, 3, 9, 12), line(16, 3, 22, 12), line(9, 14, 15, 28), line(22, 14, 16, 28)),
    F(p4, r(10, 6, 3, 2), r(9, 8, 3, 2), r(8, 10, 3, 2), r(7, 15, 3, 3), r(8, 18, 3, 3), r(9, 21, 3, 3), r(10, 24, 2, 2), r(16, 6, 2, 2)),
  ],
}

// lattice
{
  const grid = (size, d, pos, gap, L) => {
    const c = Math.floor(d / 2), last = pos[pos.length - 1]
    return [
      L(ink, ...pos.flatMap(a => pos.flatMap(b => [b < last ? r(b + d, a + c, gap, 1) : '', a < last ? r(b + c, a + d, 1, gap) : '']))),
      ...pos.flatMap(a => pos.flatMap(b => sphere(d, b, a, b4))),
    ]
  }
  icons['science/lattice'] = {
    16: grid(sz, 4, [1, 6, 11], 1, F),
    32: [...grid(SZ, 7, [3, 13, 23], 3, H), F(white, ...[3, 13, 23].flatMap(a => [3, 13, 23].map(b => r(b + 2, a + 2, 1, 1))))],
  }
}

// compass
{
  const needle = (size, cx, top, bottom, step) => {
    const out = []
    for (const y of range(top, bottom + 1)) {
      const d = Math.min(y - top, bottom - y)
      const w = 2 + 2 * Math.floor(d / step)
      out.push(r(cx - w / 2 + 1, y, w, 1))
    }
    return out.join('')
  }
  const n16 = union(sz, needle(sz, 8, 4, 11, 2)), n32 = union(SZ, needle(SZ, 16, 7, 24, 2))
  const nGlyph = pix(14, 3, ['#..#', '##.#', '#.##', '#..#'])
  icons['science/compass'] = {
    16: [
      F(ink, circle(14, 1, 1)),
      S(white, circle(12, 2, 2)),
      F(ink, path(edge(rows(n16, sz, 8, 11), sz), sz)),
      F(ink, path(edge(rows(n16, sz, 4, 7), sz), sz)),
      S(r2, path(erode(rows(n16, sz, 4, 8), sz), sz)),
      F(ink, r(7, 2, 1, 1), r(7, 7, 2, 2)),
    ],
    32: [
      F(ink, circle(28, 2, 2)),
      S(white, circle(26, 3, 3)),
      F(ink, path(edge(rows(n32, SZ, 16, 24), SZ), SZ)),
      F(ink, path(edge(rows(n32, SZ, 7, 15), SZ), SZ)),
      S(r2, path(erode(rows(n32, SZ, 7, 16), SZ), SZ)),
      F(ink, nGlyph, r(27, 15, 1, 2), r(4, 15, 1, 2), r(15, 27, 2, 1)),
      F(ink, circle(4, 14, 14)),
      F(white, r(15, 15, 1, 1)),
    ],
  }
}

// calculator
icons['science/calculator'] = {
  16: [
    F(ink, r(2, 1, 12, 14)),
    S(g4, r(3, 2, 10, 12)),
    F(ink, r(3, 2, 10, 3)),
    F(g5, r(4, 3, 8, 1)),
    F(ink, r(8, 3, 1, 1), r(10, 3, 1, 1), ...[6, 8, 10, 12].flatMap(y => [4, 7, 10].map(x => r(x, y, 2, 1)))),
  ],
  32: [
    F(ink, r(4, 2, 24, 28)),
    S(g4, r(5, 3, 22, 26)),
    F(ink, r(6, 4, 20, 7)),
    F(g5, r(7, 5, 18, 5)),
    F(ink, pix(18, 5, ['.#.', '##.', '.#.', '.#.', '###']), pix(22, 5, ['###', '..#', '###', '#..', '###'])),
    F(ink, ...[13, 17, 21, 25].flatMap(y => [8, 15, 22].map(x => r(x, y, 3, 2)))),
  ],
}

// thermometer
{
  const t16 = union(sz, r(7, 1, 2, 1), r(6, 2, 4, 9), circle(6, 5, 9))
  const t32 = union(SZ, r(14, 2, 4, 1), r(13, 3, 6, 19), circle(10, 11, 20))
  icons['science/thermometer'] = {
    16: [
      H(ink, r(10, 3, 2, 1), r(10, 5, 2, 1), r(10, 7, 2, 1)),
      F(ink, path(t16, sz)),
      S(g6, path(erode(t16, sz), sz)),
      S(r2, path(union(sz, r(7, 6, 2, 5), circle(4, 6, 10)), sz)),
    ],
    32: [
      H(ink, ...range(0, 8).map(i => r(20, 5 + 2 * i, i % 2 ? 2 : 3, 1))),
      F(ink, path(t32, SZ)),
      S(g6, path(erode(t32, SZ), SZ)),
      F(b6, r(17, 4, 1, 17)),
      S(r2, path(union(SZ, r(15, 10, 2, 12), circle(8, 12, 21)), SZ)),
      F(white, r(14, 4, 1, 5)),
    ],
  }
}

// seismograph
{
  const polyline = (size, pts, t) => {
    const out = []
    for (const k of range(0, pts.length - 1)) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1]
      let prev = y0
      for (const x of range(x0, x1 + 1)) {
        const y = Math.round(y0 + ((y1 - y0) * (x - x0)) / (x1 - x0))
        const lo = Math.min(prev, y), hi = Math.max(prev, y)
        out.push(r(x, lo, t, hi - lo + t))
        prev = y
      }
    }
    return solid(size, ...out)
  }
  icons['science/seismograph'] = {
    16: [
      ...body(sz, white, r(2, 1, 12, 10)),
      F(ink, r(3, 6, 2, 1), r(5, 5, 1, 1), r(6, 6, 1, 1), r(7, 2, 1, 5), r(8, 6, 1, 4), r(9, 4, 1, 3), r(10, 6, 2, 1), r(12, 5, 1, 1)),
      ...body(sz, g4, r(3, 11, 10, 4), circle(4, 1, 11), circle(4, 11, 11)),
      F(ink, r(3, 12, 1, 2), r(12, 12, 1, 2)),
    ],
    32: [
      ...body(SZ, white, r(4, 2, 24, 20)),
      F(g5, r(5, 7, 22, 1), r(5, 12, 22, 1), r(5, 17, 22, 1)),
      F(ink, polyline(SZ, [[5, 12], [7, 11], [9, 13], [11, 12], [13, 11], [14, 4], [16, 19], [18, 6], [19, 16], [20, 12], [22, 13], [24, 11], [26, 12]], 1)),
      ...body(SZ, g4, r(5, 22, 22, 8), circle(8, 2, 22), circle(8, 22, 22)),
      F(ink, r(6, 23, 1, 6), r(25, 23, 1, 6)),
      F(g3, r(7, 24, 1, 5), r(26, 24, 1, 5)),
    ],
  }
}

// balance
icons['science/balance'] = {
  16: [
    H(ink, r(3, 4, 1, 5), r(12, 4, 1, 5)),
    F(ink, r(2, 3, 12, 1), r(7, 2, 2, 11), r(5, 12, 6, 1), r(4, 13, 8, 2)),
    ...body(sz, g4, r(1, 9, 5, 2), r(2, 11, 3, 1)),
    ...body(sz, g4, r(10, 9, 5, 2), r(11, 11, 3, 1)),
  ],
  32: [
    H(ink, line(5, 7, 3, 17), line(5, 7, 7, 17), line(26, 7, 24, 17), line(26, 7, 28, 17)),
    F(ink, r(4, 5, 24, 2), r(15, 3, 3, 23), r(13, 2, 6, 1), r(12, 25, 8, 1), r(10, 26, 12, 1), r(8, 27, 16, 3)),
    F(g3, r(16, 4, 1, 21)),
    ...body(SZ, g4, r(2, 17, 9, 2), r(3, 19, 7, 1), r(4, 20, 5, 1)),
    ...body(SZ, g4, r(21, 17, 9, 2), r(22, 19, 7, 1), r(23, 20, 5, 1)),
  ],
}

// pcb
icons['science/pcb'] = {
  16: [
    ...body(sz, gr2, r(1, 2, 14, 12)),
    F(g4, r(9, 6, 3, 1), r(2, 7, 3, 1), r(6, 9, 1, 3), r(7, 3, 1, 2)),
    F(ink, r(5, 5, 4, 4)),
    F(a3, r(12, 6, 1, 1), r(2, 7, 1, 1), r(6, 12, 1, 1), r(7, 2, 1, 1)),
  ],
  32: [
    ...body(SZ, gr2, r(2, 4, 28, 24)),
    F(g4, r(20, 14, 6, 1), r(20, 17, 3, 1), r(22, 17, 1, 7), r(22, 23, 4, 1), r(6, 14, 6, 1), r(9, 8, 1, 10), r(9, 17, 3, 1), r(15, 7, 1, 5), r(16, 20, 1, 5), r(13, 20, 1, 2), r(8, 21, 6, 1), r(8, 22, 1, 3)),
    F(ink, r(12, 12, 8, 8)),
    F(g3, r(13, 13, 1, 1)),
    F(a3, r(25, 13, 2, 2), r(25, 22, 2, 2), r(4, 13, 2, 2), r(8, 6, 2, 2), r(14, 5, 2, 2), r(15, 25, 2, 2), r(7, 24, 2, 2)),
  ],
}

// grid
icons['science/grid'] = {
  16: [
    ...body(sz, white, r(1, 1, 13, 13)),
    F(ink, r(4, 2, 1, 11), r(7, 2, 1, 11), r(10, 2, 1, 11), r(2, 4, 11, 1), r(2, 7, 11, 1), r(2, 10, 11, 1)),
    F(b3, r(6, 6, 3, 3)),
  ],
  32: [
    ...body(SZ, white, r(3, 3, 25, 25)),
    F(ink, ...[9, 15, 21].flatMap(p => [r(p, 4, 1, 23), r(4, p, 23, 1)])),
    F(ink, circle(7, 12, 12)),
    S(b3, circle(5, 13, 13)),
  ],
}

// calipers
icons['science/calipers'] = {
  16: [
    ...body(sz, g4, r(1, 4, 14, 4), r(5, 2, 5, 3), r(1, 7, 3, 7), r(6, 7, 3, 7)),
    F(ink, ...[3, 5, 7, 9, 11, 13].map(x => r(x, 5, 1, 1)), r(5, 4, 5, 1), r(2, 8, 1, 1)),
  ],
  32: [
    ...body(SZ, g4, r(2, 10, 28, 6), r(9, 4, 9, 7), r(2, 5, 4, 6), r(2, 15, 5, 13), r(3, 28, 3, 1), r(11, 15, 5, 13), r(12, 28, 3, 1)),
    F(ink, ...range(0, 12).map(i => r(4 + 2 * i, 11, 1, i % 5 === 0 ? 2 : 1)), r(9, 10, 9, 1), r(9, 10, 1, 6), r(17, 10, 1, 6)),
    F(g2, r(12, 6, 3, 2)),
    F(g5, r(18, 11, 11, 1)),
  ],
}

write(process.argv[2], icons)
