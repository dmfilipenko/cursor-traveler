import { Data } from 'effect'

export class ChromeRuntimeError extends Data.TaggedError("ChromeRuntimeError")<{
  readonly message: string
  readonly operation: "sendMessage" | "getStorage" | "setStorage" | "clearStorage"
  readonly cause?: unknown
}> {}

export class StorageError extends Data.TaggedError("StorageError")<{
  readonly operation: "get" | "set" | "remove" | "clear"
  readonly key?: string
  readonly reason: "not_found" | "permission_denied" | "quota_exceeded" | "unknown"
  readonly cause?: unknown
}> {}

export class MouseTrackingError extends Data.TaggedError("MouseTrackingError")<{
  readonly reason: "invalid_movement" | "calculation_error" | "stream_error" | "dpi_detection_failed"
  readonly details?: string
  readonly cause?: unknown
}> {}

export class MeasurementError extends Data.TaggedError("MeasurementError")<{
  readonly reason: "invalid_pixels" | "unsupported_system" | "conversion_failed"
  readonly input?: number
  readonly system?: string
  readonly cause?: unknown
}> {}

export class BadgeError extends Data.TaggedError("BadgeError")<{
  readonly reason: "update_failed" | "invalid_value"
  readonly value?: string | number
  readonly cause?: unknown
}> {}

export class RenderError extends Data.TaggedError("RenderError")<{
  readonly reason: "dom_not_found" | "invalid_data" | "render_failed"
  readonly element?: string
  readonly cause?: unknown
}> {} 