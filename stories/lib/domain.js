// Args and stories shared by every domain stories file
import { forDomain } from './icons.js'
import { iconGrid } from './render.js'

export function domainArgs(domain) {
  return {
    args: { domain, scale: 4, background: 'light' },
    argTypes: {
      domain: { table: { disable: true } },
      scale: { control: { type: 'radio' }, options: [1, 2, 4, 8] },
      background: { control: { type: 'radio' }, options: ['light', 'dark', 'checker'] },
    },
  }
}

// Rasterised through the palette, which is what the atlas ships
export const atlasGrid = args => iconGrid(forDomain(args.domain), { ...args, mode: 'raster' })

// The SVG source as the browser renders it, for spotting stray anti aliasing
export const sourceGrid = args => iconGrid(forDomain(args.domain), { ...args, mode: 'source' })
