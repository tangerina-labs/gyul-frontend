import { track, useEditor } from 'tldraw'

/**
 * Shows a hint message when the canvas is empty.
 * The hint disappears when shapes are added to the canvas.
 */
export const CanvasEmptyHint = track(function CanvasEmptyHint() {
  const editor = useEditor()
  const shapes = editor.getCurrentPageShapes()
  const isEmpty = shapes.length === 0

  if (!isEmpty) {
    return null
  }

  return (
    <div
      data-testid="canvas-empty-hint"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <p className="text-[var(--gray-400)] text-base">
        Clique em "+ Novo Fluxo" para comecar
      </p>
    </div>
  )
})
