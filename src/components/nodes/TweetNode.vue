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
    :class="['relative', isEmpty || isError ? 'w-[350px]' : 'w-[400px]']"
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
      <div class="flex flex-col gap-2" data-testid="tweet-input-section">
        <label class="text-sm font-medium text-gray-600">
          Cole a URL do tweet
        </label>
        
        <div class="flex gap-2">
          <input
            v-model="urlInput"
            type="url"
            placeholder="https://twitter.com/user/status/123..."
            class="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm font-sans bg-white text-gray-900 transition-colors duration-fast placeholder:text-gray-400 focus:outline-none focus:border-brand-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            :disabled="isLoading"
            data-testid="tweet-url-input"
            @keydown="handleKeydown"
          />
          
          <button
            type="button"
            class="px-3 py-2 bg-brand-500 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-colors duration-fast hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading || !urlInput.trim()"
            data-testid="tweet-submit-btn"
            @click="handleSubmit"
          >
            Carregar
          </button>
        </div>
        
        <p v-if="isError && data.error" class="text-danger text-sm m-0" data-testid="tweet-error-message">
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
      <div class="flex flex-col items-center justify-center gap-4 p-6 text-gray-600" data-testid="tweet-loading">
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
        <div class="flex items-center gap-2" data-testid="tweet-author">
          <img
            v-if="data.author?.avatar"
            :src="data.author.avatar"
            :alt="data.author.name"
            class="w-12 h-12 rounded-full object-cover"
            data-testid="tweet-avatar"
          />
          <div class="flex flex-col flex-1">
            <span class="font-semibold text-gray-900" data-testid="tweet-author-name">{{ data.author?.name }}</span>
            <span class="text-sm text-gray-600" data-testid="tweet-author-handle">{{ data.author?.handle }}</span>
          </div>
          
          <svg class="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor" data-testid="tweet-x-icon">
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
        <div class="flex items-center justify-between" data-testid="tweet-footer">
          <span class="text-sm text-gray-400" data-testid="tweet-timestamp">
            {{ formattedTimestamp }}
          </span>
          
          <button
            type="button"
            class="flex items-center justify-center w-8 h-8 bg-gray-100 border border-gray-200 rounded-md text-gray-600 cursor-pointer transition-all duration-fast hover:bg-brand-500 hover:border-brand-500 hover:text-white"
            title="Adicionar no filho"
            data-testid="tweet-add-child-btn"
            @click="handleAddChild"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
