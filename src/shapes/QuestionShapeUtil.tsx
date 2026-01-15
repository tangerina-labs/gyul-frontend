import { BaseBoxShapeUtil, HTMLContainer, Rectangle2d } from 'tldraw'
import type { QuestionShape } from '../types/shapes'
import { QuestionCard } from '../components/shapes/QuestionCard'

/** Default height before content is measured */
const DEFAULT_HEIGHT = 180

/**
 * tldraw ShapeUtil for Question shapes.
 *
 * Defines how the QuestionShape behaves in the canvas:
 * - Height derived from HTML content via ResizeObserver (measuredHeight)
 * - Width fixed, no manual resize
 * - Renders QuestionCard component
 * - Custom indicator with rounded corners
 */
export class QuestionShapeUtil extends BaseBoxShapeUtil<QuestionShape> {
  static override type = 'question' as const

  override getDefaultProps(): QuestionShape['props'] {
    return {
      w: 400,
      h: DEFAULT_HEIGHT, // Required by BaseBoxShapeUtil, overridden by getGeometry
      // measuredHeight is set by useAutoHeight hook
      flowId: crypto.randomUUID(),
      prompt: '',
      response: null,
      status: 'draft',
    }
  }

  // Geometry derived from measured content height
  override getGeometry(shape: QuestionShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.measuredHeight ?? DEFAULT_HEIGHT,
      isFilled: true,
    })
  }

  // Question shapes have fixed width, height grows with content
  override canResize = () => false

  // Render the React component inside tldraw
  override component(shape: QuestionShape) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: shape.props.w,
          // No height - HTML grows naturally, measured by ResizeObserver
          pointerEvents: 'all',
        }}
      >
        <QuestionCard shape={shape} />
      </HTMLContainer>
    )
  }

  // Selection indicator with rounded corners
  override indicator(shape: QuestionShape) {
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
