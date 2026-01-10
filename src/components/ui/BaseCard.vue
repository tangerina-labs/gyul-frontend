<script setup lang="ts">
import { computed } from 'vue'

/**
 * BaseCard - Container base para nos do canvas
 * 
 * Design System: Quiet UI + Strong Focus
 * 
 * Estrutura visual:
 * - Background: sempre neutro (branco ou levemente quente para notes)
 * - Borda: sutil por padrao, destaque apenas em interacao (hover/selected)
 * - Accent Rail: barra vertical esquerda identifica o tipo do node
 * - Loading: barra de progresso no topo (nao mais animacao pulsante)
 * 
 * @example
 * <BaseCard variant="tweet" :loading="isLoading" :selected="isSelected">
 *   <template #header>Header content</template>
 *   <template #default>Body content</template>
 *   <template #footer>Footer content</template>
 * </BaseCard>
 */

export interface Props {
  /** Variante visual do card - define a cor do accent rail */
  variant?: 'tweet' | 'question' | 'note' | 'default'
  /** Estado de loading (mostra barra de progresso no topo) */
  loading?: boolean
  /** Estado de selecionado (destaque visual na borda) */
  selected?: boolean
  /** Estado de erro (accent rail vermelho) */
  error?: boolean
  /** Desabilita interacoes */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  loading: false,
  selected: false,
  error: false,
  disabled: false
})

// Selected styles based on variant (border + shadow)
const selectedStyles = computed(() => {
  switch (props.variant) {
    case 'tweet': return 'border-accent-tweet shadow-node-selected-tweet'
    case 'question': return 'border-accent-question shadow-node-selected-question'
    case 'note': return 'border-accent-note shadow-node-selected-note'
    default: return 'border-brand-500 shadow-node-selected'
  }
})

// Classes computadas baseadas no estado
const cardClasses = computed(() => [
  'relative overflow-hidden p-4 rounded-lg border shadow-node transition-all duration-fast',
  // Background
  props.variant === 'note' ? 'bg-note-bg' : 'bg-white',
  // Border and shadow states
  props.selected 
    ? selectedStyles.value
    : 'border-gray-200',
  // Disabled state
  props.disabled && 'opacity-60 pointer-events-none'
])

// Accent rail color class
const accentRailClass = computed(() => {
  if (props.error) return 'bg-danger'
  switch (props.variant) {
    case 'tweet': return 'bg-accent-tweet'
    case 'question': return 'bg-accent-question'
    case 'note': return 'bg-accent-note'
    default: return ''
  }
})

// Mostrar accent rail apenas para variantes especificas
const showAccentRail = computed(() => 
  props.variant !== 'default' || props.error
)
</script>

<template>
  <div :class="cardClasses" data-testid="base-card">
    <!-- Accent Rail - identifica tipo do node -->
    <div 
      v-if="showAccentRail" 
      :class="['absolute left-0 top-0 bottom-0 w-1 rounded-l-lg', accentRailClass]"
      data-testid="base-card-accent-rail"
    />
    
    <!-- Loading Bar - indicador de progresso suave -->
    <div 
      v-if="loading" 
      class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-warning to-transparent animate-loading-slide"
      data-testid="base-card-loading-bar"
    />
    
    <!-- Header slot (opcional) -->
    <header 
      v-if="$slots.header" 
      class="mb-2 pb-2 border-b border-gray-200"
      data-testid="base-card-header"
    >
      <slot name="header" />
    </header>
    
    <!-- Conteudo principal -->
    <div class="min-h-[40px]" data-testid="base-card-body">
      <slot />
    </div>
    
    <!-- Footer slot (opcional) -->
    <footer 
      v-if="$slots.footer" 
      class="mt-2 pt-2 border-t border-gray-200"
      data-testid="base-card-footer"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>
