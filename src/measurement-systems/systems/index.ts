// All measurement systems
export { MetricSystem } from './metric'
export { ImperialSystem } from './imperial'
export { AstronomicalSystem } from './astronomical'
export { NauticalSystem } from './nautical'

// Array of all systems for iteration if needed
import { MetricSystem } from './metric'
import { ImperialSystem } from './imperial'
import { AstronomicalSystem } from './astronomical'
import { NauticalSystem } from './nautical'

export const ALL_SYSTEMS = [
  MetricSystem,
  ImperialSystem,
  AstronomicalSystem,
  NauticalSystem
] as const 