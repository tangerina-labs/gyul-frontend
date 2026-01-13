import type { AppState, CanvasState, CustomNode, CustomEdge } from '@/types'
import { createInitialAppState, createEmptyCanvas } from '@/types'

export const STORAGE_KEY = 'gyul-state'

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as AppState

    if (!isValidAppState(parsed)) {
      console.warn('Estado invalido no LocalStorage, ignorando')
      return null
    }

    return parsed
  } catch (error) {
    console.error('Erro ao carregar estado do LocalStorage:', error)
    return null
  }
}

export function saveState(state: AppState): void {
  try {
    const serialized = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serialized)
  } catch (error) {
    console.error('Erro ao salvar estado no LocalStorage:', error)

    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('LocalStorage cheio! Considere limpar dados antigos.')
    }
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function addCanvas(
  state: AppState,
  name: string
): { newState: AppState; canvasId: string } {
  const newCanvas = createEmptyCanvas(name)

  const newState: AppState = {
    ...state,
    canvases: [...state.canvases, newCanvas],
    activeCanvasId: newCanvas.id
  }

  return { newState, canvasId: newCanvas.id }
}

export function removeCanvas(state: AppState, canvasId: string): AppState {
  const filteredCanvases = state.canvases.filter((c) => c.id !== canvasId)

  const activeCanvasId =
    state.activeCanvasId === canvasId ? null : state.activeCanvasId

  return {
    ...state,
    canvases: filteredCanvases,
    activeCanvasId
  }
}

export function updateCanvas(
  state: AppState,
  canvasId: string,
  updates: Partial<CanvasState>
): AppState {
  const existingCanvas = state.canvases.find((c) => c.id === canvasId)
  
  if (existingCanvas) {
    // Update existing canvas
    const canvases = state.canvases.map((canvas) => {
      if (canvas.id === canvasId) {
        return {
          ...canvas,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
      return canvas
    })
    return { ...state, canvases }
  } else {
    // Create new canvas if it doesn't exist
    // This handles the case when user navigates directly to a canvas URL
    const newCanvas: CanvasState = {
      id: canvasId,
      name: updates.name || 'Novo Canvas',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: updates.nodes || [],
      edges: updates.edges || [],
      viewport: updates.viewport || { x: 0, y: 0, zoom: 1 }
    }
    return { 
      ...state, 
      canvases: [...state.canvases, newCanvas],
      activeCanvasId: canvasId
    }
  }
}

export function getCanvas(
  state: AppState,
  canvasId: string
): CanvasState | undefined {
  return state.canvases.find((c) => c.id === canvasId)
}

export function setActiveCanvas(
  state: AppState,
  canvasId: string | null
): AppState {
  return {
    ...state,
    activeCanvasId: canvasId
  }
}

export function getActiveCanvas(state: AppState): CanvasState | undefined {
  if (!state.activeCanvasId) return undefined
  return getCanvas(state, state.activeCanvasId)
}

export function isValidAppState(obj: unknown): obj is AppState {
  if (!obj || typeof obj !== 'object') return false

  const state = obj as Record<string, unknown>

  if (!Array.isArray(state.canvases)) return false
  if (state.activeCanvasId !== null && typeof state.activeCanvasId !== 'string')
    return false

  for (const canvas of state.canvases) {
    if (!isValidCanvasState(canvas)) return false
  }

  return true
}

export function isValidCanvasState(obj: unknown): obj is CanvasState {
  if (!obj || typeof obj !== 'object') return false

  const canvas = obj as Record<string, unknown>

  return (
    typeof canvas.id === 'string' &&
    typeof canvas.name === 'string' &&
    typeof canvas.createdAt === 'string' &&
    typeof canvas.updatedAt === 'string' &&
    Array.isArray(canvas.nodes) &&
    Array.isArray(canvas.edges) &&
    typeof canvas.viewport === 'object' &&
    canvas.viewport !== null
  )
}

/**
 * Cleans a node for storage, keeping only structural properties.
 * Vue Flow adds runtime properties (dimensions, selected, dragging, etc.)
 * that should NOT be persisted.
 */
export function cleanNodeForStorage(node: CustomNode): CustomNode {
  return {
    id: node.id,
    type: node.type,
    position: { x: node.position.x, y: node.position.y },
    data: node.data,
  } as CustomNode
}

/**
 * Cleans an edge for storage, keeping only structural properties.
 * Vue Flow adds style/runtime properties that should NOT be persisted.
 */
export function cleanEdgeForStorage(edge: CustomEdge): CustomEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
  }
}

export function initializeState(): AppState {
  const saved = loadState()

  if (saved) {
    return saved
  }

  return createInitialAppState()
}
