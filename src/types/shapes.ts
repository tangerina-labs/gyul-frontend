import type { TLBaseShape } from 'tldraw'

export type ShapeType = 'tweet' | 'question' | 'note'
export type TweetStatus = 'empty' | 'loading' | 'loaded' | 'error'
export type QuestionStatus = 'draft' | 'loading' | 'done' | 'error'

// Tweet Shape - displays tweet content from URL
export type TweetShape = TLBaseShape<
  'tweet',
  {
    w: number
    h: number // Required by BaseBoxShapeUtil, but geometry uses measuredHeight
    measuredHeight?: number // Derived from HTML content via ResizeObserver
    flowId: string
    url: string
    status: TweetStatus
    author?: {
      name: string
      handle: string
      avatar: string
    }
    text?: string
    timestamp?: string
    error?: string
  }
>

// Question Shape - AI prompt and response
export type QuestionShape = TLBaseShape<
  'question',
  {
    w: number
    h: number // Required by BaseBoxShapeUtil, but geometry uses measuredHeight
    measuredHeight?: number // Derived from HTML content via ResizeObserver
    flowId: string
    prompt: string
    response: string | null
    status: QuestionStatus
    error?: string
  }
>

// Note Shape - user annotations
export type NoteShape = TLBaseShape<
  'note',
  {
    w: number
    h: number // Required by BaseBoxShapeUtil, but geometry uses measuredHeight
    measuredHeight?: number // Derived from HTML content via ResizeObserver
    flowId: string
    content: string
    isEditing: boolean
  }
>

// Union type for all custom shapes
export type CustomShape = TweetShape | QuestionShape | NoteShape

// Type guards - using unknown for input to avoid generic type requirement
export function isTweetShape(shape: { type: string }): shape is TweetShape {
  return shape.type === 'tweet'
}

export function isQuestionShape(shape: { type: string }): shape is QuestionShape {
  return shape.type === 'question'
}

export function isNoteShape(shape: { type: string }): shape is NoteShape {
  return shape.type === 'note'
}

export function isLoadedTweet(
  shape: { type: string; props?: { status?: string } }
): shape is TweetShape & { props: { status: 'loaded' } } {
  return isTweetShape(shape) && shape.props?.status === 'loaded'
}

export function isDoneQuestion(
  shape: { type: string; props?: { status?: string } }
): shape is QuestionShape & { props: { status: 'done' } } {
  return isQuestionShape(shape) && shape.props?.status === 'done'
}
