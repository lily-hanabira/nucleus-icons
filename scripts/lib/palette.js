// Shared palette helpers. Used by the atlas build in node and by Storybook in the browser.
import palette from '../../src/palette.json' with { type: 'json' }

const hexToRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))

// Named colours exactly as listed in src/palette.json
export const colors = palette.colors.map(c => ({ ...c, rgb: hexToRgb(c.hex) }))

// Atlas palette. Index 0 is transparent, every other index is an opaque colour.
export const atlas = [[0, 0, 0], ...colors.map(c => c.rgb)]

export const hexes = new Set(colors.map(c => c.hex.toLowerCase()))

// Index of the closest opaque palette entry, by squared RGB distance
export function nearest(r, g, b) {
  let best = 1
  let bestDist = Infinity
  for (const [i, [pr, pg, pb]] of atlas.entries()) {
    if (i === 0) continue
    const d = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  }
  return best
}

// Map an RGBA buffer to palette indices. Alpha is thresholded so edges stay hard.
// Returns the indices plus how many opaque pixels had to snap to a different colour.
export function quantize(rgba, width, height, alphaCutoff = 128) {
  const indices = new Uint8Array(width * height)
  let snapped = 0
  for (const [i] of indices.entries()) {
    const o = i * 4
    if (rgba[o + 3] < alphaCutoff) continue
    const idx = nearest(rgba[o], rgba[o + 1], rgba[o + 2])
    const [pr, pg, pb] = atlas[idx]
    if (pr !== rgba[o] || pg !== rgba[o + 1] || pb !== rgba[o + 2]) snapped++
    indices[i] = idx
  }
  return { indices, snapped }
}
