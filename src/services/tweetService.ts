import type { TweetData } from '@/types'

export interface TweetFetchResult {
  success: boolean
  data?: Omit<TweetData, 'type' | 'status' | 'flowId'>
  error?: string
}

const isTestEnv = typeof window !== 'undefined' && (window as any).__PLAYWRIGHT_TEST__
const MOCK_DELAY = isTestEnv ? 0 : 800
const TWEET_URL_REGEX = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/

const MOCK_AUTHORS = [
  { name: 'Elon Musk', handle: '@elonmusk', avatar: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg' },
  { name: 'Sam Altman', handle: '@sama', avatar: 'https://pbs.twimg.com/profile_images/804990434455887872/BG0Xh7Oa_400x400.jpg' },
  { name: 'Andrej Karpathy', handle: '@karpathy', avatar: 'https://pbs.twimg.com/profile_images/1296667294148382721/9Pr6XrPB_400x400.jpg' },
  { name: 'Yann LeCun', handle: '@ylecun', avatar: 'https://pbs.twimg.com/profile_images/1483577865056702469/rWA-3_T7_400x400.jpg' },
  { name: 'Naval', handle: '@naval', avatar: 'https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg' }
]

const MOCK_TWEETS = [
  'The most powerful force in the universe is compound interest. But the second most powerful is compound learning.',
  'AI will be the most transformative technology in human history. We are just getting started.',
  'The best way to predict the future is to create it. Start building today.',
  'Simplicity is the ultimate sophistication. Always look for ways to remove complexity.',
  'The people who are crazy enough to think they can change the world are the ones who do.',
  'Every great developer you know got there by solving problems they were unqualified to solve until they actually did it.',
  'The secret to doing good research is always to be a little underemployed. You waste years by not being able to waste hours.',
  'In the long run, the most unpleasant truth is a far safer companion than a pleasant lie.'
]

export function extractTweetId(url: string): string | null {
  const match = url.match(TWEET_URL_REGEX)
  return match?.[1] ?? null
}

export function isValidTweetUrl(url: string): boolean {
  return TWEET_URL_REGEX.test(url)
}

export async function fetchTweet(url: string): Promise<TweetFetchResult> {
  const tweetId = extractTweetId(url)

  if (!tweetId) {
    return {
      success: false,
      error: 'URL invalida. Use uma URL do Twitter/X no formato: https://twitter.com/user/status/123'
    }
  }

  await delay(MOCK_DELAY)

  const mockData = generateMockTweet(tweetId, url)

  return {
    success: true,
    data: mockData
  }
}

function generateMockTweet(
  tweetId: string,
  url: string
): Omit<TweetData, 'type' | 'status' | 'flowId'> {
  // Use ID as seed for deterministic selection
  const seed = parseInt(tweetId.slice(-4)) || 0

  const author = MOCK_AUTHORS[seed % MOCK_AUTHORS.length]
  const text = MOCK_TWEETS[seed % MOCK_TWEETS.length]

  const daysAgo = seed % 30
  const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

  return {
    url,
    author,
    text,
    timestamp
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function formatTweetTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes}m`
  }

  if (diffHours < 24) {
    return `${diffHours}h`
  }

  if (diffDays < 7) {
    return `${diffDays}d`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
