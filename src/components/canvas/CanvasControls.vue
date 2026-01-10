<script setup lang="ts">
/**
 * CanvasControls - Controles de zoom e navegacao
 *
 * Design System: Quiet UI
 * Posicionado no canto inferior direito do canvas.
 * Botoes: Zoom In, Zoom Out, Fit View
 *
 * Emits events that parent can handle. When used inside VueFlow context,
 * the parent (CanvasView) will call the appropriate VueFlow methods.
 * When used in test harness, optional callback props can be provided.
 */

interface Props {
  /** Callback para zoom in (usado em test harness sem VueFlow context) */
  onZoomIn?: () => void
  /** Callback para zoom out (usado em test harness sem VueFlow context) */
  onZoomOut?: () => void
  /** Callback para fit view (usado em test harness sem VueFlow context) */
  onFitView?: () => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'zoom-in': []
  'zoom-out': []
  'fit-view': []
}>()

const handleZoomIn = () => {
  emit('zoom-in')
  props.onZoomIn?.()
}

const handleZoomOut = () => {
  emit('zoom-out')
  props.onZoomOut?.()
}

const handleFitView = () => {
  emit('fit-view')
  props.onFitView?.()
}
</script>

<template>
  <div 
    class="absolute bottom-6 right-6 z-controls flex flex-col gap-1 p-1 bg-white border border-gray-200 rounded-md shadow-node"
    data-testid="canvas-controls"
  >
    <button
      type="button"
      class="flex items-center justify-center w-9 h-9 bg-transparent border-none rounded-md text-gray-600 cursor-pointer transition-all duration-fast hover:bg-gray-100 hover:text-gray-900 active:scale-95"
      title="Zoom In"
      data-testid="controls-zoom-in"
      @click="handleZoomIn"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    </button>

    <button
      type="button"
      class="flex items-center justify-center w-9 h-9 bg-transparent border-none rounded-md text-gray-600 cursor-pointer transition-all duration-fast hover:bg-gray-100 hover:text-gray-900 active:scale-95"
      title="Zoom Out"
      data-testid="controls-zoom-out"
      @click="handleZoomOut"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    </button>

    <div class="h-px my-1 bg-gray-200" />

    <button
      type="button"
      class="flex items-center justify-center w-9 h-9 bg-transparent border-none rounded-md text-gray-600 cursor-pointer transition-all duration-fast hover:bg-gray-100 hover:text-gray-900 active:scale-95"
      title="Fit View"
      data-testid="controls-fit-view"
      @click="handleFitView"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path
          d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
        />
      </svg>
    </button>
  </div>
</template>
