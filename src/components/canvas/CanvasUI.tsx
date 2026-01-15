import { CanvasToolbox } from './CanvasToolbox'
import { CanvasEmptyHint } from './CanvasEmptyHint'

/**
 * Custom UI layer rendered in front of the tldraw canvas.
 * Contains:
 * - CanvasToolbox: Zoom controls, fit view, undo/redo
 * - CanvasEmptyHint: Message shown when canvas is empty
 */
export function CanvasUI() {
  return (
    <>
      <CanvasEmptyHint />
      <CanvasToolbox />
    </>
  )
}
