// Miscellaneous icons: plugin, sealed and open boxes, briefcase, light bulbs, and the code editor, image editor and image viewer apps
import { ink, g2, g3, g4, g5, g6, white, b2, b3, b4, b5, gr2, gr3, a2, a3, r2, p2, n1, n2, n3, n4, r, circle, diag, S, F, S1, H, write, rasterise } from './lib.mjs'

// Pixel mask helpers: ink is the whole mask, fill is the mask eroded by one pixel
const blank = size => new Uint8Array(size * size)
// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
// Mask of every pixel inside any of the paths
const union = (size, ...paths) => {
  const m = blank(size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Mask with the paths cleared
const cut = (m, size, ...paths) => {
  const out = new Uint8Array(m)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) out[i] = 0 })
  return out
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
// Columns x0 to x1 of a mask
const band = (m, size, x0, x1) => {
  const out = blank(size)
  for (const y of range(0, size)) for (const x of range(x0, x1 + 1)) out[y * size + x] = m[y * size + x]
  return out
}
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
// rectangle with the four corner pixels cut
const rrect = (x, y, w, h) => r(x + 1, y, w - 2, 1) + r(x, y + 1, w, h - 2) + r(x + 1, y + h - 1, w - 2, 1)

// Jigsaw piece: outline is the mask, fill the eroded mask, socket cut out of both
const jigsaw = (size, body, knobs, socket) => {
  const m = cut(union(size, body, ...knobs), size, ...socket)
  return [F(ink, path(m, size)), S(b3, path(erode(m, size), size))]
}

// Cardboard box front and lid band, as components/package
const box = {
  16: [
    F(ink, r(2, 2, 12, 12)),
    S(n4, r(3, 3, 10, 4)),
    F(ink, r(3, 7, 10, 1)),
    S(n3, r(3, 8, 10, 5)),
  ],
  32: [
    F(ink, r(3, 4, 26, 25)),
    S(n4, r(4, 5, 24, 8)),
    F(ink, r(4, 13, 24, 1)),
    S(n3, r(4, 14, 24, 14)),
  ],
}

// Open box: lid flaps lean outward as stepped parallelograms, flap fill stops at the body edge
const flaps = (size, bodyRect, left, right) => {
  const body = rasterise(bodyRect, size)
  const fill = m => {
    const e = erode(m, size)
    for (const i of range(0, size * size)) if (body[i]) e[i] = 0
    return path(e, size)
  }
  const l = union(size, left), rt = union(size, right)
  return [F(ink, path(l, size), path(rt, size)), S(n4, fill(l), fill(rt))]
}

// Light bulb: round glass over a screw base. Rays go first so the bulb paints over their halo
const bulb = (glass, rays) => ({
  16: [
    ...(rays ? [H(a2, r(2, 6, 1, 2), r(13, 6, 1, 2), r(3, 3, 1, 1), r(12, 3, 1, 1))] : []),
    F(ink, circle(8, 4, 3)),
    S(glass, circle(6, 5, 4)),
    ...(rays ? [F(white, r(6, 5, 1, 1))] : []),
    F(ink, r(5, 10, 6, 5)),
    F(g3, r(6, 11, 4, 1), r(6, 13, 4, 1)),
  ],
  32: [
    ...(rays ? [H(a2, r(15, 2, 2, 3), r(2, 13, 3, 2), r(27, 13, 3, 2), diag(4, 5, 3, 1, 1, 1), diag(27, 5, 3, -1, 1, 1))] : []),
    F(ink, circle(18, 7, 6)),
    S(glass, circle(16, 8, 7)),
    ...(rays ? [F(white, r(11, 10, 2, 1), r(11, 11, 1, 1))] : []),
    F(ink, r(12, 23, 8, 7)),
    F(g3, r(13, 24, 6, 1), r(13, 26, 6, 1), r(13, 28, 6, 1)),
    F(g4, r(13, 24, 1, 1), r(13, 26, 1, 1), r(13, 28, 1, 1)),
    F(g2, r(18, 24, 1, 1), r(18, 26, 1, 1), r(18, 28, 1, 1)),
  ],
})

// Window frame as system/executable-generic. Size varies so glyphs can hang off the lower right corner
const frame = (size, x, y, w, h) => size === 32
  ? [F(ink, r(x, y, w, h)), S1(b3, r(x + 1, y + 1, w - 2, 4)), F(g6, r(x + w - 8, y + 2, 2, 2), r(x + w - 5, y + 2, 2, 2)), S(white, r(x + 1, y + 5, w - 2, h - 6))]
  : [F(ink, r(x, y, w, h)), S(b2, r(x + 1, y + 1, w - 2, 2)), S(white, r(x + 1, y + 3, w - 2, h - 4))]

// Landscape thumbnail: sky, hills, sun
const landscape = {
  16: [
    F(b4, r(3, 5, 8, 6)),
    F(a3, r(8, 6, 2, 2)),
    F(gr3, r(3, 9, 8, 2), r(4, 8, 3, 1)),
  ],
  32: [
    F(ink, r(4, 10, 18, 12)),
    F(b4, r(5, 11, 16, 10)),
    F(a3, circle(4, 15, 12)),
    F(gr3, r(5, 18, 16, 3), r(6, 16, 6, 2), r(8, 15, 2, 1), r(14, 17, 6, 1)),
  ],
}

// Paintbrush running up right from the tip, columns h tall. Segments are column index ranges into the interior
const brush = (size, x0, y0, n, h, segs) => {
  const m = union(size, diag(x0, y0, n, 1, -1, h))
  const inner = erode(m, size)
  const seg = (a, b) => path(band(inner, size, x0 + a, x0 + b), size)
  return [F(ink, path(m, size)), S(r2, seg(...segs.tip)), S(g4, seg(...segs.ferrule)), S(n3, seg(...segs.handle))]
}

// Chevron pointing left (dir -1) or right (dir 1) with the apex at ax, ay, arms n columns long
const chevron = (ax, ay, n, dir) => diag(ax, ay, n, dir, -1, 2) + diag(ax, ay, n, dir, 1, 2)

const icons = {
  'components/plugin': {
    16: jigsaw(16, r(2, 5, 9, 10), [r(5, 1, 4, 3), r(6, 4, 2, 1), r(11, 9, 1, 2), r(12, 8, 3, 4)], [r(2, 9, 1, 2), r(3, 8, 2, 4)]),
    32: jigsaw(32, r(4, 10, 18, 20), [rrect(9, 2, 8, 6), r(11, 8, 4, 2), r(22, 18, 2, 4), rrect(24, 16, 6, 8)], [r(4, 18, 2, 4), rrect(6, 16, 6, 8)]),
  },
  'components/box-sealed': {
    16: [
      ...box[16],
      F(ink, r(6, 3, 4, 10)),
      F(g5, r(7, 3, 2, 10)),
    ],
    32: [
      ...box[32],
      F(ink, r(13, 5, 6, 23)),
      F(g5, r(14, 5, 4, 23)),
      F(g6, r(14, 5, 1, 23)),
    ],
  },
  'components/box-open': {
    16: [
      F(ink, r(3, 4, 10, 11)),
      S(n1, r(4, 5, 8, 2)),
      F(ink, r(3, 7, 10, 8)),
      S(n3, r(4, 8, 8, 6)),
      ...flaps(16, r(3, 4, 10, 11), diag(3, 3, 3, -1, -1, 4), diag(12, 3, 3, 1, -1, 4)),
    ],
    32: [
      F(ink, r(6, 8, 20, 22)),
      S(n1, r(7, 9, 18, 5)),
      F(ink, r(6, 14, 20, 16)),
      S(n3, r(7, 15, 18, 14)),
      ...flaps(32, r(6, 8, 20, 22), diag(6, 6, 5, -1, -1, 9), diag(25, 6, 5, 1, -1, 9)),
    ],
  },
  'system/briefcase': {
    16: [
      F(ink, r(5, 1, 6, 1), r(5, 2, 1, 2), r(10, 2, 1, 2)),
      F(ink, r(1, 3, 14, 11)),
      S(n2, r(2, 4, 12, 2)),
      S(n2, r(2, 7, 12, 6)),
      S(n3, r(2, 8, 12, 3)),
      F(ink, r(6, 7, 4, 5)),
      F(g4, r(7, 8, 2, 3)),
    ],
    32: [
      F(ink, r(12, 2, 8, 1), r(12, 3, 1, 4), r(19, 3, 1, 4)),
      F(ink, r(2, 6, 28, 23)),
      S(n2, r(3, 7, 26, 4)),
      S(n2, r(3, 12, 26, 16)),
      S(n3, r(3, 14, 26, 5)),
      F(ink, r(13, 12, 6, 9)),
      S(g4, r(14, 13, 4, 7)),
      F(ink, r(15, 16, 2, 1)),
    ],
  },
  'status/bulb-off': bulb(g5, false),
  'status/bulb-on': bulb(a3, true),
  'apps/code-editor': {
    16: [
      ...frame(16, 1, 1, 14, 14),
      F(b3, r(3, 5, 4, 1)),
      F(p2, r(5, 7, 5, 1)),
      F(gr2, r(5, 9, 3, 1)),
      F(g3, r(3, 11, 6, 1)),
    ],
    32: [
      ...frame(32, 1, 3, 30, 26),
      F(b3, r(4, 10, 8, 2)),
      F(p2, r(7, 13, 10, 2)),
      F(gr2, r(9, 16, 6, 2)),
      F(g3, r(7, 19, 7, 2)),
      F(b3, r(4, 22, 6, 2)),
      F(p2, r(7, 25, 6, 2)),
      F(ink, chevron(17, 22, 4, 1), chevron(26, 22, 4, -1)),
    ],
  },
  'apps/image-editor': {
    16: [
      ...frame(16, 1, 1, 12, 12),
      ...landscape[16],
      ...brush(16, 8, 11, 6, 4, { tip: [1, 1], ferrule: [2, 2], handle: [3, 4] }),
    ],
    32: [
      ...frame(32, 1, 3, 26, 24),
      ...landscape[32],
      ...brush(32, 18, 25, 11, 5, { tip: [1, 3], ferrule: [4, 5], handle: [6, 9] }),
    ],
  },
  'apps/image-viewer': {
    16: [
      ...frame(16, 1, 1, 12, 12),
      ...landscape[16],
      F(ink, circle(7, 7, 7), diag(13, 12, 2, 1, 1, 2)),
      S(b5, circle(5, 8, 8)),
      F(white, r(9, 9, 1, 1)),
    ],
    32: [
      ...frame(32, 1, 3, 26, 24),
      ...landscape[32],
      F(ink, circle(13, 15, 12), diag(26, 23, 4, 1, 1, 4)),
      S(b5, circle(11, 16, 13)),
      F(g3, r(27, 25, 1, 2), r(28, 26, 1, 2)),
      F(white, r(18, 15, 2, 1)),
    ],
  },
}

write(process.argv[2], icons)
