import { Effect, Context, Layer } from 'effect'
import { MeasurementError } from '../domain/errors'
import { FormattedMeasurement, MeasurementSystemType  } from '../domain/types'
import {
  convertPixelsTo,
  convertBetweenSystems,
  getUnitSymbol,
  pixelToMillimeters,
  MetricSystem
} from '../measurement-systems'

export interface MeasurementService {
  readonly convertPixelsTo: (
    pixels: number, 
    system: MeasurementSystemType
  ) => Effect.Effect<FormattedMeasurement, MeasurementError>
  readonly convertFromMillimeters: (total: number) => Effect.Effect<FormattedMeasurement, MeasurementError>
  readonly getUnitSymbolForMillimeters: (total: number) => Effect.Effect<string, MeasurementError>
  readonly convertPixelsToMillimeters: (pixels: number) => Effect.Effect<number, MeasurementError>
}

export const MeasurementService = Context.GenericTag<MeasurementService>("@services/MeasurementService")

const convertPixels = (
  pixels: number,
  system: MeasurementSystemType
): Effect.Effect<FormattedMeasurement, MeasurementError> =>
  convertPixelsTo(pixels, system).pipe(
    Effect.catchAll((error) => Effect.fail(new MeasurementError({
      reason: "conversion_failed",
      input: pixels,
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
    convertPixelsToMillimeters: (pixels: number) => 
      pixelToMillimeters(pixels).pipe(
        Effect.catchAll((error) => Effect.fail(new MeasurementError({
          reason: "conversion_failed",
          input: pixels,
          cause: error
        })))
      )
  })
) 