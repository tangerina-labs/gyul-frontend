<script setup lang="ts">
/**
 * CanvasToolbox - Ferramentas de criacao do canvas
 *
 * Design System: Quiet UI
 * Posicionado no lado esquerdo do canvas, centralizado verticalmente.
 * Contem ferramentas para criar novos elementos no canvas.
 *
 * Atualmente contem apenas o botao "+ Novo Fluxo" para criacao explicita
 * de novos fluxos, seguindo o principio de que acoes estruturais
 * devem ser sempre explicitas.
 *
 * @emits activate-create-mode - Quando usuario clica no botao de novo fluxo
 */

interface Props {
  /**
   * Indica se o modo de criacao esta ativo
   * Usado para destaque visual do botao
   */
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false
})

const emit = defineEmits<{
  'activate-create-mode': []
}>()

const handleNewFlowClick = () => {
  emit('activate-create-mode')
}
</script>

<template>
  <div class="canvas-toolbox" data-testid="canvas-toolbox">
    <button
      type="button"
      class="canvas-toolbox__btn"
      :class="{ 'canvas-toolbox__btn--active': props.isActive }"
      title="Novo Fluxo"
      data-testid="toolbox-new-flow"
      @click="handleNewFlowClick"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      <span class="canvas-toolbox__label">Novo Fluxo</span>
    </button>
  </div>
</template>

<style scoped>
/* =============================================================================
   CANVAS TOOLBOX - Quiet UI
   ============================================================================= */

.canvas-toolbox {
  position: absolute;
  left: var(--space-6);
  top: 50%;
  transform: translateY(-50%);
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

.canvas-toolbox__btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.canvas-toolbox__btn:hover {
  background: var(--surface-muted);
  color: var(--text-primary);
}

.canvas-toolbox__btn:active {
  transform: scale(0.98);
}

.canvas-toolbox__btn svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.canvas-toolbox__label {
  line-height: 1;
}

/* Estado ativo - modo de criacao */
.canvas-toolbox__btn--active {
  background: var(--accent-primary);
  color: var(--text-inverse);
  box-shadow: 0 0 0 2px var(--selection-color);
}

.canvas-toolbox__btn--active:hover {
  background: var(--accent-primary-hover);
  color: var(--text-inverse);
}
</style>
