import { ref, computed, onMounted, onUnmounted } from 'vue'

export type CanvasMode = 'normal' | 'creating'

export function useCanvasMode() {
  const canvasMode = ref<CanvasMode>('normal')
  const isCreating = computed(() => canvasMode.value === 'creating')

  function enterCreateMode(): void {
    canvasMode.value = 'creating'
  }

  function exitCreateMode(): void {
    canvasMode.value = 'normal'
  }

  function toggleCreateMode(): void {
    if (canvasMode.value === 'normal') {
      enterCreateMode()
    } else {
      exitCreateMode()
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && isCreating.value) {
      exitCreateMode()
    }
  }

  function setupKeyboardHandlers(): void {
    document.addEventListener('keydown', handleKeydown)
  }

  function cleanupKeyboardHandlers(): void {
    document.removeEventListener('keydown', handleKeydown)
  }

  onMounted(() => {
    setupKeyboardHandlers()
  })

  onUnmounted(() => {
    cleanupKeyboardHandlers()
  })

  return {
    canvasMode,
    isCreating,
    enterCreateMode,
    exitCreateMode,
    toggleCreateMode,
    setupKeyboardHandlers,
    cleanupKeyboardHandlers
  }
}
