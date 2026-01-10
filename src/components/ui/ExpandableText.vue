<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'

/**
 * ExpandableText - Texto com truncamento e "Ver mais"
 * 
 * Trunca texto longo e permite expandir.
 * Usa CSS line-clamp para truncamento.
 * 
 * @example
 * <ExpandableText :text="longText" :lines="3" />
 */

export interface Props {
  /** Texto a ser exibido */
  text: string
  /** Numero maximo de linhas antes de truncar */
  lines?: number
  /** Texto do botao de expandir */
  expandLabel?: string
  /** Texto do botao de recolher */
  collapseLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  lines: 3,
  expandLabel: 'Ver mais',
  collapseLabel: 'Ver menos'
})

const isExpanded = ref(false)
const textRef = ref<HTMLElement | null>(null)
const isTruncated = ref(false)

// Check if text needs truncation after mount and when text changes
const checkTruncation = async () => {
  await nextTick()
  if (textRef.value) {
    // When collapsed, check if content would overflow
    const element = textRef.value
    isTruncated.value = element.scrollHeight > element.clientHeight
  }
}

onMounted(() => {
  checkTruncation()
})

watch(() => props.text, () => {
  checkTruncation()
})

// Show toggle button if truncated or already expanded
const showToggle = computed(() => {
  return isTruncated.value || isExpanded.value
})

const toggle = () => {
  isExpanded.value = !isExpanded.value
  // Re-check truncation when collapsing
  if (!isExpanded.value) {
    nextTick(() => checkTruncation())
  }
}

const textStyle = computed(() => {
  if (isExpanded.value) {
    return {}
  }
  return {
    display: '-webkit-box',
    WebkitLineClamp: props.lines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden'
  }
})
</script>

<template>
  <div class="relative">
    <p 
      ref="textRef"
      :style="textStyle"
      class="leading-normal text-gray-900 m-0 transition-all duration-base"
      data-testid="expandable-text-content"
    >
      {{ text }}
    </p>
    
    <button
      v-if="showToggle"
      type="button"
      class="inline-block mt-1 p-0 bg-transparent border-none text-brand-500 text-sm font-medium cursor-pointer transition-colors duration-fast hover:text-brand-600 hover:underline"
      data-testid="expandable-text-toggle"
      @click="toggle"
    >
      {{ isExpanded ? collapseLabel : expandLabel }}
    </button>
  </div>
</template>
