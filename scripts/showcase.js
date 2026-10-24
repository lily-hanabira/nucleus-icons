// Renders upscaled sampler images into docs/ for the readme.
// GitHub does not pixel scale images, so the 4x scaling is baked into the PNGs.
// Usage: node scripts/showcase.js
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src', 'icons')
const OUT = join(ROOT, 'docs')
const SCALE = 4
const BG = '#dde1e8'

// Hand picked icons for the hero strip, one or two per domain
const HERO = [
  'system/folder-open', 'system/page-code', 'devices/laptop-linux', 'storage/usb', 'mail/urgent',
  'control/security', 'actions/save', 'components/3d', 'apps/nucleus', 'apps/bloom-encore', 'audio/headphones',
  'science/flask', 'editor/bucket-fill', 'profile/generic-cat-1', 'emoji/face-heart-eyes',
  'emoji/rocket', 'emoji/pizza', 'traffic/green', 'status/bulb-on',
]

// Rasterise an SVG at its native size and return a data uri
const dataUri = (id, size) => {
  const svg = readFileSync(join(SRC, `${id}.${size}.svg`), 'utf8')
  const png = new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng().toString('base64')
  return `data:image/png;base64,${png}`
}

// Compose placed images into one upscaled PNG with hard pixels
function compose(width, height, images, file) {
  const parts = images.map(i => `<image x="${i.x}" y="${i.y}" width="${i.size}" height="${i.size}" image-rendering="optimizeSpeed" xlink:href="${i.uri}"/>`)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width * SCALE}" height="${height * SCALE}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${BG}"/>${parts.join('')}</svg>`
  writeFileSync(join(OUT, file), new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng())
  console.log(`wrote docs/${file}`)
}

mkdirSync(OUT, { recursive: true })

// Hero strip: the brand mark at 64, then each icon at 32 with its 16 sibling tucked beside it
const cell = 56
const lead = 80
compose(lead + 8 + HERO.length * cell, 80, [
  { x: 8, y: 8, size: 64, uri: dataUri('brand/nucleus', 64) },
  ...HERO.flatMap((id, i) => [
    { x: lead + 8 + i * cell, y: 24, size: 32, uri: dataUri(id, 32) },
    { x: lead + 8 + i * cell + 36, y: 40, size: 16, uri: dataUri(id, 16) },
  ]),
], 'hero.png')

// Domain sampler: the first eight icons of every domain at 32 in a row per domain
const domains = readdirSync(SRC, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
const perRow = 8
const images = []
domains.forEach((domain, row) => {
  const names = readdirSync(join(SRC, domain)).filter(f => f.endsWith('.32.svg')).map(f => f.replace('.32.svg', '')).slice(0, perRow)
  names.forEach((name, col) => images.push({ x: 8 + col * 40, y: 8 + row * 40, size: 32, uri: dataUri(`${domain}/${name}`, 32) }))
})
compose(16 + perRow * 40, 16 + domains.length * 40, images, 'domains.png')
