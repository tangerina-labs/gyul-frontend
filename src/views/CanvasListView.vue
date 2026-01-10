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
</script>

<template>
  <div class="canvas-list" data-testid="canvas-list-view">
    <header class="canvas-list__header">
      <div class="canvas-list__brand">
        <h1 class="canvas-list__title">gyul</h1>
        <p class="canvas-list__subtitle">Explore tweets com IA</p>
      </div>

      <button
        type="button"
        class="canvas-list__create-btn"
        data-testid="create-canvas-btn"
        @click="openCreateModal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Novo Canvas
      </button>
    </header>

    <main class="canvas-list__content">
      <div v-if="sortedCanvases.length === 0" class="canvas-list__empty" data-testid="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <h2>Nenhum canvas ainda</h2>
        <p>Crie seu primeiro canvas para comecar a explorar</p>
        <button
          type="button"
          class="canvas-list__empty-btn"
          data-testid="create-first-canvas-btn"
          @click="openCreateModal"
        >
          Criar primeiro canvas
        </button>
      </div>

      <div v-else class="canvas-list__grid" data-testid="canvas-grid">
        <article
          v-for="canvas in sortedCanvases"
          :key="canvas.id"
          class="canvas-card"
          :data-testid="`canvas-card-${canvas.id}`"
          @click="handleSelect(canvas.id)"
        >
          <div class="canvas-card__header">
            <h3 class="canvas-card__name" data-testid="canvas-name">{{ canvas.name }}</h3>
            <button
              type="button"
              class="canvas-card__delete"
              title="Deletar"
              data-testid="delete-canvas-btn"
              @click.stop="confirmDelete(canvas)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div class="canvas-card__meta">
            <span class="canvas-card__nodes" data-testid="canvas-node-count">
              {{ canvas.nodes.length }} nos
            </span>
            <span class="canvas-card__date" data-testid="canvas-date">
              {{ formatRelativeDate(canvas.updatedAt) }}
            </span>
          </div>

          <div class="canvas-card__preview">
            <div
              v-for="(node, index) in canvas.nodes.slice(0, 3)"
              :key="node.id"
              class="canvas-card__preview-node"
              :class="`canvas-card__preview-node--${node.type}`"
              :style="{ left: `${20 + index * 30}%`, top: `${30 + index * 15}%` }"
            />
          </div>
        </article>
      </div>
    </main>

    <div
      v-if="showCreateModal"
      class="modal-overlay"
      data-testid="create-modal"
      @click.self="showCreateModal = false"
    >
      <div class="modal">
        <h2 class="modal__title">Novo Canvas</h2>

        <input
          ref="createInputRef"
          v-model="newCanvasName"
          type="text"
          placeholder="Nome do canvas"
          class="modal__input"
          data-testid="canvas-name-input"
          @keydown="handleCreateKeydown"
        />

        <div class="modal__actions">
          <button
            type="button"
            class="modal__btn modal__btn--secondary"
            data-testid="cancel-create-btn"
            @click="showCreateModal = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="modal__btn modal__btn--primary"
            data-testid="confirm-create-btn"
            @click="handleCreate"
          >
            Criar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="canvasToDelete"
      class="modal-overlay"
      data-testid="delete-modal"
      @click.self="cancelDelete"
    >
      <div class="modal">
        <h2 class="modal__title">Deletar Canvas</h2>
        <p class="modal__message">
          Tem certeza que deseja deletar <strong>"{{ canvasToDelete.name }}"</strong>? Esta acao nao
          pode ser desfeita.
        </p>

        <div class="modal__actions">
          <button
            type="button"
            class="modal__btn modal__btn--secondary"
            data-testid="cancel-delete-btn"
            @click="cancelDelete"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="modal__btn modal__btn--danger"
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

<style scoped>
.canvas-list {
  min-height: 100vh;
  background: var(--background);
}

.canvas-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: white;
  border-bottom: 1px solid var(--note-border);
}

.canvas-list__brand {
  display: flex;
  flex-direction: column;
}

.canvas-list__title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.canvas-list__subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.canvas-list__create-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--tweet-border);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.canvas-list__create-btn:hover {
  background: #4338ca;
}

.canvas-list__create-btn svg {
  width: 16px;
  height: 16px;
}

.canvas-list__content {
  padding: var(--spacing-xl);
  max-width: 1200px;
  margin: 0 auto;
}

.canvas-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-xl) * 2);
  text-align: center;
}

.canvas-list__empty svg {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  margin-bottom: var(--spacing-lg);
}

.canvas-list__empty h2 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.canvas-list__empty p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.canvas-list__empty-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--tweet-border);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
}

.canvas-list__empty-btn:hover {
  background: #4338ca;
}

.canvas-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.canvas-card {
  background: white;
  border: 1px solid var(--note-border);
  border-radius: var(--node-radius);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.canvas-card:hover {
  border-color: var(--tweet-border);
  box-shadow: var(--tweet-shadow);
}

.canvas-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.canvas-card__name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

.canvas-card__delete {
  padding: var(--spacing-xs);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-fast);
}

.canvas-card:hover .canvas-card__delete {
  opacity: 1;
}

.canvas-card__delete:hover {
  color: var(--error);
}

.canvas-card__delete svg {
  width: 16px;
  height: 16px;
}

.canvas-card__meta {
  display: flex;
  gap: var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

.canvas-card__preview {
  position: relative;
  height: 80px;
  background: var(--background);
  border-radius: 8px;
  overflow: hidden;
}

.canvas-card__preview-node {
  position: absolute;
  width: 40px;
  height: 20px;
  border-radius: 4px;
  opacity: 0.6;
}

.canvas-card__preview-node--tweet {
  background: var(--tweet-border);
}

.canvas-card__preview-node--question {
  background: var(--question-border);
}

.canvas-card__preview-node--note {
  background: #d97706;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal {
  background: white;
  border-radius: var(--node-radius);
  padding: var(--spacing-lg);
  width: 100%;
  max-width: 400px;
  animation: fadeIn var(--transition-fast);
}

.modal__title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.modal__message {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.modal__input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--note-border);
  border-radius: 8px;
  font-size: var(--text-base);
  margin-bottom: var(--spacing-lg);
}

.modal__input:focus {
  outline: none;
  border-color: var(--tweet-border);
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.modal__btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: 8px;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.modal__btn--primary {
  background: var(--tweet-border);
  color: white;
}

.modal__btn--primary:hover {
  background: #4338ca;
}

.modal__btn--secondary {
  background: var(--background);
  color: var(--text-secondary);
}

.modal__btn--secondary:hover {
  background: var(--note-border);
}

.modal__btn--danger {
  background: var(--error);
  color: white;
}

.modal__btn--danger:hover {
  background: #dc2626;
}
</style>
