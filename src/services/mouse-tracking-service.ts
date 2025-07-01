import { Effect, Stream } from 'effect'
import { MouseTrackingError } from '../domain/errors'
import { MousePosition } from '../domain/models'
import { ValidationResult } from '../domain/types'

export interface MouseTrackingService {
  readonly processEvent: (
    event: MouseEvent, 
    previousEvent: MouseEvent | null
  ) => Effect.Effect<number, MouseTrackingError>
  readonly createStream: () => Stream.Stream<number, MouseTrackingError>
  readonly validateMovement: (position: MousePosition) => Effect.Effect<ValidationResult, never>
}

const calculateDistance = (position: MousePosition): number => {
  const { prevX, prevY, currX, currY } = position
  return Math.sqrt(
    Math.pow((currX - prevX), 2) + Math.pow((currY - prevY), 2)
  )
}

const detectDpi = (): Effect.Effect<number, MouseTrackingError> =>
  Effect.try({
    try: () => {
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
      
      return 96 * (window.devicePixelRatio || 1)
    },
    catch: () => new MouseTrackingError({
      reason: "dpi_detection_failed",
      details: "Could not detect DPI, using fallback"
    })
  })

const convertPixelsToMillimeters = (pixels: number): Effect.Effect<number, MouseTrackingError> =>
  Effect.gen(function* () {
    const dpi = yield* detectDpi().pipe(
      Effect.catchAll(() => Effect.succeed(96))
    )
    
    const inches = pixels / dpi
    const millimeters = inches * 25.4
    
    if (isNaN(millimeters) || millimeters < 0) {
      return yield* Effect.fail(new MouseTrackingError({
        reason: "calculation_error",
        details: `Invalid conversion result: ${millimeters}`
      }))
    }
    
    return millimeters
  })

const validateMovement = (position: MousePosition): Effect.Effect<ValidationResult, never> =>
  Effect.succeed({
    isValid: Math.abs(position.prevX - position.currX) < 300 && 
             Math.abs(position.prevY - position.currY) < 300,
    reason: Math.abs(position.prevX - position.currX) >= 300 || 
            Math.abs(position.prevY - position.currY) >= 300 
            ? "Movement too large" 
            : undefined
  })

const processMouseEvent = (
  event: MouseEvent, 
  previousEvent: MouseEvent | null
): Effect.Effect<number, MouseTrackingError> =>
  Effect.gen(function* () {
    if (!previousEvent) {
      return 0
    }

    const position: MousePosition = {
      _tag: "MousePosition",
      prevX: previousEvent.pageX,
      prevY: previousEvent.pageY,
      currX: event.pageX,
      currY: event.pageY
    }

    const validation = yield* validateMovement(position)
    if (!validation.isValid) {
      return 0
    }

    const pixelDistance = calculateDistance(position)
    const millimeters = yield* convertPixelsToMillimeters(pixelDistance)
    
    return millimeters
  })

const createMouseStream = (): Stream.Stream<number, MouseTrackingError> =>
  Stream.async<number, MouseTrackingError>((emit) => {
    let previousEvent: MouseEvent | null = null
    
    const handleMouseMove = (event: MouseEvent) => {
      Effect.runPromise(
        processMouseEvent(event, previousEvent).pipe(
          Effect.map(distance => {
            if (distance > 0) {
              emit.single(distance)
            }
          }),
          Effect.catchAll((error) => {
            console.error('🐭 Mouse event processing error:', error)
            return Effect.succeed(void 0)
          })
        )
      )
      previousEvent = event
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    
    return Effect.sync(() => {
      document.removeEventListener('mousemove', handleMouseMove)
    })
  })

export const MouseTrackingServiceLive: MouseTrackingService = {
  processEvent: processMouseEvent,
  createStream: createMouseStream,
  validateMovement: validateMovement
} 