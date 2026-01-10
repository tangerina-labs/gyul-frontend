<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TweetData } from '@/types'
import { formatTweetTimestamp } from '@/services/tweetService'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ExpandableText from '@/components/ui/ExpandableText.vue'
import DeleteButton from '@/components/ui/DeleteButton.vue'

interface Props {
  id: string
  data: TweetData
  selected?: boolean
  hasChildren?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  hasChildren: false
})

const emit = defineEmits<{
  'load-tweet': [url: string]
  'add-child': [position: { x: number; y: number }]
  'delete': []
}>()

const urlInput = ref(props.data.url || '')

const isEmpty = computed(() => props.data.status === 'empty')
const isLoading = computed(() => props.data.status === 'loading')
const isLoaded = computed(() => props.data.status === 'loaded')
const isError = computed(() => props.data.status === 'error')

const cardVariant = computed(() => {
  if (isEmpty.value || isError.value) return 'default'
  return 'tweet'
})

const handleSubmit = () => {
  const url = urlInput.value.trim()
  if (url) {
    emit('load-tweet', url)
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSubmit()
  }
}

const handleAddChild = () => {
  emit('add-child', { x: 0, y: 200 })
}

const formattedTimestamp = computed(() => {
  if (!props.data.timestamp) return ''
  return formatTweetTimestamp(props.data.timestamp)
})
</script>

<template>
  <div 
    class="tweet-node" 
    :class="{ 'tweet-node--empty': isEmpty || isError }"
    :data-status="data.status"
  >
    <BaseCard
      v-if="isEmpty || isError"
      :variant="cardVariant"
      :loading="isLoading"
      :selected="selected"
      :error="isError"
      data-testid="tweet-card"
    >
      <div class="tweet-node__input-section" data-testid="tweet-input-section">
        <label class="tweet-node__label">
          Cole a URL do tweet
        </label>
        
        <div class="tweet-node__input-group">
          <input
            v-model="urlInput"
            type="url"
            placeholder="https://twitter.com/user/status/123..."
            class="tweet-node__input"
            :disabled="isLoading"
            data-testid="tweet-url-input"
            @keydown="handleKeydown"
          />
          
          <button
            type="button"
            class="tweet-node__submit"
            :disabled="isLoading || !urlInput.trim()"
            data-testid="tweet-submit-btn"
            @click="handleSubmit"
          >
            Carregar
          </button>
        </div>
        
        <p v-if="isError && data.error" class="tweet-node__error" data-testid="tweet-error-message">
          {{ data.error }}
        </p>
      </div>
    </BaseCard>
    
    <BaseCard
      v-else-if="isLoading"
      :variant="cardVariant"
      :loading="true"
      :selected="selected"
      data-testid="tweet-card"
    >
      <div class="tweet-node__loading" data-testid="tweet-loading">
        <LoadingSpinner size="lg" />
        <p>Carregando tweet...</p>
      </div>
    </BaseCard>
    
    <BaseCard
      v-else-if="isLoaded"
      variant="tweet"
      :loading="false"
      :selected="selected"
      data-testid="tweet-card"
    >
      <template #header>
        <div class="tweet-node__author" data-testid="tweet-author">
          <img
            v-if="data.author?.avatar"
            :src="data.author.avatar"
            :alt="data.author.name"
            class="tweet-node__avatar"
            data-testid="tweet-avatar"
          />
          <div class="tweet-node__author-info">
            <span class="tweet-node__author-name" data-testid="tweet-author-name">{{ data.author?.name }}</span>
            <span class="tweet-node__author-handle" data-testid="tweet-author-handle">{{ data.author?.handle }}</span>
          </div>
          
          <svg class="tweet-node__x-icon" viewBox="0 0 24 24" fill="currentColor" data-testid="tweet-x-icon">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      </template>
      
      <div data-testid="tweet-text">
        <ExpandableText
          :text="data.text || ''"
          :lines="4"
        />
      </div>
      
      <template #footer>
        <div class="tweet-node__footer" data-testid="tweet-footer">
          <span class="tweet-node__timestamp" data-testid="tweet-timestamp">
            {{ formattedTimestamp }}
          </span>
          
          <button
            type="button"
            class="tweet-node__add-child"
            title="Adicionar no filho"
            data-testid="tweet-add-child-btn"
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
      data-testid="tweet-delete-btn"
      @delete="emit('delete')"
    />
  </div>
</template>

<style scoped>
.tweet-node {
  position: relative;
  width: 400px;
}

.tweet-node--empty {
  width: 350px;
}

.tweet-node__input-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tweet-node__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.tweet-node__input-group {
  display: flex;
  gap: var(--space-2);
}

.tweet-node__input {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-sans);
  background: var(--surface-node);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.tweet-node__input::placeholder {
  color: var(--text-muted);
}

.tweet-node__input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.tweet-node__input:disabled {
  background: var(--surface-muted);
  cursor: not-allowed;
}

.tweet-node__submit {
  padding: var(--space-2) var(--space-3);
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.tweet-node__submit:hover:not(:disabled) {
  background: var(--accent-primary-hover);
}

.tweet-node__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tweet-node__error {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  margin: 0;
}

.tweet-node__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-6);
  color: var(--text-secondary);
}

.tweet-node__author {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.tweet-node__avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.tweet-node__author-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tweet-node__author-name {
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.tweet-node__author-handle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.tweet-node__x-icon {
  width: 20px;
  height: 20px;
  color: var(--text-muted);
}

.tweet-node__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tweet-node__timestamp {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.tweet-node__add-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--surface-muted);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tweet-node__add-child:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--text-inverse);
}

.tweet-node__add-child svg {
  width: 16px;
  height: 16px;
}
</style>
