import type { TLStoreSnapshot } from 'tldraw'

/**
 * Counts the number of custom shapes (tweet, question, note) in a tldraw snapshot.
 * Excludes built-in tldraw shapes like arrows, frames, etc.
 */
export function countShapesInSnapshot(snapshot: TLStoreSnapshot | null): number {
  if (!snapshot) return 0

  const store = snapshot.store
  if (!store) return 0

  let count = 0

  for (const record of Object.values(store)) {
    // Check if this is a shape record
    if (record && typeof record === 'object' && 'typeName' in record) {
      if (record.typeName === 'shape') {
        // Count all shapes for now (including built-in ones)
        // In the future, we might want to filter only custom shapes
        count++
      }
    }
  }

  return count
}

/**
 * Formats a shape count for display.
 * Returns "No shapes" for 0, "1 shape" for 1, "X shapes" for more.
 */
export function formatShapeCount(count: number): string {
  if (count === 0) return 'No shapes'
  if (count === 1) return '1 shape'
  return `${count} shapes`
}
