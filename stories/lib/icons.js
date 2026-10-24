// Loads every SVG source under src/icons and groups it by domain and name
const files = import.meta.glob('../../src/icons/*/*.svg', { query: '?raw', import: 'default', eager: true })

const byId = new Map()
for (const [path, svg] of Object.entries(files)) {
  const [, domain, name, size] = /\/icons\/([^/]+)\/([^/.]+)\.(16|32|64)\.svg$/.exec(path)
  const id = `${domain}/${name}`
  if (!byId.has(id)) byId.set(id, { id, domain, name, svg: {} })
  byId.get(id).svg[size] = svg
}

export const icons = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id))
export const domains = [...new Set(icons.map(i => i.domain))].sort()
export const forDomain = domain => icons.filter(i => i.domain === domain)
