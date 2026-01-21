import { useState, useCallback, type FormEvent, type KeyboardEvent } from 'react'
import { useEditor } from 'tldraw'
import type { TweetShape } from '../../types/shapes'
import { useLoadTweet } from '../../hooks/useTweet'
import { useAutoHeight } from '../../hooks/useAutoHeight'
import { BaseCard } from '../ui/BaseCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ExpandableText } from '../ui/ExpandableText'
import { AddChildButton } from './AddChildButton'
import { Interactive } from '../ui/Interactive'

interface TweetCardProps {
  shape: TweetShape
}

/** Minimum height for auto-sizing */
const MIN_HEIGHT = 150

/**
 * Tweet card component that renders different states:
 * - empty: URL input form
 * - loading: Spinner with loading message
 * - loaded: Tweet content with author, text, timestamp
 * - error: Error message with retry option
 *
 * Height is automatically measured and synced to shape via useAutoHeight.
 */
export function TweetCard({ shape }: TweetCardProps) {
  const editor = useEditor()
  const { mutate: loadTweet, isPending } = useLoadTweet()
  const [url, setUrl] = useState(shape.props.url)
  const autoHeightRef = useAutoHeight(shape.id, 'tweet', MIN_HEIGHT)

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault()

      if (!url.trim() || isPending) return

      // Update shape to loading state
      editor.updateShape<TweetShape>({
        id: shape.id,
        type: 'tweet',
        props: {
          status: 'loading',
          url: url.trim(),
        },
      })

      loadTweet(url.trim(), {
        onSuccess: (data) => {
          editor.updateShape<TweetShape>({
            id: shape.id,
            type: 'tweet',
            props: {
              status: 'loaded',
              author: data.author,
              text: data.text,
              timestamp: data.timestamp,
            },
          })
        },
        onError: (error) => {
          editor.updateShape<TweetShape>({
            id: shape.id,
            type: 'tweet',
            props: {
              status: 'error',
              error: error.message,
            },
          })
        },
      })
    },
    [editor, shape.id, url, loadTweet, isPending]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  // Empty state - show URL input
  if (shape.props.status === 'empty') {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="tweet-card"
          data-shape-id={shape.id}
          borderColor="var(--gray-300)"
          borderStyle="dashed"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <TwitterIcon />
              <span className="text-sm font-medium">Tweet</span>
            </div>

            <Interactive>
              <input
                data-testid="tweet-url-input"
                type="text"
                placeholder="Cole a URL do tweet"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="
                  w-full rounded-md border border-gray-300 px-3 py-2
                  text-sm placeholder-gray-400
                  focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                "
                autoFocus
              />
            </Interactive>

            <Interactive>
              <button
                data-testid="tweet-submit-btn"
                type="submit"
                disabled={!url.trim()}
                className="
                  w-full rounded-md bg-indigo-600 px-4 py-2
                  text-sm font-medium text-white
                  transition-colors duration-150
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500
                "
              >
                Carregar
              </button>
            </Interactive>
          </form>
        </BaseCard>
      </div>
    )
  }

  // Loading state - show spinner
  if (shape.props.status === 'loading') {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="tweet-card"
          data-shape-id={shape.id}
          borderColor="var(--color-loading)"
          className="animate-pulse-border"
        >
          <div
            data-testid="tweet-loading"
            className="flex flex-col items-center justify-center gap-3 py-8"
          >
            <LoadingSpinner
              data-testid="tweet-loading-spinner"
              size={32}
              color="var(--color-loading)"
            />
            <span className="text-sm text-gray-500">Carregando tweet...</span>
          </div>
        </BaseCard>
      </div>
    )
  }

  // Error state - show error message with retry
  if (shape.props.status === 'error') {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="tweet-card"
          data-shape-id={shape.id}
          borderColor="var(--color-error)"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <TwitterIcon />
              <span className="text-sm font-medium">Tweet</span>
            </div>

            <div
              data-testid="tweet-error-message"
              className="rounded-md bg-red-50 p-3 text-sm text-red-600"
            >
              {shape.props.error || 'Erro ao carregar tweet'}
            </div>

            <Interactive>
              <input
                data-testid="tweet-url-input"
                type="text"
                placeholder="Cole a URL do tweet"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                className="
                  w-full rounded-md border border-red-300 px-3 py-2
                  text-sm placeholder-gray-400
                  focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500
                "
              />
            </Interactive>

            <Interactive>
              <button
                data-testid="tweet-retry-btn"
                type="submit"
                disabled={!url.trim()}
                className="
                  w-full rounded-md bg-indigo-600 px-4 py-2
                  text-sm font-medium text-white
                  transition-colors duration-150
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500
                "
              >
                Tentar novamente
              </button>
            </Interactive>
          </form>
        </BaseCard>
      </div>
    )
  }

  // Loaded state - show tweet content
  if (shape.props.status === 'loaded' && shape.props.author) {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="tweet-card"
          data-shape-id={shape.id}
          borderColor="var(--color-tweet)"
          style={{
            border: '3px solid var(--color-tweet)',
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.15)',
          }}
        >
          <div className="flex flex-col gap-3">
            {/* Header with author info */}
            <div className="flex items-start justify-between">
              <div data-testid="tweet-author" className="flex items-center gap-3">
                <img
                  data-testid="tweet-author-avatar"
                  src={shape.props.author.avatar}
                  alt={shape.props.author.name}
                  className="h-12 w-12 rounded-full bg-gray-200"
                />
                <div>
                  <div
                    data-testid="tweet-author-name"
                    className="font-semibold text-gray-900"
                  >
                    {shape.props.author.name}
                  </div>
                  <div
                    data-testid="tweet-author-handle"
                    className="text-sm text-gray-500"
                  >
                    @{shape.props.author.handle}
                  </div>
                </div>
              </div>
              <TwitterIcon className="h-5 w-5 text-indigo-500" />
            </div>

            {/* Tweet text with expandable support */}
            <ExpandableText
              data-testid="tweet-text"
              text={shape.props.text || ''}
              maxLines={5}
              className="text-gray-700"
            />

            {/* Footer with timestamp and add child button */}
            <div
              data-testid="tweet-footer"
              className="flex items-center justify-between border-t border-gray-100 pt-3"
            >
              <span
                data-testid="tweet-timestamp"
                className="text-xs text-gray-400"
              >
                {shape.props.timestamp}
              </span>
              <AddChildButton shapeId={shape.id} data-testid="tweet-add-child-btn" />
            </div>
          </div>
        </BaseCard>
      </div>
    )
  }

  // Fallback
  return null
}

/**
 * Twitter/X icon component
 */
function TwitterIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      data-testid="tweet-x-icon"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
