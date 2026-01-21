import { useState, useRef, useEffect, type HTMLAttributes } from 'react'
import { Interactive } from './Interactive'

interface ExpandableTextProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  maxLines?: number
}

/**
 * Component for displaying long text with "Ver mais/menos" toggle.
 * Automatically detects if text needs truncation based on line count.
 */
export function ExpandableText({
  text,
  maxLines = 5,
  className = '',
  ...props
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      // Use requestAnimationFrame to ensure layout is complete
      const frame = requestAnimationFrame(() => {
        if (textRef.current) {
          const lineHeight = parseInt(getComputedStyle(textRef.current).lineHeight) || 22
          const maxHeight = lineHeight * maxLines
          setNeedsTruncation(textRef.current.scrollHeight > maxHeight)
        }
      })
      return () => cancelAnimationFrame(frame)
    }
  }, [text, maxLines])

  return (
    <div className={className} {...props}>
      <div
        ref={textRef}
        data-testid="expandable-text-content"
        className={`whitespace-pre-wrap leading-relaxed ${
          !expanded && needsTruncation ? `line-clamp-${maxLines}` : ''
        }`}
        style={
          !expanded && needsTruncation
            ? {
                display: '-webkit-box',
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }
            : undefined
        }
      >
        {text}
      </div>

      {needsTruncation && (
        <Interactive>
          <button
            type="button"
            data-testid="expandable-text-toggle"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        </Interactive>
      )}
    </div>
  )
}
