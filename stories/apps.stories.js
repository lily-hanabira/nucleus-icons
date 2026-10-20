import { domainArgs, atlasGrid, sourceGrid } from './lib/domain.js'

export default { title: 'Icons/Apps', ...domainArgs('apps') }
export const Atlas = args => atlasGrid(args)
export const Source = args => sourceGrid(args)
