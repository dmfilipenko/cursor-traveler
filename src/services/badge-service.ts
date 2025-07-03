import { Effect, Context, Layer } from 'effect'
import { BadgeError, StorageError, MeasurementError } from '../domain/errors'
import { StorageService } from './storage-service'
import { MeasurementService } from './measurement-service'
import { CalculationService } from './calculation-service'

export interface BadgeService {
  readonly setBadgeText: (text: string) => Effect.Effect<void, BadgeError>
  readonly updateFromStorage: () => Effect.Effect<
    void,
    BadgeError | StorageError | MeasurementError,
    StorageService | CalculationService | MeasurementService
  >
}

export const BadgeService = Context.GenericTag<BadgeService>(
  '@services/BadgeService'
)

const setBadgeText = (text: string): Effect.Effect<void, BadgeError> =>
  Effect.try({
    try: () => {
      if (chrome?.action?.setBadgeText) {
        chrome.action.setBadgeText({ text })
        console.log('🏷️ Badge: Set to:', text)
      } else {
        throw new Error('chrome.action.setBadgeText not available')
      }
    },
    catch: error =>
      new BadgeError({
        reason: 'update_failed',
        value: text,
        cause: error,
      }),
  })

const getDisplayUnits = (
  total: number
): Effect.Effect<string, MeasurementError, MeasurementService> =>
  Effect.gen(function* () {
    const measurementService = yield* MeasurementService
    const measurement = yield* measurementService.convertFromMillimeters(total)
    return measurement.unit.symbol
  })

const updateBadgeFromStorage = (): Effect.Effect<
  void,
  BadgeError | StorageError | MeasurementError,
  StorageService | CalculationService | MeasurementService
> =>
  Effect.gen(function* () {
    const storageService = yield* StorageService
    const calculationService = yield* CalculationService

    const storageData = yield* storageService.get()
    const total = yield* calculationService.calculateTotal(storageData)
    const units = yield* getDisplayUnits(total)
    yield* setBadgeText(units)
  })

export const BadgeServiceLive = Layer.succeed(
  BadgeService,
  BadgeService.of({
    setBadgeText,
    updateFromStorage: () => updateBadgeFromStorage(),
  })
)
