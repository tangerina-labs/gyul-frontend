import { describe, it, expect } from 'vitest'
import { createEmptyCanvas, createInitialAppState } from '@/types/canvas'

describe('Factory Functions', () => {
  describe('createEmptyCanvas', () => {
    it('should create a canvas with correct structure', () => {
      const canvas = createEmptyCanvas('Test Canvas')

      expect(canvas).toHaveProperty('id')
      expect(canvas.name).toBe('Test Canvas')
      expect(canvas.nodes).toEqual([])
      expect(canvas.edges).toEqual([])
      expect(canvas.viewport).toEqual({ x: 0, y: 0, zoom: 1 })
      expect(canvas).toHaveProperty('createdAt')
      expect(canvas).toHaveProperty('updatedAt')
    })

    it('should generate unique UUIDs for each canvas', () => {
      const canvas1 = createEmptyCanvas('Canvas 1')
      const canvas2 = createEmptyCanvas('Canvas 2')

      expect(canvas1.id).not.toBe(canvas2.id)
    })

    it('should generate valid UUID format', () => {
      const canvas = createEmptyCanvas('Test')
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      expect(canvas.id).toMatch(uuidRegex)
    })

    it('should set createdAt and updatedAt to current time', () => {
      const before = new Date().toISOString()
      const canvas = createEmptyCanvas('Test')
      const after = new Date().toISOString()

      expect(canvas.createdAt >= before).toBe(true)
      expect(canvas.createdAt <= after).toBe(true)
      expect(canvas.createdAt).toBe(canvas.updatedAt)
    })

    it('should set valid ISO timestamp for createdAt', () => {
      const canvas = createEmptyCanvas('Test')
      const date = new Date(canvas.createdAt)

      expect(date.toISOString()).toBe(canvas.createdAt)
    })

    it('should preserve the canvas name exactly', () => {
      const specialName = 'Canvas with special chars: !@#$%'
      const canvas = createEmptyCanvas(specialName)

      expect(canvas.name).toBe(specialName)
    })

    it('should handle empty string as name', () => {
      const canvas = createEmptyCanvas('')

      expect(canvas.name).toBe('')
    })

    it('should have correct viewport default values', () => {
      const canvas = createEmptyCanvas('Test')

      expect(canvas.viewport.x).toBe(0)
      expect(canvas.viewport.y).toBe(0)
      expect(canvas.viewport.zoom).toBe(1)
    })
  })

  describe('createInitialAppState', () => {
    it('should create empty app state', () => {
      const appState = createInitialAppState()

      expect(appState).toEqual({
        canvases: [],
        activeCanvasId: null
      })
    })

    it('should have canvases as empty array', () => {
      const appState = createInitialAppState()

      expect(Array.isArray(appState.canvases)).toBe(true)
      expect(appState.canvases).toHaveLength(0)
    })

    it('should have activeCanvasId as null', () => {
      const appState = createInitialAppState()

      expect(appState.activeCanvasId).toBeNull()
    })

    it('should create independent instances', () => {
      const appState1 = createInitialAppState()
      const appState2 = createInitialAppState()

      expect(appState1).not.toBe(appState2)
      expect(appState1.canvases).not.toBe(appState2.canvases)
    })
  })
})
