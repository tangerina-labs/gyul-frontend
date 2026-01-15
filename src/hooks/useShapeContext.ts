import { useEditor, type TLShapeId } from 'tldraw'
import type { AiContext } from '../services/aiService'
import { isTweetShape, isQuestionShape, isNoteShape } from '../types/shapes'

/**
 * Hook to collect context from ancestor shapes via arrows.
 *
 * Currently returns empty context (standalone mode) since arrows
 * are not yet implemented. Will be enhanced when shape connections
 * feature is added.
 *
 * @param shapeId - The ID of the shape to collect context for
 * @returns AiContext object with tweet, questions, and notes from ancestors
 */
export function useShapeContext(shapeId: string): AiContext {
  const editor = useEditor()

  // For now, return empty context (standalone mode)
  // TODO: Implement arrow traversal when connections are available
  const context: AiContext = {}

  // Get all shapes to check for potential context
  const shapes = editor.getCurrentPageShapes()

  // Find arrows that point to this shape
  const incomingArrows = shapes.filter((s) => {
    if (s.type !== 'arrow') return false
    const arrowProps = s.props as { end?: { boundShapeId?: string } }
    return arrowProps.end?.boundShapeId === shapeId
  })

  // If no incoming arrows, return empty context
  if (incomingArrows.length === 0) {
    return context
  }

  // Collect ancestors by traversing arrows
  const ancestors: typeof shapes = []
  let currentId = shapeId

  while (true) {
    // Find arrow pointing to current shape
    const parentArrow = shapes.find((s) => {
      if (s.type !== 'arrow') return false
      const arrowProps = s.props as { end?: { boundShapeId?: string } }
      return arrowProps.end?.boundShapeId === currentId
    })

    if (!parentArrow) break

    // Get parent shape from arrow start
    const arrowProps = parentArrow.props as { start?: { boundShapeId?: string } }
    const parentId = arrowProps.start?.boundShapeId
    if (!parentId) break

    const parent = editor.getShape(parentId as TLShapeId)
    if (!parent) break

    ancestors.push(parent)
    currentId = parentId
  }

  // Build context from ancestors (order: closest to root)
  for (const shape of ancestors.reverse()) {
    if (isTweetShape(shape) && shape.props.status === 'loaded') {
      context.tweet = {
        text: shape.props.text || '',
        author: shape.props.author?.handle || '',
      }
    }

    if (isQuestionShape(shape) && shape.props.status === 'done') {
      context.previousQuestions = context.previousQuestions || []
      context.previousQuestions.push({
        prompt: shape.props.prompt,
        response: shape.props.response || '',
      })
    }

    if (isNoteShape(shape) && !shape.props.isEditing) {
      context.notes = context.notes || []
      context.notes.push(shape.props.content)
    }
  }

  return context
}
