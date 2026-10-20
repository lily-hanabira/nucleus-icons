// Runs every generator in this folder and writes the SVG sources into src/icons.
// Usage: node tools/draw.mjs [name ...] to run only the named generators.
import { readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '..', 'src', 'icons')
const skip = new Set(['lib.mjs', 'draw.mjs', 'preview.mjs'])
const wanted = process.argv.slice(2)
const files = readdirSync(here).filter(f => f.endsWith('.mjs') && !skip.has(f))

for (const file of files) {
  const name = file.replace(/\.mjs$/, '')
  if (wanted.length && !wanted.includes(name)) continue
  const result = spawnSync(process.execPath, [resolve(here, file), out], { stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status)
}
