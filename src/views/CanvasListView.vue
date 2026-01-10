<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@/composables/useStorage'
import type { CanvasState } from '@/types'

const router = useRouter()

const { state, createCanvas, deleteCanvas } = useStorage()

const sortedCanvases = computed(() => {
  return [...state.value.canvases].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

const showCreateModal = ref(false)
const newCanvasName = ref('')
const createInputRef = ref<HTMLInputElement | null>(null)

const openCreateModal = () => {
  newCanvasName.value = ''
  showCreateModal.value = true
  setTimeout(() => {
    createInputRef.value?.focus()
  }, 100)
}

const handleCreate = () => {
  const name = newCanvasName.value.trim() || 'Novo Canvas'
  const canvasId = createCanvas(name)
  showCreateModal.value = false
  router.push({ name: 'canvas', params: { id: canvasId } })
}

const handleCreateKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleCreate()
  }
  if (e.key === 'Escape') {
    showCreateModal.value = false
  }
}

const canvasToDelete = ref<CanvasState | null>(null)

const confirmDelete = (canvas: CanvasState) => {
  canvasToDelete.value = canvas
}

const handleDelete = () => {
  if (canvasToDelete.value) {
    deleteCanvas(canvasToDelete.value.id)
    canvasToDelete.value = null
  }
}

const cancelDelete = () => {
  canvasToDelete.value = null
}

const handleSelect = (canvasId: string) => {
  router.push({ name: 'canvas', params: { id: canvasId } })
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Agora mesmo'
  if (diffHours < 24) return `${diffHours}h atras`
  if (diffDays < 7) return `${diffDays}d atras`

  return formatDate(dateString)
}

// Preview node colors
const previewNodeColors: Record<string, string> = {
  tweet: 'bg-accent-tweet',
  question: 'bg-accent-question',
  note: 'bg-amber-600'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50" data-testid="canvas-list-view">
    <header class="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-200">
      <div class="flex flex-col">
        <h1 class="text-xl font-bold text-gray-900">gyul</h1>
        <p class="text-sm text-gray-600">Explore tweets com IA</p>
      </div>

      <button
        type="button"
        class="flex items-center gap-2 px-6 py-2 bg-brand-500 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors duration-fast hover:bg-brand-600"
        data-testid="create-canvas-btn"
        @click="openCreateModal"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Novo Canvas
      </button>
    </header>

    <main class="p-8 max-w-[1200px] mx-auto">
      <div v-if="sortedCanvases.length === 0" class="flex flex-col items-center justify-center py-16 text-center" data-testid="empty-state">
        <svg class="w-16 h-16 text-gray-400 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Nenhum canvas ainda</h2>
        <p class="text-gray-600 mb-6">Crie seu primeiro canvas para comecar a explorar</p>
        <button
          type="button"
          class="px-6 py-2 bg-brand-500 text-white border-none rounded-lg text-sm font-medium cursor-pointer hover:bg-brand-600"
          data-testid="create-first-canvas-btn"
          @click="openCreateModal"
        >
          Criar primeiro canvas
        </button>
      </div>

      <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6" data-testid="canvas-grid">
        <article
          v-for="canvas in sortedCanvases"
          :key="canvas.id"
          class="group bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-fast hover:border-brand-500 hover:shadow-node-hover"
          :data-testid="`canvas-card-${canvas.id}`"
          @click="handleSelect(canvas.id)"
        >
          <div class="flex items-start justify-between mb-2">
            <h3 class="text-base font-semibold text-gray-900" data-testid="canvas-name">{{ canvas.name }}</h3>
            <button
              type="button"
              class="p-1 bg-transparent border-none text-gray-400 cursor-pointer opacity-0 transition-all duration-fast group-hover:opacity-100 hover:text-danger [.group:hover_&]:opacity-100"
              title="Deletar"
              data-testid="delete-canvas-btn"
              @click.stop="confirmDelete(canvas)"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div class="flex gap-4 text-sm text-gray-600 mb-4">
            <span data-testid="canvas-node-count">
              {{ canvas.nodes.length }} nos
            </span>
            <span data-testid="canvas-date">
              {{ formatRelativeDate(canvas.updatedAt) }}
            </span>
          </div>

          <div class="relative h-20 bg-gray-50 rounded-lg overflow-hidden">
            <div
              v-for="(node, index) in canvas.nodes.slice(0, 3)"
              :key="node.id"
              :class="['absolute w-10 h-5 rounded opacity-60', previewNodeColors[node.type] || 'bg-gray-400']"
              :style="{ left: `${20 + index * 30}%`, top: `${30 + index * 15}%` }"
            />
          </div>
        </article>
      </div>
    </main>

    <!-- Create Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-modal"
      data-testid="create-modal"
      @click.self="showCreateModal = false"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-[400px] animate-fade-in">
        <h2 class="text-lg font-semibold mb-4">Novo Canvas</h2>

        <input
          ref="createInputRef"
          v-model="newCanvasName"
          type="text"
          placeholder="Nome do canvas"
          class="w-full px-4 py-2 border border-gray-200 rounded-lg text-base mb-6 focus:outline-none focus:border-brand-500"
          data-testid="canvas-name-input"
          @keydown="handleCreateKeydown"
        />

        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="px-6 py-2 bg-gray-50 text-gray-600 border-none rounded-lg text-sm font-medium cursor-pointer transition-colors duration-fast hover:bg-gray-200"
            data-testid="cancel-create-btn"
            @click="showCreateModal = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-6 py-2 bg-brand-500 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors duration-fast hover:bg-brand-600"
            data-testid="confirm-create-btn"
            @click="handleCreate"
          >
            Criar
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <div
      v-if="canvasToDelete"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-modal"
      data-testid="delete-modal"
      @click.self="cancelDelete"
    >
      <div class="bg-white rounded-lg p-6 w-full max-w-[400px] animate-fade-in">
        <h2 class="text-lg font-semibold mb-4">Deletar Canvas</h2>
        <p class="text-gray-600 mb-6">
          Tem certeza que deseja deletar <strong>"{{ canvasToDelete.name }}"</strong>? Esta acao nao
          pode ser desfeita.
        </p>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="px-6 py-2 bg-gray-50 text-gray-600 border-none rounded-lg text-sm font-medium cursor-pointer transition-colors duration-fast hover:bg-gray-200"
            data-testid="cancel-delete-btn"
            @click="cancelDelete"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-6 py-2 bg-danger text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors duration-fast hover:bg-red-600"
            data-testid="confirm-delete-btn"
            @click="handleDelete"
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
