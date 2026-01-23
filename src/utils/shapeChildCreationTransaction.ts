import { Editor, createShapeId, type TLShapeId } from 'tldraw'
import type { ShapeType } from '../types/shapes'
import { deleteShapeWithArrows } from './shapeDelete'
import {
  calculateChildPositionWithCollisionDetection,
  estimateChildHeight,
  createArrow,
  checkArrowBindings,
} from './shapeChildCreation'

/**
 * Aguarda dois animation frames (conservative approach).
 * Garante que o store do tldraw atualizou completamente após operações.
 * 
 * Este approach conservador evita race conditions onde bindings
 * ainda não foram propagados completamente no store.
 */
async function waitForStoreUpdate(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

/**
 * Cria child shape com arrow de forma transacional.
 * 
 * ATOMICIDADE GARANTIDA:
 * - Todas as operações sucedem OU
 * - Rollback completo (deleta shape + arrow)
 * 
 * FASES DA TRANSAÇÃO:
 * 1. Validação: Parent existe?
 * 2. Preparação: Herdar flowId ou criar novo
 * 3. Criação Shape: Criar child
 * 4. Criação Arrow: Criar arrow com bindings
 * 5. Validação Bindings: 2x RAF + verificar bindings completos
 * 6. Pan Camera: Centralizar no child
 * 7. Sucesso: Retornar IDs
 * 
 * Se qualquer fase falhar, rollback deleta shape + arrow usando cascade delete.
 * 
 * FLOWID LOGIC:
 * - Se parent tem flowId → child herda
 * - Se parent NÃO tem flowId → criar novo UUID, child recebe
 * - Parent NUNCA é atualizado (responsabilidade do componente)
 * 
 * @param editor - Editor do tldraw
 * @param parentId - ID do shape pai
 * @param childType - Tipo do shape filho a criar
 * @returns Promise com { childId, arrowId }
 * @throws Error se qualquer etapa falhar (com mensagem descritiva)
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await createChildShapeTransactional(editor, parentId, 'note')
 *   console.log('Created:', result.childId, result.arrowId)
 * } catch (error) {
 *   console.error('Failed to create child:', error.message)
 *   toast.error('Failed to create shape')
 * }
 * ```
 */
export async function createChildShapeTransactional(
  editor: Editor,
  parentId: TLShapeId,
  childType: ShapeType
): Promise<{ childId: TLShapeId; arrowId: TLShapeId }> {
  let createdShapeId: TLShapeId | null = null
  let createdArrowId: TLShapeId | null = null

  try {
    // === FASE 1: VALIDAÇÃO ===
    const parent = editor.getShape(parentId)
    if (!parent) {
      throw new Error(`Parent shape ${parentId} not found`)
    }

    // === FASE 2: PREPARAÇÃO ===
    // FlowId: herdar do parent ou criar novo
    // IMPORTANTE: Parent NUNCA é atualizado aqui (responsabilidade do componente)
    const parentFlowId = (parent.props as any).flowId || crypto.randomUUID()

    // Calcular posição do child com detecção de colisão
    const childWidth = childType === 'note' ? 300 : 400
    const childHeight = estimateChildHeight(childType)
    const position = calculateChildPositionWithCollisionDetection(
      editor,
      parentId,
      parent as any,
      childWidth,
      childHeight
    )

    const childId = createShapeId()

    // === FASE 3: CRIAR SHAPE ===
    try {
      editor.createShape({
        id: childId,
        type: childType,
        x: position.x,
        y: position.y,
        props: {
          flowId: parentFlowId, // Herdar flowId (parent não é atualizado)
        },
      })
      createdShapeId = childId
    } catch (error) {
      throw new Error(
        `Failed to create child shape: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    // === FASE 4: CRIAR ARROW ===
    try {
      const arrowId = createArrow(editor, parentId, childId)
      createdArrowId = arrowId
    } catch (error) {
      throw new Error(
        `Failed to create arrow: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    // === FASE 5: VALIDAR BINDINGS (CONSERVADOR) ===
    // Aguardar dois RAF para garantir store atualizado
    await waitForStoreUpdate()

    const bindingStatus = checkArrowBindings(editor, createdArrowId)
    if (!bindingStatus.hasBothBindings) {
      throw new Error(
        `Arrow bindings incomplete: start=${bindingStatus.hasStartBinding}, end=${bindingStatus.hasEndBinding}`
      )
    }

    // === FASE 6: PAN CAMERA ===
    // Parte da transação (falha causa rollback)
    try {
      const childShape = editor.getShape(childId)
      if (childShape) {
        const childBounds = editor.getShapePageBounds(childId)
        if (childBounds) {
          editor.centerOnPoint(childBounds.center, {
            animation: { duration: 300 },
          })
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to pan camera: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }

    // === SUCESSO ===
    return {
      childId: createdShapeId,
      arrowId: createdArrowId,
    }
  } catch (error) {
    // === ROLLBACK COMPLETO ===
    console.error('Shape creation failed, rolling back:', error)

    if (createdShapeId || createdArrowId) {
      try {
        // Deletar shape (cascade delete remove arrow automaticamente)
        if (createdShapeId) {
          deleteShapeWithArrows(editor, createdShapeId)
        }
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
    }

    // Re-throw error original para caller capturar e mostrar toast
    throw error
  }
}
