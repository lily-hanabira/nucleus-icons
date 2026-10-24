// Compiles src/icons into the atlas release in dist/.
// Usage: node scripts/build.js [--check]
// --check validates the sources and exits without writing anything.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'
import { atlas, hexes, quantize } from './lib/palette.js'
import { encodeIndexedPng } from './lib/png.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src', 'icons')
const DIST = join(ROOT, 'dist')
const REQUIRED = [16, 32]
// 64 is optional and reserved for brand and launcher marks, its page holds only the icons that have one
const SIZES = [16, 32, 64]
const COLUMNS = 16
const NAME = 'nucleus-icons'
const checkOnly = process.argv.includes('--check')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))

// Collect icons as { domain, name, files: { 16: path, 32: path, 64: path } }, 64 being optional
function collect() {
  const icons = new Map()
  for (const domain of readdirSync(SRC, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)) {
    for (const file of readdirSync(join(SRC, domain))) {
      const match = /^([a-z0-9-]+)\.(16|32|64)\.svg$/.exec(file)
      if (!match) {
        fail(`${domain}/${file}: file name must be <name>.<16|32|64>.svg with lowercase kebab case name`)
        continue
      }
      const [, name, size] = match
      const id = `${domain}/${name}`
      if (!icons.has(id)) icons.set(id, { id, domain, name, files: {} })
      icons.get(id).files[size] = join(SRC, domain, file)
    }
  }
  return [...icons.values()].sort((a, b) => a.id.localeCompare(b.id))
}

const problems = []
const fail = msg => problems.push(msg)

// Static checks on one SVG source
function validate(icon, size, svg) {
  const label = `${icon.id}.${size}`
  const dims = new RegExp(`width="${size}"\\s+height="${size}"\\s+viewBox="0 0 ${size} ${size}"`)
  if (!dims.test(svg)) fail(`${label}: width, height and viewBox must all be ${size}`)
  if (!/shape-rendering="crispEdges"/.test(svg)) fail(`${label}: root svg needs shape-rendering="crispEdges"`)
  for (const tag of ['<linearGradient', '<radialGradient', '<filter', '<text', '<image', ' stroke=']) {
    if (svg.includes(tag)) fail(`${label}: ${tag} is not allowed, use flat fills only`)
  }
  for (const [, hex] of svg.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
    if (!hexes.has(`#${hex.toLowerCase()}`)) fail(`${label}: #${hex} is not in src/palette.json`)
  }
}

function render(svg, size) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size }, background: 'rgba(0,0,0,0)', font: { loadSystemFonts: false } })
  const image = resvg.render()
  return { width: image.width, height: image.height, pixels: image.pixels }
}

function buildPage(icons, size) {
  const columns = Math.min(COLUMNS, icons.length)
  const rows = Math.ceil(icons.length / columns)
  const width = columns * size
  const height = rows * size
  const page = new Uint8Array(width * height)
  const placements = {}
  let snapped = 0

  icons.forEach((icon, i) => {
    const svg = readFileSync(icon.files[size], 'utf8')
    const img = render(svg, size)
    const q = quantize(img.pixels, img.width, img.height)
    snapped += q.snapped
    const x = (i % columns) * size
    const y = Math.floor(i / columns) * size
    for (const row of Array(size).keys()) {
      page.set(q.indices.subarray(row * size, (row + 1) * size), (y + row) * width + x)
    }
    placements[icon.id] = { x, y }
  })

  return { width, height, columns, page, placements, snapped }
}

function main() {
  const icons = collect()
  for (const icon of icons) {
    for (const size of REQUIRED) if (!icon.files[size]) fail(`${icon.id}: missing ${size}px variant`)
    for (const size of SIZES) if (icon.files[size]) validate(icon, size, readFileSync(icon.files[size], 'utf8'))
  }

  if (problems.length) {
    console.error(`${problems.length} problem(s):`)
    for (const p of problems) console.error(`  ${p}`)
    process.exit(1)
  }
  console.log(`${icons.length} icons across ${new Set(icons.map(i => i.domain)).size} domains, sources valid`)
  if (checkOnly) return

  mkdirSync(DIST, { recursive: true })
  const manifest = {
    name: NAME,
    version: pkg.version,
    palette: ['transparent', ...atlas.slice(1).map(([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join(''))],
    pages: {},
    icons: {},
  }
  for (const icon of icons) manifest.icons[icon.id] = { domain: icon.domain, name: icon.name }

  for (const size of SIZES) {
    const withSize = icons.filter(i => i.files[size])
    if (!withSize.length) continue
    const { width, height, columns, page, placements, snapped } = buildPage(withSize, size)
    const file = `${NAME}-${size}.png`
    writeFileSync(join(DIST, file), encodeIndexedPng(page, width, height, atlas))
    manifest.pages[size] = { file, cell: size, columns, width, height }
    for (const [id, pos] of Object.entries(placements)) manifest.icons[id][size] = pos
    console.log(`${file}: ${withSize.length} icons, ${width}x${height}, ${snapped} edge pixel(s) snapped to palette`)
  }

  writeFileSync(join(DIST, `${NAME}.json`), JSON.stringify(manifest, null, 2) + '\n')
  copyFileSync(join(ROOT, 'LICENSE'), join(DIST, 'LICENSE'))
  console.log(`wrote ${NAME}.json and LICENSE to dist/`)
}

main()
