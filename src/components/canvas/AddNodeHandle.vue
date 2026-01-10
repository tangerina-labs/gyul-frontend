<script setup lang="ts">
/**
 * AddNodeHandle - Handle customizado para adicionar nos filhos
 *
 * Design System: Quiet UI
 * Este componente e um placeholder para futura implementacao
 * de drag-and-drop para criar nos filhos.
 *
 * Por enquanto, usamos o botao "+" dentro de cada node.
 *
 * Futuras funcionalidades planejadas:
 * - Drag from handle para criar nos filhos
 * - Visual feedback durante drag
 * - Snap to grid
 * - Connection preview
 */

interface Props {
  /** Se o handle esta visivel */
  visible?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: true
})

const emit = defineEmits<{
  'drag-start': [position: { x: number; y: number }]
  'drag-end': [position: { x: number; y: number }]
}>()

// TODO: Implementar drag-and-drop para criar nos filhos
// Por enquanto, a criacao de filhos usa o botao dentro do node
</script>

<template>
  <div
    v-if="visible"
    class="add-node-handle"
    data-testid="add-node-handle"
    role="button"
    tabindex="0"
    aria-label="Drag to create child node"
  >
    <div class="add-node-handle__icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </div>
    <span class="add-node-handle__tooltip">Arraste para criar no filho</span>
  </div>
</template>

<style scoped>
/* =============================================================================
   ADD NODE HANDLE - Quiet UI
   ============================================================================= */

.add-node-handle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--handle-size);
  height: var(--handle-size);
  background: var(--handle-bg);
  border: 2px solid var(--handle-border);
  border-radius: var(--radius-full);
  cursor: grab;
  margin: 10rem;
  transition: all var(--transition-fast);
}

.add-node-handle:hover {
  background: var(--handle-hover-bg);
  transform: scale(1.2);
}

.add-node-handle:active {
  cursor: grabbing;
  transform: scale(1.1);
}

.add-node-handle__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
  color: var(--handle-border);
}

.add-node-handle__icon svg {
  width: 100%;
  height: 100%;
}

.add-node-handle__tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--space-1) var(--space-2);
  background: var(--text-primary);
  color: var(--text-inverse);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  border-radius: var(--radius-sm);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
}

.add-node-handle:hover .add-node-handle__tooltip {
  opacity: 1;
}

/* Arrow pointing down */
.add-node-handle__tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--text-primary);
}
</style>
