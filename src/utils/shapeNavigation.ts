import { Editor, type TLShapeId, type TLShape } from 'tldraw'

/**
 * Retorna lista de ancestrais de um shape (para contexto de IA).
 */
export function getAncestors(editor: Editor, shapeId: TLShapeId): TLShape[] {
  const ancestors: TLShape[] = []
  let currentId = shapeId

  while (true) {
    // Encontrar arrow que aponta para o shape atual (end binding)
    const parentArrow = editor.getCurrentPageShapes().find(
      (s) =>
        s.type === 'arrow' &&
        s.props.end?.type === 'binding' &&
        s.props.end.boundShapeId === currentId
    )

    if (!parentArrow) break // Chegou na raiz

    const parentId = parentArrow.props.start?.boundShapeId
    if (!parentId) break

    const parent = editor.getShape(parentId)
    if (!parent) break

    ancestors.push(parent)
    currentId = parentId
  }

  return ancestors
}

/**
 * Verifica se shape é folha (sem filhos).
 * Usado para validação de deleção (feature futura).
 */
export function isLeafShape(editor: Editor, shapeId: TLShapeId): boolean {
  const arrows = editor.getCurrentPageShapes().filter(
    (s) =>
      s.type === 'arrow' &&
      s.props.start?.type === 'binding' &&
      s.props.start.boundShapeId === shapeId
  )
  return arrows.length === 0
}

/**
 * Utilitário para obter flowId de um shape.
 */
export function getShapeFlowId(editor: Editor, shapeId: TLShapeId): string | null {
  const shape = editor.getShape(shapeId)
  return shape?.props?.flowId ?? null
}
