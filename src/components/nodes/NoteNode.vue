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
    class="relative w-[300px]"
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
        class="w-full min-h-[80px] max-h-[200px] p-2 bg-transparent border-none font-sans text-base leading-normal text-gray-900 resize-none placeholder:text-gray-400 focus:outline-none"
        rows="3"
        data-testid="note-textarea"
        @input="handleInput"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
      
      <div v-else class="min-h-[40px]" data-testid="note-content">
        <p v-if="hasContent" class="text-base leading-normal text-gray-900 whitespace-pre-wrap break-words m-0">
          {{ data.content }}
        </p>
        <p v-else class="text-sm text-gray-400 italic m-0">
          (Nota vazia)
        </p>
      </div>
      
      <template v-if="!isEditing && hasContent" #footer>
        <div class="flex justify-end">
          <button
            type="button"
            class="flex items-center justify-center w-7 h-7 bg-transparent border border-gray-200 rounded-md text-gray-600 cursor-pointer transition-all duration-fast hover:bg-accent-note hover:border-accent-note hover:text-white"
            title="Adicionar no filho"
            data-testid="note-add-child-btn"
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
      data-testid="note-delete-btn"
      @delete="emit('delete')"
    />
    
    <div 
      v-if="isEditing" 
      class="absolute -bottom-6 left-0 right-0 flex justify-center gap-4 text-xs text-gray-400"
      data-testid="note-hints"
    >
      <span class="bg-gray-50 px-1.5 py-0.5 rounded-md">Enter para salvar</span>
      <span class="bg-gray-50 px-1.5 py-0.5 rounded-md">Shift+Enter para nova linha</span>
    </div>
  </div>
</template>
