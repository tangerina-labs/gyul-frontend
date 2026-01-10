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

// Computed para classes
const buttonClasses = computed(() => ({
  "delete-button": true,
  "delete-button--disabled": props.disabled,
}));

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

<style scoped>
/* =============================================================================
   DELETE BUTTON - Minimal + Soft Danger
   ============================================================================= */

.delete-button {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;

  /* Quiet UI: quase invisivel por padrao, revela no hover */
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);

  /* Icone cinza bem sutil */
  color: var(--text-muted);
  opacity: 0.6;

  /* Cursor e transicoes */
  cursor: pointer;

  /* Transicao suave para todos os estados */
  transition: background var(--transition-fast),
    border-color var(--transition-fast), color var(--transition-fast),
    opacity var(--transition-fast), transform var(--transition-fast);
}

/* Revelar sutilmente ao passar o mouse no node pai */
.delete-button:not(:disabled) {
  opacity: 1;
  border: 1px solid var(--text-muted);
  background: white;
}

.delete-button:not(:disabled):hover {
  opacity: 1;
}

/* Hover: soft danger - revela intencao destrutiva suavemente */
.delete-button:hover:not(:disabled) {
  background: rgb(250 202 203);
  border-color: rgb(190 0 0 / 10%);
  color: var(--color-danger);
  opacity: 1;
  transform: scale(1.05);
  border-width: 1.5px;
}

/* Focus visivel para acessibilidade */
.delete-button:focus-visible {
  outline: 2px solid var(--color-danger);
  outline-offset: 2px;
}

/* Active: feedback de click */
.delete-button:active:not(:disabled) {
  transform: scale(0.95);
}

/* =============================================================================
   ESTADO DISABLED - Para nos com filhos
   
   Quiet UI: sutil mas ainda legivel
   O usuario precisa perceber que o botao existe, apenas nao pode usar
   ============================================================================= */

.delete-button--disabled,
.delete-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: auto; /* Permite tooltip mesmo disabled */
  border: 1px solid var(--text-muted);
}

.delete-button--disabled:hover,
.delete-button:disabled:hover {
  /* Nao muda visual no hover quando disabled */
  background: transparent;
  border: 1px solid var(--text-muted);
  color: var(--text-muted);
  opacity: 0.3;
  transform: none;
}

/* =============================================================================
   ICONE SVG
   ============================================================================= */

.delete-button svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* =============================================================================
   SR-ONLY - Texto acessivel para leitores de tela
   ============================================================================= */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
