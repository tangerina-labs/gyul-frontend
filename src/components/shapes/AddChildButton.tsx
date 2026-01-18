import { useState, useCallback, useRef, useLayoutEffect, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { useEditor } from 'tldraw'
import { Interactive } from '../ui/Interactive'
import { ShapeTypeMenu } from '../canvas/ShapeTypeMenu'
import { createChildShape } from '../../utils/shapeChildCreation'
import type { ShapeType } from '../../types/shapes'

// Menu dimensions - adjust based on actual ShapeTypeMenu size
const MENU_WIDTH = 160
const MENU_HEIGHT = 120
const MENU_GAP = 4
const VIEWPORT_PADDING = 8

interface AddChildButtonProps extends HTMLAttributes<HTMLButtonElement> {
  shapeId: string
  disabled?: boolean
  'data-testid'?: string
}

/**
 * Calculates optimal menu position to keep it within viewport bounds.
 * Tries to position menu below button first, then above if no space.
 * Adjusts horizontal position if menu would overflow.
 */
function calculateMenuPosition(
  buttonRect: DOMRect,
  menuWidth: number,
  menuHeight: number,
  gap: number
): { x: number; y: number } {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  }

  let x = buttonRect.left
  let y = buttonRect.bottom + gap

  // Check vertical overflow
  if (y + menuHeight > viewport.height - VIEWPORT_PADDING) {
    // Try positioning above button
    const yAbove = buttonRect.top - menuHeight - gap
    if (yAbove >= VIEWPORT_PADDING) {
      y = yAbove
    } else {
      // Not enough space above or below, clamp to viewport
      y = Math.max(VIEWPORT_PADDING, viewport.height - menuHeight - VIEWPORT_PADDING)
    }
  }

  // Check horizontal overflow
  if (x + menuWidth > viewport.width - VIEWPORT_PADDING) {
    // Align to right edge of button
    x = buttonRect.right - menuWidth
    
    // If still overflows left, clamp to viewport
    if (x < VIEWPORT_PADDING) {
      x = VIEWPORT_PADDING
    }
  }

  return { x, y }
}

/**
 * Button for creating child shapes.
 * Opens a dropdown menu to select shape type, then creates child + arrow automatically.
 */
export function AddChildButton({
  shapeId,
  disabled = false,
  'data-testid': testId,
  ...props
}: AddChildButtonProps) {
  const editor = useEditor()
  const [showMenu, setShowMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = useCallback(() => {
    if (disabled) return
    
    // Calculate optimal menu position
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      const position = calculateMenuPosition(rect, MENU_WIDTH, MENU_HEIGHT, MENU_GAP)
      setMenuPosition(position)
    }
    
    setShowMenu(true)
  }, [disabled])

  const handleSelectType = useCallback(
    (type: ShapeType) => {
      // Criar shape filho + arrow
      const result = createChildShape(editor, shapeId, type)

      if (result) {
        // Sucesso - menu fecha automaticamente
        setShowMenu(false)
      } else {
        // Falha - fechar menu e log de erro já foi feito
        console.error('Failed to create child shape')
        setShowMenu(false)
      }
    },
    [editor, shapeId]
  )

  const handleCloseMenu = useCallback(() => {
    setShowMenu(false)
  }, [])

  // Update menu position if button moves (zoom, pan, etc)
  useLayoutEffect(() => {
    if (!showMenu || !buttonRef.current) return

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (rect) {
        const position = calculateMenuPosition(rect, MENU_WIDTH, MENU_HEIGHT, MENU_GAP)
        setMenuPosition(position)
      }
    }

    // Initial position
    updatePosition()

    // Observe button position changes
    const observer = new ResizeObserver(updatePosition)
    observer.observe(buttonRef.current)

    // Also listen to scroll/resize events
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [showMenu])

  return (
    <div className="relative inline-block">
      <Interactive>
        <button
          ref={buttonRef}
          type="button"
          data-testid={testId || 'add-child-btn'}
          disabled={disabled}
          {...props}
          className={`
            flex h-8 w-8 items-center justify-center
            rounded-full border-2 border-dashed border-gray-300
            bg-white text-gray-400
            transition-all duration-150
            hover:border-gray-400 hover:text-gray-500
            disabled:cursor-not-allowed disabled:opacity-50
            cursor-pointer
          `}
          onClick={handleClick}
          aria-label="Adicionar filho"
          aria-expanded={showMenu}
          aria-haspopup="menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </Interactive>

      {/* Shape Type Menu - rendered via Portal outside shape hierarchy */}
      {showMenu && createPortal(
        <ShapeTypeMenu
          position={menuPosition}
          onSelect={handleSelectType}
          onClose={handleCloseMenu}
          parentShapeId={shapeId}
        />,
        document.body
      )}
    </div>
  )
}
