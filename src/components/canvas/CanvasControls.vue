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
  <div class="canvas-controls" data-testid="canvas-controls">
    <button
      type="button"
      class="canvas-controls__btn"
      title="Zoom In"
      data-testid="controls-zoom-in"
      @click="handleZoomIn"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    </button>

    <button
      type="button"
      class="canvas-controls__btn"
      title="Zoom Out"
      data-testid="controls-zoom-out"
      @click="handleZoomOut"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    </button>

    <div class="canvas-controls__divider" />

    <button
      type="button"
      class="canvas-controls__btn"
      title="Fit View"
      data-testid="controls-fit-view"
      @click="handleFitView"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path
          d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* =============================================================================
   CANVAS CONTROLS - Quiet UI
   ============================================================================= */

.canvas-controls {
  position: absolute;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: var(--z-controls);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-1);
  background: var(--surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.canvas-controls__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.canvas-controls__btn:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.canvas-controls__btn:active {
  transform: scale(0.95);
}

.canvas-controls__btn svg {
  width: 20px;
  height: 20px;
}

.canvas-controls__divider {
  height: 1px;
  margin: var(--space-1) 0;
  background: var(--border-subtle);
}
</style>
