import { type ReactNode } from 'react'

interface InteractiveProps {
  children: ReactNode
}

/**
 * Wrapper component for interactive elements inside tldraw shapes.
 * 
 * Prevents pointer and touch events from propagating to the canvas,
 * allowing buttons, inputs, and other interactive elements to work
 * without interfering with shape dragging/selection.
 * 
 * Uses display: contents to avoid affecting layout/flexbox/grid.
 * 
 * @example
 * <Interactive>
 *   <button onClick={handleClick}>Click me</button>
 * </Interactive>
 */
export function Interactive({ children }: InteractiveProps) {
  return (
    <div
      style={{ display: 'contents' }}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}
