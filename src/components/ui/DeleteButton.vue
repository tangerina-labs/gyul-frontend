<script setup lang="ts">
import { computed } from "vue";

/**
 * DeleteButton - Botao de delete minimalista com soft danger
 *
 * Design System: Quiet UI + Strong Focus
 *
 * Estetica:
 * - Fundo transparente por padrao, vermelho suave no hover
 * - Icone cinza muted por padrao, vermelho no hover
 * - Forma: quadrado arredondado (nao circulo)
 * - Icone: lixeira elegante (nao X generico)
 *
 * Estados:
 * - Default: icone cinza discreto
 * - Hover: fundo rosa suave + icone vermelho
 * - Disabled: opacidade reduzida + cursor not-allowed + tooltip
 *
 * @emits delete - Quando o botao e clicado (apenas se nao disabled)
 */

export interface Props {
  /** Desabilita o botao (para nos com filhos) */
  disabled?: boolean;
  /** Texto do tooltip (mostrado sempre, conteudo diferente se disabled) */
  tooltipText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  tooltipText: "Deletar",
});

const emit = defineEmits<{
  delete: [];
}>();

// Tooltip text baseado no estado
const computedTooltip = computed(() => {
  if (props.disabled) {
    return props.tooltipText || "Este no possui filhos e nao pode ser deletado";
  }
  return props.tooltipText || "Deletar";
});

// Handler de click
const handleClick = () => {
  if (!props.disabled) {
    emit("delete");
  }
};

// Button classes
const buttonClasses = computed(() => [
  'absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 rounded-md transition-all duration-fast',
  props.disabled 
    ? 'opacity-30 cursor-not-allowed border border-gray-400 bg-transparent text-gray-400 pointer-events-auto' 
    : 'opacity-100 border border-gray-400 bg-white text-gray-400 cursor-pointer hover:bg-red-200 hover:border-red-200 hover:text-danger hover:scale-105 hover:border-[1.5px] active:scale-95'
])
</script>

<template>
  <button
    type="button"
    :class="buttonClasses"
    :title="computedTooltip"
    :disabled="disabled"
    :aria-disabled="disabled"
    data-testid="delete-button"
    @click="handleClick"
  >
    <!-- Icone de lixeira minimalista -->
    <svg
      class="w-4 h-4 flex-shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7"
      />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M15 4V3a1 1 0 00-1-1h-4a1 1 0 00-1 1v1" />
      <path d="M4 7h16" />
    </svg>
    <span class="sr-only">{{ computedTooltip }}</span>
  </button>
</template>
