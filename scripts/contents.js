// Refreshes the domain table in readme.md between the contents markers from the icons on disk.
// Usage: node scripts/contents.js
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src', 'icons')
const README = join(ROOT, 'readme.md')
const STYLE = join(ROOT, 'style.md')

// Domain descriptions come from the table in style.md
const covers = new Map()
for (const line of readFileSync(STYLE, 'utf8').split('\n')) {
  const m = /^\| ([a-z]+) \| (.+) \|$/.exec(line)
  if (m && m[1] !== 'Domain') covers.set(m[1], m[2])
}

const rows = readdirSync(SRC, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => {
    const count = readdirSync(join(SRC, d.name)).filter(f => f.endsWith('.16.svg')).length
    return `| ${d.name} | ${count} | ${covers.get(d.name) || ''} |`
  })
const total = rows.reduce((n, row) => n + Number(row.split('|')[2]), 0)

const table = [
  `${total} icons across ${rows.length} domains, each at 16 and 32 pixels.`,
  '',
  '| Domain | Icons | Covers |',
  '| ------ | ----- | ------ |',
  ...rows,
].join('\n')

const readme = readFileSync(README, 'utf8')
const start = '<!-- contents:start -->'
const end = '<!-- contents:end -->'
const a = readme.indexOf(start)
const b = readme.indexOf(end)
if (a < 0 || b < 0) throw new Error('contents markers missing from readme.md')
writeFileSync(README, readme.slice(0, a + start.length) + '\n' + table + '\n' + readme.slice(b))
console.log(`readme contents: ${total} icons, ${rows.length} domains`)
