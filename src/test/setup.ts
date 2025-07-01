import { vi } from 'vitest'

// Mock Chrome extension APIs
const mockChrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    sync: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    getManifest: vi.fn(() => ({ version: '1.0.0' })),
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
  },
}

Object.defineProperty(globalThis, 'chrome', {
  value: mockChrome,
  writable: true,
})

// Mock DOM APIs for content script testing
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true,
}) 