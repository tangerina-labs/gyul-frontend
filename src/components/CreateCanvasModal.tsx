import { useState, useRef, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

interface CreateCanvasModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateCanvas: (name: string) => void
}

export function CreateCanvasModal({
  open,
  onOpenChange,
  onCreateCanvas,
}: CreateCanvasModalProps) {
  const [canvasName, setCanvasName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the dialog is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
      return () => clearTimeout(timer)
    } else {
      // Reset input when modal closes
      setCanvasName('')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = canvasName.trim() || 'New Canvas'
    onCreateCanvas(name)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in"
          data-testid="modal-overlay"
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-fade-in"
          data-testid="create-canvas-modal"
        >
          <Dialog.Title className="text-lg font-semibold text-[var(--gray-900)]">
            Create New Canvas
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[var(--gray-400)]">
            Give your canvas a name to get started.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="mt-4">
            <input
              ref={inputRef}
              type="text"
              value={canvasName}
              onChange={(e) => setCanvasName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="New Canvas"
              className="w-full rounded-lg border border-[var(--gray-300)] px-4 py-2 text-[var(--gray-900)] placeholder:text-[var(--gray-400)] focus:border-[var(--color-tweet)] focus:outline-none focus:ring-2 focus:ring-[var(--color-tweet)]/20"
              data-testid="canvas-name-input"
            />

            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg border border-[var(--gray-300)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] transition-colors hover:bg-[var(--gray-100)]"
                  data-testid="cancel-button"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                className="rounded-lg bg-[var(--color-tweet)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-tweet)]/90"
                data-testid="create-button"
              >
                Create
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
