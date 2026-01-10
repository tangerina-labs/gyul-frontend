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
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
}
</script>

<template>
  <svg
    :class="['animate-spin text-warning', sizeClasses[props.size]]"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :data-size="props.size"
    data-testid="loading-spinner"
  >
    <circle
      class="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="3"
    />
    <circle
      class="[stroke-dasharray:60] [stroke-dashoffset:45]"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
</template>
