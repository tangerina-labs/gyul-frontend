import { Editor, createShapeId, type TLShapeId } from 'tldraw'
import type { ShapeType } from '../types/shapes'
import type { ParentChildArrowMeta, ArrowBindingProps } from '../types/arrows'
import { deleteShapeWithArrows } from './shapeDelete'
type Diagonals =
  'bottom-right' |
  'top-right' |
  'top-left' |
  'bottom-left'

type VerticalHorizontals =
  'bottom' |
  'right' |
  'top' |
  'left'

type Directions = Diagonals | VerticalHorizontals


/**
 * Verifica colisão entre dois retângulos usando AABB (Axis-Aligned Bounding Box).
 * Adiciona padding para garantir gap mínimo entre shapes.
 * 
 * @returns true se há colisão, false se não há
 */
function checkCollision(
  bounds1: { x: number; y: number; w: number; h: number },
  bounds2: { x: number; y: number; w: number; h: number },
  padding: number = 20
): boolean {
  // AABB collision detection with padding
  return !(
    bounds1.x + bounds1.w + padding < bounds2.x ||
    bounds1.x - padding > bounds2.x + bounds2.w ||
    bounds1.y + bounds1.h + padding < bounds2.y ||
    bounds1.y - padding > bounds2.y + bounds2.h
  )
}

/**
 * Estima altura inicial do child shape para detecção de colisão.
 * Shapes usam measuredHeight dinâmica, mas precisamos de estimativa conservadora
 * para posicionamento inicial.
 */
export function estimateChildHeight(childType: ShapeType): number {
  // Estimativa conservadora baseada no DEFAULT_HEIGHT dos ShapeUtils (150px)
  // + margem para conteúdo dinâmico
  // Note shapes tendem a ser menores, outros shapes podem ter mais conteúdo
  if (childType === 'note') {
    return 180
  }
  return 200
}

export function calculateChildPositionWithCollisionDetection(
  editor: Editor,
  parentId: TLShapeId,
  parent: { x: number; y: number; props: { w: number; measuredHeight?: number; h: number } },
  childWidth: number,
  childHeight: number
): { x: number; y: number } {
  const parentWidth = parent.props.w
  const parentHeight = parent.props.measuredHeight ?? parent.props.h
  const gap = 80
  const maxLevels = 25
  const SQRT2 = Math.SQRT2 // ~1.414

  // Obter todos os shapes do canvas para verificação de colisão
  const allShapes = editor.getCurrentPageShapes()

  // Centro do pai
  const parentCenterX = parent.x + parentWidth / 2
  const parentCenterY = parent.y + parentHeight / 2

  // Função helper para verificar colisão em uma posição
  const hasCollisionAt = (x: number, y: number, direction: string, level: number): boolean => {
    const candidateBounds = { x, y, w: childWidth, h: childHeight }

    for (const shape of allShapes) {
      if (shape.id === parentId) continue
      if (shape.type === 'arrow') continue

      const shapeBounds = editor.getShapePageBounds(shape.id)
      if (!shapeBounds) continue

      if (checkCollision(candidateBounds, {
        x: shapeBounds.x,
        y: shapeBounds.y,
        w: shapeBounds.width,
        h: shapeBounds.height
      }, gap)) {
        console.log(`[V2] ✗ Colisão em ${direction} (nível ${level}) com shape ${shape.type} em x=${shapeBounds.x.toFixed(0)}, y=${shapeBounds.y.toFixed(0)}`)
        return true
      }
    }
    return false
  }

  // Função para calcular posição baseada na direção
  // Parte da BORDA do pai, não do centro
  const calculatePositionForDirection = (
    direction: Directions,
    level: number
  ): { x: number; y: number } => {
    const levelOffset = level * gap

    switch (direction) {
      case 'bottom':
        // Child centralizado abaixo do pai
        return {
          x: parentCenterX - childWidth / 2,
          y: parent.y + parentHeight + gap + levelOffset
        }

      case 'top':
        // Child centralizado acima do pai
        return {
          x: parentCenterX - childWidth / 2,
          y: parent.y - childHeight - gap - levelOffset
        }

      case 'right':
        // Child à direita, centralizado verticalmente
        return {
          x: parent.x + parentWidth + gap + levelOffset,
          y: parentCenterY - childHeight / 2
        }

      case 'left':
        // Child à esquerda, centralizado verticalmente
        return {
          x: parent.x - childWidth - gap - levelOffset,
          y: parentCenterY - childHeight / 2
        }

      case 'bottom-right':
        // Diagonal: aplicar fator sqrt(2) para compensar geometria
        return {
          x: parent.x + parentWidth + (gap + levelOffset) / SQRT2,
          y: parent.y + parentHeight + (gap + levelOffset) / SQRT2
        }

      case 'bottom-left':
        return {
          x: parent.x - childWidth - (gap + levelOffset) / SQRT2,
          y: parent.y + parentHeight + (gap + levelOffset) / SQRT2
        }

      case 'top-right':
        return {
          x: parent.x + parentWidth + (gap + levelOffset) / SQRT2,
          y: parent.y - childHeight - (gap + levelOffset) / SQRT2
        }

      case 'top-left':
        return {
          x: parent.x - childWidth - (gap + levelOffset) / SQRT2,
          y: parent.y - childHeight - (gap + levelOffset) / SQRT2
        }
    }
  }

  // Ordem das direções: espiral horária começando por baixo
  const spiralOrder: Directions[] = [
    'bottom',
    'bottom-right',
    'right',
    'top-right',
    'top',
    'top-left',
    'left',
    'bottom-left'
  ]

  // Varredura em espiral
  for (let level = 0; level < maxLevels; level++) {
    for (const direction of spiralOrder) {
      const pos = calculatePositionForDirection(direction, level)

      if (!hasCollisionAt(pos.x, pos.y, direction, level)) {
        console.log(`[V2] ✓ Posição livre: ${direction} (nível ${level}) em x=${pos.x.toFixed(0)}, y=${pos.y.toFixed(0)}`)
        return pos
      }
    }
  }

  // Fallback
  console.warn('[V2] No collision-free position found. Using fallback.')
  return {
    x: parentCenterX - childWidth / 2,
    y: parent.y + parentHeight + gap
  }
}


/**
 * LEGACY: Calcula posição para child shape usando algoritmo de espiral simples.
 * Não verifica colisões - apenas usa índice do filho.
 * 
 * @deprecated Use calculateChildPositionWithCollisionDetection para evitar sobreposições
 */
export function calculateChildPosition(
  parent: { x: number; y: number; props: { w: number; measuredHeight?: number; h: number } },
  childIndex: number,
  childWidth: number
): { x: number; y: number } {
  const parentHeight = parent.props.measuredHeight ?? parent.props.h
  const gap = 80

  if (childIndex === 0) {
    // Primeira posição: abaixo e centralizado
    return {
      x: parent.x + (parent.props.w / 2) - (childWidth / 2),
      y: parent.y + parentHeight + gap,
    }
  }

  // Posições subsequentes: espiral
  // Raio base = largura do pai + gap
  const baseRadius = parent.props.w / 2 + gap
  // Aumentar raio a cada nível da espiral
  const spiralLevel = Math.floor(childIndex / 4)
  const radius = baseRadius + spiralLevel * 150

  // Ângulo: dividir 360° em 4 posições por nível (direita, baixo, esquerda, cima)
  const angleStep = (Math.PI * 2) / 4
  const angle = (childIndex % 4) * angleStep + Math.PI / 2 // Começar embaixo

  return {
    x: parent.x + parent.props.w / 2 + Math.cos(angle) * radius - childWidth / 2,
    y: parent.y + parentHeight / 2 + Math.sin(angle) * radius,
  }
}

/**
 * Verifica se uma arrow tem bindings configurados nos dois terminais (start e end).
 * Retorna informações sobre os bindings encontrados.
 * 
 * IMPORTANTE: Usa editor.getBindingsFromShape() que consulta diretamente o store,
 * pois as props da arrow podem não estar atualizadas imediatamente após criar os bindings.
 */
export function checkArrowBindings(editor: Editor, arrowId: TLShapeId): {
  hasStartBinding: boolean
  hasEndBinding: boolean
  hasBothBindings: boolean
  startShapeId: TLShapeId | null
  endShapeId: TLShapeId | null
  bindings: Array<{ terminal: string; toId: TLShapeId }>
} {
  const arrow = editor.getShape(arrowId)

  if (!arrow || arrow.type !== 'arrow') {
    return {
      hasStartBinding: false,
      hasEndBinding: false,
      hasBothBindings: false,
      startShapeId: null,
      endShapeId: null,
      bindings: [],
    }
  }

  // Buscar bindings diretamente no store (método mais confiável)
  // editor.getBindingsFromShape() retorna todos os bindings onde fromId === arrowId
  const arrowBindings = editor.getBindingsFromShape(arrowId, 'arrow')

  const bindingDetails = arrowBindings.map((binding) => ({
    terminal: (binding.props as any).terminal || 'unknown',
    toId: binding.toId,
  }))

  // Encontrar bindings de start e end
  const startBinding = arrowBindings.find((b) => (b.props as any).terminal === 'start')
  const endBinding = arrowBindings.find((b) => (b.props as any).terminal === 'end')

  return {
    hasStartBinding: !!startBinding,
    hasEndBinding: !!endBinding,
    hasBothBindings: !!startBinding && !!endBinding,
    startShapeId: startBinding?.toId ?? null,
    endShapeId: endBinding?.toId ?? null,
    bindings: bindingDetails,
  }
}

/**
 * Conta quantos filhos um shape tem (através de arrows saindo dele).
 */
export function getChildrenCount(editor: Editor, parentId: TLShapeId): number {
  const arrows = editor.getCurrentPageShapes().filter((s) => {
    if (s.type !== 'arrow') return false
    const props = s.props as any
    return props.start?.type === 'binding' && props.start.boundShapeId === parentId
  })
  return arrows.length
}

/**
 * Cria uma arrow conectando pai e filho com bindings.
 * Os bindings fazem a arrow seguir os shapes automaticamente quando movidos.
 * 
 * Processo (baseado na documentação do tldraw):
 * 1. Criar arrow com coordenadas numéricas iniciais
 * 2. Criar bindings separados para start e end usando editor.createBinding()
 */
export function createArrow(
  editor: Editor,
  parentId: TLShapeId,
  childId: TLShapeId
): TLShapeId {
  const arrowId = createShapeId(`arrow-${parentId}-${childId}`)

  // Get bounds to calculate arrow positions
  const parentBounds = editor.getShapePageBounds(parentId)
  const childBounds = editor.getShapePageBounds(childId)

  if (!parentBounds || !childBounds) {
    throw new Error('Could not get bounds for parent or child shape')
  }

  // Step 1: Create arrow with numeric coordinates and metadata
  const meta: ParentChildArrowMeta = {
    isParentChildConnection: true,
    parentId: parentId,
    childId: childId,
    createdBy: 'system',
  }

  const payloadArrowShape = {
    id: arrowId,
    type: 'arrow' as const,
    props: {
      start: {
        x: parentBounds.center.x,
        y: parentBounds.center.y,
      },
      end: {
        x: childBounds.center.x,
        y: childBounds.center.y,
      },
      color: 'grey',
      size: 's',
      arrowheadStart: 'none' as const,
      arrowheadEnd: 'none' as const,
    },
    meta: meta as Record<string, unknown>,
  }

  editor.createShape(payloadArrowShape as any)

  // Step 2: Create bindings (separate records) so arrow follows shapes
  // Binding for start (parent)
  const startBindingProps: ArrowBindingProps = {
    terminal: 'start',
    normalizedAnchor: { x: 0.5, y: 0.5 }, // center
    isPrecise: false,
    isExact: false,
  }

  editor.createBinding({
    type: 'arrow',
    fromId: arrowId,
    toId: parentId,
    props: startBindingProps,
  })

  // Binding for end (child)
  const endBindingProps: ArrowBindingProps = {
    terminal: 'end',
    normalizedAnchor: { x: 0.5, y: 0.5 }, // center
    isPrecise: false,
    isExact: false,
  }

  editor.createBinding({
    type: 'arrow',
    fromId: arrowId,
    toId: childId,
    props: endBindingProps,
  })

  // Send arrow to back so it doesn't cover shapes
  editor.sendToBack([arrowId])

  return arrowId
}

/**
 * Cria um shape filho e arrow automaticamente.
 * Operação atômica - rollback se falhar.
 * Usa detecção de colisão para encontrar posição livre.
 */
export function createChildShape(
  editor: Editor,
  parentId: TLShapeId,
  childType: ShapeType
): { childId: TLShapeId; arrowId: TLShapeId } | null {
  // Validação parcial: verificar se pai existe
  const parent = editor.getShape(parentId)

  if (!parent) {
    console.error(`Parent shape ${parentId} not found`)
    return null
  }

  // Obter flowId do pai (ou criar novo se não existir)
  const parentFlowId = (parent.props as any).flowId || crypto.randomUUID()

  // Calcular posição do filho com detecção de colisão
  const childWidth = childType === 'note' ? 300 : 400
  const childHeight = estimateChildHeight(childType)
  const position = calculateChildPositionWithCollisionDetection(
    editor,
    parentId,
    parent as any,
    childWidth,
    childHeight
  )

  // Criar ID do filho
  const childId = createShapeId()

  try {
    // Criar shape filho
    editor.createShape({
      id: childId,
      type: childType,
      x: position.x,
      y: position.y,
      props: {
        flowId: parentFlowId, // Herdar flowId
      },
    })

    // Criar arrow
    const arrowId = createArrow(editor, parentId, childId)

    // Pan camera para mostrar o filho
    const childShape = editor.getShape(childId)
    if (childShape) {
      const childBounds = editor.getShapePageBounds(childId)
      if (childBounds) {
        editor.centerOnPoint(childBounds.center, { animation: { duration: 300 } })
      }
    }

    return { childId, arrowId }
  } catch (error) {
    console.error('Failed to create child shape:', error)

    // Rollback: deletar shape E arrow (se foram criados) usando cascade delete
    try {
      const createdChild = editor.getShape(childId)
      if (createdChild) {
        deleteShapeWithArrows(editor, childId)
      }
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError)
    }

    return null
  }
}
