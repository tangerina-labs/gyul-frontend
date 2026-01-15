import { useState, useCallback, useEffect, useRef, type KeyboardEvent } from 'react'
import { useEditor } from 'tldraw'
import type { NoteShape } from '../../types/shapes'
import { useAutoHeight } from '../../hooks/useAutoHeight'
import { BaseCard } from '../ui/BaseCard'
import { AddChildButton } from './AddChildButton'
import { Interactive } from '../ui/Interactive'

interface NoteCardProps {
  shape: NoteShape
}

const MAX_CONTENT_LENGTH = 1000

/** Minimum height for auto-sizing - ensures footer has space */
const MIN_HEIGHT = 120

/**
 * Note card component that renders different states:
 * - editing: Textarea for writing annotation (only during creation)
 * - readonly: Static text display with add child button
 *
 * Note: After finalization, the note becomes permanently readonly.
 * Empty notes are automatically removed.
 *
 * Height is automatically measured and synced to shape via useAutoHeight.
 * Footer is anchored to bottom when content is small.
 */
export function NoteCard({ shape }: NoteCardProps) {
  const editor = useEditor()
  const [content, setContent] = useState(shape.props.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoHeightRef = useAutoHeight(shape.id, 'note', MIN_HEIGHT)

  // Auto-focus textarea when in editing mode
  useEffect(() => {
    if (shape.props.isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [shape.props.isEditing])

  const finalize = useCallback(() => {
    const trimmed = content.trim()

    if (!trimmed) {
      // Remove shape if content is empty
      editor.deleteShape(shape.id)
      return
    }

    // Update shape to readonly state
    editor.updateShape<NoteShape>({
      id: shape.id,
      type: 'note',
      props: {
        content: trimmed,
        isEditing: false,
      },
    })
  }, [editor, shape.id, content])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter without Shift finalizes the note
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        finalize()
      }

      // Escape also finalizes
      if (e.key === 'Escape') {
        e.preventDefault()
        finalize()
      }
    },
    [finalize]
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Limit content to MAX_CONTENT_LENGTH
    const newContent = e.target.value
    if (newContent.length <= MAX_CONTENT_LENGTH) {
      setContent(newContent)
    } else {
      setContent(newContent.slice(0, MAX_CONTENT_LENGTH))
    }
  }, [])

  // Editing state - show textarea
  if (shape.props.isEditing) {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="note-card"
          borderColor={content.trim() ? 'var(--color-note)' : 'var(--gray-300)'}
          className="bg-amber-50"
          minHeight={MIN_HEIGHT}
        >
          <div className="flex flex-col gap-2 h-full">
            {/* Textarea */}
            <Interactive>
              <textarea
                ref={textareaRef}
                data-testid="note-textarea"
                placeholder="Adicione sua anotacao..."
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={finalize}
                className="
                  w-full min-h-[80px] bg-transparent flex-1
                  text-sm text-gray-700 placeholder-gray-400
                  resize-none border-none outline-none
                  focus:outline-none
                "
                maxLength={MAX_CONTENT_LENGTH}
              />
            </Interactive>

            {/* Hints - anchored at bottom */}
            <span
              data-testid="note-hint"
              className="text-xs text-gray-400 mt-auto"
            >
              Enter para salvar, Shift+Enter para nova linha
            </span>
          </div>
        </BaseCard>
      </div>
    )
  }

  // Readonly state - show static text and add child button
  return (
    <div ref={autoHeightRef}>
      <BaseCard
        data-testid="note-card"
        borderColor="var(--gray-300)"
        className="bg-amber-50"
        minHeight={MIN_HEIGHT}
      >
        <div className="flex flex-col h-full" style={{ minHeight: MIN_HEIGHT - 32 }}>
          {/* Content - takes available space */}
          <div
            data-testid="note-content"
            className="text-sm text-gray-700 whitespace-pre-wrap break-words flex-1"
          >
            {shape.props.content}
          </div>

          {/* Footer with add child button - anchored at bottom */}
          <div className="flex items-center justify-end border-t border-gray-100 pt-2 mt-auto">
            <AddChildButton
              shapeId={shape.id}
              data-testid="note-add-child-btn"
            />
          </div>
        </div>
      </BaseCard>
    </div>
  )
}
