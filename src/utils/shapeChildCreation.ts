import { Editor, createShapeId, type TLShapeId } from 'tldraw'
import type { ShapeType } from '../types/shapes'

/**
 * Calcula posição para child shape usando algoritmo de espiral.
 * Primeira posição: abaixo e centralizado
 * Posições subsequentes: espiral ao redor do pai
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
 * Conta quantos filhos um shape tem (através de arrows saindo dele).
 */
export function getChildrenCount(editor: Editor, parentId: TLShapeId): number {
  const arrows = editor.getCurrentPageShapes().filter(
    (s) =>
      s.type === 'arrow' &&
      s.props.start?.type === 'binding' &&
      s.props.start.boundShapeId === parentId
  )
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
  editor.createShape({
    id: arrowId,
    type: 'arrow',
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
      arrowheadStart: 'none',
      arrowheadEnd: 'none',
    },
    meta: {
      // Custom metadata for parent-child connection arrows
      isParentChildConnection: true,
      parentId: parentId,
      childId: childId,
      createdBy: 'system',
    },
  })

  // Step 2: Create bindings (separate records) so arrow follows shapes
  // Binding for start (parent)
  editor.createBinding({
    type: 'arrow',
    fromId: arrowId,
    toId: parentId,
    props: {
      terminal: 'start',
      normalizedAnchor: { x: 0.5, y: 0.5 }, // center
      isPrecise: false,
      isExact: false,
    },
  })

  // Binding for end (child)
  editor.createBinding({
    type: 'arrow',
    fromId: arrowId,
    toId: childId,
    props: {
      terminal: 'end',
      normalizedAnchor: { x: 0.5, y: 0.5 }, // center
      isPrecise: false,
      isExact: false,
    },
  })

  // Send arrow to back so it doesn't cover shapes
  editor.sendToBack([arrowId])

  return arrowId
}

/**
 * Cria um shape filho e arrow automaticamente.
 * Operação atômica - rollback se falhar.
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
  const parentFlowId = parent.props.flowId || crypto.randomUUID()

  // Calcular posição do filho
  const childrenCount = getChildrenCount(editor, parentId)
  const childWidth = childType === 'note' ? 300 : 400
  const position = calculateChildPosition(parent, childrenCount, childWidth)

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

    // Rollback: tentar deletar shape se foi criado
    try {
      const createdChild = editor.getShape(childId)
      if (createdChild) {
        editor.deleteShape(childId)
      }
    } catch {
      // Ignore rollback errors
    }

    return null
  }
}
