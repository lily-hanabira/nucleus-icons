import { domainArgs, atlasGrid, sourceGrid } from './lib/domain.js'

export default { title: 'Icons/Agents', ...domainArgs('agents') }
export const Atlas = args => atlasGrid(args)
export const Source = args => sourceGrid(args)
