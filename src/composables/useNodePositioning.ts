import type { CustomNode, NodeType } from '@/types'

export const COLLISION_MARGIN = 40
export const INITIAL_ZOOM_EMPTY = 1
export const PAN_DURATION = 300

const CHILD_OFFSETS = [
  { x: 0, y: 200 },
  { x: 250, y: 150 },
  { x: -250, y: 150 },
  { x: 125, y: 250 },
  { x: -125, y: 250 },
]

const NODE_SIZES: Record<NodeType, { width: number; height: number }> = {
  tweet: { width: 400, height: 200 },
  question: { width: 400, height: 250 },
  note: { width: 350, height: 100 }
}

interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

export type GetDimensionsFn = (nodeId: string) => Size | null

function toRect(position: Position, size: Size): Rect {
  return {
    left: position.x,
    top: position.y,
    right: position.x + size.width,
    bottom: position.y + size.height
  }
}

function hasCollision(rectA: Rect, rectB: Rect, margin: number): boolean {
  return !(
    rectA.right + margin < rectB.left ||
    rectA.left - margin > rectB.right ||
    rectA.bottom + margin < rectB.top ||
    rectA.top - margin > rectB.bottom
  )
}

function collidesWithAny(
  position: Position,
  size: Size,
  existingNodes: CustomNode[],
  margin: number,
  getDimensions?: GetDimensionsFn
): boolean {
  const candidateRect = toRect(position, size)

  for (const node of existingNodes) {
    const nodeSize = getDimensions?.(node.id) ?? getNodeSize(node.type as NodeType)
    const nodeRect = toRect(node.position, nodeSize)

    if (hasCollision(candidateRect, nodeRect, margin)) {
      return true
    }
  }

  return false
}

export function getNodeSize(type: NodeType): Size {
  return NODE_SIZES[type] ?? NODE_SIZES.note
}

export function getChildOffset(childIndex: number): Position {
  const index = childIndex % CHILD_OFFSETS.length
  return CHILD_OFFSETS[index] ?? { x: 0, y: 200 }
}

export function findFreePosition(
  desiredPosition: Position,
  nodeType: NodeType,
  existingNodes: CustomNode[],
  margin: number = COLLISION_MARGIN,
  getDimensions?: GetDimensionsFn
): Position {
  const size = getNodeSize(nodeType)

  if (existingNodes.length === 0) {
    return desiredPosition
  }

  if (!collidesWithAny(desiredPosition, size, existingNodes, margin, getDimensions)) {
    return desiredPosition
  }

  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 }
  ]

  const step = margin
  const maxRadius = 2000

  for (let radius = step; radius <= maxRadius; radius += step) {
    for (const dir of directions) {
      const candidate: Position = {
        x: desiredPosition.x + dir.x * radius,
        y: desiredPosition.y + dir.y * radius
      }

      if (!collidesWithAny(candidate, size, existingNodes, margin, getDimensions)) {
        return candidate
      }
    }
  }

  return {
    x: desiredPosition.x + maxRadius,
    y: desiredPosition.y
  }
}

export function countChildren(parentId: string, edges: { source: string; target: string }[]): number {
  return edges.filter(edge => edge.source === parentId).length
}

export function calculateChildPosition(
  parentNode: CustomNode,
  childType: NodeType,
  existingChildCount: number,
  allNodes: CustomNode[],
  margin: number = COLLISION_MARGIN,
  getDimensions?: GetDimensionsFn
): Position {
  const offset = getChildOffset(existingChildCount)

  const desiredPosition: Position = {
    x: parentNode.position.x + offset.x,
    y: parentNode.position.y + offset.y
  }

  return findFreePosition(desiredPosition, childType, allNodes, margin, getDimensions)
}
