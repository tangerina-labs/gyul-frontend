import { BaseBoxShapeUtil, HTMLContainer, Rectangle2d } from 'tldraw'
import type { NoteShape } from '../types/shapes'
import { NoteCard } from '../components/shapes/NoteCard'

/** Default height before content is measured */
const DEFAULT_HEIGHT = 150

/**
 * tldraw ShapeUtil for Note shapes.
 *
 * Defines how the NoteShape behaves in the canvas:
 * - Height derived from HTML content via ResizeObserver (measuredHeight)
 * - Width fixed at 300px (smaller than Tweet/Question for post-it visual)
 * - No manual resize
 * - Renders NoteCard component
 * - Custom indicator with rounded corners
 */
export class NoteShapeUtil extends BaseBoxShapeUtil<NoteShape> {
  static override type = 'note' as const

  override getDefaultProps(): NoteShape['props'] {
    return {
      w: 300,
      h: DEFAULT_HEIGHT, // Required by BaseBoxShapeUtil, overridden by getGeometry
      // measuredHeight is set by useAutoHeight hook
      flowId: crypto.randomUUID(),
      content: '',
      isEditing: true, // starts in editing mode
    }
  }

  // Geometry derived from measured content height
  override getGeometry(shape: NoteShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.measuredHeight ?? DEFAULT_HEIGHT,
      isFilled: true,
    })
  }

  // Note shapes have fixed width, height grows with content
  override canResize = () => false

  // Render the React component inside tldraw
  override component(shape: NoteShape) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: shape.props.w,
          // No height - HTML grows naturally, measured by ResizeObserver
          pointerEvents: 'all',
        }}
      >
        <NoteCard shape={shape} />
      </HTMLContainer>
    )
  }

  // Selection indicator with rounded corners
  override indicator(shape: NoteShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.measuredHeight ?? DEFAULT_HEIGHT}
        rx={12}
        ry={12}
      />
    )
  }
}
