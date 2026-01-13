/**
 * Timing utilities with test environment awareness.
 *
 * In Playwright test environment (__PLAYWRIGHT_TEST__ flag), all delays
 * are reduced to near-zero to speed up tests while still allowing
 * Vue's reactivity system to settle.
 */

const isTestEnv = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).__PLAYWRIGHT_TEST__
}

/**
 * Returns the appropriate delay value based on environment.
 * In test environment, returns a minimal delay (1ms) to allow
 * Vue's nextTick to complete without adding artificial wait time.
 */
export function getDelay(productionMs: number): number {
  return isTestEnv() ? 1 : productionMs
}

/**
 * Creates a promise that resolves after the appropriate delay.
 * Use this instead of raw setTimeout for async operations.
 */
export function delay(productionMs: number): Promise<void> {
  const ms = getDelay(productionMs)
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Animation duration constants.
 * Use these for CSS transitions and JavaScript animations.
 */
export const ANIMATION_DURATION = {
  /** Node removal animation */
  NODE_REMOVE: 150,
  /** Pan/zoom animation */
  PAN: 200,
  /** Focus delay for inputs after modal opens */
  FOCUS_DELAY: 100,
  /** Delay before centering view on new node */
  CENTER_DELAY: 50,
  /** Delay before fit view on mount */
  FIT_VIEW_DELAY: 100,
} as const

/**
 * Gets animation duration adjusted for test environment.
 */
export function getAnimationDuration(key: keyof typeof ANIMATION_DURATION): number {
  return getDelay(ANIMATION_DURATION[key])
}
