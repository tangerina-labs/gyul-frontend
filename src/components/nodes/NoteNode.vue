<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import type { NoteData } from '@/types'
import BaseCard from '@/components/ui/BaseCard.vue'
import DeleteButton from '@/components/ui/DeleteButton.vue'

interface Props {
  id: string
  data: NoteData
  selected?: boolean
  hasChildren?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  hasChildren: false
})

const emit = defineEmits<{
  'update': [content: string]
  'finalize': [content: string]
  'add-child': [position: { x: number; y: number }]
  'delete': []
}>()

const contentInput = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const isEditing = computed(() => props.data.isEditing)
const hasContent = computed(() => props.data.content.trim().length > 0)

onMounted(() => {
  if (isEditing.value && textareaRef.value) {
    nextTick(() => {
      textareaRef.value?.focus()
      resizeTextarea()
    })
  }
})

const resizeTextarea = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.max(80, textareaRef.value.scrollHeight) + 'px'
  }
}

const handleInput = () => {
  resizeTextarea()
}

const handleBlur = () => {
  if (isEditing.value) {
    finalize()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    finalize()
  }
  
  if (e.key === 'Escape') {
    e.preventDefault()
    finalize()
  }
}

const finalize = () => {
  const content = contentInput.value.trim()
  emit('finalize', content)
}

const handleAddChild = () => {
  emit('add-child', { x: 0, y: 180 })
}
</script>

<template>
  <div 
    class="note-node"
    :data-status="isEditing ? 'editing' : 'readonly'"
  >
    <BaseCard
      variant="note"
      :selected="selected"
      data-testid="note-card"
    >
      <textarea
        v-if="isEditing"
        ref="textareaRef"
        v-model="contentInput"
        placeholder="Escreva sua anotacao..."
        class="note-node__textarea"
        rows="3"
        data-testid="note-textarea"
        @input="handleInput"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      
      <div v-else class="note-node__content" data-testid="note-content">
        <p v-if="hasContent" class="note-node__text">
          {{ data.content }}
        </p>
        <p v-else class="note-node__empty">
          (Nota vazia)
        </p>
      </div>
      
      <template v-if="!isEditing && hasContent" #footer>
        <div class="note-node__footer">
          <button
            type="button"
            class="note-node__add-child"
            title="Adicionar no filho"
            data-testid="note-add-child-btn"
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
      data-testid="note-delete-btn"
      @delete="emit('delete')"
    />
    
    <div v-if="isEditing" class="note-node__hints" data-testid="note-hints">
      <span>Enter para salvar</span>
      <span>Shift+Enter para nova linha</span>
    </div>
  </div>
</template>

<style scoped>
.note-node {
  position: relative;
  width: 300px;
}

.note-node__textarea {
  width: 100%;
  min-height: 80px;
  max-height: 200px;
  padding: var(--space-2);
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  resize: none;
}

.note-node__textarea:focus {
  outline: none;
}

.note-node__textarea::placeholder {
  color: var(--text-muted);
}

.note-node__content {
  min-height: 40px;
}

.note-node__text {
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.note-node__empty {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.note-node__footer {
  display: flex;
  justify-content: flex-end;
}

.note-node__add-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.note-node__add-child:hover {
  background: var(--accent-note);
  border-color: var(--accent-note);
  color: var(--text-inverse);
}

.note-node__add-child svg {
  width: 14px;
  height: 14px;
}

.note-node__hints {
  position: absolute;
  bottom: -24px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.note-node__hints span {
  background: var(--surface-canvas);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}
</style>
