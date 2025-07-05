import { Big } from 'big.js'
import type { MeasurementSystem } from '../../domain/types'

export const AstronomicalSystem: MeasurementSystem = {
  id: 'astronomical',
  name: 'Astro',
  baseUnit: 'mm',
  units: [
    {
      name: 'astronomical unit',
      symbol: 'AU',
      factor: new Big('149597870700000'),  // 1 AU = ~149.6 billion mm
      threshold: new Big('74798935350000'), // Use AU for >= 0.5 AU
      precision: 6
    },
    {
      name: 'light-year',
      symbol: 'ly',
      factor: new Big('9460730472580800000'), // 1 ly = ~9.46 × 10^18 mm
      threshold: new Big('4730365236290400000'), // Use ly for >= 0.5 ly
      precision: 6
    },
    {
      name: 'parsec',
      symbol: 'pc',
      factor: new Big('30856775814913672789'), // 1 pc = ~3.09 × 10^19 mm
      threshold: new Big('15428387907456836394'), // Use pc for >= 0.5 pc
      precision: 6
    }
  ]
} as const

// Conversion factors FROM astronomical (mm) TO other systems' base units (all mm now!)
export const AstronomicalConversions = {
  toMetric: new Big('1'),             // mm to mm (same base!)
  toImperial: new Big('1'),           // mm to mm (same base!)
  toNautical: new Big('1'),           // mm to mm (same base!)
} as const 