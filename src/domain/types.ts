import { Big } from 'big.js'
import { Data, Schema } from 'effect'

export type MessageType = "distance" | "badge_update"

export type StorageOperation = "get" | "set" | "remove" | "clear"

export type MouseEventType = "mousemove" | "mousedown" | "mouseup"

export interface DpiInfo {
  readonly detected: number
  readonly fallback: number
  readonly source: "measurement" | "devicePixelRatio" | "default"
}

export interface ConversionResult {
  readonly value: number
  readonly unit: string | null
  readonly formatted: string
}

export interface ValidationResult {
  readonly isValid: boolean
  readonly reason?: string
}

// Core unit definition
export interface MeasurementUnit {
  readonly symbol: string
  readonly name: string
  readonly factor: number | Big  // Support both regular numbers and Big for precision
  readonly threshold: number | Big  // Support both regular numbers and Big for precision
  readonly precision: number  // Decimal places for display
}

// Measurement system definition
export interface MeasurementSystem {
  readonly id: string
  readonly name: string
  readonly baseUnit: string  // Symbol of the base unit
  readonly units: readonly MeasurementUnit[]
}

// Error types using discriminated unions
export type ConversionError = 
  | { readonly _tag: 'ConversionError'; readonly message: string }
  | { readonly _tag: 'SystemNotFoundError'; readonly systemId: string; readonly message: string }
  | { readonly _tag: 'NoConversionPathError'; readonly from: string; readonly to: string; readonly message: string }

// Error constructors
export const ConversionError = (message: string): ConversionError => ({
  _tag: 'ConversionError',
  message
})

export const SystemNotFoundError = (systemId: string): ConversionError => ({
  _tag: 'SystemNotFoundError',
  systemId,
  message: `Measurement system not found: ${systemId}`
})

export const NoConversionPathError = (from: string, to: string): ConversionError => ({
  _tag: 'NoConversionPathError',
  from,
  to,
  message: `No conversion path found from ${from} to ${to}`
})

// Formatted measurement result
export interface FormattedMeasurement {
  readonly value: number
  readonly unit: MeasurementUnit
  readonly formatted: string
}

// Effect-based measurement system type (replacing string union)
export class MeasurementSystemMetric extends Data.TaggedClass("Metric")<{}> {}
export class MeasurementSystemImperial extends Data.TaggedClass("Imperial")<{}> {}
export class MeasurementSystemAstronomical extends Data.TaggedClass("Astronomical")<{}> {}
export class MeasurementSystemNautical extends Data.TaggedClass("Nautical")<{}> {}

export type MeasurementSystemType = 
  | MeasurementSystemMetric
  | MeasurementSystemImperial
  | MeasurementSystemAstronomical
  | MeasurementSystemNautical

// Constructor helpers
export const MeasurementSystem = {
  Metric: () => new MeasurementSystemMetric(),
  Imperial: () => new MeasurementSystemImperial(),
  Astronomical: () => new MeasurementSystemAstronomical(),
  Nautical: () => new MeasurementSystemNautical()
} as const

