import { ref, watch, onMounted } from 'vue'
import type { AppState, CanvasState, CustomNode, CustomEdge } from '@/types'
import {
  initializeState,
  saveState,
  addCanvas,
  removeCanvas,
  updateCanvas,
  getCanvas,
  setActiveCanvas
} from '@/services/storageService'

export function useStorage() {
  const state = ref<AppState>(initializeState())
  const isLoading = ref(true)

  onMounted(() => {
    state.value = initializeState()
    isLoading.value = false
  })

  watch(
    state,
    (newState) => {
      saveState(newState)
    },
    { deep: true }
  )

  function createCanvas(name: string): string {
    const { newState, canvasId } = addCanvas(state.value, name)
    state.value = newState
    return canvasId
  }

  function deleteCanvas(canvasId: string): void {
    state.value = removeCanvas(state.value, canvasId)
  }

  function selectCanvas(canvasId: string | null): void {
    state.value = setActiveCanvas(state.value, canvasId)
  }

  function saveCanvasState(
    canvasId: string,
    nodes: CustomNode[],
    edges: CustomEdge[]
  ): void {
    state.value = updateCanvas(state.value, canvasId, {
      nodes,
      edges,
      updatedAt: new Date().toISOString()
    })
  }

  function getCanvasById(canvasId: string): CanvasState | undefined {
    return getCanvas(state.value, canvasId)
  }

  return {
    state,
    isLoading,
    createCanvas,
    deleteCanvas,
    selectCanvas,
    saveCanvasState,
    getCanvasById
  }
}
