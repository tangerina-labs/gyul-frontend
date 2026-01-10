import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  STORAGE_KEY,
  loadState,
  saveState,
  clearState,
  addCanvas,
  removeCanvas,
  updateCanvas,
  getCanvas,
  setActiveCanvas,
  getActiveCanvas,
  initializeState,
  isValidAppState,
  isValidCanvasState,
  cleanNodeForStorage,
  cleanEdgeForStorage
} from '@/services/storageService'
import { createInitialAppState, createEmptyCanvas } from '@/types'
import type { CustomNode, CustomEdge } from '@/types'

describe('Storage Service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('STORAGE_KEY', () => {
    it('should have correct storage key', () => {
      expect(STORAGE_KEY).toBe('gyul-state')
    })
  })

  describe('loadState', () => {
    it('should return null when localStorage is empty', () => {
      const result = loadState()
      expect(result).toBeNull()
    })

    it('should return null for invalid JSON', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json')
      const result = loadState()
      expect(result).toBeNull()
    })

    it('should return null for invalid AppState structure', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ invalid: true }))
      const result = loadState()
      expect(result).toBeNull()
    })

    it('should return valid AppState when present', () => {
      const validState = {
        canvases: [],
        activeCanvasId: null
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validState))
      const result = loadState()
      expect(result).toEqual({ canvases: [], activeCanvasId: null })
    })
  })

  describe('saveState', () => {
    it('should save state to localStorage', () => {
      const state = { canvases: [], activeCanvasId: null }
      saveState(state)
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(JSON.parse(saved!)).toEqual({ canvases: [], activeCanvasId: null })
    })

    it('should overwrite existing state', () => {
      saveState({ canvases: [], activeCanvasId: null })
      saveState({ canvases: [], activeCanvasId: 'test-id' })
      const saved = localStorage.getItem(STORAGE_KEY)
      expect(JSON.parse(saved!).activeCanvasId).toBe('test-id')
    })
  })

  describe('clearState', () => {
    it('should remove state from localStorage', () => {
      saveState({ canvases: [], activeCanvasId: null })
      clearState()
      const result = localStorage.getItem(STORAGE_KEY)
      expect(result).toBeNull()
    })
  })

  describe('addCanvas', () => {
    it('should create a new canvas and add to state', () => {
      const initialState = createInitialAppState()
      const { newState, canvasId } = addCanvas(initialState, 'Test Canvas')

      expect(canvasId).toBeDefined()
      expect(newState.canvases).toHaveLength(1)
      expect(newState.canvases[0].name).toBe('Test Canvas')
      expect(newState.activeCanvasId).toBe(canvasId)
    })

    it('should add canvas to existing canvases', () => {
      const state = createInitialAppState()
      const { newState: state1 } = addCanvas(state, 'Canvas 1')
      const { newState: state2, canvasId } = addCanvas(state1, 'Canvas 2')

      expect(state2.canvases).toHaveLength(2)
      expect(state2.activeCanvasId).toBe(canvasId)
    })

    it('should set new canvas as active', () => {
      const state = createInitialAppState()
      const { newState, canvasId } = addCanvas(state, 'New Canvas')

      expect(newState.activeCanvasId).toBe(canvasId)
    })
  })

  describe('removeCanvas', () => {
    it('should remove canvas from state', () => {
      const state = createInitialAppState()
      const { newState: withCanvas, canvasId } = addCanvas(state, 'Test')
      const afterRemove = removeCanvas(withCanvas, canvasId)

      expect(afterRemove.canvases).toHaveLength(0)
    })

    it('should clear activeCanvasId if removed canvas was active', () => {
      const state = createInitialAppState()
      const { newState: withCanvas, canvasId } = addCanvas(state, 'Test')
      const afterRemove = removeCanvas(withCanvas, canvasId)

      expect(afterRemove.activeCanvasId).toBeNull()
    })

    it('should preserve activeCanvasId if different canvas removed', () => {
      const state = createInitialAppState()
      const { newState: s1, canvasId: id1 } = addCanvas(state, 'Canvas 1')
      const { newState: s2, canvasId: id2 } = addCanvas(s1, 'Canvas 2')
      const s3 = setActiveCanvas(s2, id1)
      const s4 = removeCanvas(s3, id2)

      expect(s4.activeCanvasId).toBe(id1)
    })
  })

  describe('updateCanvas', () => {
    it('should update canvas name', () => {
      const state = createInitialAppState()
      const { newState, canvasId } = addCanvas(state, 'Original')
      const updated = updateCanvas(newState, canvasId, { name: 'Updated' })
      const canvas = getCanvas(updated, canvasId)

      expect(canvas?.name).toBe('Updated')
    })

    it('should update updatedAt timestamp', async () => {
      const state = createInitialAppState()
      const { newState, canvasId } = addCanvas(state, 'Test')
      const original = getCanvas(newState, canvasId)

      await new Promise((resolve) => setTimeout(resolve, 10))

      const updated = updateCanvas(newState, canvasId, { name: 'Updated' })
      const updatedCanvas = getCanvas(updated, canvasId)

      expect(new Date(updatedCanvas!.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(original!.updatedAt).getTime()
      )
    })

    it('should not modify other canvases', () => {
      const state = createInitialAppState()
      const { newState: s1, canvasId: id1 } = addCanvas(state, 'Canvas 1')
      const { newState: s2, canvasId: id2 } = addCanvas(s1, 'Canvas 2')
      const updated = updateCanvas(s2, id2, { name: 'Updated 2' })

      expect(getCanvas(updated, id1)?.name).toBe('Canvas 1')
      expect(getCanvas(updated, id2)?.name).toBe('Updated 2')
    })
  })

  describe('getCanvas', () => {
    it('should return canvas by id', () => {
      const state = createInitialAppState()
      const { newState, canvasId } = addCanvas(state, 'Test Canvas')
      const canvas = getCanvas(newState, canvasId)

      expect(canvas).toBeDefined()
      expect(canvas?.name).toBe('Test Canvas')
    })

    it('should return undefined for non-existent id', () => {
      const state = createInitialAppState()
      const canvas = getCanvas(state, 'non-existent-id')

      expect(canvas).toBeUndefined()
    })
  })

  describe('setActiveCanvas', () => {
    it('should set activeCanvasId', () => {
      const state = createInitialAppState()
      const { newState, canvasId } = addCanvas(state, 'Test')
      const s1 = setActiveCanvas(newState, null)
      const s2 = setActiveCanvas(s1, canvasId)

      expect(s2.activeCanvasId).toBe(canvasId)
    })

    it('should set activeCanvasId to null', () => {
      const state = createInitialAppState()
      const { newState } = addCanvas(state, 'Test')
      const updated = setActiveCanvas(newState, null)

      expect(updated.activeCanvasId).toBeNull()
    })
  })

  describe('getActiveCanvas', () => {
    it('should return active canvas', () => {
      const state = createInitialAppState()
      const { newState, canvasId } = addCanvas(state, 'Active Canvas')
      const canvas = getActiveCanvas(newState)

      expect(canvas).toBeDefined()
      expect(canvas?.name).toBe('Active Canvas')
      expect(canvas?.id).toBe(canvasId)
    })

    it('should return undefined when no active canvas', () => {
      const state = createInitialAppState()
      const canvas = getActiveCanvas(state)

      expect(canvas).toBeUndefined()
    })
  })

  describe('initializeState', () => {
    it('should return initial state when localStorage empty', () => {
      const result = initializeState()

      expect(result).toEqual({ canvases: [], activeCanvasId: null })
    })

    it('should return saved state when present', () => {
      const state = createInitialAppState()
      const { newState } = addCanvas(state, 'Saved Canvas')
      saveState(newState)

      const result = initializeState()

      expect(result.canvases).toHaveLength(1)
      expect(result.canvases[0].name).toBe('Saved Canvas')
    })
  })

  describe('isValidAppState', () => {
    it('should return true for valid state', () => {
      const result = isValidAppState({ canvases: [], activeCanvasId: null })
      expect(result).toBe(true)
    })

    it('should return true for state with activeCanvasId', () => {
      const result = isValidAppState({ canvases: [], activeCanvasId: 'some-id' })
      expect(result).toBe(true)
    })

    it('should return false for null', () => {
      const result = isValidAppState(null)
      expect(result).toBe(false)
    })

    it('should return false for non-object', () => {
      const result = isValidAppState('string')
      expect(result).toBe(false)
    })

    it('should return false when canvases is not array', () => {
      const result = isValidAppState({ canvases: 'not-array', activeCanvasId: null })
      expect(result).toBe(false)
    })

    it('should return false when activeCanvasId is invalid', () => {
      const result = isValidAppState({ canvases: [], activeCanvasId: 123 })
      expect(result).toBe(false)
    })
  })

  describe('isValidCanvasState', () => {
    it('should return true for valid canvas', () => {
      const canvas = createEmptyCanvas('Test')
      const result = isValidCanvasState(canvas)
      expect(result).toBe(true)
    })

    it('should return false for null', () => {
      const result = isValidCanvasState(null)
      expect(result).toBe(false)
    })

    it('should return false for missing id', () => {
      const result = isValidCanvasState({
        name: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      })
      expect(result).toBe(false)
    })

    it('should return false for missing nodes array', () => {
      const result = isValidCanvasState({
        id: 'test-id',
        name: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      })
      expect(result).toBe(false)
    })

    it('should return false for missing viewport', () => {
      const result = isValidCanvasState({
        id: 'test-id',
        name: 'Test',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes: [],
        edges: []
      })
      expect(result).toBe(false)
    })
  })

  describe('Persistence Round Trip', () => {
    it('should persist complete canvas structure', () => {
      const state = createInitialAppState()
      const { newState, canvasId } = addCanvas(state, 'Full Canvas')
      const updated = updateCanvas(newState, canvasId, {
        viewport: { x: 100, y: 200, zoom: 1.5 }
      })
      saveState(updated)

      const loaded = loadState()
      const canvas = loaded?.canvases[0]

      expect(canvas?.name).toBe('Full Canvas')
      expect(canvas?.viewport).toEqual({ x: 100, y: 200, zoom: 1.5 })
      expect(canvas?.nodes).toEqual([])
      expect(canvas?.edges).toEqual([])
    })
  })

  describe('Error Handling', () => {
    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem(STORAGE_KEY, '{corrupted: json syntax')
      const result = loadState()
      expect(result).toBeNull()
    })

    it('should handle partial/malformed state', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ canvases: 'not-an-array' }))
      const result = loadState()
      expect(result).toBeNull()
    })
  })

  // ===========================================================================
  // DATA CLEANING - Persist only structural properties
  // ===========================================================================

  describe('cleanNodeForStorage', () => {
    it('should persist only structural node properties (id, type, position, data)', () => {
      const dirtyNode = {
        id: 'node-1',
        type: 'note',
        position: { x: 100, y: 200 },
        data: { type: 'note', flowId: 'f1', content: 'test', isEditing: false },
        // Vue Flow runtime properties (should NOT be persisted)
        dimensions: { width: 300, height: 100 },
        selected: true,
        dragging: false,
        computedPosition: { x: 100, y: 200, z: 0 },
        handleBounds: { source: [], target: [] }
      } as unknown as CustomNode

      const clean = cleanNodeForStorage(dirtyNode)

      expect(Object.keys(clean).sort()).toEqual(['data', 'id', 'position', 'type'].sort())
      expect(clean.id).toBe('node-1')
      expect(clean.type).toBe('note')
      expect(clean.position).toEqual({ x: 100, y: 200 })
      expect(clean.data).toEqual({ type: 'note', flowId: 'f1', content: 'test', isEditing: false })
    })

    it('should work with tweet node data', () => {
      const tweetNode = {
        id: 'tweet-1',
        type: 'tweet',
        position: { x: 50, y: 75 },
        data: {
          type: 'tweet',
          flowId: 'abc',
          url: 'https://x.com/user/status/123',
          status: 'loaded',
          author: { name: 'User', handle: '@user', avatar: 'url' },
          text: 'Tweet content',
          timestamp: '2024-01-01'
        },
        dimensions: { width: 320, height: 250 },
        selected: false
      } as unknown as CustomNode

      const clean = cleanNodeForStorage(tweetNode)

      expect(Object.keys(clean).sort()).toEqual(['data', 'id', 'position', 'type'].sort())
      expect(clean.data.type).toBe('tweet')
      expect((clean.data as any).author.handle).toBe('@user')
    })

    it('should work with question node data', () => {
      const questionNode = {
        id: 'question-1',
        type: 'question',
        position: { x: 200, y: 300 },
        data: {
          type: 'question',
          flowId: 'xyz',
          prompt: 'What is this?',
          response: 'This is the answer',
          status: 'done'
        },
        dimensions: { width: 320, height: 180 }
      } as unknown as CustomNode

      const clean = cleanNodeForStorage(questionNode)

      expect(Object.keys(clean).sort()).toEqual(['data', 'id', 'position', 'type'].sort())
      expect(clean.data.type).toBe('question')
      expect((clean.data as any).response).toBe('This is the answer')
    })
  })

  describe('cleanEdgeForStorage', () => {
    it('should persist only structural edge properties (id, source, target)', () => {
      const dirtyEdge = {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        // Vue Flow style/runtime properties (should NOT be persisted)
        type: 'bezier',
        animated: false,
        style: { stroke: '#ccc', strokeWidth: 2 },
        sourceHandle: null,
        targetHandle: null,
        markerEnd: 'arrow'
      } as unknown as CustomEdge

      const clean = cleanEdgeForStorage(dirtyEdge)

      expect(Object.keys(clean).sort()).toEqual(['id', 'source', 'target'].sort())
      expect(clean.id).toBe('edge-1')
      expect(clean.source).toBe('node-1')
      expect(clean.target).toBe('node-2')
    })

    it('should work with minimal edge (already clean)', () => {
      const minimalEdge = {
        id: 'edge-2',
        source: 'a',
        target: 'b'
      } as CustomEdge

      const clean = cleanEdgeForStorage(minimalEdge)

      expect(Object.keys(clean).sort()).toEqual(['id', 'source', 'target'].sort())
      expect(clean).toEqual({ id: 'edge-2', source: 'a', target: 'b' })
    })
  })
})
