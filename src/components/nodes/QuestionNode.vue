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
    class="question-node"
    :data-status="data.status"
  >
    <BaseCard
      variant="question"
      :loading="isLoading"
      :selected="selected"
      data-testid="question-card"
    >
      <div class="question-node__prompt-section" data-testid="question-prompt-section">
        <label class="question-node__label">
          Pergunta
        </label>
        
        <textarea
          v-if="isDraft"
          ref="textareaRef"
          v-model="promptInput"
          placeholder="Escreva sua pergunta..."
          class="question-node__textarea"
          rows="3"
          data-testid="question-textarea"
          @input="resizeTextarea"
          @keydown="handleKeydown"
        />
        
        <p v-else class="question-node__prompt-text" data-testid="question-prompt-text">
          {{ data.prompt }}
        </p>
        
        <button
          v-if="isDraft"
          type="button"
          class="question-node__submit"
          :disabled="!promptInput.trim()"
          data-testid="question-submit-btn"
          @click="handleSubmit"
        >
          Submeter
          <span class="question-node__shortcut">Ctrl+Enter</span>
        </button>
      </div>
      
      <div 
        v-if="isLoading || isDone" 
        class="question-node__response-section"
        data-testid="question-response-section"
      >
        <div class="question-node__response-header">
          <span class="question-node__label">Resposta</span>
          <span v-if="isDone" class="question-node__ai-badge" data-testid="question-ai-badge">AI</span>
        </div>
        
        <div v-if="isLoading" class="question-node__loading" data-testid="question-loading">
          <LoadingSpinner size="md" />
          <span>Gerando resposta...</span>
        </div>
        
        <div v-else-if="isDone" class="question-node__response-content" data-testid="question-response-content">
          <ExpandableText
            :text="data.response || ''"
            :lines="6"
          />
        </div>
      </div>
      
      <template v-if="isDone" #footer>
        <div class="question-node__footer" data-testid="question-footer">
          <button
            type="button"
            class="question-node__add-child"
            title="Adicionar no filho"
            data-testid="question-add-child-btn"
            @click="handleAddChild"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

<style scoped>
.question-node {
  position: relative;
  width: 400px;
}

.question-node__label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.question-node__prompt-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.question-node__textarea {
  width: 100%;
  min-height: 80px;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  background: var(--surface-node);
  color: var(--text-primary);
  resize: none;
  transition: border-color var(--transition-fast);
}

.question-node__textarea:focus {
  outline: none;
  border-color: var(--accent-question);
}

.question-node__textarea::placeholder {
  color: var(--text-muted);
}

.question-node__prompt-text {
  padding: var(--space-2);
  background: var(--surface-muted);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  margin: 0;
}

.question-node__submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--accent-question);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.question-node__submit:hover:not(:disabled) {
  background: var(--color-violet-500);
}

.question-node__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.question-node__shortcut {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

.question-node__response-section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.question-node__response-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.question-node__ai-badge {
  padding: 2px 8px;
  background: var(--color-success-light);
  color: var(--color-success);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.question-node__loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.question-node__response-content {
  padding: var(--space-3);
  background: var(--surface-muted);
  border-radius: var(--radius-sm);
}

.question-node__footer {
  display: flex;
  justify-content: flex-end;
}

.question-node__add-child {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.question-node__add-child:hover {
  background: var(--accent-question);
  border-color: var(--accent-question);
  color: var(--text-inverse);
}

.question-node__add-child svg {
  width: 14px;
  height: 14px;
}
</style>
