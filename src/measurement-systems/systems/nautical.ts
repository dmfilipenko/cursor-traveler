import { Big } from 'big.js'
import type { MeasurementSystem } from '../../domain/types'

export const NauticalSystem: MeasurementSystem = {
  id: 'nautical',
  name: 'Nautical',
  baseUnit: 'mm',
  units: [
    {
      name: 'fathom',
      symbol: 'ftm',
      factor: new Big('1828.8'),       // 1 fathom = 1.8288 m = 1828.8 mm
      threshold: new Big('1828.8'),    // Use fathoms for >= 1828.8mm (1 fathom)
      precision: 2
    },
    {
      name: 'cable',
      symbol: 'cb',
      factor: new Big('185200'),       // 1 cable = 185.2 m = 185,200 mm
      threshold: new Big('185200'),    // Use cables for >= 185,200mm (1 cable)
      precision: 2
    },
    {
      name: 'nautical mile',
      symbol: 'nmi',
      factor: new Big('1852000'),      // 1 nmi = 1.852 km = 1,852,000 mm
      threshold: new Big('926000'),    // Use nmi for >= 926,000mm (0.5 nmi)
      precision: 2
    }
  ]
} 