import { Effect, Layer, Array, Option, Schema } from 'effect'
import { StorageService, StorageServiceLive } from './services/storage-service'
import { MessagingService, MessagingServiceLive } from './services/messaging-service'
import { BadgeService, BadgeServiceLive } from './services/badge-service'
import { DateService, DateServiceLive } from './services/date-service'
import { CalculationService, CalculationServiceLive } from './services/calculation-service'
import { MeasurementService, MeasurementServiceLive } from './services/measurement-service'
import { ChromeMessage } from './domain/models'
import { StorageError, BadgeError, MeasurementError } from './domain/errors'
import { isRestrictedUrl } from './domain/restricted-pages'

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

let postInstallReloadRegistered = false

// Check if content script is already loaded in a tab
const checkContentScriptLoaded = (tabId: number): Promise<boolean> =>
  new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, { type: 'ping' }, (response) => {
        // If we get a response and no error, content script is loaded
        if (chrome.runtime.lastError || !response || !response.loaded) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    } catch {
      resolve(false)
    }

    // Timeout after 100ms - if no response, assume not loaded
    setTimeout(() => resolve(false), 100)
  })

// Tab priority for smart reloading
interface TabWithPriority {
  tab: chrome.tabs.Tab
  priority: number
  needsReload: boolean
}

// Determine reload priority: higher = more important
const getTabPriority = (tab: chrome.tabs.Tab): number => {
  let priority = 0

  // Highest priority: active tab in current window
  if (tab.active) priority += 1000

  // High priority: recently accessed tabs (based on tab.lastAccessed if available)
  if (tab.lastAccessed) {
    const hoursSinceAccess = (Date.now() - tab.lastAccessed) / (1000 * 60 * 60)
    if (hoursSinceAccess < 1) priority += 500      // Last hour
    else if (hoursSinceAccess < 24) priority += 100 // Last 24 hours
  }

  // Medium priority: tabs that are currently loaded (not discarded)
  if (tab.discarded !== true) priority += 50

  // Lower priority: pinned tabs (they're likely to stay open)
  if (tab.pinned) priority += 25

  return priority
}

// Smart reload: only reload tabs that need it, prioritizing active/recent tabs
const smartReloadTabs = async (): Promise<void> => {
  try {
    // Query all HTTP/HTTPS tabs
    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] })

    // Filter out restricted URLs and check which tabs need reloading
    const tabsToCheck: TabWithPriority[] = []

    for (const tab of tabs) {
      if (typeof tab.id !== 'number' || isRestrictedUrl(tab.url)) {
        continue
      }

      const priority = getTabPriority(tab)
      const isLoaded = await checkContentScriptLoaded(tab.id)

      tabsToCheck.push({
        tab,
        priority,
        needsReload: !isLoaded
      })
    }

    // Filter to only tabs that need reloading and sort by priority (highest first)
    const tabsToReload = tabsToCheck
      .filter(t => t.needsReload)
      .sort((a, b) => b.priority - a.priority)

    // Reload tabs in priority order
    for (const { tab, priority } of tabsToReload) {
      if (typeof tab.id === 'number') {
        console.log(`[Smart Reload] Reloading tab ${tab.id} (priority: ${priority}): ${tab.url}`)
        chrome.tabs.reload(tab.id)
      }
    }

    if (tabsToReload.length === 0) {
      console.log('[Smart Reload] No tabs needed reloading - all content scripts already loaded!')
    } else {
      console.log(`[Smart Reload] Reloaded ${tabsToReload.length} of ${tabs.length} tabs`)
    }
  } catch (error) {
    console.error('[Smart Reload] Error during smart reload:', error)
  }
}

const setupPostInstallReload = (): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    if (postInstallReloadRegistered) {
      return
    }

    postInstallReloadRegistered = true

    chrome.runtime.onInstalled.addListener((details) => {
      // Handle both INSTALL and UPDATE events
      if (details.reason === chrome.runtime.OnInstalledReason.INSTALL ||
          details.reason === chrome.runtime.OnInstalledReason.UPDATE) {

        console.log(`[Smart Reload] Extension ${details.reason} detected, performing smart reload...`)

        // Use smart reload instead of reloading all tabs
        smartReloadTabs()
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
    yield* setupPostInstallReload()
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
