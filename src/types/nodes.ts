import type { Node } from '@vue-flow/core'

export type NodeType = 'tweet' | 'question' | 'note'
export type TweetStatus = 'empty' | 'loading' | 'loaded' | 'error'
export type QuestionStatus = 'draft' | 'loading' | 'done'

export interface TweetData {
  type: 'tweet'
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

export interface QuestionData {
  type: 'question'
  flowId: string
  prompt: string
  response: string | null
  status: QuestionStatus
}

export interface NoteData {
  type: 'note'
  flowId: string
  content: string
  isEditing: boolean
}

export type CustomNodeData = TweetData | QuestionData | NoteData
export type CustomNode = Node<CustomNodeData>

export function isTweetData(data: CustomNodeData): data is TweetData {
  return data.type === 'tweet'
}

export function isQuestionData(data: CustomNodeData): data is QuestionData {
  return data.type === 'question'
}

export function isNoteData(data: CustomNodeData): data is NoteData {
  return data.type === 'note'
}

export function isLoadedTweet(data: CustomNodeData): data is TweetData & { status: 'loaded' } {
  return isTweetData(data) && data.status === 'loaded'
}

export function isDoneQuestion(data: CustomNodeData): data is QuestionData & { status: 'done' } {
  return isQuestionData(data) && data.status === 'done'
}
