import { Effect, Layer } from 'effect'
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

const cleanStorage = (): Effect.Effect<void, never, StorageService> =>
  Effect.gen(function* () {
    const storageService = yield* StorageService
    const storageData = yield* storageService.get().pipe(
      Effect.catchAll(() => Effect.succeed({}))
    )
    
    const keysToRemove: string[] = []
    
    for (const [key, value] of Object.entries(storageData)) {
      const shouldRemove = 
        key === 'test' || 
        typeof value === 'string' ||
        (typeof value === 'number' && (isNaN(value) || value < 0 || value > 10000))
      
      if (shouldRemove) {
        keysToRemove.push(key)
      }
    }
    
    if (keysToRemove.length > 0) {
      yield* storageService.remove(keysToRemove).pipe(
        Effect.catchAll(() => Effect.succeed(void 0))
      )
    }
  })

const processDistanceMessage = (distance: number): Effect.Effect<any, StorageError | BadgeError | MeasurementError, StorageService | DateService | BadgeService | CalculationService | MeasurementService> =>
  Effect.gen(function* () {
    if (typeof distance !== 'number' || isNaN(distance)) {
      return { success: false, error: 'Invalid distance' }
    }
    
    const dateService = yield* DateService
    const storageService = yield* StorageService
    const badgeService = yield* BadgeService
    
    const timestamp = yield* dateService.getDayStartTimestamp()
    const existingData = yield* storageService.get([timestamp.toString()]).pipe(
      Effect.catchAll(() => Effect.succeed({}))
    )
    
    const existingValue = (existingData as Record<string, number>)[timestamp.toString()] || 0
    const totalDistance = distance + existingValue
    
    yield* storageService.set({ [timestamp.toString()]: totalDistance }).pipe(
      Effect.catchAll(() => Effect.succeed(void 0))
    )
    
    yield* badgeService.updateFromStorage()
    
    return { success: true }
  })

const handleMessage = (message: ChromeMessage): Effect.Effect<any, StorageError | BadgeError | MeasurementError, StorageService | DateService | BadgeService | CalculationService | MeasurementService> =>
  Effect.gen(function* () {
    switch (message.type) {
      case "distance":
        return yield* processDistanceMessage(message.data as number)
      case "test":
        return { success: true, message: 'Background communication successful' }
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