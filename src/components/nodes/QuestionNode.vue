<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import type { QuestionData } from '@/types'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ExpandableText from '@/components/ui/ExpandableText.vue'
import DeleteButton from '@/components/ui/DeleteButton.vue'

interface Props {
  id: string
  data: QuestionData
  selected?: boolean
  hasChildren?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  hasChildren: false
})

const emit = defineEmits<{
  'submit': [prompt: string]
  'add-child': [position: { x: number; y: number }]
  'delete': []
}>()

const promptInput = ref(props.data.prompt || '')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const isDraft = computed(() => props.data.status === 'draft')
const isLoading = computed(() => props.data.status === 'loading')
const isDone = computed(() => props.data.status === 'done')

const resizeTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

onMounted(() => {
  if (isDraft.value && textareaRef.value) {
    nextTick(() => {
      textareaRef.value?.focus()
      resizeTextarea()
    })
  }
})

const handleSubmit = () => {
  const prompt = promptInput.value.trim()
  if (prompt) {
    emit('submit', prompt)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    handleSubmit()
  }
}

const handleAddChild = () => {
  emit('add-child', { x: 0, y: 250 })
}
</script>

<template>
  <div 
    class="relative w-[400px]"
    :data-status="data.status"
  >
    <BaseCard
      variant="question"
      :loading="isLoading"
      :selected="selected"
      data-testid="question-card"
    >
      <div class="flex flex-col gap-2" data-testid="question-prompt-section">
        <label class="block text-sm font-medium text-gray-600 mb-1">
          Pergunta
        </label>
        
        <textarea
          v-if="isDraft"
          ref="textareaRef"
          v-model="promptInput"
          placeholder="Escreva sua pergunta..."
          class="w-full min-h-[80px] px-3 py-2 border border-gray-200 rounded-md font-sans text-base leading-normal bg-white text-gray-900 resize-none transition-colors duration-fast placeholder:text-gray-400 focus:outline-none focus:border-accent-question"
          rows="3"
          data-testid="question-textarea"
          @input="resizeTextarea"
          @keydown="handleKeydown"
        />
        
        <p v-else class="p-2 bg-gray-100 rounded-md text-base leading-normal text-gray-900 m-0" data-testid="question-prompt-text">
          {{ data.prompt }}
        </p>
        
        <button
          v-if="isDraft"
          type="button"
          class="flex items-center justify-center gap-2 px-3 py-2 bg-accent-question text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors duration-fast hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!promptInput.trim()"
          data-testid="question-submit-btn"
          @click="handleSubmit"
        >
          Submeter
          <span class="text-xs opacity-70">Ctrl+Enter</span>
        </button>
      </div>
      
      <div 
        v-if="isLoading || isDone" 
        class="mt-4 pt-4 border-t border-gray-200"
        data-testid="question-response-section"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-600">Resposta</span>
          <span 
            v-if="isDone" 
            class="px-2 py-0.5 bg-success/10 text-success rounded-md text-xs font-semibold uppercase"
            data-testid="question-ai-badge"
          >
            AI
          </span>
        </div>
        
        <div v-if="isLoading" class="flex items-center gap-2 p-4 text-gray-600 text-sm" data-testid="question-loading">
          <LoadingSpinner size="md" />
          <span>Gerando resposta...</span>
        </div>
        
        <div v-else-if="isDone" class="p-3 bg-gray-100 rounded-md" data-testid="question-response-content">
          <ExpandableText
            :text="data.response || ''"
            :lines="6"
          />
        </div>
      </div>
      
      <template v-if="isDone" #footer>
        <div class="flex justify-end" data-testid="question-footer">
          <button
            type="button"
            class="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600 text-sm cursor-pointer transition-all duration-fast hover:bg-accent-question hover:border-accent-question hover:text-white"
            title="Adicionar no filho"
            data-testid="question-add-child-btn"
            @click="handleAddChild"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </template>
    </BaseCard>
    
    <DeleteButton
      v-if="selected"
      :disabled="hasChildren"
      :tooltip-text="hasChildren ? 'Este no possui filhos e nao pode ser deletado' : 'Deletar'"
      data-testid="question-delete-btn"
      @delete="emit('delete')"
    />
  </div>
</template>
