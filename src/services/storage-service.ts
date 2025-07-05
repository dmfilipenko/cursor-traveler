import { Effect, Context, Layer } from 'effect'
import { StorageError } from '../domain/errors'

export interface StorageService {
  readonly get: (keys?: string[]) => Effect.Effect<Record<string, any>, StorageError>
  readonly set: (data: Record<string, any>) => Effect.Effect<void, StorageError>
  readonly remove: (keys: string[]) => Effect.Effect<void, StorageError>
  readonly clear: () => Effect.Effect<void, StorageError>
  readonly getSelectedMeasurementSystem: () => Effect.Effect<string, StorageError>
  readonly setSelectedMeasurementSystem: (systemId: string) => Effect.Effect<void, StorageError>
}

export const StorageService = Context.GenericTag<StorageService>("@services/StorageService")

const MEASUREMENT_SYSTEM_KEY = 'selectedMeasurementSystem'
const DEFAULT_MEASUREMENT_SYSTEM = 'metric'

const chromeStorageGet = (keys?: string[]): Effect.Effect<Record<string, any>, StorageError> =>
  Effect.tryPromise({
    try: () => new Promise<Record<string, any>>((resolve, reject) => {
      chrome.storage.local.get(keys || null, (data) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(data)
        }
      })
    }),
    catch: (error) => new StorageError({
      operation: "get",
      reason: "unknown",
      cause: error
    })
  })

const chromeStorageSet = (data: Record<string, any>): Effect.Effect<void, StorageError> =>
  Effect.tryPromise({
    try: () => new Promise<void>((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    }),
    catch: (error) => new StorageError({
      operation: "set",
      reason: "unknown",
      cause: error
    })
  })

const chromeStorageRemove = (keys: string[]): Effect.Effect<void, StorageError> =>
  Effect.tryPromise({
    try: () => new Promise<void>((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    }),
    catch: (error) => new StorageError({
      operation: "remove",
      reason: "unknown",
      cause: error
    })
  })

const chromeStorageClear = (): Effect.Effect<void, StorageError> =>
  Effect.tryPromise({
    try: () => new Promise<void>((resolve, reject) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    }),
    catch: (error) => new StorageError({
      operation: "clear",
      reason: "unknown",
      cause: error
    })
  })

const getSelectedMeasurementSystem = (): Effect.Effect<string, StorageError> =>
  Effect.gen(function* () {
    const data = yield* chromeStorageGet([MEASUREMENT_SYSTEM_KEY])
    const result = data[MEASUREMENT_SYSTEM_KEY] || DEFAULT_MEASUREMENT_SYSTEM
    return result
  })

const setSelectedMeasurementSystem = (systemId: string): Effect.Effect<void, StorageError> =>
  chromeStorageSet({ [MEASUREMENT_SYSTEM_KEY]: systemId })

export const StorageServiceLive = Layer.succeed(
  StorageService,
  StorageService.of({
    get: (keys) => chromeStorageGet(keys),
    set: (data) => chromeStorageSet(data),
    remove: (keys) => chromeStorageRemove(keys),
    clear: () => chromeStorageClear(),
    getSelectedMeasurementSystem: () => getSelectedMeasurementSystem(),
    setSelectedMeasurementSystem: (systemId) => setSelectedMeasurementSystem(systemId)
  })
) 