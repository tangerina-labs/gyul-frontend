/**
 * Type definitions for arrows and bindings in the tldraw canvas.
 * 
 * This file contains interfaces for:
 * - Arrow shapes that connect parent and child shapes
 * - Binding records that make arrows follow shapes
 * - Validation and utility types for testing
 * 
 * The application uses the new tldraw bindings API where bindings are
 * separate records in the store, not properties within the arrow shape.
 */

/**
 * Metadata attached to parent-child connection arrows.
 * This distinguishes system-created connection arrows from user-created arrows.
 */
export interface ParentChildArrowMeta {
  /** Identifies this as a parent-child connection arrow */
  isParentChildConnection: boolean
  /** ID of the parent shape */
  parentId: string
  /** ID of the child shape */
  childId: string
  /** Who created this arrow */
  createdBy: 'system' | 'user'
  /** Index signature for tldraw JsonObject compatibility */
  [key: string]: unknown
}

/**
 * Properties of an arrow binding (new tldraw API).
 * Bindings make arrows stick to shapes and follow them when moved.
 */
export interface ArrowBindingProps {
  /** Which end of the arrow this binding is for */
  terminal: 'start' | 'end'
  /** Normalized position on the shape (0-1 range for x and y) */
  normalizedAnchor: { x: number; y: number }
  /** Whether binding uses precise connection point */
  isPrecise: boolean
  /** Whether binding position is exact */
  isExact: boolean
}

/**
 * Complete binding record as stored in tldraw's store.
 * Each arrow has two bindings: one for start, one for end.
 */
export interface ArrowBindingRecord {
  /** Unique binding ID */
  id: string
  /** Record type in store */
  typeName: 'binding'
  /** Type of binding */
  type: 'arrow'
  /** Arrow shape ID (the arrow that this binding belongs to) */
  fromId: string
  /** Target shape ID (the shape that the arrow connects to) */
  toId: string
  /** Binding properties */
  props: ArrowBindingProps
}

/**
 * Arrow shape structure as stored in the tldraw store.
 * This represents parent-child connection arrows specifically.
 */
export interface ParentChildArrowShape {
  /** Unique arrow shape ID */
  id: string
  /** Record type in store */
  typeName: 'shape'
  /** Shape type */
  type: 'arrow'
  /** Arrow visual properties */
  props: {
    /** Start point coordinates (before bindings are applied) */
    start: { x: number; y: number }
    /** End point coordinates (before bindings are applied) */
    end: { x: number; y: number }
    /** Arrow color */
    color: string
    /** Arrow line size */
    size: string
    /** Arrowhead style at start */
    arrowheadStart: 'none' | 'arrow' | 'dot'
    /** Arrowhead style at end */
    arrowheadEnd: 'none' | 'arrow' | 'dot'
  }
  /** Custom metadata for parent-child connections */
  meta: ParentChildArrowMeta
}

/**
 * Arrow with resolved binding information.
 * Useful for tests and validation - represents an arrow where
 * bindings have been resolved to actual shape IDs.
 */
export interface ArrowWithBindings {
  /** Arrow shape ID */
  id: string
  /** ID of shape at start of arrow */
  startShapeId: string
  /** ID of shape at end of arrow */
  endShapeId: string
  /** Optional metadata (only present on parent-child connection arrows) */
  meta?: ParentChildArrowMeta
}

/**
 * Result of validating arrow bindings.
 * Used in tests to verify that arrows are properly connected.
 */
export interface ArrowBindingValidation {
  /** Number of arrows with valid bindings */
  validCount: number
  /** Number of arrows with invalid bindings */
  invalidCount: number
  /** Total number of arrows checked */
  totalCount: number
  /** Arrows that have both start and end bindings */
  validArrows: Array<{
    id: string
    hasStartBinding: boolean
    hasEndBinding: boolean
    startShapeId: string | null
    endShapeId: string | null
  }>
  /** Arrows with missing or invalid bindings */
  invalidArrows: Array<{
    id: string
    reason: string
    hasStartBinding: boolean
    hasEndBinding: boolean
  }>
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for ParentChildArrowMeta.
 * Validates that an object has the structure of parent-child arrow metadata.
 * 
 * @example
 * if (isParentChildArrowMeta(arrow.meta)) {
 *   console.log(arrow.meta.parentId) // TypeScript knows meta is valid
 * }
 */
export function isParentChildArrowMeta(meta: unknown): meta is ParentChildArrowMeta {
  return (
    typeof meta === 'object' &&
    meta !== null &&
    'isParentChildConnection' in meta &&
    typeof (meta as any).isParentChildConnection === 'boolean' &&
    'parentId' in meta &&
    typeof (meta as any).parentId === 'string' &&
    'childId' in meta &&
    typeof (meta as any).childId === 'string'
  )
}

/**
 * Type guard for ArrowBindingProps.
 * Validates that an object has the structure of binding properties.
 * 
 * @example
 * if (isArrowBindingProps(binding.props)) {
 *   console.log(binding.props.terminal) // 'start' or 'end'
 * }
 */
export function isArrowBindingProps(props: unknown): props is ArrowBindingProps {
  return (
    typeof props === 'object' &&
    props !== null &&
    'terminal' in props &&
    ((props as any).terminal === 'start' || (props as any).terminal === 'end') &&
    'normalizedAnchor' in props &&
    typeof (props as any).normalizedAnchor === 'object' &&
    (props as any).normalizedAnchor !== null &&
    'x' in (props as any).normalizedAnchor &&
    'y' in (props as any).normalizedAnchor
  )
}

/**
 * Type guard for ArrowBindingRecord.
 * Validates that an object is a complete binding record.
 * 
 * @example
 * const bindings = records.filter(isArrowBindingRecord)
 * // bindings is now ArrowBindingRecord[]
 */
export function isArrowBindingRecord(record: unknown): record is ArrowBindingRecord {
  return (
    typeof record === 'object' &&
    record !== null &&
    'typeName' in record &&
    (record as any).typeName === 'binding' &&
    'type' in record &&
    (record as any).type === 'arrow' &&
    'fromId' in record &&
    typeof (record as any).fromId === 'string' &&
    'toId' in record &&
    typeof (record as any).toId === 'string' &&
    'props' in record &&
    isArrowBindingProps((record as any).props)
  )
}

/**
 * Type guard for ParentChildArrowShape.
 * Validates that a shape is a parent-child connection arrow.
 * 
 * @example
 * const arrows = shapes.filter(isParentChildArrowShape)
 * arrows.forEach(arrow => {
 *   console.log(`${arrow.meta.parentId} -> ${arrow.meta.childId}`)
 * })
 */
export function isParentChildArrowShape(shape: unknown): shape is ParentChildArrowShape {
  return (
    typeof shape === 'object' &&
    shape !== null &&
    'typeName' in shape &&
    (shape as any).typeName === 'shape' &&
    'type' in shape &&
    (shape as any).type === 'arrow' &&
    'meta' in shape &&
    isParentChildArrowMeta((shape as any).meta)
  )
}

/**
 * Type guard for ArrowWithBindings.
 * Validates that an arrow has both start and end shape IDs resolved.
 * 
 * @example
 * if (isArrowWithBindings(arrow)) {
 *   console.log(`Arrow connects ${arrow.startShapeId} to ${arrow.endShapeId}`)
 * }
 */
export function isArrowWithBindings(arrow: unknown): arrow is ArrowWithBindings {
  return (
    typeof arrow === 'object' &&
    arrow !== null &&
    'id' in arrow &&
    typeof (arrow as any).id === 'string' &&
    'startShapeId' in arrow &&
    typeof (arrow as any).startShapeId === 'string' &&
    'endShapeId' in arrow &&
    typeof (arrow as any).endShapeId === 'string'
  )
}
