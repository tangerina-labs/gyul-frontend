import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateAnswer, formatContextForDebug } from '@/services/aiService'
import type { CustomNodeData, TweetData, QuestionData, NoteData } from '@/types'

describe('AI Service', () => {
  describe('generateAnswer', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return error for empty prompt', async () => {
      const result = await generateAnswer({
        ancestors: [],
        prompt: ''
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Por favor, escreva uma pergunta.')
    })

    it('should return error for whitespace-only prompt', async () => {
      const result = await generateAnswer({
        ancestors: [],
        prompt: '   '
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Por favor, escreva uma pergunta.')
    })

    it('should return success with content for valid prompt (generic context)', async () => {
      const result = await generateAnswer({
        ancestors: [],
        prompt: 'O que e inteligencia artificial?'
      })

      expect(result.success).toBe(true)
      expect(result.content).toBeDefined()
      expect(typeof result.content).toBe('string')
      expect(result.content!.length).toBeGreaterThan(50)
      expect(result.content).toContain('O que e inteligencia artificial?')
    })

    it('should have 5% random error chance', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.03)

      const result = await generateAnswer({
        ancestors: [],
        prompt: 'Test prompt'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Erro ao gerar resposta. Por favor, tente novamente.')
    })
  })

  describe('Context Analysis - Tweet Context', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should use withTweet template when tweet ancestor is present', async () => {
      const tweetAncestor: TweetData = {
        type: 'tweet',
        flowId: 'test-flow',
        url: 'https://twitter.com/test/status/123',
        status: 'loaded',
        author: { name: 'Test User', handle: '@testuser', avatar: 'avatar.png' },
        text: 'Este e um tweet sobre inteligencia artificial e machine learning',
        timestamp: new Date().toISOString()
      }

      const result = await generateAnswer({
        ancestors: [tweetAncestor],
        prompt: 'O que isso significa?'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('O tweet original menciona:')
    })

    it('should truncate long tweet text in response', async () => {
      const longTweetText = 'A'.repeat(200)
      const tweetAncestor: TweetData = {
        type: 'tweet',
        flowId: 'test-flow',
        url: 'https://twitter.com/test/status/123',
        status: 'loaded',
        author: { name: 'Test User', handle: '@testuser', avatar: 'avatar.png' },
        text: longTweetText,
        timestamp: new Date().toISOString()
      }

      const result = await generateAnswer({
        ancestors: [tweetAncestor],
        prompt: 'Explique isso'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('...')
      expect(result.content).not.toContain(longTweetText)
    })
  })

  describe('Context Analysis - Question Context', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should use withPreviousQA template when question ancestor is present', async () => {
      const questionAncestor: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'O que e machine learning?',
        response: 'Machine learning e uma area da IA que permite sistemas aprenderem com dados.',
        status: 'done'
      }

      const result = await generateAnswer({
        ancestors: [questionAncestor],
        prompt: 'Como isso se aplica na pratica?'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('pergunta anterior')
    })

    it('should include reference to last question prompt', async () => {
      const questionAncestor: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'Primeira pergunta sobre IA',
        response: 'Resposta sobre IA',
        status: 'done'
      }

      const result = await generateAnswer({
        ancestors: [questionAncestor],
        prompt: 'Segunda pergunta'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('Primeira pergunta sobre IA')
    })

    it('should ignore questions that are not done', async () => {
      const draftQuestion: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'Draft question',
        response: null,
        status: 'draft'
      }

      const result = await generateAnswer({
        ancestors: [draftQuestion],
        prompt: 'Nova pergunta'
      })

      expect(result.success).toBe(true)
      expect(result.content).not.toContain('pergunta anterior')
    })
  })

  describe('Context Analysis - Note Context', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should acknowledge notes in response', async () => {
      const noteAncestor: NoteData = {
        type: 'note',
        flowId: 'test-flow',
        content: 'Minhas anotacoes sobre o tema',
        isEditing: false
      }

      const result = await generateAnswer({
        ancestors: [noteAncestor],
        prompt: 'Como posso aplicar isso?'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('anotacoes')
    })
  })

  describe('Context Analysis - Mixed Context', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should prioritize tweet over question context for template selection', async () => {
      const tweetAncestor: TweetData = {
        type: 'tweet',
        flowId: 'test-flow',
        url: 'https://twitter.com/test/status/123',
        status: 'loaded',
        author: { name: 'Test User', handle: '@testuser', avatar: 'avatar.png' },
        text: 'Tweet sobre tecnologia',
        timestamp: new Date().toISOString()
      }
      const questionAncestor: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'Pergunta anterior',
        response: 'Resposta anterior',
        status: 'done'
      }

      const result = await generateAnswer({
        ancestors: [tweetAncestor, questionAncestor],
        prompt: 'Nova pergunta'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('O tweet original menciona:')
      expect(result.content).toContain('pergunta anterior')
    })

    it('should include all context types in response', async () => {
      const tweetAncestor: TweetData = {
        type: 'tweet',
        flowId: 'test-flow',
        url: 'https://twitter.com/test/status/123',
        status: 'loaded',
        author: { name: 'Test User', handle: '@testuser', avatar: 'avatar.png' },
        text: 'Tweet content',
        timestamp: new Date().toISOString()
      }
      const questionAncestor: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'Previous question',
        response: 'Previous response',
        status: 'done'
      }
      const noteAncestor: NoteData = {
        type: 'note',
        flowId: 'test-flow',
        content: 'My notes',
        isEditing: false
      }

      const result = await generateAnswer({
        ancestors: [tweetAncestor, questionAncestor, noteAncestor],
        prompt: 'Final question'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('tweet')
      expect(result.content).toContain('pergunta anterior')
      expect(result.content).toContain('anotacoes')
    })
  })

  describe('formatContextForDebug', () => {
    it('should format empty context correctly', () => {
      const result = formatContextForDebug({
        ancestors: [],
        prompt: 'Test prompt'
      })

      expect(result).toContain('=== AI CONTEXT ===')
      expect(result).toContain('--- ANCESTORS ---')
      expect(result).toContain('--- PROMPT ---')
      expect(result).toContain('Test prompt')
    })

    it('should format tweet ancestor correctly', () => {
      const tweetAncestor: TweetData = {
        type: 'tweet',
        flowId: 'test-flow',
        url: 'https://twitter.com/test/status/123',
        status: 'loaded',
        author: { name: 'Test User', handle: '@testuser', avatar: 'avatar.png' },
        text: 'Tweet content here',
        timestamp: new Date().toISOString()
      }

      const result = formatContextForDebug({
        ancestors: [tweetAncestor],
        prompt: 'My question'
      })

      expect(result).toContain('[TWEET] @@testuser: Tweet content here')
      expect(result).toContain('My question')
    })

    it('should format question ancestor correctly', () => {
      const questionAncestor: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'Previous question',
        response: 'Previous answer',
        status: 'done'
      }

      const result = formatContextForDebug({
        ancestors: [questionAncestor],
        prompt: 'New question'
      })

      expect(result).toContain('[Q] Previous question')
      expect(result).toContain('[A] Previous answer')
    })

    it('should format note ancestor correctly', () => {
      const noteAncestor: NoteData = {
        type: 'note',
        flowId: 'test-flow',
        content: 'Note content here',
        isEditing: false
      }

      const result = formatContextForDebug({
        ancestors: [noteAncestor],
        prompt: 'Question'
      })

      expect(result).toContain('[NOTE] Note content here')
    })

    it('should not format unloaded tweets', () => {
      const emptyTweet: TweetData = {
        type: 'tweet',
        flowId: 'test-flow',
        url: '',
        status: 'empty'
      }

      const result = formatContextForDebug({
        ancestors: [emptyTweet],
        prompt: 'Question'
      })

      expect(result).not.toContain('[TWEET]')
    })

    it('should not format draft questions', () => {
      const draftQuestion: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'Draft prompt',
        response: null,
        status: 'draft'
      }

      const result = formatContextForDebug({
        ancestors: [draftQuestion],
        prompt: 'New question'
      })

      expect(result).not.toContain('[Q] Draft prompt')
    })
  })

  describe('Response Structure', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should have correct structure on success', async () => {
      const result = await generateAnswer({
        ancestors: [],
        prompt: 'Valid question'
      })

      expect(result).toHaveProperty('success', true)
      expect(result).toHaveProperty('content')
      expect(result.error).toBeUndefined()
    })

    it('should have correct structure on validation error', async () => {
      const result = await generateAnswer({
        ancestors: [],
        prompt: ''
      })

      expect(result).toHaveProperty('success', false)
      expect(result).toHaveProperty('error')
      expect(result.content).toBeUndefined()
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should handle empty ancestors array', async () => {
      const result = await generateAnswer({
        ancestors: [],
        prompt: 'Question without context'
      })

      expect(result.success).toBe(true)
      expect(result.content).toBeDefined()
    })

    it('should handle very long prompt', async () => {
      const longPrompt = 'A'.repeat(1000)

      const result = await generateAnswer({
        ancestors: [],
        prompt: longPrompt
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain(longPrompt)
    })

    it('should handle special characters in prompt', async () => {
      const result = await generateAnswer({
        ancestors: [],
        prompt: 'What about "quotes" and {braces} and $pecial chars?'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('What about "quotes" and {braces} and $pecial chars?')
    })

    it('should handle multiple questions in ancestors (uses last one)', async () => {
      const question1: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'First question',
        response: 'First response',
        status: 'done'
      }
      const question2: QuestionData = {
        type: 'question',
        flowId: 'test-flow',
        prompt: 'Second question - this should appear',
        response: 'Second response',
        status: 'done'
      }

      const result = await generateAnswer({
        ancestors: [question1, question2],
        prompt: 'Third question'
      })

      expect(result.success).toBe(true)
      expect(result.content).toContain('Second question - this should appear')
    })
  })
})
