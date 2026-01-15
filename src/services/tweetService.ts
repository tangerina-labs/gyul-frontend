/**
 * Tweet Service - Mock implementation for MVP
 *
 * Provides URL validation and mock tweet data.
 * Returns deterministic data based on tweet ID for consistency.
 */

export interface TweetAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TweetResponse {
  author: TweetAuthor
  text: string
  timestamp: string
}

export interface TweetValidationResult {
  valid: boolean
  error?: string
}

// Regex to validate Twitter/X URLs
const TWEET_URL_REGEX = /^https:\/\/(twitter\.com|x\.com)\/(\w+)\/status\/(\d+)/

/**
 * Validates a tweet URL format.
 * Accepts twitter.com and x.com URLs with /status/[id] pattern.
 */
export function validateTweetUrl(url: string): TweetValidationResult {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'URL nao pode estar vazia' }
  }

  const trimmedUrl = url.trim()

  // Check for https protocol
  if (!trimmedUrl.startsWith('https://')) {
    return {
      valid: false,
      error: 'URL deve usar protocolo HTTPS',
    }
  }

  // Check for valid Twitter/X domain and format
  if (!TWEET_URL_REGEX.test(trimmedUrl)) {
    return {
      valid: false,
      error: 'URL invalida. Use: https://twitter.com/user/status/123',
    }
  }

  return { valid: true }
}

/**
 * Extracts the tweet ID from a valid URL.
 * Returns null if URL is invalid.
 */
export function extractTweetId(url: string): string | null {
  const match = url.match(TWEET_URL_REGEX)
  return match ? match[3] : null
}

/**
 * Extracts the username from a valid URL.
 * Returns null if URL is invalid.
 */
export function extractUsername(url: string): string | null {
  const match = url.match(TWEET_URL_REGEX)
  return match ? match[2] : null
}

/**
 * Simple hash function to generate deterministic values from tweet ID.
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Generates a mock author name based on the username.
 */
function generateMockName(username: string): string {
  // Capitalize first letter and add some variation
  const names = [
    username.charAt(0).toUpperCase() + username.slice(1),
    `${username.charAt(0).toUpperCase()}. ${username.slice(1)}`,
    username.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  ]
  const hash = hashCode(username)
  return names[hash % names.length]
}

/**
 * Generates mock tweet text based on the tweet ID.
 */
function generateMockTweet(tweetId: string): string {
  const tweets = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum facilisis lorem nec sapien ultrices, nec tempus ex accumsan. Mauris euismod suscipit velit, ut rhoncus justo viverra eu. Etiam sodales risus et odio dictum, sit amet dictum odio rutrum. Pellentesque at ex eget dolor viverra hendrerit. Aliquam facilisis, magna nec feugiat cursus, enim lectus euismod nulla, vel finibus sapien augue non urna. Suspendisse vel sollicitudin mauris, ac tempus lorem. Vestibulum euismod, est sit amet tincidunt molestie, libero justo dictum enim, ut tristique ex risus in nibh. In aliquam erat eu elit tristique, nec euismod nulla pharetra. Cras pulvinar felis ac felis malesuada, eget dictum purus efficitur. Suspendisse potenti. Morbi euismod maximus ante vel efficitur. Proin ultricies nec elit ut commodo. Integer nec massa nec diam lacinia sodales nec non erat. In nec posuere ante. Aliquam erat volutpat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tincidunt pulvinar massa, vitae pulvinar mi accumsan non. Integer porta, massa non dictum cursus, risus enim ultricies urna, non pretium felis sem vitae neque. Aliquam suscipit ex eu urna rhoncus porttitor. Pellentesque viverra, ante ac interdum eleifend, ligula nisi dictum libero, id bibendum ante eros sed elit.',
    'Este é um tweet mockado para demonstração. O conteúdo real seria carregado da API do Twitter.',
    'Explorando ideias interessantes sobre tecnologia, design e inovação. O que você acha?',
    'Nulla facilisi. Pellentesque viverra ultricies erat, vitae dictum magna accumsan sit amet. Curabitur aliquam orci nec velit faucibus, eget facilisis ipsum dictum. Sed posuere turpis et varius dictum. Curabitur vulputate, odio non feugiat pretium, felis orci sagittis sem, in blandit ipsum lectus quis lectus. Integer commodo, urna nec cursus pharetra, lacus enim vulputate urna, et sodales diam eros eu elit. Vestibulum consequat arcu a lacus sollicitudin tristique. Maecenas luctus, risus at vehicula commodo, nibh nulla mollis nisi, nec commodo massa sem vitae turpis. Aliquam non metus eu metus blandit finibus. Integer feugiat quam at sem gravida, ac dictum enim euismod. Fusce euismod auctor rutrum. Mauris vel eleifend ex, id dictum ex. Aenean bibendum fermentum lobortis. Vivamus id erat neque. Suspendisse molestie commodo tellus. In egestas sollicitudin sapien quis dictum. Pellentesque scelerisque pharetra lacus. Aliquam et velit et nisi convallis molestie. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem, quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum, quia dolor sit, amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur? Fusce posuere nulla massa, eu dignissim ex laoreet eu. Vestibulum vel porta nulla, quis facilisis massa.',
  ]
  const hash = hashCode(tweetId)
  return tweets[hash % tweets.length]
}

/**
 * Generates a mock date based on the tweet ID.
 * Returns a date string in pt-BR format.
 */
function generateMockDate(tweetId: string): string {
  const hash = hashCode(tweetId)
  // Generate a date within the last year
  const daysAgo = hash % 365
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Checks if running in Playwright test environment.
 */
function isTestEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  return (window as Window & { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ === true
}

/**
 * Fetches tweet data (mock implementation).
 *
 * - Validates URL format
 * - Returns deterministic mock data based on tweet ID
 * - Simulates network delay (800ms in production, 0ms in tests)
 */
export async function fetchTweet(url: string): Promise<TweetResponse> {
  // Validate URL first
  const validation = validateTweetUrl(url)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  const tweetId = extractTweetId(url)
  const username = extractUsername(url)

  if (!tweetId || !username) {
    throw new Error('Nao foi possivel extrair dados da URL')
  }

  // Simulate network delay (skip in test environment)
  const delay = isTestEnvironment() ? 0 : 800
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // Generate deterministic mock data
  return {
    author: {
      name: generateMockName(username),
      handle: username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    },
    text: generateMockTweet(tweetId),
    timestamp: generateMockDate(tweetId),
  }
}
