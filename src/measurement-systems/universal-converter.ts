import { fail, succeed, flatMap } from 'effect/Effect'
import type { Effect } from 'effect'
import { Big } from 'big.js'
import { MeasurementSystem, MeasurementUnit, ConversionError, FormattedMeasurement, SystemNotFoundError, MeasurementSystemType } from '../domain/types'
import { MetricSystem, ImperialSystem, AstronomicalSystem, NauticalSystem } from './systems'

// Constants
const DPI_BOUNDS = {
  MIN: 50,
  MAX: 500
} as const

const MEASUREMENT_CONSTANTS = {
  STANDARD_CSS_DPI: 96,
  MM_PER_INCH: 25.4,
  TEST_ELEMENT_SIZE: '1in',
  TEST_ELEMENT_POSITION: '-1000px'
} as const

// Get actual DPI for accurate pixel-to-physical conversion (desktop only)
const getActualDPI = (): number => {
  try {
    // CSS-based measurement (most accurate)
    const testElement = document.createElement('div')
    testElement.style.width = MEASUREMENT_CONSTANTS.TEST_ELEMENT_SIZE
    testElement.style.height = MEASUREMENT_CONSTANTS.TEST_ELEMENT_SIZE
    testElement.style.position = 'absolute'
    testElement.style.left = MEASUREMENT_CONSTANTS.TEST_ELEMENT_POSITION
    testElement.style.top = MEASUREMENT_CONSTANTS.TEST_ELEMENT_POSITION
    testElement.style.visibility = 'hidden'
    
    document.body.appendChild(testElement)
    const pixelsPerInch = testElement.offsetWidth
    document.body.removeChild(testElement)
    
    // Sanity check - if result seems wrong, fall back
    if (pixelsPerInch > DPI_BOUNDS.MIN && pixelsPerInch < DPI_BOUNDS.MAX) {
      return pixelsPerInch
    }
  } catch (error) {
    // Ignore errors and fall back
  }

  // devicePixelRatio approximation
  const devicePixelRatio = window.devicePixelRatio || 1
  
  return MEASUREMENT_CONSTANTS.STANDARD_CSS_DPI * devicePixelRatio
}

// Improved pixel to millimeter conversion
export const pixelToMillimeters = (pixels: number): Effect.Effect<number, ConversionError, never> => {
  if (pixels < 0) {
    return fail(ConversionError('Pixel value cannot be negative'))
  }
  
  const dpi = getActualDPI()
  const inches = pixels / dpi
  const mm = inches * MEASUREMENT_CONSTANTS.MM_PER_INCH
  
  return succeed(mm)
}

// Simple system lookup by ID
const getSystemById = (systemId: string): MeasurementSystem | undefined => {
  switch (systemId) {
    case MetricSystem.id: return MetricSystem
    case ImperialSystem.id: return ImperialSystem
    case AstronomicalSystem.id: return AstronomicalSystem
    case NauticalSystem.id: return NauticalSystem
    default: return undefined
  }
}

// Convert MeasurementSystemType to MeasurementSystem object (proper Effect approach)
const getSystemFromType = (systemType: MeasurementSystemType): MeasurementSystem => {
  switch (systemType._tag) {
    case "Metric": return MetricSystem
    case "Imperial": return ImperialSystem
    case "Astronomical": return AstronomicalSystem
    case "Nautical": return NauticalSystem
  }
}

// Helper to convert Big or number to number for comparisons
const toNumber = (value: number | Big): number => 
  value instanceof Big ? value.toNumber() : (value as number)

// Helper to perform division with Big support
const safeDivide = (numerator: number, denominator: number | Big): Big => {
  const bigDenominator = denominator instanceof Big ? denominator : new Big(denominator)
  return new Big(numerator).div(bigDenominator)
}

// Find the appropriate unit within a system based on value and thresholds
const findBestUnit = (value: number, system: MeasurementSystem): MeasurementUnit => {
  // Sort units by threshold descending to find the largest applicable unit
  const sortedUnits = [...system.units].sort((a, b) => toNumber(b.threshold) - toNumber(a.threshold))
  return sortedUnits.find(unit => value >= toNumber(unit.threshold)) || system.units[0]
}

// Convert value within a system to the appropriate unit
const convertWithinSystem = (
  baseValue: number,
  system: MeasurementSystem
): Effect.Effect<FormattedMeasurement, ConversionError, never> => {
  let unit = findBestUnit(baseValue, system)
  let convertedValue = safeDivide(baseValue, unit.factor)

  const getFactor = (unit: MeasurementUnit) =>
    unit.factor instanceof Big ? unit.factor : new Big(unit.factor)

  if (convertedValue.lt(1) && getFactor(unit).gt(1)) {
    const sortedUnits = [...system.units].sort((a, b) =>
      getFactor(a).cmp(getFactor(b))
    )
    const currentIndex = sortedUnits.findIndex((u) => u.symbol === unit.symbol)
    if (currentIndex > 0) {
      unit = sortedUnits[currentIndex - 1]
      convertedValue = safeDivide(baseValue, unit.factor)
    }
  }

  const rounded = parseFloat(convertedValue.toFixed(unit.precision))

  return succeed({
    value: rounded,
    unit,
    formatted: `${rounded} ${unit.name}`
  })
}

// Universal converter from pixels to any measurement system (by MeasurementSystemType - PREFERRED)
export const convertPixelsTo = (
  pixels: number,
  systemType: MeasurementSystemType
): Effect.Effect<FormattedMeasurement, ConversionError, never> => {
  const targetSystem = getSystemFromType(systemType)
  return convertPixelsToSystem(pixels, targetSystem)
}

// Legacy version using string IDs (for backward compatibility)
export const convertPixelsToById = (
  pixels: number,
  targetSystemId: string
): Effect.Effect<FormattedMeasurement, ConversionError, never> => {
  // Get target system
  const targetSystem = getSystemById(targetSystemId)
  if (!targetSystem) {
    return fail(SystemNotFoundError(targetSystemId))
  }

  return convertPixelsToSystem(pixels, targetSystem)
}

// Convert between any two measurement systems (by ID)
export const convertBetween = (
  value: number,
  fromSystemId: string,
  toSystemId: string
): Effect.Effect<FormattedMeasurement, ConversionError, never> => {
  // Get systems
  const fromSystem = getSystemById(fromSystemId)
  const toSystem = getSystemById(toSystemId)
  
  if (!fromSystem) {
    return fail(SystemNotFoundError(fromSystemId))
  }
  if (!toSystem) {
    return fail(SystemNotFoundError(toSystemId))
  }

  return convertBetweenSystems(value, fromSystem, toSystem)
}

// Get just the unit symbol for a value in a system (for badges, etc.)
export const getUnitSymbol = (
  value: number,
  systemId: string
): Effect.Effect<string, ConversionError, never> => {
  const system = getSystemById(systemId)
  if (!system) {
    return fail(SystemNotFoundError(systemId))
  }

  const unit = findBestUnit(value, system)
  return succeed(unit.symbol)
}

// Direct system object versions (preferred)
export const convertPixelsToSystem = (
  pixels: number,
  targetSystem: MeasurementSystem
): Effect.Effect<FormattedMeasurement, ConversionError, never> =>
  flatMap(
    pixelToMillimeters(pixels),
    (millimeters) => convertWithinSystem(millimeters, targetSystem)
  )

export const convertBetweenSystems = (
  value: number,
  fromSystem: MeasurementSystem,
  toSystem: MeasurementSystem
): Effect.Effect<FormattedMeasurement, ConversionError, never> => {
  // Since all systems use mm as base, direct conversion is possible!
  // No need for transitive conversions anymore
  if (fromSystem.id === toSystem.id) {
    return convertWithinSystem(value, toSystem)
  }

  // All systems use mm base, so value is already in the right base unit
  return convertWithinSystem(value, toSystem)
}

 