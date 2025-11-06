import { Option } from 'effect'

export type RestrictedReason = 'chrome_internal' | 'chrome_web_store'

export type RestrictionCopy = {
  title: string
  description: string
  hint: string
  icon: string
  iconLabel: string
}

const RESTRICTION_COPY: Record<RestrictedReason, RestrictionCopy> = {
  chrome_internal: {
    title: 'Chrome keeps this page locked down',
    description: 'Google blocks every extension from injecting tools into chrome:// pages for security reasons.',
    hint: 'Open any regular website to keep tracking your mouse distance.',
    icon: '🔒',
    iconLabel: 'Locked page'
  },
  chrome_web_store: {
    title: 'Chrome Web Store is read-only',
    description: 'The Web Store does not allow extensions to run, so Cursor Traveler has nothing to measure here.',
    hint: 'Install complete? Switch to another tab and the tracker will start immediately.',
    icon: '🧭',
    iconLabel: 'Compass icon'
  }
}

const normalizeUrl = (url?: string | null): string => (url ?? '').toLowerCase()

export const getRestrictedReason = (url?: string | null): Option.Option<RestrictedReason> => {
  const normalized = normalizeUrl(url)

  if (!normalized) {
    return Option.none()
  }

  if (normalized.startsWith('chrome://') || normalized.startsWith('edge://')) {
    return Option.some('chrome_internal')
  }

  if (
    normalized.startsWith('https://chrome.google.com/webstore') ||
    normalized.startsWith('https://chromewebstore.google.com') ||
    normalized.startsWith('https://microsoftedge.microsoft.com/addons')
  ) {
    return Option.some('chrome_web_store')
  }

  return Option.none()
}

export const isRestrictedUrl = (url?: string | null): boolean => Option.isSome(getRestrictedReason(url))

export const getRestrictionCopy = (reason: RestrictedReason): RestrictionCopy => RESTRICTION_COPY[reason]
