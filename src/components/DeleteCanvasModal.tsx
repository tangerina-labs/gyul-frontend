import * as Dialog from '@radix-ui/react-dialog'

interface DeleteCanvasModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  canvasName: string
  onConfirmDelete: () => void
}

export function DeleteCanvasModal({
  open,
  onOpenChange,
  canvasName,
  onConfirmDelete,
}: DeleteCanvasModalProps) {
  const handleDelete = () => {
    onConfirmDelete()
    onOpenChange(false)
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
          data-testid="delete-canvas-modal"
        >
          <Dialog.Title className="text-lg font-semibold text-[var(--gray-900)]">
            Delete Canvas
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-[var(--gray-400)]">
            Are you sure you want to delete "{canvasName}"? This action cannot
            be undone.
          </Dialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-lg border border-[var(--gray-300)] px-4 py-2 text-sm font-medium text-[var(--gray-700)] transition-colors hover:bg-[var(--gray-100)]"
                data-testid="cancel-delete-button"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-[var(--color-error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-error)]/90"
              data-testid="confirm-delete-button"
            >
              Delete
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
