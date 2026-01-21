import { forwardRef, type ReactNode, type HTMLAttributes } from 'react'

interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  borderColor?: string
  borderStyle?: 'solid' | 'dashed'
  selected?: boolean
  minHeight?: number
}

/**
 * Base card component for all shape types.
 * Provides consistent styling with customizable border color and selection state.
 *
 * Note: Width is always 100% to fill the parent HTMLContainer.
 * Height is determined by content - it grows naturally for auto-sizing shapes.
 */
export const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(
  function BaseCard(
    {
      children,
      borderColor = 'var(--gray-300)',
      borderStyle = 'solid',
      selected = false,
      minHeight,
      className = '',
      style,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl bg-white
          transition-shadow duration-200
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          ${className}
        `}
        style={{
          width: '100%',
          // No height - content determines size, measured by ResizeObserver
          minHeight: minHeight ? `${minHeight}px` : undefined,
          border: `2px ${borderStyle} ${borderColor}`,
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-md)',
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
