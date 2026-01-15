import { TweetShapeUtil } from './TweetShapeUtil'
import { QuestionShapeUtil } from './QuestionShapeUtil'
import { NoteShapeUtil } from './NoteShapeUtil'

/**
 * Custom shape utilities for tldraw.
 * Pass this array to the Tldraw component's shapeUtils prop.
 */
export const customShapeUtils = [TweetShapeUtil, QuestionShapeUtil, NoteShapeUtil]

export { TweetShapeUtil, QuestionShapeUtil, NoteShapeUtil }
