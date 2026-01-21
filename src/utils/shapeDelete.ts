import { Editor, type TLShapeId } from 'tldraw'

/**
 * Encontra todas as arrows conectadas aos shapes especificados.
 * 
 * IMPORTANTE: No tldraw, bindings são records SEPARADOS no store, não estão
 * nas props da arrow. Usamos editor.getBindingsToShape() para encontrar arrows.
 * 
 * Algoritmo:
 * - Para cada shape que será deletado, busca bindings onde shape é o target (toId)
 * - Cada binding tem um fromId que é o ID da arrow conectada
 * - Coleta todos os IDs de arrows únicas
 * 
 * Complexidade: O(N × B) onde N = shapes a deletar, B = bindings médios por shape
 * 
 * @param editor - Editor do tldraw
 * @param shapeIds - Set de IDs dos shapes que serão deletados
 * @returns Set de IDs das arrows que devem ser deletadas
 */
function findConnectedArrows(
  editor: Editor,
  shapeIds: Set<TLShapeId>
): Set<TLShapeId> {
  const arrowsToDelete = new Set<TLShapeId>()
  
  // Para cada shape que será deletado
  for (const shapeId of shapeIds) {
    // Buscar todos os bindings onde este shape é o target
    // 'arrow' é o tipo de binding que conecta arrows a shapes
    const bindings = editor.getBindingsToShape(shapeId, 'arrow')
    
    // Cada binding tem fromId (arrow) e toId (shape)
    // Se o shape está sendo deletado, a arrow (fromId) também deve ser deletada
    for (const binding of bindings) {
      arrowsToDelete.add(binding.fromId)
    }
  }
  
  return arrowsToDelete
}

/**
 * Deleta múltiplos shapes e todas as arrows conectadas a eles (cascade).
 * 
 * Garante:
 * - Atomicidade: Uma única operação no history (undo/redo funciona perfeitamente)
 * - Performance: Scan único + batch delete
 * - Idempotência: Pode ser chamado com shapes já deletados (no-op)
 * - Sem duplicatas: Usa Set para prevenir tentativas de deletar a mesma arrow duas vezes
 * 
 * Ordem de deleção: arrows + shapes em uma única operação
 * Isso evita referências pendentes e garante consistência do store.
 * 
 * @param editor - Editor do tldraw
 * @param shapeIds - Array de IDs dos shapes a deletar
 */
export function deleteShapesWithArrows(
  editor: Editor,
  shapeIds: TLShapeId[]
): void {
  // Edge case: array vazio
  if (shapeIds.length === 0) return
  
  // Converter para Set para lookup O(1)
  const shapeIdsSet = new Set(shapeIds)
  
  // Fase 1: Coletar arrows conectadas
  const arrowsToDelete = findConnectedArrows(editor, shapeIdsSet)
  
  // Fase 2: Combinar tudo que precisa ser deletado
  // Note: Se user selecionou uma arrow diretamente, ela já está em shapeIds
  // O Set garante que não teremos duplicatas ao converter de volta para array
  const allIdsToDelete = [
    ...Array.from(arrowsToDelete), // Arrows descobertas
    ...shapeIds,                   // Shapes originais
  ]
  
  // Fase 3: Batch delete - UMA operação no history
  // Isso cria uma única entrada no undo stack, permitindo undo/redo atômico
  editor.deleteShapes(allIdsToDelete)
}

/**
 * Deleta um único shape e suas arrows conectadas (wrapper de conveniência).
 * 
 * Útil para casos onde você tem apenas um shape ID e quer uma API mais simples.
 * 
 * @param editor - Editor do tldraw
 * @param shapeId - ID do shape a deletar
 */
export function deleteShapeWithArrows(
  editor: Editor,
  shapeId: TLShapeId
): void {
  deleteShapesWithArrows(editor, [shapeId])
}
