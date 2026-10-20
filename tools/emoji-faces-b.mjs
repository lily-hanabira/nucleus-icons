// Emoji faces, second set: masked, unwell, sunglasses, nerd, confused, worried, surprised, fearful, crying and confounded faces
import { ink, g2, g5, white, b4, b5, a2, a3, r2, r3, r, circle, S, F, write, rasterise, face, eyes, smile } from './lib.mjs'

// Pixel helpers: an ink outline is the core dilated by one pixel, clipped to the face silhouette
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i)
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
// Mask grown by one pixel
const dilate = (m, size) => {
  const out = new Uint8Array(size * size)
  for (const y of range(0, size)) for (const x of range(0, size)) {
    if (!m[y * size + x]) continue
    for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
      const nx = x + dx, ny = y + dy
      if (nx >= 0 && ny >= 0 && nx < size && ny < size) out[ny * size + nx] = 1
    }
  }
  return out
}
const silhouette = { 16: circle(14, 1, 1), 32: circle(28, 2, 2) }
// Face disc in a colour other than yellow
const disc = { 16: circle(12, 2, 2), 32: circle(26, 3, 3) }
// blob: ink outlined shape in a colour, layer fn S or F, kept inside the face outline
const blob = (size, layer, colour, core, clip = silhouette[size]) => {
  const c = rasterise(core, size), k = rasterise(clip, size), inner = rasterise(disc[size], size)
  const o = dilate(c, size)
  for (const i of range(0, size * size)) {
    o[i] &= k[i]
    c[i] &= inner[i]
  }
  return [F(ink, path(o, size)), layer(colour, path(c, size))]
}

// Shared features
const frown = {
  16: F(ink, r(4, 12, 1, 1), r(5, 11, 6, 1), r(11, 12, 1, 1)),
  32: F(ink, r(8, 24, 2, 2), r(10, 22, 2, 2), r(12, 20, 8, 2), r(20, 22, 2, 2), r(22, 24, 2, 2)),
}
const smallFrown = {
  16: F(ink, r(6, 11, 4, 1), r(5, 12, 1, 1), r(10, 12, 1, 1)),
  32: F(ink, r(13, 21, 6, 2), r(11, 23, 2, 2), r(19, 23, 2, 2)),
}
const flat = { 16: F(ink, r(5, 11, 6, 1)), 32: F(ink, r(11, 22, 10, 2)) }
const smallO = {
  16: F(ink, r(7, 11, 2, 2)),
  32: F(ink, r(15, 21, 2, 1), r(14, 22, 4, 2), r(15, 24, 2, 1)),
}
const bigO = {
  16: F(ink, r(6, 10, 4, 1), r(5, 11, 6, 1), r(6, 12, 4, 1)),
  32: F(ink, r(13, 20, 6, 1), r(12, 21, 8, 1), r(11, 22, 10, 2), r(12, 24, 8, 1), r(13, 25, 6, 1)),
}
const wideEyes = {
  16: [F(ink, r(4, 5, 3, 3), r(9, 5, 3, 3)), F(white, r(5, 6, 1, 1), r(10, 6, 1, 1))],
  32: [F(ink, r(9, 10, 5, 5), r(18, 10, 5, 5)), F(white, r(10, 11, 3, 3), r(19, 11, 3, 3)), F(ink, r(11, 12, 1, 1), r(20, 12, 1, 1))],
}
const raisedBrows = {
  16: F(ink, r(5, 4, 2, 1), r(9, 4, 2, 1)),
  32: F(ink, r(10, 7, 3, 2), r(19, 7, 3, 2)),
}
const worriedBrows = {
  16: F(ink, r(4, 5, 1, 1), r(5, 4, 2, 1), r(9, 4, 2, 1), r(11, 5, 1, 1)),
  32: F(ink, r(7, 9, 3, 2), r(10, 7, 4, 2), r(18, 7, 4, 2), r(22, 9, 3, 2)),
}
// X shaped eye n pixels across
const xeye = (x0, y0, n) => range(0, n).map(i => r(x0 + i, y0 + i, 2, 1) + r(x0 + n - 1 - i, y0 + i, 2, 1)).join('')
const sweat = {
  16: blob(16, F, b4, r(13, 8, 1, 2)),
  32: blob(32, F, b4, r(27, 13, 1, 2) + r(26, 15, 3, 3) + r(27, 18, 2, 1)),
}

const icons = {
  'emoji/face-medical-mask': {
    16: [...face[16], eyes[16], ...blob(16, S, white, r(5, 10, 6, 3)), F(ink, r(1, 10, 4, 1), r(11, 10, 4, 1))],
    32: [...face[32], eyes[32], ...blob(32, S, white, r(9, 19, 14, 8)), F(g5, r(11, 22, 10, 1), r(11, 24, 10, 1)), F(ink, r(2, 20, 7, 2), r(23, 20, 7, 2))],
  },
  'emoji/face-thermometer': {
    16: [...face[16],
      F(ink, r(5, 7, 2, 1), r(9, 7, 2, 1)), F(a2, r(5, 6, 2, 1), r(9, 6, 2, 1)),
      ...blob(16, F, white, r(4, 11, 3, 1) + r(8, 12, 2, 1)), F(r2, r(10, 12, 1, 1))],
    32: [...face[32],
      F(ink, r(10, 12, 3, 2), r(19, 12, 3, 2)), F(a2, r(9, 10, 5, 2), r(18, 10, 5, 2)),
      flat[32],
      ...blob(32, F, white, r(6, 19, 4, 2) + r(9, 20, 4, 2) + r(12, 21, 4, 2) + r(15, 22, 4, 2) + circle(4, 19, 22)),
      F(r2, circle(4, 19, 22)), F(g5, r(8, 20, 2, 1), r(11, 21, 2, 1), r(14, 22, 2, 1))],
  },
  'emoji/face-head-bandage': {
    16: [...face[16],
      ...blob(16, S, white, range(0, 4).map(i => r(3 + 2 * i, 4 - i, 3, 1)).join('')),
      F(ink, r(5, 6, 2, 2), r(9, 7, 2, 1))],
    32: [...face[32],
      ...blob(32, S, white, range(0, 14).map(i => r(3 + i, 16 - i, 5, 1)).join('')),
      F(ink, r(10, 11, 3, 3), r(18, 12, 4, 2))],
  },
  'emoji/face-crossed-out-eyes': {
    16: [...face[16], F(ink, r(4, 5, 1, 1), r(6, 5, 1, 1), r(5, 6, 1, 1), r(4, 7, 1, 1), r(6, 7, 1, 1), r(9, 5, 1, 1), r(11, 5, 1, 1), r(10, 6, 1, 1), r(9, 7, 1, 1), r(11, 7, 1, 1)), smallO[16]],
    32: [...face[32], F(ink, xeye(8, 10, 5), xeye(18, 10, 5)), smallO[32]],
  },
  'emoji/face-sunglasses': {
    16: [...face[16], F(ink, r(3, 6, 10, 1), r(4, 7, 4, 1), r(9, 7, 4, 1)), F(g2, r(5, 6, 1, 1), r(10, 6, 1, 1)), smile[16]],
    32: [...face[32],
      F(ink, r(8, 10, 6, 1), r(7, 11, 8, 3), r(8, 14, 6, 1), r(18, 10, 6, 1), r(17, 11, 8, 3), r(18, 14, 6, 1), r(4, 11, 24, 2)),
      F(g2, r(8, 11, 2, 2), r(18, 11, 2, 2)), smile[32]],
  },
  'emoji/face-nerd': {
    16: [...face[16],
      F(ink, circle(5, 3, 5), circle(5, 8, 5)), F(b5, r(4, 6, 3, 3), r(9, 6, 3, 3)), F(ink, r(5, 7, 1, 1), r(10, 7, 1, 1)),
      smile[16], ...blob(16, F, white, r(7, 12, 2, 1))],
    32: [...face[32],
      F(ink, circle(10, 6, 8), circle(10, 17, 8), r(15, 12, 3, 2)), S(white, circle(8, 7, 9), circle(8, 18, 9)),
      F(b5, circle(6, 8, 10), circle(6, 19, 10)), F(ink, r(10, 12, 2, 2), r(21, 12, 2, 2)), F(white, r(10, 12, 1, 1), r(21, 12, 1, 1)),
      smile[32], ...blob(32, F, white, r(14, 25, 4, 2))],
  },
  'emoji/face-confused': {
    16: [...face[16], eyes[16], F(ink, r(5, 12, 1, 1), r(6, 11, 2, 1), r(8, 12, 1, 1), r(9, 11, 1, 1), r(10, 10, 1, 1))],
    32: [...face[32], eyes[32], F(ink, r(9, 24, 2, 1), r(10, 23, 3, 2), r(13, 22, 2, 2), r(15, 23, 2, 2), r(17, 22, 2, 2), r(19, 21, 2, 2), r(21, 20, 2, 2))],
  },
  'emoji/face-worried': {
    16: [...face[16], worriedBrows[16], eyes[16], smallFrown[16]],
    32: [...face[32], worriedBrows[32], eyes[32], smallFrown[32]],
  },
  'emoji/face-open-mouth': {
    16: [...face[16], eyes[16], bigO[16]],
    32: [...face[32], eyes[32], F(ink, circle(6, 13, 20))],
  },
  'emoji/face-hushed': {
    16: [...face[16], raisedBrows[16], eyes[16], smallO[16]],
    32: [...face[32], raisedBrows[32], eyes[32], smallO[32]],
  },
  'emoji/face-astonished': {
    16: [...face[16], ...wideEyes[16], bigO[16]],
    32: [...face[32], ...wideEyes[32], bigO[32]],
  },
  'emoji/face-flushed': {
    16: [...face[16], ...wideEyes[16], flat[16], F(r3, r(3, 8, 2, 2), r(11, 8, 2, 2))],
    32: [...face[32], ...wideEyes[32], flat[32], F(r3, r(5, 15, 4, 3), r(23, 15, 4, 3))],
  },
  'emoji/face-fearful': {
    16: [F(ink, circle(14, 1, 1)), S(b5, circle(12, 2, 2)), F(b4, r(3, 11, 10, 1), r(4, 12, 8, 1), r(6, 13, 4, 1)),
      ...wideEyes[16], smallO[16], ...sweat[16]],
    32: [F(ink, circle(28, 2, 2)), S(b5, circle(26, 3, 3)), F(b4, r(5, 22, 22, 2), r(6, 24, 20, 1), r(7, 25, 18, 1), r(8, 26, 16, 1), r(10, 27, 12, 1), r(12, 28, 8, 1)),
      ...wideEyes[32], smallO[32], ...sweat[32]],
  },
  'emoji/face-anguished': {
    16: [...face[16], raisedBrows[16], eyes[16], F(ink, r(6, 10, 4, 1), r(5, 11, 6, 2))],
    32: [...face[32], raisedBrows[32], eyes[32], F(ink, r(14, 20, 4, 1), r(12, 21, 8, 1), r(11, 22, 10, 4))],
  },
  'emoji/face-sad-but-relieved': {
    16: [...face[16], worriedBrows[16], eyes[16], smallFrown[16], ...sweat[16]],
    32: [...face[32], worriedBrows[32], eyes[32], smallFrown[32], ...sweat[32]],
  },
  'emoji/face-crying': {
    16: [...face[16], eyes[16], frown[16], F(b4, r(5, 8, 1, 3))],
    32: [...face[32], eyes[32], frown[32], ...blob(32, F, b4, r(11, 14, 2, 3) + r(10, 17, 4, 2))],
  },
  'emoji/face-loudly-crying': {
    16: [...face[16],
      F(ink, r(4, 7, 1, 1), r(5, 6, 2, 1), r(7, 7, 1, 1), r(8, 7, 1, 1), r(9, 6, 2, 1), r(11, 7, 1, 1)),
      F(b4, r(4, 8, 1, 5), r(11, 8, 1, 5)), F(ink, r(6, 10, 4, 2), r(7, 12, 2, 1))],
    32: [...face[32],
      F(ink, r(7, 13, 2, 2), r(9, 11, 4, 2), r(13, 13, 2, 2), r(17, 13, 2, 2), r(19, 11, 4, 2), r(23, 13, 2, 2)),
      ...blob(32, F, b4, r(7, 15, 2, 11) + r(23, 15, 2, 11)), bigO[32]],
  },
  'emoji/face-confounded': {
    16: [...face[16],
      F(ink, r(4, 6, 1, 1), r(5, 7, 1, 1), r(4, 8, 1, 1), r(11, 6, 1, 1), r(10, 7, 1, 1), r(11, 8, 1, 1)),
      F(ink, r(4, 12, 1, 1), r(5, 11, 2, 1), r(7, 12, 2, 1), r(9, 11, 2, 1), r(11, 12, 1, 1))],
    32: [...face[32],
      F(ink, r(8, 10, 2, 2), r(10, 12, 2, 2), r(8, 14, 2, 2), r(22, 10, 2, 2), r(20, 12, 2, 2), r(22, 14, 2, 2)),
      F(ink, r(8, 23, 2, 2), r(10, 21, 4, 2), r(14, 23, 4, 2), r(18, 21, 4, 2), r(22, 23, 2, 2))],
  },
}

write(process.argv[2], icons)
