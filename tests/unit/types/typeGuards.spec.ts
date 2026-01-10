import { describe, it, expect } from 'vitest'
import {
  isTweetData,
  isQuestionData,
  isNoteData,
  isLoadedTweet,
  isDoneQuestion
} from '@/types/nodes'
import type { TweetData, QuestionData, NoteData, CustomNodeData } from '@/types/nodes'

const sampleTweetData: TweetData = {
  type: 'tweet',
  flowId: 'test-flow-1',
  url: '',
  status: 'empty'
}

const sampleLoadedTweetData: TweetData = {
  type: 'tweet',
  flowId: 'test-flow-1',
  url: 'https://twitter.com/test/status/123',
  status: 'loaded',
  author: {
    name: 'Test User',
    handle: '@testuser',
    avatar: 'https://example.com/avatar.jpg'
  },
  text: 'This is a test tweet about AI and machine learning.',
  timestamp: new Date().toISOString()
}

const sampleQuestionData: QuestionData = {
  type: 'question',
  flowId: 'test-flow-2',
  prompt: 'What is the meaning of life?',
  response: null,
  status: 'draft'
}

const sampleDoneQuestionData: QuestionData = {
  type: 'question',
  flowId: 'test-flow-2',
  prompt: 'What is machine learning?',
  response: 'Machine learning is a subset of AI that enables systems to learn from data.',
  status: 'done'
}

const sampleNoteData: NoteData = {
  type: 'note',
  flowId: 'test-flow-3',
  content: 'Important notes about the topic',
  isEditing: false
}

describe('Type Guards', () => {
  describe('isTweetData', () => {
    it('should return true for TweetData', () => {
      expect(isTweetData(sampleTweetData)).toBe(true)
      expect(isTweetData(sampleLoadedTweetData)).toBe(true)
    })

    it('should return false for QuestionData', () => {
      expect(isTweetData(sampleQuestionData)).toBe(false)
      expect(isTweetData(sampleDoneQuestionData)).toBe(false)
    })

    it('should return false for NoteData', () => {
      expect(isTweetData(sampleNoteData)).toBe(false)
    })
  })

  describe('isQuestionData', () => {
    it('should return true for QuestionData', () => {
      expect(isQuestionData(sampleQuestionData)).toBe(true)
      expect(isQuestionData(sampleDoneQuestionData)).toBe(true)
    })

    it('should return false for TweetData', () => {
      expect(isQuestionData(sampleTweetData)).toBe(false)
      expect(isQuestionData(sampleLoadedTweetData)).toBe(false)
    })

    it('should return false for NoteData', () => {
      expect(isQuestionData(sampleNoteData)).toBe(false)
    })
  })

  describe('isNoteData', () => {
    it('should return true for NoteData', () => {
      expect(isNoteData(sampleNoteData)).toBe(true)
    })

    it('should return false for TweetData', () => {
      expect(isNoteData(sampleTweetData)).toBe(false)
      expect(isNoteData(sampleLoadedTweetData)).toBe(false)
    })

    it('should return false for QuestionData', () => {
      expect(isNoteData(sampleQuestionData)).toBe(false)
      expect(isNoteData(sampleDoneQuestionData)).toBe(false)
    })
  })

  describe('isLoadedTweet', () => {
    it('should return true for loaded TweetData', () => {
      expect(isLoadedTweet(sampleLoadedTweetData)).toBe(true)
    })

    it('should return false for empty TweetData', () => {
      expect(isLoadedTweet(sampleTweetData)).toBe(false)
    })

    it('should return false for loading TweetData', () => {
      const loadingTweet: TweetData = {
        ...sampleTweetData,
        status: 'loading'
      }
      expect(isLoadedTweet(loadingTweet)).toBe(false)
    })

    it('should return false for error TweetData', () => {
      const errorTweet: TweetData = {
        ...sampleTweetData,
        status: 'error',
        error: 'Failed to load tweet'
      }
      expect(isLoadedTweet(errorTweet)).toBe(false)
    })

    it('should return false for non-tweet data', () => {
      expect(isLoadedTweet(sampleQuestionData)).toBe(false)
      expect(isLoadedTweet(sampleNoteData)).toBe(false)
    })
  })

  describe('isDoneQuestion', () => {
    it('should return true for done QuestionData', () => {
      expect(isDoneQuestion(sampleDoneQuestionData)).toBe(true)
    })

    it('should return false for draft QuestionData', () => {
      expect(isDoneQuestion(sampleQuestionData)).toBe(false)
    })

    it('should return false for loading QuestionData', () => {
      const loadingQuestion: QuestionData = {
        ...sampleQuestionData,
        status: 'loading'
      }
      expect(isDoneQuestion(loadingQuestion)).toBe(false)
    })

    it('should return false for non-question data', () => {
      expect(isDoneQuestion(sampleTweetData)).toBe(false)
      expect(isDoneQuestion(sampleLoadedTweetData)).toBe(false)
      expect(isDoneQuestion(sampleNoteData)).toBe(false)
    })
  })
})

describe('Sample Data Validation', () => {
  it('should have valid TweetData structure', () => {
    expect(sampleTweetData.type).toBe('tweet')
    expect(typeof sampleTweetData.flowId).toBe('string')
    expect(typeof sampleTweetData.url).toBe('string')
    expect(['empty', 'loading', 'loaded', 'error']).toContain(sampleTweetData.status)
  })

  it('should have valid loaded TweetData with author', () => {
    expect(sampleLoadedTweetData.status).toBe('loaded')
    expect(sampleLoadedTweetData.author).toBeDefined()
    expect(typeof sampleLoadedTweetData.author?.name).toBe('string')
    expect(typeof sampleLoadedTweetData.author?.handle).toBe('string')
    expect(typeof sampleLoadedTweetData.author?.avatar).toBe('string')
    expect(typeof sampleLoadedTweetData.text).toBe('string')
    expect(typeof sampleLoadedTweetData.timestamp).toBe('string')
  })

  it('should have valid QuestionData structure', () => {
    expect(sampleQuestionData.type).toBe('question')
    expect(typeof sampleQuestionData.flowId).toBe('string')
    expect(typeof sampleQuestionData.prompt).toBe('string')
    expect(sampleQuestionData.response === null || typeof sampleQuestionData.response === 'string').toBe(true)
    expect(['draft', 'loading', 'done']).toContain(sampleQuestionData.status)
  })

  it('should have valid done QuestionData with response', () => {
    expect(sampleDoneQuestionData.status).toBe('done')
    expect(typeof sampleDoneQuestionData.prompt).toBe('string')
    expect(sampleDoneQuestionData.prompt.length).toBeGreaterThan(0)
    expect(typeof sampleDoneQuestionData.response).toBe('string')
    expect(sampleDoneQuestionData.response!.length).toBeGreaterThan(0)
  })

  it('should have valid NoteData structure', () => {
    expect(sampleNoteData.type).toBe('note')
    expect(typeof sampleNoteData.flowId).toBe('string')
    expect(typeof sampleNoteData.content).toBe('string')
    expect(typeof sampleNoteData.isEditing).toBe('boolean')
  })
})
