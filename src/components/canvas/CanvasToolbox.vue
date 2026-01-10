<script setup lang="ts">
import { computed } from 'vue'

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

const buttonClasses = computed(() => [
  'flex items-center gap-2 px-4 py-2 bg-transparent border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-fast whitespace-nowrap',
  props.isActive
    ? 'bg-brand-500 text-white shadow-node-selected hover:bg-brand-600'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]'
])
</script>

<template>
  <div 
    class="absolute left-6 top-1/2 -translate-y-1/2 z-controls flex flex-col gap-1 p-1 bg-white border border-gray-200 rounded-md shadow-node"
    data-testid="canvas-toolbox"
  >
    <button
      type="button"
      :class="buttonClasses"
      :data-active="isActive || undefined"
      title="Novo Fluxo"
      data-testid="toolbox-new-flow"
      @click="handleNewFlowClick"
    >
      <svg
        class="w-[18px] h-[18px] flex-shrink-0"
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
      <span class="leading-none">Novo Fluxo</span>
    </button>
  </div>
</template>
