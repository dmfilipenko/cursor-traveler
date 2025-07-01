// Global analytics function (Google Analytics)
declare function ga(command: string, ...fields: any[]): void;

// Chrome extension globals are already handled by @types/chrome
declare global {
  interface Window {
    clearStorage?: () => void;
  }
} 