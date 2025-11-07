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

// Constants for keepalive configuration
const KEEPALIVE_ALARM_NAME = 'keepalive' as const
const KEEPALIVE_INTERVAL_MINUTES = 0.5 as const

// Constants for tab reload configuration
const TAB_URL_PATTERNS = ['http://*/*', 'https://*/*'] as const
const HEALTH_CHECK_TIMEOUT_MS = 100 as const
const HEALTH_CHECK_MESSAGE_TYPE = 'ping' as const

// Priority weights for smart reloading
const PRIORITY_WEIGHTS = {
  ACTIVE_TAB: 1000,
  RECENT_ONE_HOUR: 500,
  RECENT_ONE_DAY: 100,
  LOADED_TAB: 50, // Tab loaded in memory (not discarded)
  PINNED_TAB: 25,
} as const

// Time thresholds in hours
const TIME_THRESHOLDS = {
  ONE_HOUR: 1,
  ONE_DAY: 24,
} as const

const MILLISECONDS_PER_HOUR = 3600000 as const // 1000 * 60 * 60

const setupKeepalive = () =>
  Effect.sync(() => {
    chrome.alarms.create(KEEPALIVE_ALARM_NAME, { periodInMinutes: KEEPALIVE_INTERVAL_MINUTES })
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === KEEPALIVE_ALARM_NAME) {
        // Keepalive triggered
      }
    })
  })

let postInstallReloadRegistered = false

// Check if content script is already loaded in a tab
const checkContentScriptLoaded = (tabId: number) =>
  Effect.async<boolean>((resume) => {
    let responded = false

    const respond = (value: boolean) => {
      if (!responded) {
        responded = true
        resume(Effect.succeed(value))
      }
    }

    try {
      chrome.tabs.sendMessage(tabId, { type: HEALTH_CHECK_MESSAGE_TYPE }, (response) => {
        if (chrome.runtime.lastError || !response || !response.loaded) {
          respond(false)
        } else {
          respond(true)
        }
      })
    } catch {
      respond(false)
    }

    // Timeout if no response
    setTimeout(() => respond(false), HEALTH_CHECK_TIMEOUT_MS)
  })

// Determine reload priority: higher = more important
const getTabPriority = (tab: chrome.tabs.Tab): number => {
  let priority = 0

  // Highest priority: active tab in current window
  if (tab.active) {
    priority += PRIORITY_WEIGHTS.ACTIVE_TAB
  }

  // High priority: recently accessed tabs
  if (tab.lastAccessed) {
    const hoursSinceAccess = (Date.now() - tab.lastAccessed) / MILLISECONDS_PER_HOUR
    if (hoursSinceAccess < TIME_THRESHOLDS.ONE_HOUR) {
      priority += PRIORITY_WEIGHTS.RECENT_ONE_HOUR
    } else if (hoursSinceAccess < TIME_THRESHOLDS.ONE_DAY) {
      priority += PRIORITY_WEIGHTS.RECENT_ONE_DAY
    }
  }

  // Medium priority: tabs that are currently loaded (not discarded)
  if (tab.discarded !== true) {
    priority += PRIORITY_WEIGHTS.LOADED_TAB
  }

  // Lower priority: pinned tabs (they're likely to stay open)
  if (tab.pinned) {
    priority += PRIORITY_WEIGHTS.PINNED_TAB
  }

  return priority
}

// Query all tabs that can have content scripts
const queryReloadableTabs = () =>
  Effect.tryPromise({
    try: () => chrome.tabs.query({ url: [...TAB_URL_PATTERNS] }),
    catch: () => [] as chrome.tabs.Tab[]
  }).pipe(
    Effect.catchAll(() => Effect.succeed([] as chrome.tabs.Tab[]))
  )

// Check if a tab should be considered for reloading
const isValidTab = (tab: chrome.tabs.Tab): boolean =>
  typeof tab.id === 'number' && !isRestrictedUrl(tab.url)

// Create tab with priority information
const createTabWithPriority = (tab: chrome.tabs.Tab) =>
  Effect.gen(function* () {
    const priority = getTabPriority(tab)
    const isLoaded = yield* checkContentScriptLoaded(tab.id!)

    return {
      tab,
      priority,
      needsReload: !isLoaded
    }
  })

// Reload a single tab with logging
const reloadTab = (tabId: number, priority: number, url?: string) =>
  Effect.sync(() => {
    console.log(`[Smart Reload] Reloading tab ${tabId} (priority: ${priority}): ${url || 'unknown'}`)
    chrome.tabs.reload(tabId)
  })

// Smart reload: only reload tabs that need it, prioritizing active/recent tabs
const smartReloadTabs = () =>
  Effect.gen(function* () {
    // Query all HTTP/HTTPS tabs
    const tabs = yield* queryReloadableTabs()

    // Filter valid tabs and check which need reloading
    const validTabs = Array.filter(tabs, isValidTab)
    const tabsToCheck = yield* Effect.all(
      Array.map(validTabs, createTabWithPriority),
      { concurrency: 'unbounded' }
    )

    // Filter to only tabs that need reloading and sort by priority (highest first)
    const tabsToReload = Array.filter(tabsToCheck, (t) => t.needsReload)
      .sort((a, b) => b.priority - a.priority)

    // Reload tabs in priority order
    yield* Effect.all(
      Array.map(tabsToReload, ({ tab, priority }) =>
        reloadTab(tab.id!, priority, tab.url)
      ),
      { concurrency: 'unbounded' }
    )

    // Log results
    if (tabsToReload.length === 0) {
      console.log('[Smart Reload] No tabs needed reloading - all content scripts already loaded!')
    } else {
      console.log(`[Smart Reload] Reloaded ${tabsToReload.length} of ${tabs.length} tabs`)
    }
  }).pipe(
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error('[Smart Reload] Error during smart reload:', error)
      })
    )
  )

const setupPostInstallReload = () =>
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

        // Use smart reload with Effect runtime
        Effect.runFork(smartReloadTabs())
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
const main = () =>
  Effect.gen(function* () {
    yield* initialize().pipe(
      Effect.provide(MainLayer),
      Effect.catchAll(() => Effect.succeed(void 0))
    )
  })

Effect.runFork(main()) 
