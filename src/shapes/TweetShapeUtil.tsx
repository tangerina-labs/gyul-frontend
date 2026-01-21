import { BaseBoxShapeUtil, HTMLContainer, Rectangle2d } from 'tldraw'
import type { TweetShape } from '../types/shapes'
import { TweetCard } from '../components/shapes/TweetCard'

/** Default height before content is measured */
const DEFAULT_HEIGHT = 200

/**
 * tldraw ShapeUtil for Tweet shapes.
 *
 * Defines how the TweetShape behaves in the canvas:
 * - Height derived from HTML content via ResizeObserver (measuredHeight)
 * - Width fixed, no manual resize
 * - Renders TweetCard component
 * - Custom indicator with rounded corners
 */
export class TweetShapeUtil extends BaseBoxShapeUtil<TweetShape> {
  static override type = 'tweet' as const

  override getDefaultProps(): TweetShape['props'] {
    return {
      w: 400,
      h: DEFAULT_HEIGHT, // Required by BaseBoxShapeUtil, overridden by getGeometry
      // measuredHeight is set by useAutoHeight hook
      flowId: crypto.randomUUID(),
      url: '',
      status: 'empty',
    }
  }

  // Geometry derived from measured content height
  override getGeometry(shape: TweetShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.measuredHeight ?? DEFAULT_HEIGHT,
      isFilled: true,
    })
  }

  // Tweet shapes have fixed width, height grows with content
  override canResize = () => false

  // Render the React component inside tldraw
  override component(shape: TweetShape) {
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: shape.props.w,
          // No height - HTML grows naturally, measured by ResizeObserver
          pointerEvents: 'all',
        }}
      >
        <TweetCard shape={shape} />
      </HTMLContainer>
    )
  }

  // Selection indicator with rounded corners
  override indicator(shape: TweetShape) {
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
