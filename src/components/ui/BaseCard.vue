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

// Classes computadas baseadas no estado
const cardClasses = computed(() => ({
  'base-card': true,
  [`base-card--${props.variant}`]: true,
  'base-card--loading': props.loading,
  'base-card--selected': props.selected,
  'base-card--error': props.error,
  'base-card--disabled': props.disabled
}))

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
      class="base-card__accent-rail" 
      data-testid="base-card-accent-rail"
    />
    
    <!-- Loading Bar - indicador de progresso suave -->
    <div 
      v-if="loading" 
      class="base-card__loading-bar" 
      data-testid="base-card-loading-bar"
    />
    
    <!-- Header slot (opcional) -->
    <header v-if="$slots.header" class="base-card__header" data-testid="base-card-header">
      <slot name="header" />
    </header>
    
    <!-- Conteudo principal -->
    <div class="base-card__body" data-testid="base-card-body">
      <slot />
    </div>
    
    <!-- Footer slot (opcional) -->
    <footer v-if="$slots.footer" class="base-card__footer" data-testid="base-card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
/* =============================================================================
   BASE CARD - Quiet UI Container
   ============================================================================= */

.base-card {
  position: relative;
  background: var(--node-background);
  border: var(--node-border-width) solid var(--node-border-color);
  border-radius: var(--node-border-radius);
  padding: var(--node-padding);
  box-shadow: var(--node-shadow);
  overflow: hidden;
  transition: 
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
}

/* =============================================================================
   ACCENT RAIL - Identificacao visual por tipo
   
   Barra vertical na esquerda do card que identifica o tipo.
   Isso permite que a borda do card permaneca neutra enquanto
   o tipo e claramente identificavel.
   ============================================================================= */

.base-card__accent-rail {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--accent-rail-width);
  background: var(--accent-rail-color, transparent);
  border-radius: var(--node-border-radius) 0 0 var(--node-border-radius);
}

/* =============================================================================
   LOADING BAR - Indicador de progresso suave
   
   Substitui a animacao borderPulse agressiva por uma barra
   de progresso no topo do card. Mais sutil e menos distrativo.
   ============================================================================= */

.base-card__loading-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--color-warning) 50%,
    transparent 100%
  );
  animation: loadingSlide 1.5s ease-in-out infinite;
}

@keyframes loadingSlide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* =============================================================================
   VARIANTES - Cores do accent rail por tipo
   ============================================================================= */

.base-card--tweet {
  --accent-rail-color: var(--accent-tweet);
}

.base-card--question {
  --accent-rail-color: var(--accent-question);
}

.base-card--note {
  --accent-rail-color: var(--accent-note);
  background: var(--note-bg);
}

/* =============================================================================
   ESTADOS - Interacao e feedback visual
   ============================================================================= */

/* Selected: borda de destaque + sombra sutil */
.base-card--selected {
  border-color: var(--node-selected-border);
  box-shadow: var(--node-selected-shadow);
}

/* Error: accent rail vermelho */
.base-card--error {
  --accent-rail-color: var(--color-danger);
}

/* Disabled: opacidade reduzida */
.base-card--disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* =============================================================================
   ESTRUTURA INTERNA
   ============================================================================= */

.base-card__header {
  margin-bottom: var(--space-2);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-subtle);
}

.base-card__body {
  min-height: 40px;
}

.base-card__footer {
  margin-top: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-subtle);
}
</style>
