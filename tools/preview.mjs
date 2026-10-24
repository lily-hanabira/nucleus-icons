// Renders icons from src/icons at 6x on light and dark rows for review. A 64 variant is shown when it exists.
// Usage: node tools/preview.mjs out.png domain/name ...
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const [out, ...ids] = process.argv.slice(2)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'icons')
const K = 6
const png = (id, size) => new Resvg(readFileSync(`${root}/${id}.${size}.svg`, 'utf8'), { font: { loadSystemFonts: false } }).render().asPng().toString('base64')
const img = (id, size, x, y) => `<image x="${x}" y="${y}" width="${size}" height="${size}" image-rendering="optimizeSpeed" xlink:href="data:image/png;base64,${png(id, size)}"/>`

const big = ids.some(id => existsSync(`${root}/${id}.64.svg`))
const cell = big ? 108 : 40
let parts = ''
ids.forEach((id, i) => {
  const x = 4 + i * cell
  for (const y of [4, 68]) {
    parts += img(id, 32, x, y) + img(id, 16, x + 8, y + 38)
    if (existsSync(`${root}/${id}.64.svg`)) parts += img(id, 64, x + 36, y - 2)
  }
})
const w = 8 + ids.length * cell
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w * K}" height="${128 * K}" viewBox="0 0 ${w} 128"><rect width="100%" height="64" fill="#dde1e8"/><rect y="64" width="100%" height="64" fill="#3a4150"/>${parts}</svg>`
writeFileSync(out, new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng())
console.log('wrote', out)
