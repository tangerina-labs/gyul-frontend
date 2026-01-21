import { useState, useCallback } from 'react'
import { track, useEditor } from 'tldraw'
import { ShapeTypeMenu } from './ShapeTypeMenu'
import type { ShapeType } from '../../types/shapes'

const ZOOM_MIN = 0.25
const ZOOM_MAX = 2

/**
 * Custom canvas toolbox that replaces tldraw's native controls.
 * Provides: New Flow, Zoom In, Zoom Out, Fit View, Undo, Redo
 */
export const CanvasToolbox = track(function CanvasToolbox() {
  const editor = useEditor()
  const [isCreatingFlow, setIsCreatingFlow] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [canvasClickPosition, setCanvasClickPosition] = useState<{ x: number; y: number } | null>(null)

  const zoomLevel = editor.getZoomLevel()
  const canZoomIn = zoomLevel < ZOOM_MAX
  const canZoomOut = zoomLevel > ZOOM_MIN
  const canUndo = editor.getCanUndo()
  const canRedo = editor.getCanRedo()

  const handleNewFlow = useCallback(() => {
    setIsCreatingFlow(true)
  }, [])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isCreatingFlow) return

      // Get click position relative to screen
      const screenPoint = { x: e.clientX, y: e.clientY }

      // Convert to page coordinates for shape creation
      const pagePoint = editor.screenToPage(screenPoint)

      setMenuPosition(screenPoint)
      setCanvasClickPosition(pagePoint)
    },
    [isCreatingFlow, editor]
  )

  const handleSelectType = useCallback(
    (type: ShapeType) => {
      if (!canvasClickPosition) return

      // Create the shape at the clicked position
      editor.createShape({
        type,
        x: canvasClickPosition.x - 200, // Center the shape (400px width / 2)
        y: canvasClickPosition.y - 100, // Offset from click position
        props: {
          flowId: crypto.randomUUID(),
        },
      })

      // Reset state
      setIsCreatingFlow(false)
      setMenuPosition(null)
      setCanvasClickPosition(null)
    },
    [editor, canvasClickPosition]
  )

  const handleCloseMenu = useCallback(() => {
    setMenuPosition(null)
    setCanvasClickPosition(null)
    setIsCreatingFlow(false)
  }, [])

  const handleCancelCreation = useCallback(() => {
    setIsCreatingFlow(false)
    setMenuPosition(null)
    setCanvasClickPosition(null)
  }, [])

  const handleZoomIn = () => {
    editor.zoomIn(editor.getViewportScreenCenter(), { animation: { duration: 200 } })
  }

  const handleZoomOut = () => {
    editor.zoomOut(editor.getViewportScreenCenter(), { animation: { duration: 200 } })
  }

  const handleFitView = () => {
    const shapes = editor.getCurrentPageShapes()
    if (shapes.length > 0) {
      editor.zoomToFit({ animation: { duration: 300 } })
    } else {
      // Reset to center if no shapes
      editor.resetZoom(editor.getViewportScreenCenter(), { animation: { duration: 200 } })
    }
  }

  const handleUndo = () => {
    editor.undo()
  }

  const handleRedo = () => {
    editor.redo()
  }

  // Format zoom level as percentage
  const zoomPercentage = Math.round(zoomLevel * 100)

  return (
    <>
      {/* Click overlay when in creation mode */}
      {isCreatingFlow && !menuPosition && (
        <div
          className="fixed inset-0 z-[999] cursor-crosshair"
          onClick={handleCanvasClick}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancelCreation()
          }}
          tabIndex={0}
          role="button"
          aria-label="Click to place shape"
        />
      )}

      {/* New Flow Button - Top Left */}
      <div className="absolute left-4 top-1/2 z-[1000] -translate-y-1/2">
        <button
          onClick={handleNewFlow}
          data-testid="toolbox-new-flow"
          className={`
            flex items-center gap-2 rounded-lg px-4 py-2
            text-sm font-medium shadow-lg
            transition-all duration-150
            ${
              isCreatingFlow
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
          title={isCreatingFlow ? 'Clique no canvas para posicionar' : 'Criar novo fluxo'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Novo Fluxo</span>
        </button>

        {/* Instruction text when in creation mode */}
        {isCreatingFlow && !menuPosition && (
          <div className="mt-2 rounded-md bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
            Clique no canvas para posicionar o shape
          </div>
        )}
      </div>

      {/* Main Toolbox - Bottom Right */}
      <div
        className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1 rounded-lg bg-white p-1 shadow-lg"
        data-testid="canvas-toolbox"
      >
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          disabled={!canZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          data-testid="zoom-in-button"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Zoom Level Display */}
        <div
          className="flex h-9 w-9 items-center justify-center text-xs font-medium text-gray-600"
          data-testid="zoom-level"
          title={`Zoom: ${zoomPercentage}%`}
        >
          {zoomPercentage}%
        </div>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          disabled={!canZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          data-testid="zoom-out-button"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        {/* Divider */}
        <div className="my-1 h-px bg-gray-200" />

        {/* Fit View */}
        <button
          onClick={handleFitView}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
          data-testid="fit-view-button"
          title="Fit View (Shift+1)"
          aria-label="Fit View"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="my-1 h-px bg-gray-200" />

        {/* Undo */}
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          data-testid="undo-button"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </button>

        {/* Redo */}
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
          data-testid="redo-button"
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
            />
          </svg>
        </button>
      </div>

      {/* Shape Type Menu */}
      {menuPosition && (
        <ShapeTypeMenu
          position={menuPosition}
          onSelect={handleSelectType}
          onClose={handleCloseMenu}
        />
      )}
    </>
  )
})
