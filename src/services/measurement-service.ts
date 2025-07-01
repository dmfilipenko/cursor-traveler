import { Effect, Context, Layer } from 'effect'
import { MeasurementError } from '../domain/errors'
import { FormattedMeasurement } from '../domain/types'
import {
  convertPixelsTo,
  convertBetweenSystems,
  getUnitSymbol,
  MetricSystem
} from '../measurement-systems'

export interface MeasurementService {
  readonly convertPixelsTo: (
    pixels: number, 
    system: 'metric' | 'imperial' | 'astronomical' | 'nautical'
  ) => Effect.Effect<FormattedMeasurement, MeasurementError>
  readonly convertFromMillimeters: (total: number) => Effect.Effect<FormattedMeasurement, MeasurementError>
  readonly getUnitSymbolForMillimeters: (total: number) => Effect.Effect<string, MeasurementError>
  readonly convertPixelsToMillimeters: (pixels: number) => Effect.Effect<number, MeasurementError>
}

export const MeasurementService = Context.GenericTag<MeasurementService>("@services/MeasurementService")

const convertPixelsToMm = (pixels: number): Effect.Effect<number, MeasurementError> =>
  Effect.try({
    try: () => {
      const dpi = (() => {
        try {
          const testElement = document.createElement('div')
          testElement.style.width = '1in'
          testElement.style.height = '1in'
          testElement.style.position = 'absolute'
          testElement.style.left = '-1000px'
          testElement.style.top = '-1000px'
          testElement.style.visibility = 'hidden'
          
          document.body.appendChild(testElement)
          const pixelsPerInch = testElement.offsetWidth
          document.body.removeChild(testElement)
          
          if (pixelsPerInch > 50 && pixelsPerInch < 500) {
            return pixelsPerInch
          }
        } catch (error) {
          // Ignore errors and fall back
        }
        return 96 * (window.devicePixelRatio || 1)
      })()
      
      const inches = pixels / dpi
      const mm = inches * 25.4
      
      if (isNaN(mm) || mm < 0) {
        throw new Error(`Invalid conversion result: ${mm}`)
      }
      
      return mm
    },
    catch: (error) => new MeasurementError({
      reason: "conversion_failed",
      input: pixels,
      cause: error
    })
  })

const convertPixels = (
  pixels: number,
  system: 'metric' | 'imperial' | 'astronomical' | 'nautical'
): Effect.Effect<any, MeasurementError> =>
  convertPixelsTo(pixels, system).pipe(
    Effect.catchAll((error) => Effect.fail(new MeasurementError({
      reason: "conversion_failed",
      input: pixels,
      system,
      cause: error
    })))
  )

const convertFromMillimeters = (total: number): Effect.Effect<FormattedMeasurement, MeasurementError> =>
  convertBetweenSystems(total, MetricSystem, MetricSystem).pipe(
    Effect.catchAll((error) => Effect.fail(new MeasurementError({
      reason: "conversion_failed",
      input: total,
      cause: error
    })))
  )

const getUnitSymbolForMillimeters = (total: number): Effect.Effect<string, MeasurementError> =>
  getUnitSymbol(total, MetricSystem.id).pipe(
    Effect.catchAll((error) => Effect.fail(new MeasurementError({
      reason: "conversion_failed",
      input: total,
      cause: error
    })))
  )

export const MeasurementServiceLive = Layer.succeed(
  MeasurementService,
  MeasurementService.of({
    convertPixelsTo: convertPixels,
    convertFromMillimeters: convertFromMillimeters,
    getUnitSymbolForMillimeters: getUnitSymbolForMillimeters,
    convertPixelsToMillimeters: convertPixelsToMm
  })
) 