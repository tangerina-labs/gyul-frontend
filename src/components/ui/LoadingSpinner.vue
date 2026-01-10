<script setup lang="ts">
/**
 * LoadingSpinner - Indicador de carregamento animado
 * 
 * Design System: Quiet UI
 * SVG spinner com animacao CSS.
 * Tamanho e cor configuraveis.
 * 
 * @example
 * <LoadingSpinner size="md" />
 * <LoadingSpinner size="lg" class="text-blue-500" />
 */

export interface Props {
  /** Tamanho do spinner */
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
})

const sizeClasses: Record<string, string> = {
  sm: 'spinner--sm',
  md: 'spinner--md',
  lg: 'spinner--lg'
}
</script>

<template>
  <svg
    :class="['spinner', sizeClasses[props.size]]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :data-size="props.size"
    data-testid="loading-spinner"
  >
    <circle
      class="spinner__track"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="3"
    />
    <circle
      class="spinner__head"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
</template>

<style scoped>
/* =============================================================================
   LOADING SPINNER - Quiet UI
   ============================================================================= */

.spinner {
  animation: spin 1s linear infinite;
  color: var(--color-warning);
}

.spinner--sm {
  width: 16px;
  height: 16px;
}

.spinner--md {
  width: 24px;
  height: 24px;
}

.spinner--lg {
  width: 32px;
  height: 32px;
}

.spinner__track {
  opacity: 0.2;
}

.spinner__head {
  stroke-dasharray: 60;
  stroke-dashoffset: 45;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
