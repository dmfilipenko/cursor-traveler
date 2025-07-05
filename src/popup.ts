import { Effect, Layer } from 'effect'
import { StorageService, StorageServiceLive } from './services/storage-service'
import { CalculationService, CalculationServiceLive } from './services/calculation-service'
import { MeasurementService, MeasurementServiceLive } from './services/measurement-service'
import { BadgeService, BadgeServiceLive } from './services/badge-service'
import { FormattedMeasurement } from './domain/types'
import { StorageError, MeasurementError, RenderError, BadgeError } from './domain/errors'
import { getSystemById } from './measurement-systems'

// Type declaration for analytics functions
declare global {
  interface Window {
    analytics?: {
      trackExtensionEvent: (eventName: string, parameters?: Record<string, any>) => void
      trackPageView: (pageName: string) => void
      trackPopupOpen: () => void
      trackMouseDistance: (distance: number, unit: string) => void
    }
  }
}

// Create main service layer
const MainLayer = Layer.mergeAll(
  StorageServiceLive,
  CalculationServiceLive,
  MeasurementServiceLive,
  BadgeServiceLive
)

// Analytics functions for GA4
const sendPageview = (): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.trackPageView('popup')
    }
  })

const trackPopupInteraction = (): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.trackPopupOpen()
    }
  })

// Render popup UI
const render = (measurement: FormattedMeasurement): Effect.Effect<void, RenderError, never> =>
  Effect.try({
    try: () => {
      const $total = document.querySelector<HTMLDivElement>('.total')
      const $unit = document.querySelector<HTMLDivElement>('.unit')

      if (!$total || !$unit) {
        throw new Error('Could not find DOM elements .total or .unit')
      }

      // Clear previous content to handle updates correctly
      $total.innerHTML = ''

      const [integerPart, decimalPart] = String(measurement.value).split('.')

      $total.textContent = integerPart
      $unit.textContent = measurement.unit.name

      if (decimalPart) {
        const $mantissa = document.createElement('span')
        $mantissa.className = 'mantissa'
        $mantissa.textContent = `.${decimalPart}`
        $total.appendChild($mantissa)
      }
    },
    catch: (error) => new RenderError({
      reason: 'render_failed',
      element: 'popup',
      cause: error
    })
  })

// Main popup render logic with selected system
const renderPopup = (): Effect.Effect<void, StorageError | MeasurementError | RenderError, StorageService | CalculationService | MeasurementService> =>
  Effect.gen(function* () {
    const storageService = yield* StorageService
    const calculationService = yield* CalculationService
    const measurementService = yield* MeasurementService

    const storageData = yield* storageService.get()
    const selectedSystemId = yield* storageService.getSelectedMeasurementSystem()
    const selectedSystem = getSystemById(selectedSystemId)
    
    const total = yield* calculationService.calculateTotal(storageData)
    const measurement = yield* measurementService.convertFromMillimeters(total, selectedSystem)

    yield* render(measurement)
  })

// Update badge with current system
const updateBadgeForSystem = (): Effect.Effect<void, StorageError | MeasurementError | BadgeError, StorageService | CalculationService | MeasurementService | BadgeService> =>
  Effect.gen(function* () {
    const storageService = yield* StorageService
    const calculationService = yield* CalculationService
    const measurementService = yield* MeasurementService
    const badgeService = yield* BadgeService

    const storageData = yield* storageService.get()
    const selectedSystemId = yield* storageService.getSelectedMeasurementSystem()
    const selectedSystem = getSystemById(selectedSystemId)
    
    const total = yield* calculationService.calculateTotal(storageData)
    const unitSymbol = yield* measurementService.getUnitSymbolForMillimeters(total, selectedSystem)
    
    yield* badgeService.setBadgeText(unitSymbol)
  })

// Load and sync measurement system selector state
const syncMeasurementSystemSelector = (): Effect.Effect<void, StorageError, StorageService> =>
  Effect.gen(function* () {
    const storageService = yield* StorageService
    const selectedSystemId = yield* storageService.getSelectedMeasurementSystem()
    
    const radioButtons = document.querySelectorAll<HTMLInputElement>('input[name="system"]')
    radioButtons.forEach(radio => {
      radio.checked = radio.value === selectedSystemId
    })
  })

// Setup measurement system selector with event delegation
const setupMeasurementSystemSelector = (): Effect.Effect<void, StorageError, StorageService> =>
  Effect.gen(function* () {
    const storageService = yield* StorageService
    
    // Sync initial state
    yield* syncMeasurementSystemSelector()
    
    // Setup event delegation on parent element
    const selectorContainer = document.querySelector('.metric-selector')
    if (!selectorContainer) {
      throw new Error('Metric selector container not found')
    }
    
    const handleSelectorChange = (event: Event): void => {
      const target = event.target as HTMLInputElement
      
      // Check if the target is a radio button with name="system"
      if (target.type === 'radio' && target.name === 'system' && target.checked) {
        // Save to storage
        Effect.runFork(
          storageService.setSelectedMeasurementSystem(target.value).pipe(
            Effect.provide(MainLayer)
          )
        )
        
        // Update display
        Effect.runFork(
          renderPopup().pipe(Effect.provide(MainLayer))
        )
        
        // Update badge
        Effect.runFork(
          updateBadgeForSystem().pipe(Effect.provide(MainLayer))
        )
      }
    }
    
    // Attach single delegated event listener
    selectorContainer.addEventListener('change', handleSelectorChange)
  })

// Setup storage listener for real-time updates
const setupStorageListener = (): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    chrome.storage.onChanged.addListener(() => {
      Effect.runFork(
        Effect.gen(function* () {
          yield* syncMeasurementSystemSelector()
          yield* renderPopup()
        }).pipe(Effect.provide(MainLayer))
      )
    })
  })

// Periodic refresh
const setupPeriodicRefresh = (): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    setInterval(() => {
      Effect.runFork(
        renderPopup().pipe(Effect.provide(MainLayer))
      )
    }, 500)
  })

// Main program
const program = Effect.gen(function* () {
  yield* sendPageview()
  yield* trackPopupInteraction()
  yield* setupMeasurementSystemSelector()
  yield* renderPopup()
  yield* setupStorageListener()
  yield* setupPeriodicRefresh()
})

// Setup debug functions
if (typeof window !== 'undefined') {
  (window as any).clearStorage = () => {
    Effect.runFork(
      Effect.gen(function* () {
        const storageService = yield* StorageService
        yield* storageService.clear()
      }).pipe(Effect.provide(MainLayer))
    )
  }
}

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Effect.runFork(program.pipe(Effect.provide(MainLayer))))
} else {
  Effect.runFork(program.pipe(Effect.provide(MainLayer)))
}
 