// All measurement systems
export { MetricSystem } from './metric'
export { ImperialSystem } from './imperial'
export { NauticalSystem } from './nautical'

// Array of all systems for iteration if needed
import { MetricSystem } from './metric'
import { ImperialSystem } from './imperial'
import { NauticalSystem } from './nautical'

export const ALL_SYSTEMS = [
  MetricSystem,
  ImperialSystem,
  NauticalSystem
] as const 