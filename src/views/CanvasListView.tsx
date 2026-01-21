import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { useAppStore } from '../stores/appStore'
import { CreateCanvasModal } from '../components/CreateCanvasModal'
import { DeleteCanvasModal } from '../components/DeleteCanvasModal'
import { countShapesInSnapshot, formatShapeCount } from '../utils/canvasUtils'
import type { CanvasState } from '../types'

export function CanvasListView() {
  const navigate = useNavigate()
  const { state, createCanvas, deleteCanvas } = useAppStore()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteModalState, setDeleteModalState] = useState<{
    open: boolean
    canvas: CanvasState | null
  }>({ open: false, canvas: null })

  const handleCreateCanvas = (name: string) => {
    const canvasId = createCanvas(name)
    navigate({ to: '/canvas/$id', params: { id: canvasId } })
  }

  const handleOpenCanvas = (canvasId: string) => {
    navigate({ to: '/canvas/$id', params: { id: canvasId } })
  }

  const handleDeleteClick = (canvas: CanvasState, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteModalState({ open: true, canvas })
  }

  const handleConfirmDelete = () => {
    if (deleteModalState.canvas) {
      deleteCanvas(deleteModalState.canvas.id)
    }
  }

  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  const sortedCanvases = [...state.canvases].sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

  return (
    <div className="min-h-screen bg-[var(--gray-50)] p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--gray-900)]">gyul</h1>
        {state.canvases.length > 0 && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-lg bg-[var(--color-tweet)] px-4 py-2 text-white transition-colors hover:bg-[var(--color-tweet)]/90"
            data-testid="new-canvas-button"
          >
            New Canvas
          </button>
        )}
      </header>

      {state.canvases.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          data-testid="empty-state"
        >
          <p className="mb-4 text-[var(--gray-400)]">No canvases yet</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-lg border-2 border-dashed border-[var(--gray-300)] px-6 py-3 text-[var(--gray-400)] transition-colors hover:border-[var(--color-tweet)] hover:text-[var(--color-tweet)]"
            data-testid="create-first-canvas-button"
          >
            Create your first canvas
          </button>
        </div>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="canvas-list"
        >
          {sortedCanvases.map((canvas) => (
            <article
              key={canvas.id}
              onClick={() => handleOpenCanvas(canvas.id)}
              className="group cursor-pointer rounded-xl border border-[var(--gray-300)] bg-white p-4 shadow-[var(--shadow-md)] transition-shadow hover:shadow-[var(--shadow-lg)]"
              data-testid="canvas-card"
              data-canvas-id={canvas.id}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3
                    className="truncate font-medium text-[var(--gray-900)]"
                    data-testid="canvas-name"
                  >
                    {canvas.name}
                  </h3>
                  <p
                    className="mt-1 text-sm text-[var(--gray-400)]"
                    data-testid="canvas-shape-count"
                  >
                    {formatShapeCount(countShapesInSnapshot(canvas.snapshot))}
                  </p>
                  <p
                    className="mt-1 text-sm text-[var(--gray-400)]"
                    data-testid="canvas-date"
                  >
                    {formatRelativeDate(canvas.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(canvas, e)}
                  className="rounded p-1 text-[var(--gray-400)] opacity-0 transition-all hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] group-hover:opacity-100"
                  aria-label={`Delete ${canvas.name}`}
                  data-testid="delete-canvas-button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Create Canvas Modal */}
      <CreateCanvasModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCanvas={handleCreateCanvas}
      />

      {/* Delete Canvas Modal */}
      <DeleteCanvasModal
        open={deleteModalState.open}
        onOpenChange={(open) =>
          setDeleteModalState((prev) => ({ ...prev, open }))
        }
        canvasName={deleteModalState.canvas?.name || ''}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  )
}
