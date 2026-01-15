import { useMutation } from '@tanstack/react-query'
import { fetchTweet, type TweetResponse } from '../services/tweetService'

/**
 * Hook to load tweet data using TanStack Query mutation.
 *
 * Usage:
 * ```tsx
 * const { mutate: loadTweet, isPending, error } = useLoadTweet()
 *
 * loadTweet(url, {
 *   onSuccess: (data) => { ... },
 *   onError: (error) => { ... }
 * })
 * ```
 */
export function useLoadTweet() {
  return useMutation<TweetResponse, Error, string>({
    mutationFn: fetchTweet,
  })
}
