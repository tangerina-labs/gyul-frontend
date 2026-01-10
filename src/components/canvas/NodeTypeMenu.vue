<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { NodeType } from '@/types'

/**
 * NodeTypeMenu - Menu de selecao de tipo de no
 *
 * Design System: Quiet UI
 * Aparece ao clicar no canvas vazio.
 * Usuario seleciona o tipo e um novo no e criado.
 *
 * @emits select - Quando usuario seleciona um tipo
 * @emits close - Quando menu deve fechar (clique fora, Esc)
 */

interface Props {
  /** Posicao X do menu (coordenadas do viewport) */
  x: number
  /** Posicao Y do menu (coordenadas do viewport) */
  y: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [type: NodeType]
  close: []
  mounted: [rect: DOMRect]
}>()

const menuRef = ref<HTMLElement | null>(null)

// Opcoes do menu
const options: Array<{ type: NodeType; label: string; icon: string; description: string }> = [
  {
    type: 'tweet',
    label: 'Tweet',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    description: 'Carregar tweet do Twitter/X'
  },
  {
    type: 'question',
    label: 'Question',
    icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
    description: 'Fazer pergunta para a IA'
  },
  {
    type: 'note',
    label: 'Note',
    icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125',
    description: 'Adicionar anotacao pessoal'
  }
]

// Icon colors by type
const iconColors: Record<NodeType, string> = {
  tweet: 'text-accent-tweet',
  question: 'text-accent-question',
  note: 'text-accent-note'
}

// Handlers
const handleSelect = (type: NodeType) => {
  emit('select', type)
}

const handleClickOutside = (e: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    emit('close')
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close')
  }
}

// Lifecycle
onMounted(() => {
  // Use setTimeout to avoid the same click that opened the menu from closing it
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside, true)
  }, 0)
  document.addEventListener('keydown', handleKeydown)

  // Emit dimensions after render for auto-positioning
  nextTick(() => {
    if (menuRef.value) {
      emit('mounted', menuRef.value.getBoundingClientRect())
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    ref="menuRef"
    class="fixed z-menu min-w-[240px] bg-white border border-gray-200 rounded-lg shadow-menu overflow-hidden animate-fade-in"
    :style="{ left: `${props.x}px`, top: `${props.y}px` }"
    role="menu"
    data-testid="node-type-menu"
  >
    <div class="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 border-b border-gray-200">
      Adicionar no
    </div>

    <button
      v-for="option in options"
      :key="option.type"
      type="button"
      class="flex items-center gap-4 w-full p-4 bg-transparent border-none text-left cursor-pointer transition-colors duration-fast hover:bg-gray-100 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-gray-200"
      role="menuitem"
      :data-testid="`menu-option-${option.type}`"
      @click="handleSelect(option.type)"
    >
      <svg 
        :class="['w-6 h-6 flex-shrink-0', iconColors[option.type]]" 
        viewBox="0 0 24 24" 
        fill="none"
      >
        <path
          :d="option.icon"
          :fill="option.type === 'tweet' ? 'currentColor' : 'none'"
          :stroke="option.type !== 'tweet' ? 'currentColor' : 'none'"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <div class="flex flex-col gap-0.5">
        <span class="font-medium text-gray-900" :data-testid="`menu-label-${option.type}`">
          {{ option.label }}
        </span>
        <span class="text-sm text-gray-600" :data-testid="`menu-description-${option.type}`">
          {{ option.description }}
        </span>
      </div>
    </button>
  </div>
</template>
