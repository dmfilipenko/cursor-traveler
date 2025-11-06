import { Big } from 'big.js'
import type { MeasurementSystem } from '../../domain/types'

export const MetricSystem: MeasurementSystem = {
  id: 'metric',
  name: 'Metric',
  baseUnit: 'mm',
  units: [
    {
      name: 'millimeter',
      symbol: 'mm',
      factor: new Big('1'),           // Base unit
      threshold: new Big('0'),        // Always available
      precision: 2
    },
    {
      name: 'centimeter',
      symbol: 'cm',
      factor: new Big('10'),          // 1 cm = 10 mm
      threshold: new Big('10'),       // Use cm for >= 10mm
      precision: 2
    },
    {
      name: 'meter',
      symbol: 'm',
      factor: new Big('1000'),        // 1 m = 1000 mm
      threshold: new Big('1000'),     // Use m for >= 1000mm (1m)
      precision: 2
    },
    {
      name: 'kilometer',
      symbol: 'km',
      factor: new Big('1000000'),     // 1 km = 1,000,000 mm
      threshold: new Big('10000'),    // Use km for >= 10,000mm (10m)
      precision: 3
    }
  ]
} as const 