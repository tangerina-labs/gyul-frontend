import type { TLStoreSnapshot } from 'tldraw'

export interface CanvasState {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  snapshot: TLStoreSnapshot | null
}

export interface AppState {
  canvases: CanvasState[]
  activeCanvasId: string | null
}

export function createEmptyCanvas(name: string): CanvasState {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
    snapshot: null,
  }
}

export function createInitialAppState(): AppState {
  return {
    canvases: [],
    activeCanvasId: null,
  }
}
