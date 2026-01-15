import { useLayoutEffect, useRef } from 'react'
import { useEditor, type TLShapeId } from 'tldraw'
import type { ShapeType } from '../types/shapes'

/**
 * Hook that measures HTML content height and updates the shape's measuredHeight prop.
 * Uses ResizeObserver to react to content changes automatically.
 *
 * This follows the tldraw pattern where:
 * - HTML grows naturally based on content
 * - Shape geometry is derived from the measured height
 * - Never the other way around
 *
 * @param shapeId - The shape ID to update
 * @param type - The shape type (for type-safe updateShape)
 * @param minHeight - Minimum height fallback (default: 100)
 * @returns ref to attach to the root content element
 *
 * @example
 * function MyCard({ shape }) {
 *   const ref = useAutoHeight(shape.id, 'tweet', 150)
 *   return <div ref={ref}><BaseCard>...</BaseCard></div>
 * }
 */
export function useAutoHeight(
  shapeId: TLShapeId,
  type: ShapeType,
  minHeight = 100
) {
  const editor = useEditor()
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      const height = Math.max(minHeight, Math.ceil(entry.contentRect.height))

      // Avoid infinite loop: only update if height actually changed
      const shape = editor.getShape(shapeId)
      if (!shape) return

      const currentHeight = (shape.props as { measuredHeight?: number }).measuredHeight
      if (currentHeight === height) return

      editor.updateShape({
        id: shapeId,
        type,
        props: { measuredHeight: height },
      })
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [editor, shapeId, type, minHeight])

  return ref
}
