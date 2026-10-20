import { colors } from '../scripts/lib/palette.js'
import { el } from './lib/render.js'
import * as styles from './lib/styles.js'

export default { title: 'Design/Palette' }

export const Swatches = () => {
  const wrap = el('div', { ...styles.grid, gap: '8px' })
  colors.forEach((c, i) => {
    const swatch = el('div', styles.swatch)
    const chip = el('div', { ...styles.chip, background: c.hex })
    swatch.append(chip, el('div', null, `${i + 1} ${c.name}`), el('div', null, c.hex))
    wrap.append(swatch)
  })
  return wrap
}
