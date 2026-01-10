import { useVueFlow } from '@vue-flow/core'
import { fetchTweet } from '@/services/tweetService'
import { generateAnswer } from '@/services/aiService'
import type {
  CustomNode,
  CustomNodeData,
  NodeType,
  TweetData,
  QuestionData,
  NoteData
} from '@/types'

export function useNodes() {
  const { nodes, edges, addNodes, addEdges, removeNodes, updateNode } =
    useVueFlow()

  function createNode(
    type: NodeType,
    position: { x: number; y: number },
    parentId?: string
  ): string {
    const id = `${type}-${Date.now()}`

    let flowId: string
    if (parentId) {
      const parentNode = nodes.value.find((n) => n.id === parentId)
      flowId =
        (parentNode?.data as CustomNodeData)?.flowId ?? crypto.randomUUID()
    } else {
      flowId = crypto.randomUUID()
    }

    const dataByType: Record<NodeType, CustomNodeData> = {
      tweet: { type: 'tweet', flowId, url: '', status: 'empty' },
      question: {
        type: 'question',
        flowId,
        prompt: '',
        response: null,
        status: 'draft'
      },
      note: { type: 'note', flowId, content: '', isEditing: true }
    }

    const node: CustomNode = {
      id,
      type,
      position,
      data: dataByType[type]
    }

    addNodes([node])

    if (parentId) {
      addEdges([
        {
          id: `edge-${parentId}-${id}`,
          source: parentId,
          target: id
        }
      ])
    }

    return id
  }

  async function loadTweet(nodeId: string, url: string): Promise<void> {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (!node) return

    const data = node.data as TweetData

    updateNode(nodeId, {
      data: { ...data, url, status: 'loading' }
    })

    const result = await fetchTweet(url)

    if (result.success && result.data) {
      updateNode(nodeId, {
        data: {
          ...data,
          url,
          status: 'loaded',
          author: result.data.author,
          text: result.data.text,
          timestamp: result.data.timestamp,
          error: undefined
        }
      })
    } else {
      updateNode(nodeId, {
        data: {
          ...data,
          url,
          status: 'error',
          error: result.error
        }
      })
    }
  }

  async function submitQuestion(nodeId: string, prompt: string): Promise<void> {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (!node) return

    const data = node.data as QuestionData

    updateNode(nodeId, {
      data: { ...data, prompt, status: 'loading' }
    })

    const ancestors = getAncestors(nodeId)
    const ancestorData = ancestors.map((n) => n.data as CustomNodeData)

    const result = await generateAnswer({ ancestors: ancestorData, prompt })

    updateNode(nodeId, {
      data: {
        ...data,
        prompt,
        response: result.success ? result.content : 'Erro ao gerar resposta',
        status: 'done'
      }
    })
  }

  function getAncestors(nodeId: string): CustomNode[] {
    const ancestorIds = new Set<string>()
    const stack = [nodeId]

    while (stack.length > 0) {
      const current = stack.pop()!

      const parents = edges.value
        .filter((e) => e.target === current)
        .map((e) => e.source)

      for (const parentId of parents) {
        if (!ancestorIds.has(parentId)) {
          ancestorIds.add(parentId)
          stack.push(parentId)
        }
      }
    }

    return nodes.value.filter((n) => ancestorIds.has(n.id)) as CustomNode[]
  }

  function updateNote(nodeId: string, content: string): void {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (!node || (node.data as CustomNodeData).type !== 'note') return

    const data = node.data as NoteData

    updateNode(nodeId, {
      data: { ...data, content }
    })
  }

  function finalizeNote(nodeId: string): void {
    const node = nodes.value.find((n) => n.id === nodeId)
    if (!node || (node.data as CustomNodeData).type !== 'note') return

    const data = node.data as NoteData

    if (data.content.trim() === '') {
      removeNodes([nodeId])
      return
    }

    updateNode(nodeId, {
      data: { ...data, isEditing: false }
    })
  }

  function deleteNode(nodeId: string): boolean {
    const hasChildren = edges.value.some((e) => e.source === nodeId)
    if (hasChildren) return false

    const nodeElement = document.querySelector(`[data-id="${nodeId}"]`)
    if (nodeElement) {
      nodeElement.classList.add('removing')

      setTimeout(() => {
        removeNodes([nodeId])
      }, 150)
    } else {
      removeNodes([nodeId])
    }

    return true
  }

  return {
    createNode,
    loadTweet,
    submitQuestion,
    updateNote,
    finalizeNote,
    deleteNode,
    getAncestors
  }
}
