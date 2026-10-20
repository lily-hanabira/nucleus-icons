import { domainArgs, atlasGrid, sourceGrid } from './lib/domain.js'

export default { title: 'Icons/Ui', ...domainArgs('ui') }
export const Atlas = args => atlasGrid(args)
export const Source = args => sourceGrid(args)
