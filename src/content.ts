import { Effect, Stream, Chunk, Array as EffectArray } from 'effect'
import { MouseTrackingServiceLive } from './services/mouse-tracking-service'
import { ChromeMessage } from './domain/models'
import { ChromeRuntimeError } from './domain/errors'

// Constants for mouse movement processing
const MOUSE_BUFFER_SIZE = 50 as const
const MOUSE_BUFFER_WINDOW = "1 second" as const

// Constants for health check
const HEALTH_CHECK_MESSAGE_TYPE = 'ping' as const
const HEALTH_CHECK_RESPONSE = { status: 'ok', loaded: true } as const

// Direct Chrome messaging function with offline handling
const sendMessage = <T = any>(message: ChromeMessage) =>
  Effect.tryPromise({
    try: () => new Promise<T>((resolve, reject) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(response)
          }
        })
      } catch (error) {
        // Handle case when extension context is invalidated
        reject(error)
      }
    }),
    catch: (error) => new ChromeRuntimeError({
      message: "Failed to send message",
      operation: "sendMessage",
      cause: error
    })
  })

// Process mouse movements and send to background
const processMouseMovements = () =>
  Effect.gen(function* () {
    const mouseStream = MouseTrackingServiceLive.createStream()

    const bufferedStream = Stream.groupedWithin(mouseStream, MOUSE_BUFFER_SIZE, MOUSE_BUFFER_WINDOW).pipe(
      Stream.map((chunk: Chunk.Chunk<number>) => {
        const movements = Chunk.toReadonlyArray(chunk)
        return EffectArray.reduce(movements, 0, (sum: number, value: number) => sum + value)
      }),
      Stream.catchAll(() => Stream.empty)
    )

    yield* Stream.runForEach(bufferedStream, (total: number) =>
      Effect.gen(function* () {
        const distanceMessage: ChromeMessage = {
          _tag: "ChromeMessage",
          type: "distance",
          data: total
        }

        yield* sendMessage(distanceMessage).pipe(
          Effect.catchAll((error) => {
            // Log error but don't stop the stream - extension should continue tracking
            console.debug('Message send failed (extension still functional):', error)
            return Effect.succeed(void 0)
          })
        )
      })
    )
  })

// Health check listener - responds to ping messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === HEALTH_CHECK_MESSAGE_TYPE) {
    sendResponse(HEALTH_CHECK_RESPONSE)
    return true // Keep channel open for async response
  }
  return false
})

// Auto-start when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Effect.runFork(processMouseMovements()))
} else {
  Effect.runFork(processMouseMovements())
} 