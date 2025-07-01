import { Effect, Stream, Chunk, Array as EffectArray } from 'effect'
import { MouseTrackingServiceLive } from './services/mouse-tracking-service'
import { ChromeMessage } from './domain/models'
import { ChromeRuntimeError } from './domain/errors'

// Direct Chrome messaging function
const sendMessage = <T = any>(message: ChromeMessage): Effect.Effect<T, ChromeRuntimeError> =>
  Effect.tryPromise({
    try: () => new Promise<T>((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    }),
    catch: (error) => new ChromeRuntimeError({
      message: "Failed to send message",
      operation: "sendMessage",
      cause: error
    })
  })

// Test background communication
const testBackgroundCommunication = (): Effect.Effect<void, never, never> =>
  Effect.gen(function* () {
    const testMessage: ChromeMessage = {
      _tag: "ChromeMessage",
      type: "test",
      data: "hello from content"
    }
    
    yield* sendMessage(testMessage).pipe(
      Effect.catchAll(() => Effect.succeed(void 0))
    )
  })

// Process mouse movements and send to background
const processMouseMovements = (): Effect.Effect<void, never, never> =>
  Effect.gen(function* () {
    const mouseStream = MouseTrackingServiceLive.createStream()
    
    const bufferedStream = Stream.groupedWithin(mouseStream, 100, "5 seconds").pipe(
      Stream.map((chunk: Chunk.Chunk<number>) => {
        const movements = Chunk.toReadonlyArray(chunk)
        return EffectArray.reduce(movements, 0, (sum: number, value: number) => sum + value)
      }),
      Stream.filter((total: number) => total > 0),
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
          Effect.catchAll(() => Effect.succeed(void 0))
        )
      })
    )
  })

// Main content initialization
const initialize = (): Effect.Effect<void, never, never> =>
  Effect.gen(function* () {
    yield* testBackgroundCommunication()
    yield* processMouseMovements()
  })

// Main execution
const main = (): Effect.Effect<void, never, never> =>
  Effect.gen(function* () {
    yield* initialize().pipe(
      Effect.catchAll(() => Effect.succeed(void 0))
    )
  })

// Auto-start when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Effect.runFork(main()))
} else {
  Effect.runFork(main())
} 