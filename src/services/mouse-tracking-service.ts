import { Effect, Stream } from 'effect'
import { MouseTrackingError } from '../domain/errors'
import { MousePosition } from '../domain/models'
import { pixelToMillimeters } from '../measurement-systems'

export interface MouseTrackingService {
  readonly processEvent: (
    event: MouseEvent, 
    previousEvent: MouseEvent | null
  ) => Effect.Effect<number, MouseTrackingError>
  readonly createStream: () => Stream.Stream<number, MouseTrackingError>
}

const calculateDistance = (position: MousePosition): number => {
  const { prevX, prevY, currX, currY } = position
  return Math.sqrt(
    Math.pow((currX - prevX), 2) + Math.pow((currY - prevY), 2)
  )
}

const validateMovement = (position: MousePosition): boolean =>
    Math.abs(position.prevX - position.currX) < 300 && 
    Math.abs(position.prevY - position.currY) < 300

const processMouseEvent = (
  event: MouseEvent, 
  previousEvent: MouseEvent | null
): Effect.Effect<number, MouseTrackingError> => {
  if (!previousEvent) {
    return Effect.succeed(0)
  }

  const position: MousePosition = {
    _tag: "MousePosition",
    prevX: previousEvent.pageX,
    prevY: previousEvent.pageY,
    currX: event.pageX,
    currY: event.pageY
  }

  if (!validateMovement(position)) {
    return Effect.succeed(0)
  }

  const pixelDistance = calculateDistance(position)
  
  return pixelToMillimeters(pixelDistance).pipe(
    Effect.catchAll((error) => Effect.fail(new MouseTrackingError({
      reason: "calculation_error",
      details: `Pixel conversion failed: ${error}`
    })))
  )
}

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
} 