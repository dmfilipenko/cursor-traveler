import { Effect, Layer, Array, Option, Schema } from 'effect'
import { StorageService, StorageServiceLive } from './services/storage-service'
import { MessagingService, MessagingServiceLive } from './services/messaging-service'
import { BadgeService, BadgeServiceLive } from './services/badge-service'
import { DateService, DateServiceLive } from './services/date-service'
import { CalculationService, CalculationServiceLive } from './services/calculation-service'
import { MeasurementService, MeasurementServiceLive } from './services/measurement-service'
import { ChromeMessage } from './domain/models'
import { StorageError, BadgeError, MeasurementError } from './domain/errors'

// Create main service layer
const MainLayer = Layer.mergeAll(
  StorageServiceLive,
  MessagingServiceLive,
  BadgeServiceLive,
  DateServiceLive,
  CalculationServiceLive,
  MeasurementServiceLive
)

const setupKeepalive = (): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    chrome.alarms.create('keepalive', { periodInMinutes: 0.5 })
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'keepalive') {
        // Keepalive triggered
      }
    })
  })

// Schema for valid distance values (following calculation-service.ts pattern)
const DistanceSchema = Schema.Number.pipe(
  Schema.filter(n => n >= 0 && !isNaN(n) && n < 1000000) // 1km max reasonable distance
)

// Domain-specific validation for storage entries
const isValidTimestampKey = (key: string): boolean => {
  const timestamp = parseInt(key, 10)
  return !isNaN(timestamp) && timestamp > 0 && timestamp <= Date.now()
}

const isValidDistanceValue = (value: any): value is number => {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= 0 && 
         value < 1000000 // 1km seems reasonable as max daily distance
}

// Configuration keys that should never be cleaned up
const PROTECTED_KEYS = ['selectedMeasurementSystem']

const isValidStorageEntry = ([key, value]: [string, any]): boolean => {
  // Never clean up protected configuration keys
  if (PROTECTED_KEYS.includes(key)) {
    return true
  }
  
  // For distance data, validate timestamp key and distance value
  return isValidTimestampKey(key) && isValidDistanceValue(value)
}

// Effect-based distance validation
const validateDistance = (distance: unknown): Effect.Effect<number, MeasurementError> =>
  Effect.gen(function* () {
    const result = Schema.decodeUnknownEither(DistanceSchema)(distance)
    if (result._tag === "Right") {
      return result.right
    }
    return yield* Effect.fail(new MeasurementError({
      reason: "invalid_pixels",
      input: typeof distance === 'number' ? distance : undefined,
      cause: result.left
    }))
  })

const cleanStorage = (): Effect.Effect<void, never, StorageService> =>
  Effect.gen(function* () {
    const storageService = yield* StorageService
    const storageData = yield* storageService.get().pipe(
      Effect.catchAll(() => Effect.succeed({}))
    )
    
    const keysToRemove = Array.filterMap(
      Object.entries(storageData),
      ([key, value]) => {
        const isValid = isValidStorageEntry([key, value])
        return isValid ? Option.none() : Option.some(key)
      }
    )
    
    if (keysToRemove.length > 0) {
      yield* storageService.remove(keysToRemove).pipe(
        Effect.catchAll(() => Effect.succeed(void 0))
      )
    } 
  })

const processDistanceMessage = (distance: unknown): Effect.Effect<{ success: true }, StorageError | BadgeError | MeasurementError, StorageService | DateService | BadgeService | CalculationService | MeasurementService> =>
  Effect.gen(function* () {
    const validDistance = yield* validateDistance(distance)
    
    const dateService = yield* DateService
    const storageService = yield* StorageService
    const badgeService = yield* BadgeService
    
    const timestamp = yield* dateService.getDayStartTimestamp()
    const existingData = yield* storageService.get([timestamp.toString()])
    
    const existingValue = (existingData as Record<string, number>)[timestamp.toString()] || 0
    const totalDistance = validDistance + existingValue
    
    yield* storageService.set({ [timestamp.toString()]: totalDistance })
    
    yield* badgeService.updateFromStorage()
    
    return { success: true } as const
  })

const handleMessage = (message: ChromeMessage): Effect.Effect<any, StorageError | BadgeError | MeasurementError, StorageService | DateService | BadgeService | CalculationService | MeasurementService> =>
  Effect.gen(function* () {
    switch (message.type) {
      case "distance":
        return yield* processDistanceMessage(message.data) // No type cast needed
      default:
        return { success: false, error: 'Unknown message type' }
    }
  })

const initialize = (): Effect.Effect<void, never, StorageService | MessagingService | BadgeService | DateService | CalculationService | MeasurementService> =>
  Effect.gen(function* () {
    const messagingService = yield* MessagingService
    const badgeService = yield* BadgeService
    
    yield* setupKeepalive()
    yield* cleanStorage()
    
    // Setup message listener with provided MainLayer
    yield* messagingService.setupListener((message: ChromeMessage) =>
      handleMessage(message).pipe(
        Effect.provide(MainLayer),
        Effect.catchAll(() => Effect.succeed({ success: false, error: 'Handler failed' }))
      )
    )
    
    // Setup storage listener
    chrome.storage.onChanged.addListener(() => {
      Effect.runFork(
        badgeService.updateFromStorage().pipe(
          Effect.provide(MainLayer)
        )
      )
    })
    
    yield* badgeService.updateFromStorage().pipe(
      Effect.catchAll(() => Effect.succeed(void 0))
    )
  })

// Main execution
const main = (): Effect.Effect<void, never, never> =>
  Effect.gen(function* () {
    yield* initialize().pipe(
      Effect.provide(MainLayer),
      Effect.catchAll(() => Effect.succeed(void 0))
    )
  })

Effect.runFork(main()) 