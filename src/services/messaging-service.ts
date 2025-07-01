import { Effect, Context, Layer } from 'effect'
import { ChromeRuntimeError } from '../domain/errors'
import { ChromeMessage } from '../domain/models'

export interface MessagingService {
  readonly sendMessage: <T = any>(message: ChromeMessage) => Effect.Effect<T, ChromeRuntimeError>
  readonly setupListener: <T = any>(
    handler: (message: ChromeMessage) => Effect.Effect<T, never>
  ) => Effect.Effect<void, never>
}

export const MessagingService = Context.GenericTag<MessagingService>("@services/MessagingService")

const chromeSendMessage = <T = any>(message: ChromeMessage): Effect.Effect<T, ChromeRuntimeError> =>
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
        reject(error)
      }
    }),
    catch: (error) => new ChromeRuntimeError({
      message: "Failed to send message",
      operation: "sendMessage",
      cause: error
    })
  })

const setupMessageListener = <T = any>(
  handler: (message: ChromeMessage) => Effect.Effect<T, never>
): Effect.Effect<void, never> =>
  Effect.sync(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Message received:', message, 'from:', sender.tab?.url)
      
      const chromeMessage: ChromeMessage = {
        _tag: "ChromeMessage",
        type: message.type,
        data: message.data,
        sender
      }
      
      // More idiomatic Effect.js approach using runFork
      Effect.runFork(
        handler(chromeMessage).pipe(
          Effect.tap((response) => Effect.sync(() => sendResponse(response))),
          Effect.catchAll((error) => 
            Effect.sync(() => {
              console.error('📨 Message handler error:', error)
              sendResponse({ success: false, error: String(error) })
            })
          )
        )
      )
      
      return true // Keep response channel open for async response
    })
    
    console.log('📨 Message listener set up')
  })

export const MessagingServiceLive = Layer.succeed(
  MessagingService,
  MessagingService.of({
    sendMessage: chromeSendMessage,
    setupListener: setupMessageListener
  })
) 