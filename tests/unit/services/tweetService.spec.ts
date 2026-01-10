import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  extractTweetId,
  isValidTweetUrl,
  fetchTweet,
  formatTweetTimestamp
} from '@/services/tweetService'

describe('Tweet Service', () => {
  describe('extractTweetId', () => {
    it('should extract ID from twitter.com URL', () => {
      const result = extractTweetId('https://twitter.com/elonmusk/status/1234567890')
      expect(result).toBe('1234567890')
    })

    it('should extract ID from x.com URL', () => {
      const result = extractTweetId('https://x.com/sama/status/9876543210')
      expect(result).toBe('9876543210')
    })

    it('should extract ID from URL with query parameters', () => {
      const result = extractTweetId('https://twitter.com/user/status/123?s=20&t=abc')
      expect(result).toBe('123')
    })

    it('should return null for invalid URL', () => {
      const result = extractTweetId('https://google.com')
      expect(result).toBeNull()
    })

    it('should return null for random text', () => {
      const result = extractTweetId('random text')
      expect(result).toBeNull()
    })

    it('should return null for empty string', () => {
      const result = extractTweetId('')
      expect(result).toBeNull()
    })

    it('should return null for URL without status ID', () => {
      const result = extractTweetId('https://twitter.com/elonmusk')
      expect(result).toBeNull()
    })
  })

  describe('isValidTweetUrl', () => {
    it('should return true for valid twitter.com URL', () => {
      const result = isValidTweetUrl('https://twitter.com/elonmusk/status/123')
      expect(result).toBe(true)
    })

    it('should return true for valid x.com URL', () => {
      const result = isValidTweetUrl('https://x.com/sama/status/456')
      expect(result).toBe(true)
    })

    it('should return false for google.com', () => {
      const result = isValidTweetUrl('https://google.com')
      expect(result).toBe(false)
    })

    it('should return false for random text', () => {
      const result = isValidTweetUrl('random text')
      expect(result).toBe(false)
    })

    it('should return false for empty string', () => {
      const result = isValidTweetUrl('')
      expect(result).toBe(false)
    })

    it('should return false for twitter profile URL', () => {
      const result = isValidTweetUrl('https://twitter.com/elonmusk')
      expect(result).toBe(false)
    })
  })

  describe('fetchTweet', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should return error for invalid URL', async () => {
      const result = await fetchTweet('invalid-url')

      expect(result.success).toBe(false)
      expect(result.error).toContain('URL invalida')
    })

    it('should return success with data for valid twitter.com URL', async () => {
      const result = await fetchTweet('https://twitter.com/test/status/12345')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.url).toBe('https://twitter.com/test/status/12345')
      expect(result.data?.author).toBeDefined()
      expect(result.data?.author?.name).toBeTruthy()
      expect(result.data?.author?.handle).toBeTruthy()
      expect(result.data?.author?.avatar).toBeTruthy()
      expect(result.data?.text).toBeTruthy()
      expect(result.data?.timestamp).toBeTruthy()
    })

    it('should return success with data for valid x.com URL', async () => {
      const result = await fetchTweet('https://x.com/user/status/67890')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.url).toBe('https://x.com/user/status/67890')
    })

    it('should return deterministic mock data based on tweet ID', async () => {
      const result1 = await fetchTweet('https://twitter.com/test/status/11111')
      const result2 = await fetchTweet('https://twitter.com/other/status/11111')

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      expect(result1.data?.author?.name).toBe(result2.data?.author?.name)
      expect(result1.data?.text).toBe(result2.data?.text)
    })

    it('should return valid ISO timestamp', async () => {
      const result = await fetchTweet('https://twitter.com/test/status/12345')

      expect(result.success).toBe(true)
      const date = new Date(result.data!.timestamp!)
      expect(date.toISOString()).toBe(result.data!.timestamp)
    })

    it('should return timestamp within last 30 days', async () => {
      const result = await fetchTweet('https://twitter.com/test/status/12345')

      expect(result.success).toBe(true)

      const timestamp = new Date(result.data!.timestamp!)
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      expect(timestamp.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime())
      expect(timestamp.getTime()).toBeLessThanOrEqual(now.getTime())
    })
  })

  describe('formatTweetTimestamp', () => {
    it('should format timestamp less than 1 hour as minutes', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const result = formatTweetTimestamp(thirtyMinutesAgo)

      expect(result).toMatch(/^\d+m$/)
    })

    it('should format timestamp less than 24 hours as hours', () => {
      const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      const result = formatTweetTimestamp(fiveHoursAgo)

      expect(result).toBe('5h')
    })

    it('should format timestamp less than 7 days as days', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      const result = formatTweetTimestamp(threeDaysAgo)

      expect(result).toBe('3d')
    })

    it('should format timestamp more than 7 days as date', () => {
      const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      const result = formatTweetTimestamp(fifteenDaysAgo)

      expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/)
    })

    it('should handle edge case at 1 hour boundary', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const result = formatTweetTimestamp(oneHourAgo)

      expect(result).toBe('1h')
    })

    it('should handle edge case at 24 hour boundary', () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const result = formatTweetTimestamp(oneDayAgo)

      expect(result).toBe('1d')
    })

    it('should handle zero minutes', () => {
      const now = new Date().toISOString()
      const result = formatTweetTimestamp(now)

      expect(result).toBe('0m')
    })
  })

  describe('Mock Data Quality', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should have valid avatar URLs', async () => {
      const result = await fetchTweet('https://twitter.com/test/status/12345')

      expect(result.success).toBe(true)
      expect(result.data?.author?.avatar).toMatch(/^https:\/\//)
    })

    it('should have handle starting with @', async () => {
      const result = await fetchTweet('https://twitter.com/test/status/12345')

      expect(result.success).toBe(true)
      expect(result.data?.author?.handle).toMatch(/^@/)
    })

    it('should have realistic tweet texts (> 20 chars)', async () => {
      const result = await fetchTweet('https://twitter.com/test/status/12345')

      expect(result.success).toBe(true)
      expect(result.data?.text?.length).toBeGreaterThan(20)
    })
  })

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should handle URL without protocol', async () => {
      const result = await fetchTweet('twitter.com/user/status/123')

      expect(result.success).toBe(true)
      expect(result.data?.url).toBe('twitter.com/user/status/123')
    })

    it('should handle URL with http (not https)', async () => {
      const result = await fetchTweet('http://twitter.com/user/status/123')

      expect(result.success).toBe(true)
    })

    it('should handle URL with trailing slash', async () => {
      const result = await fetchTweet('https://twitter.com/user/status/123/')

      expect(result.success).toBe(true)
    })
  })
})
