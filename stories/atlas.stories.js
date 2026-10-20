// Shows the compiled pages from dist/. Run the build first so the files exist.
import { el } from './lib/render.js'
import * as styles from './lib/styles.js'

export default {
  title: 'Release/Atlas',
  args: { scale: 4 },
  argTypes: { scale: { control: { type: 'radio' }, options: [1, 2, 4, 8] } },
}

export const Pages = args => {
  const wrap = el('div', { fontFamily: 'Verdana, Tahoma, sans-serif', fontSize: '12px' })
  fetch('/nucleus-icons.json')
    .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.statusText))))
    .then(manifest => {
      wrap.append(el('p', null, `${manifest.name} ${manifest.version}, ${Object.keys(manifest.icons).length} icons`))
      for (const page of Object.values(manifest.pages)) {
        const section = el('div', { marginBottom: '24px' })
        section.append(el('p', null, `${page.file} (${page.width}x${page.height})`))
        const img = el('img', { ...styles.pixel, ...styles.backgrounds.checker })
        img.src = `/${page.file}`
        img.width = page.width * args.scale
        img.height = page.height * args.scale
        section.append(img)
        wrap.append(section)
      }
    })
    .catch(() => wrap.append(el('p', null, 'No atlas found. Run npm run build and reload.')))
  return wrap
}
