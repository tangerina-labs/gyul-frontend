import { ref, watch } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { Connection, Edge } from '@vue-flow/core'
import type { CanvasState, CustomNode, CustomEdge, CustomNodeData } from '@/types'

export function useCanvas(
  initialState: CanvasState,
  onSave: (nodes: CustomNode[], edges: CustomEdge[]) => void
) {
  const {
    nodes,
    edges,
    addNodes,
    addEdges,
    removeNodes,
    removeEdges,
    updateNode,
    fitView,
    setViewport,
    onConnect,
    onPaneClick,
    project
  } = useVueFlow()

  // Vue Flow types differ from CustomNode/CustomEdge, use type assertion
  ;(nodes.value as unknown) = initialState.nodes
  ;(edges.value as unknown) = initialState.edges
  setViewport(initialState.viewport)

  function isValidConnection(connection: Connection): boolean {
    const { source, target } = connection
    if (!source || !target) return false

    if (source === target) return false
    if (isAncestor(target, source, edges.value)) return false

    const sourceNode = nodes.value.find((n) => n.id === source)
    const targetNode = nodes.value.find((n) => n.id === target)
    if (!sourceNode || !targetNode) return false

    const sourceData = sourceNode.data as CustomNodeData
    const targetData = targetNode.data as CustomNodeData
    if (sourceData.flowId !== targetData.flowId) return false

    return true
  }

  function isAncestor(nodeA: string, nodeB: string, edgeList: Edge[]): boolean {
    const visited = new Set<string>()
    const stack = [nodeB]

    while (stack.length > 0) {
      const current = stack.pop()!
      if (current === nodeA) return true
      if (visited.has(current)) continue

      visited.add(current)

      const parents = edgeList
        .filter((e) => e.target === current)
        .map((e) => e.source)

      stack.push(...parents)
    }

    return false
  }

  onConnect((params) => {
    if (isValidConnection(params)) {
      addEdges([
        {
          id: `edge-${params.source}-${params.target}`,
          source: params.source!,
          target: params.target!
        }
      ])
    }
  })

  const pendingNodePosition = ref<{ x: number; y: number } | null>(null)

  onPaneClick((event) => {
    const position = project({ x: event.clientX, y: event.clientY })
    pendingNodePosition.value = position
  })

  watch(
    [nodes, edges],
    () => {
      onSave(nodes.value as CustomNode[], edges.value as CustomEdge[])
    },
    { deep: true }
  )

  return {
    nodes,
    edges,
    addNodes,
    addEdges,
    removeNodes,
    removeEdges,
    updateNode,
    fitView,
    pendingNodePosition,
    isValidConnection,
    clearPendingPosition: () => {
      pendingNodePosition.value = null
    }
  }
}
