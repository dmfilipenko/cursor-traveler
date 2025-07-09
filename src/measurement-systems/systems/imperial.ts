import { Big } from 'big.js'
import type { MeasurementSystem } from '../../domain/types'

export const ImperialSystem: MeasurementSystem = {
  id: 'imperial',
  name: 'Imperial',
  baseUnit: 'mm',
  units: [
    {
      name: 'inch',
      symbol: 'in',
      factor: new Big('25.4'),         // 1 inch = 25.4 mm
      threshold: new Big('25.4'),      // Use inches for >= 25.4mm (1 inch)
      precision: 2
    },
    {
      name: 'foot',
      symbol: 'ft',
      factor: new Big('304.8'),        // 1 foot = 304.8 mm (12 * 25.4)
      threshold: new Big('304.8'),     // Use feet for >= 304.8mm (1 foot)
      precision: 2
    },
    {
      name: 'yard',
      symbol: 'yd',
      factor: new Big('914.4'),        // 1 yard = 914.4 mm (3 * 304.8)
      threshold: new Big('914.4'),     // Use yards for >= 914.4mm (1 yard)
      precision: 2
    },
    {
      name: 'mile',
      symbol: 'mi',
      factor: new Big('1609344'),      // 1 mile = 1,609,344 mm
      threshold: new Big('804672'),    // Use miles for >= 804,672mm (0.5 miles)
      precision: 2
    }
  ]
} as const 