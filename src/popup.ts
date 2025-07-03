import { Effect, Layer } from 'effect'
import { StorageService, StorageServiceLive } from './services/storage-service'
import { CalculationService, CalculationServiceLive } from './services/calculation-service'
import { MeasurementService, MeasurementServiceLive } from './services/measurement-service'
import { FormattedMeasurement } from './domain/types'
import { StorageError, MeasurementError, RenderError } from './domain/errors'

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
  MeasurementServiceLive
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

// Main popup render logic
const renderPopup = (): Effect.Effect<void, StorageError | MeasurementError | RenderError, StorageService | CalculationService | MeasurementService> =>
  Effect.gen(function* () {
    const storageService = yield* StorageService
    const calculationService = yield* CalculationService
    const measurementService = yield* MeasurementService

    const storageData = yield* storageService.get()
    const total = yield* calculationService.calculateTotal(storageData)
    const measurement = yield* measurementService.convertFromMillimeters(total)

    yield* render(measurement)
  })

// Setup storage listener for real-time updates
const setupStorageListener = (): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    chrome.storage.onChanged.addListener(() => {
      Effect.runFork(
        renderPopup().pipe(Effect.provide(MainLayer))
      )
    })
  })

// Periodic refresh
const setupPeriodicRefresh = (): Effect.Effect<void, never, never> =>
  Effect.sync(() => {
    const interval = setInterval(() => {
      Effect.runFork(
        renderPopup().pipe(Effect.provide(MainLayer))
      )
    }, 2000)

    window.addEventListener('beforeunload', () => {
      clearInterval(interval)
    })
  })

// Main program
const program = Effect.gen(function* () {
  yield* sendPageview()
  yield* trackPopupInteraction()
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
 