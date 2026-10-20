// DOM helpers for showing icons scaled up with hard pixels
import { quantize, atlas } from '../../scripts/lib/palette.js'
import * as styles from './styles.js'

export const el = (tag, style, text) => {
  const node = document.createElement(tag)
  if (style) Object.assign(node.style, style)
  if (text) node.textContent = text
  return node
}

const svgUrl = svg => URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))

// The SVG as the browser draws it, scaled with CSS
export function svgTile(svg, size, scale) {
  const img = el('img', styles.pixel)
  img.src = svgUrl(svg)
  img.width = size * scale
  img.height = size * scale
  return img
}

// The SVG rasterised at native size and pushed through the atlas palette, matching the build
export function rasterTile(svg, size, scale) {
  const canvas = el('canvas', styles.pixel)
  canvas.width = size
  canvas.height = size
  canvas.style.width = `${size * scale}px`
  canvas.style.height = `${size * scale}px`

  const img = new Image()
  img.onload = () => {
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, size, size)
    const data = ctx.getImageData(0, 0, size, size)
    const { indices } = quantize(data.data, size, size)
    for (const [i, idx] of indices.entries()) {
      const [r, g, b] = atlas[idx]
      data.data.set([r, g, b, idx === 0 ? 0 : 255], i * 4)
    }
    ctx.putImageData(data, 0, 0)
  }
  img.src = svgUrl(svg)
  return canvas
}

export function iconCard(icon, { scale, mode, background }) {
  const card = el('div', { ...styles.card, ...styles.backgrounds[background] })
  const pair = el('div', styles.pair)
  for (const size of [16, 32]) {
    const tile = mode === 'source' ? svgTile(icon.svg[size], size, scale) : rasterTile(icon.svg[size], size, scale)
    tile.title = `${icon.id} ${size}px`
    pair.append(tile)
  }
  card.append(pair, el('code', null, icon.name))
  return card
}

export function iconGrid(list, args) {
  const grid = el('div', styles.grid)
  for (const icon of list) grid.append(iconCard(icon, args))
  return grid
}
