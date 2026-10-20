import { domainArgs, atlasGrid, sourceGrid } from './lib/domain.js'

export default { title: 'Icons/Labels', ...domainArgs('labels') }
export const Atlas = args => atlasGrid(args)
export const Source = args => sourceGrid(args)
