export interface MousePosition {
  readonly _tag: "MousePosition"
  readonly prevX: number
  readonly prevY: number
  readonly currX: number
  readonly currY: number
}

export interface MouseMovement {
  readonly _tag: "MouseMovement"
  readonly pixelDistance: number
  readonly timestamp: number
  readonly millimeters: number
  readonly position: MousePosition
}

export interface StorageEntry {
  readonly _tag: "StorageEntry"
  readonly key: string
  readonly value: number
  readonly timestamp: number
}

export interface ChromeMessage {
  readonly _tag: "ChromeMessage"
  readonly type: "distance" | "test" | "badge_update"
  readonly data: unknown
  readonly sender?: chrome.runtime.MessageSender
}

export interface RenderData {
  readonly _tag: "RenderData"
  readonly total: number
  readonly metric: string
} 