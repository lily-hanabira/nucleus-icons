// Shared generator library: palette ramps, path and layer helpers, and the rasteriser that paints
// layers onto a pixel grid, derives each surface bevel and emits one SVG path per colour.
import { writeFileSync, mkdirSync } from 'node:fs'

export const ramps = {
  gray: ['#1e2430', '#3a4150', '#5c6478', '#8a92a4', '#b8bec9', '#dde1e8', '#f4f6f8', '#ffffff'],
  blue: ['#163e7a', '#1f5fb8', '#2f86e0', '#5cb0f2', '#9ad3fa', '#d6eefc'],
  teal: ['#0f6a6a', '#179e9a', '#3fc9c3', '#a6ece7'],
  green: ['#1f6b2a', '#2f9a3a', '#5ac85a', '#a9ea9a'],
  amber: ['#a85c10', '#e08a1c', '#f5b83c', '#fbe08a'],
  red: ['#8a1c1c', '#cf2b2b', '#ef5a4a', '#f9a89a'],
  purple: ['#4a2a8a', '#7a4cc9', '#a98ae6', '#d9c9f5'],
  tan: ['#6b4a1e', '#a87836', '#d9ab5a', '#f0d6a0', '#faecc8'],
}
export const [ink, g1, g2, g3, g4, g5, g6, white] = ramps.gray
export const [b1, b2, b3, b4, b5, b6] = ramps.blue
export const [gr1, gr2, gr3, gr4] = ramps.green
export const [a1, a2, a3, a4] = ramps.amber
export const [r1, r2, r3, r4] = ramps.red
export const [p1, p2, p3, p4] = ramps.purple
export const [n1, n2, n3, n4, n5] = ramps.tan

// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i)

// Highlight and shade are the neighbours of a colour inside its ramp
export const tones = hex => {
  for (const ramp of Object.values(ramps)) {
    const i = ramp.indexOf(hex)
    if (i >= 0) return { light: ramp[Math.min(i + 1, ramp.length - 1)], dark: ramp[Math.max(i - 1, 0)] }
  }
  throw new Error(`no ramp for ${hex}`)
}

// Rectangle path
export const r = (x, y, w, h) => `M${x} ${y}h${w}v${h}h-${w}z`
// Stepped disc of diameter d with its top left at ox, oy
export const circle = (d, ox, oy) => {
  const R = d / 2, s = []
  for (const y of range(0, d)) {
    const dy = y + 0.5 - R, hw = Math.sqrt(R * R - dy * dy)
    const x = Math.round(R - hw), w = d - 2 * x
    s.push(r(ox + x, oy + y, w, 1))
  }
  return s.join('')
}
// Upward triangle: two pixel apex at cx, widening by two every two rows, last row pair lastH tall
export const tri = (cx, top, pairs, lastH = 2) => {
  const s = []
  for (const i of range(0, pairs)) s.push(r(cx - i, top + 2 * i, 2 + 2 * i, i === pairs - 1 ? lastH : 2))
  return s.join('')
}
// One pixel wide columns h tall at each point
export const cols = (pts, h) => pts.map(([x, y]) => r(x, y, 1, h)).join('')
// n columns h tall stepping by dx, dy from x0, y0
export const diag = (x0, y0, n, dx, dy, h) => cols(Array.from({ length: n }, (_, i) => [x0 + i * dx, y0 + i * dy]), h)

// Layer helpers. S = bevelled surface, F = flat fill
export const S = (fill, ...d) => ({ fill, d: d.join(''), bevel: true })
export const F = (fill, ...d) => ({ fill, d: d.join(''), bevel: false })
export const S1 = (fill, ...d) => ({ fill, d: d.join(''), bevel: true, width: 1 })
// H = flat glyph with a one pixel g6 halo so ink marks survive dark backgrounds
export const H = (fill, ...d) => ({ fill, d: d.join(''), bevel: false, halo: '#f4f6f8' })

// Parse a path made of M h v z commands into vertex loops
export function loops(d) {
  const res = []
  let cur = null, x = 0, y = 0
  for (const [, cmd, args] of d.matchAll(/([MhvzHVL])\s*([-\d. ,]*)/g)) {
    const nums = args.trim().split(/[\s,]+/).filter(Boolean).map(Number)
    if (cmd === 'M') {
      x = nums[0]
      y = nums[1]
      cur = [[x, y]]
      res.push(cur)
    }
    if (cmd === 'h') {
      x += nums[0]
      cur.push([x, y])
    }
    if (cmd === 'v') {
      y += nums[0]
      cur.push([x, y])
    }
  }
  return res
}

// Even odd scanline fill of axis aligned loops onto a boolean mask
export function rasterise(d, size) {
  const mask = new Uint8Array(size * size)
  const edges = []
  for (const loop of loops(d)) {
    for (const i of range(0, loop.length)) {
      const [x0, y0] = loop[i], [x1, y1] = loop[(i + 1) % loop.length]
      if (x0 === x1 && y0 !== y1) edges.push([x0, Math.min(y0, y1), Math.max(y0, y1)])
    }
  }
  for (const y of range(0, size)) {
    const xs = edges.filter(([, y0, y1]) => y0 <= y + 0.5 && y + 0.5 < y1).map(e => e[0]).sort((a, b) => a - b)
    for (const i of range(0, Math.floor(xs.length / 2))) {
      for (const x of range(xs[2 * i], xs[2 * i + 1])) mask[y * size + x] = 1
    }
  }
  return mask
}

// Paint the layers onto a colour grid: halos first, then fills, then the bevel of every surface layer
export function render(size, layers) {
  const colour = new Array(size * size).fill(null)
  const top = new Int16Array(size * size).fill(-1)
  const masks = layers.map(l => rasterise(l.d, size))
  masks.forEach((mask, li) => {
    if (layers[li].halo) {
      for (const y of range(0, size)) for (const x of range(0, size)) {
        if (!mask[y * size + x]) continue
        for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
          const nx = x + dx, ny = y + dy
          if (nx < 0 || ny < 0 || nx >= size || ny >= size || mask[ny * size + nx]) continue
          colour[ny * size + nx] = layers[li].halo
          top[ny * size + nx] = -2
        }
      }
    }
    for (const i of range(0, mask.length)) {
      if (!mask[i]) continue
      colour[i] = layers[li].fill
      top[i] = li
    }
  })
  // bevel pass per surface layer
  layers.forEach((layer, li) => {
    if (!layer.bevel) return
    const { light, dark } = tones(layer.fill)
    const width = 1
    let region = masks[li]
    for (const _ of range(0, width)) {
      const next = new Uint8Array(region)
      const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && region[y * size + x] === 1
      for (const y of range(0, size)) for (const x of range(0, size)) {
        if (!at(x, y)) continue
        const up = at(x, y - 1), down = at(x, y + 1), left = at(x - 1, y), right = at(x + 1, y)
        const shade = !down || (!right && up)
        const highlight = !shade && (!up || !left)
        if (!shade && !highlight) continue
        next[y * size + x] = 0
        const i = y * size + x
        if (top[i] === li) colour[i] = shade ? dark : light
      }
      region = next
    }
  })
  return colour
}

// Emit one path per colour, merging runs into rectangles greedily
export function emit(size, colour, title) {
  const byColour = new Map()
  const used = new Uint8Array(size * size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    const i = y * size + x
    if (!colour[i] || used[i]) continue
    const c = colour[i]
    let w = 1
    while (x + w < size && colour[i + w] === c && !used[i + w]) w++
    let h = 1
    while (y + h < size) {
      let ok = true
      for (const k of range(0, w)) {
        const j = (y + h) * size + x + k
        if (colour[j] !== c || used[j]) ok = false
      }
      if (!ok) break
      h++
    }
    for (const yy of range(0, h)) for (const k of range(0, w)) used[(y + yy) * size + x + k] = 1
    if (!byColour.has(c)) byColour.set(c, [])
    byColour.get(c).push(r(x, y, w, h))
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">\n` +
    `  <title>${title}</title>\n` +
    [...byColour].map(([c, d]) => `  <path fill="${c}" d="${d.join('')}"/>`).join('\n') + '\n</svg>\n'
}

// Write every icon at 16 and 32 as out/<domain>/<name>.<size>.svg
export function write(out, icons) {
  for (const [id, sizes] of Object.entries(icons)) {
    const [domain, name] = id.split('/')
    mkdirSync(`${out}/${domain}`, { recursive: true })
    for (const size of [16, 32]) writeFileSync(`${out}/${domain}/${name}.${size}.svg`, emit(size, render(size, sizes[size]), name))
  }
  console.log('wrote', Object.keys(icons).length, 'icons')
}

// Shared bodies. Pages keep a white interior of x4..11 y2..13 at 16 and x7..24 y3..27 at 32
export const page = {
  16: [
    F(ink, 'M3 1h7v1h1v1h1v1h1v10h-10z'),
    S('#ffffff', 'M4 2h5v3h3v8h-8z'),
    F(g5, 'M9 2h1v1h1v1h1v1h-3z'),
  ],
  32: [
    F(ink, 'M6 2h14v1h1v1h1v1h1v1h1v1h1v1h1v21h-20z'),
    S('#ffffff', 'M7 3h12v1h1v1h1v1h1v1h1v1h1v1h1v19h-18z'),
    S1(g5, 'M19 4h1v1h1v1h1v1h1v1h1v1h-5z'),
    F(ink, r(19, 4, 1, 6), r(19, 9, 7, 1)),
  ],
}

// Emoji bases. Yellow face disc with a fixed grid: at 16 eyes sit at (5,6) and (9,6) as 2x2,
// mouth row is y10 to y12. At 32 eyes sit at (10,11) and (19,11) as 3x3, mouth rows y20 to y25
export const face = {
  16: [F(ink, circle(14, 1, 1)), S(a3, circle(12, 2, 2))],
  32: [F(ink, circle(28, 2, 2)), S(a3, circle(26, 3, 3))],
}
// Cat face: the same disc with two pointed ears on top, inner ear in a2
export const catFace = {
  16: [F(ink, r(2, 1, 3, 1), r(2, 2, 3, 2), r(11, 1, 3, 1), r(11, 2, 3, 2), circle(14, 1, 1)), S(a3, r(3, 2, 1, 2), r(12, 2, 1, 2), circle(12, 2, 2)), F(a2, r(3, 2, 1, 1), r(12, 2, 1, 1))],
  32: [F(ink, tri(6, 0, 5), tri(25, 0, 5), circle(28, 2, 2)), S(a3, tri(6, 2, 4, 1), tri(25, 2, 4, 1), circle(26, 3, 3)), F(a2, r(5, 4, 3, 2), r(24, 4, 3, 2))],
}
// Standard eyes and smile
export const eyes = { 16: F(ink, r(5, 6, 2, 2), r(9, 6, 2, 2)), 32: F(ink, r(10, 11, 3, 3), r(19, 11, 3, 3)) }
export const smile = {
  16: F(ink, r(4, 10, 1, 1), r(5, 11, 6, 1), r(11, 10, 1, 1)),
  32: F(ink, r(8, 19, 2, 2), r(10, 21, 2, 2), r(12, 23, 8, 2), r(20, 21, 2, 2), r(22, 19, 2, 2)),
}
