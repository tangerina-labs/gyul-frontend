import type { Edge } from '@vue-flow/core'
import type { CustomNode } from './nodes'

export type CustomEdge = Edge
export type EdgeType = 'default'

export interface CanvasState {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  nodes: CustomNode[]
  edges: CustomEdge[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
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
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 }
  }
}

export function createInitialAppState(): AppState {
  return {
    canvases: [],
    activeCanvasId: null
  }
}
