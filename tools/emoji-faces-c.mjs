// Emoji faces, third set: screaming, persevering, tired, steaming, angry, horned, pleading, melting, tears of joy and shattered faces
import { ink, g5, white, b4, b6, a2, a3, r2, r3, p1, p2, r, circle, diag, S, F, write, rasterise, face, eyes } from './lib.mjs'

// One pixel rects at each point
const px = pts => pts.map(([x, y]) => r(x, y, 1, 1)).join('')
// Blocks w by h at each point
const bl = (pts, w = 2, h = 2) => pts.map(([x, y]) => r(x, y, w, h)).join('')
// Integers from a up to but not including b
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
// Stepped ellipse path w by h with its top left at ox, oy
const ell = (w, h, ox, oy) => range(0, h).map(y => {
  const dy = (y + 0.5 - h / 2) / (h / 2), hw = (w / 2) * Math.sqrt(Math.max(0, 1 - dy * dy))
  const x = Math.round(w / 2 - hw)
  return r(ox + x, oy + y, w - 2 * x, 1)
}).join('')

// Pixel masks: ink is the whole mask, the fill is the mask eroded by one pixel
const mask = (size, ...paths) => {
  const m = new Uint8Array(size * size)
  for (const p of paths) rasterise(p, size).forEach((v, i) => { if (v) m[i] = 1 })
  return m
}
// Mask shrunk by one pixel, eight also checks the diagonals
const erode = (m, size, eight = false) => {
  const out = new Uint8Array(size * size)
  const at = (x, y) => x >= 0 && y >= 0 && x < size && y < size && m[y * size + x] === 1
  for (const y of range(0, size)) for (const x of range(0, size)) {
    let ok = at(x, y) && at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1)
    if (ok && eight) ok = at(x - 1, y - 1) && at(x + 1, y - 1) && at(x - 1, y + 1) && at(x + 1, y + 1)
    if (ok) out[y * size + x] = 1
  }
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
// Ink outlined blob with a surface fill (flat when small)
const blob = (size, fill, flat, ...paths) => {
  const m = mask(size, ...paths)
  return [F(ink, path(m, size)), (flat ? F : S)(fill, path(erode(m, size), size))]
}
// Open mouth: ink ring around an a2 interior
const hole = (size, ...paths) => {
  const m = mask(size, ...paths)
  return [F(ink, path(m, size)), F(a2, path(erode(m, size), size))]
}
// Wavy mouth at 32 from a list of row positions
const wave32 = ys => bl(ys.map((y, i) => [8 + 2 * i, y]))
// Union of overlapping paths, since one path fills even odd
const U = (size, ...paths) => path(mask(size, ...paths), size)

// Face disc in a colour other than yellow
const disc = {
  16: c => [F(ink, circle(14, 1, 1)), S(c, circle(12, 2, 2))],
  32: c => [F(ink, circle(28, 2, 2)), S(c, circle(26, 3, 3))],
}

// Shared features
const angryBrows = {
  16: F(ink, r(4, 3, 2, 1), r(6, 4, 1, 1), r(10, 3, 2, 1), r(9, 4, 1, 1)),
  32: F(ink, bl([[7, 6], [9, 7], [11, 8], [19, 8], [21, 7], [23, 6]])),
}
const sadBrows = {
  16: F(ink, px([[4, 4], [5, 3], [6, 3], [9, 3], [10, 3], [11, 4]])),
  32: F(ink, bl([[12, 6], [10, 7], [8, 8], [18, 6], [20, 7], [22, 8]])),
}
const frown = {
  16: F(ink, r(5, 10, 6, 1), r(4, 11, 1, 1), r(11, 11, 1, 1)),
  32: F(ink, r(12, 21, 8, 2), bl([[10, 22], [20, 22], [8, 23], [22, 23]])),
}
const flat = { 16: F(ink, r(5, 11, 6, 1)), 32: F(ink, r(11, 22, 10, 2)) }
const downcast = {
  16: F(ink, px([[4, 7], [5, 6], [6, 6], [9, 6], [10, 6], [11, 7]])),
  32: F(ink, r(10, 12, 4, 2), r(8, 13, 2, 2), r(18, 12, 4, 2), r(22, 13, 2, 2)),
}
const scrunch = {
  16: F(ink, px([[5, 5], [6, 6], [5, 7], [10, 5], [9, 6], [10, 7]])),
  32: F(ink, U(32, diag(9, 9, 4, 1, 1, 2), diag(9, 15, 4, 1, -1, 2), diag(19, 12, 4, 1, -1, 2), diag(19, 12, 4, 1, 1, 2))),
}
const happy = {
  16: F(ink, px([[4, 7], [5, 6], [6, 7], [9, 7], [10, 6], [11, 7]])),
  32: F(ink, diag(8, 13, 3, 1, -1, 2), diag(11, 11, 3, 1, 1, 2), diag(18, 13, 3, 1, -1, 2), diag(21, 11, 3, 1, 1, 2)),
}
const xeyes = {
  16: F(ink, px([[4, 5], [6, 5], [5, 6], [4, 7], [6, 7], [9, 5], [11, 5], [10, 6], [9, 7], [11, 7]])),
  32: F(ink, U(32, diag(9, 10, 5, 1, 1, 2), diag(9, 14, 5, 1, -1, 2), diag(18, 10, 5, 1, 1, 2), diag(18, 14, 5, 1, -1, 2))),
}
const glossy = {
  16: [eyes[16], F(white, px([[5, 6], [9, 6]]))],
  32: [eyes[32], F(white, px([[10, 11], [19, 11]]))],
}
const horns = {
  16: [
    F(ink, px([[2, 1], [3, 1], [2, 2], [2, 3], [12, 1], [13, 1], [13, 2], [13, 3]])),
    F(p1, px([[3, 2], [3, 3], [12, 2], [12, 3]])),
  ],
  32: [
    F(ink, px([[5, 2], [5, 3], [6, 3], [5, 4], [7, 4], [5, 5], [5, 6], [5, 7], [26, 2], [26, 3], [25, 3], [26, 4], [24, 4], [26, 5], [26, 6], [26, 7]])),
    F(p1, px([[6, 4], [6, 5], [7, 5], [6, 6], [7, 6], [6, 7], [25, 4], [25, 5], [24, 5], [25, 6], [24, 6], [25, 7]])),
  ],
}

// Melting body: the standard disc, its bottom third squared off into a puddle at the margins, drips under the rim
const melt = {
  16: [
    F(ink, U(16, circle(14, 1, 1), r(1, 9, 14, 5), r(3, 14, 2, 1), r(7, 14, 2, 1), r(11, 14, 2, 1))),
    S(a3, U(16, circle(12, 2, 2), r(2, 9, 12, 4), r(3, 13, 2, 1), r(7, 13, 2, 1), r(11, 13, 2, 1))),
  ],
  32: [
    F(ink, U(32, circle(28, 2, 2), r(2, 19, 28, 1), r(1, 20, 30, 9), r(5, 29, 4, 1), r(13, 29, 4, 1), r(21, 29, 4, 1))),
    S(a3, U(32, circle(26, 3, 3), r(3, 19, 26, 1), r(2, 20, 28, 8), r(6, 28, 2, 1), r(14, 28, 2, 1), r(22, 28, 2, 1))),
  ],
}

// Steam jets: ink outlined g5 clouds bursting sideways from the nostrils past the outline
const jets = {
  16: [
    F(ink, r(2, 8, 5, 1), r(1, 9, 1, 1), r(2, 10, 5, 1), r(9, 8, 5, 1), r(14, 9, 1, 1), r(9, 10, 5, 1)),
    F(g5, r(2, 9, 4, 1), r(10, 9, 4, 1)),
    F(ink, r(6, 9, 1, 1), r(9, 9, 1, 1)),
  ],
  32: [
    F(ink, r(3, 15, 3, 1), r(2, 16, 1, 1), r(6, 16, 7, 1), r(1, 17, 1, 2), r(2, 19, 11, 1), r(26, 15, 3, 1), r(29, 16, 1, 1), r(19, 16, 7, 1), r(30, 17, 1, 2), r(19, 19, 11, 1)),
    F(g5, r(3, 16, 3, 1), r(2, 17, 10, 2), r(26, 16, 3, 1), r(20, 17, 10, 2)),
    F(ink, r(12, 17, 2, 2), r(18, 17, 2, 2)),
  ],
}

const icons = {
  'emoji/face-screaming-fear': {
    16: [
      ...face[16],
      F(b6, r(5, 3, 6, 1), r(4, 4, 8, 2), r(3, 6, 10, 2)),
      F(ink, r(5, 5, 2, 3), r(9, 5, 2, 3)),
      F(ink, r(7, 9, 2, 1), r(6, 10, 4, 3)),
      ...blob(16, a3, true, r(2, 8, 2, 1), r(1, 9, 4, 4), r(2, 13, 2, 1)),
      ...blob(16, a3, true, r(12, 8, 2, 1), r(11, 9, 4, 4), r(12, 13, 2, 1)),
    ],
    32: [
      ...face[32],
      F(b6, r(11, 4, 10, 1), r(9, 5, 14, 1), r(8, 6, 16, 1), r(7, 7, 18, 1), r(6, 8, 20, 2), r(5, 10, 22, 2), r(4, 12, 24, 3)),
      F(white, r(9, 10, 5, 5), r(18, 10, 5, 5)),
      eyes[32],
      F(ink, r(14, 18, 4, 1), r(13, 19, 6, 8), r(14, 27, 4, 1)),
      ...blob(32, a3, false, r(3, 15, 2, 1), r(6, 15, 2, 1), r(2, 16, 8, 9), r(3, 25, 6, 1), r(4, 26, 4, 1)),
      ...blob(32, a3, false, r(27, 15, 2, 1), r(24, 15, 2, 1), r(22, 16, 8, 9), r(23, 25, 6, 1), r(24, 26, 4, 1)),
    ],
  },
  'emoji/face-persevering': {
    16: [...face[16], scrunch[16], F(ink, px([[5, 10], [6, 10], [4, 11], [7, 11], [8, 12], [9, 12], [10, 11], [11, 10]]))],
    32: [...face[32], scrunch[32], F(ink, wave32([22, 21, 21, 22, 23, 23, 22, 21]))],
  },
  'emoji/face-disappointed': {
    16: [...face[16], downcast[16], frown[16]],
    32: [...face[32], downcast[32], frown[32]],
  },
  'emoji/face-downcast-sweat': {
    16: [
      ...face[16], downcast[16], frown[16],
      F(ink, px([[13, 2], [12, 3], [14, 3], [11, 4], [14, 4], [12, 5], [13, 5]])),
      F(b4, px([[13, 3], [12, 4], [13, 4]])),
    ],
    32: [
      ...face[32], downcast[32], frown[32],
      ...blob(32, b4, false, r(26, 4, 1, 1), r(25, 5, 3, 2), r(24, 7, 4, 1), r(23, 8, 6, 2), r(24, 10, 4, 1), r(25, 11, 2, 1)),
    ],
  },
  'emoji/face-weary': {
    16: [
      ...face[16], sadBrows[16],
      F(ink, px([[4, 6], [5, 7], [6, 6], [9, 6], [10, 7], [11, 6]])),
      F(ink, r(4, 10, 8, 1), r(5, 11, 6, 1), r(6, 12, 4, 1)),
    ],
    32: [
      ...face[32], sadBrows[32],
      F(ink, r(8, 11, 2, 2), r(10, 13, 3, 2), r(13, 11, 2, 2), r(17, 11, 2, 2), r(19, 13, 3, 2), r(22, 11, 2, 2)),
      F(ink, r(10, 19, 12, 2), r(8, 21, 16, 2), r(10, 23, 12, 1), r(12, 24, 8, 1), r(14, 25, 4, 1)),
    ],
  },
  'emoji/face-tired': {
    16: [...face[16], xeyes[16], ...hole(16, r(5, 9, 6, 1), r(4, 10, 8, 2), r(5, 12, 6, 1))],
    32: [...face[32], xeyes[32], ...hole(32, r(12, 18, 8, 1), r(10, 19, 12, 1), r(8, 20, 16, 5), r(10, 25, 12, 1), r(12, 26, 8, 1))],
  },
  'emoji/face-steam': {
    16: [...face[16], angryBrows[16], F(ink, r(5, 6, 2, 1), r(9, 6, 2, 1)), F(ink, r(5, 12, 6, 1)), ...jets[16]],
    32: [...face[32], F(ink, bl([[7, 8], [9, 9], [11, 10], [19, 10], [21, 9], [23, 8]])), F(ink, r(9, 13, 5, 2), r(18, 13, 5, 2)), F(ink, r(11, 23, 10, 2)), ...jets[32]],
  },
  'emoji/face-enraged': {
    16: [...disc[16](r2), angryBrows[16], eyes[16], F(ink, px([[5, 10], [6, 10], [9, 10], [10, 10], [4, 11], [7, 11], [8, 11], [11, 11]]))],
    32: [...disc[32](r2), angryBrows[32], eyes[32], F(ink, wave32([22, 21, 21, 22, 22, 21, 21, 22]))],
  },
  'emoji/face-angry': {
    16: [...face[16], angryBrows[16], eyes[16], frown[16]],
    32: [...face[32], angryBrows[32], eyes[32], frown[32]],
  },
  'emoji/face-smiling-horns': {
    16: [...disc[16](p2), ...horns[16], happy[16], F(ink, r(5, 12, 5, 1), r(4, 11, 1, 1), r(10, 11, 1, 1), r(11, 10, 1, 1))],
    32: [...disc[32](p2), ...horns[32], happy[32], F(ink, r(8, 22, 2, 2), r(10, 23, 8, 2), r(18, 22, 2, 2), r(20, 21, 2, 2), r(22, 19, 2, 2))],
  },
  'emoji/face-angry-horns': {
    16: [...disc[16](p2), ...horns[16], angryBrows[16], eyes[16], frown[16]],
    32: [...disc[32](p2), ...horns[32], angryBrows[32], eyes[32], frown[32]],
  },
  'emoji/face-pleading': {
    16: [...face[16], sadBrows[16], ...glossy[16], F(ink, r(7, 11, 2, 1)), F(r3, r(3, 9, 2, 1), r(11, 9, 2, 1))],
    32: [...face[32], sadBrows[32], ...glossy[32], F(ink, r(15, 22, 2, 2)), F(r3, r(6, 16, 3, 2), r(23, 16, 3, 2))],
  },
  'emoji/face-holding-back-tears': {
    16: [...face[16], F(ink, r(5, 4, 2, 1), r(9, 4, 2, 1)), ...glossy[16], F(b4, r(5, 8, 2, 1), r(9, 8, 2, 1)), flat[16]],
    32: [...face[32], F(ink, r(9, 7, 5, 2), r(18, 7, 5, 2)), ...glossy[32], F(b4, r(9, 14, 5, 2), r(18, 14, 5, 2)), flat[32]],
  },
  'emoji/face-distorted': {
    16: [
      ...blob(16, a3, false, ell(14, 12, 1, 2)),
      F(ink, r(4, 5, 2, 2), r(10, 7, 2, 2)),
      F(ink, px([[4, 10], [5, 11], [6, 11], [7, 10], [8, 10], [9, 11], [10, 11], [11, 10]])),
    ],
    32: [
      ...blob(32, a3, false, ell(30, 26, 1, 3)),
      F(ink, r(9, 10, 3, 3), r(20, 13, 3, 3)),
      F(ink, wave32([21, 20, 20, 21, 22, 23, 22, 21])),
    ],
  },
  'emoji/face-melting': {
    16: [
      ...melt[16],
      F(a2, r(5, 6, 2, 1), r(9, 6, 2, 1)),
      F(ink, r(5, 7, 2, 1), r(9, 7, 2, 1)),
      F(ink, px([[4, 10], [5, 10], [6, 11], [7, 11], [8, 10], [9, 10], [10, 11], [11, 11], [12, 12]])),
    ],
    32: [
      ...melt[32],
      F(a2, r(10, 10, 3, 2), r(19, 10, 3, 2)),
      F(ink, r(10, 12, 3, 2), r(19, 12, 3, 2)),
      F(ink, bl([[9, 20], [11, 21], [13, 21], [15, 22], [17, 23], [19, 23], [21, 24], [23, 25]])),
    ],
  },
  'emoji/face-bags-under-eyes': {
    16: [...face[16], eyes[16], F(a2, r(5, 8, 2, 1), r(9, 8, 2, 1)), flat[16]],
    32: [...face[32], eyes[32], F(a2, r(9, 14, 5, 2), r(18, 14, 5, 2)), flat[32]],
  },
  'emoji/face-tears-of-joy': {
    16: [
      ...face[16], happy[16],
      F(ink, r(4, 9, 8, 2), r(5, 11, 6, 1), r(6, 12, 4, 1)),
      F(white, r(5, 10, 6, 1)),
      F(b4, r(3, 8, 1, 2), r(12, 8, 1, 2)),
    ],
    32: [
      ...face[32], happy[32],
      F(ink, r(8, 19, 16, 4), r(9, 23, 14, 1), r(10, 24, 12, 1), r(12, 25, 8, 1), r(14, 26, 4, 1)),
      F(white, r(10, 21, 12, 2)),
      F(b4, r(7, 13, 2, 2), r(6, 15, 2, 2), r(5, 17, 2, 3), r(23, 13, 2, 2), r(24, 15, 2, 2), r(25, 17, 2, 3)),
    ],
  },
  'emoji/face-shattered': {
    16: [
      ...face[16], F(ink, r(4, 6, 2, 2), r(10, 6, 2, 2)),
      F(ink, px([[8, 2], [7, 3], [7, 4], [8, 5], [8, 6], [7, 7], [7, 8], [6, 4], [5, 3], [4, 3], [8, 9], [9, 9], [10, 10], [11, 10], [12, 11]])),
      F(ink, r(6, 11, 4, 1)),
    ],
    32: [
      ...face[32], eyes[32],
      F(ink, bl([[16, 3], [15, 5], [14, 7], [15, 9], [14, 11], [15, 13], [16, 15], [15, 17]])),
      F(ink, bl([[12, 6], [10, 5], [8, 4]])),
      F(ink, bl([[18, 16], [20, 17], [22, 18], [24, 19], [26, 20]])),
      F(ink, r(13, 22, 6, 2)),
    ],
  },
}

write(process.argv[2], icons)
