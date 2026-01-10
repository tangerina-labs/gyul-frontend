import { useVueFlow } from '@vue-flow/core'
import type {
  CustomNode,
  CustomNodeData,
  TweetData,
  QuestionData,
  NoteData
} from '@/types'

export function useNodeContext() {
  const { nodes, edges } = useVueFlow()

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

  function formatContextAsText(nodeId: string): string {
    const ancestors = getAncestors(nodeId)
    const parts: string[] = []

    for (const node of ancestors) {
      const data = node.data as CustomNodeData

      if (data.type === 'tweet' && data.status === 'loaded') {
        const tweet = data as TweetData
        parts.push(`[Tweet de ${tweet.author?.handle}]: ${tweet.text}`)
      } else if (data.type === 'question' && data.status === 'done') {
        const question = data as QuestionData
        parts.push(`[Pergunta]: ${question.prompt}`)
        parts.push(`[Resposta]: ${question.response}`)
      } else if (data.type === 'note') {
        const note = data as NoteData
        if (note.content.trim()) {
          parts.push(`[Nota]: ${note.content}`)
        }
      }
    }

    return parts.join('\n\n')
  }

  function getAncestorData(nodeId: string): CustomNodeData[] {
    return getAncestors(nodeId).map((n) => n.data as CustomNodeData)
  }

  return {
    getAncestors,
    formatContextAsText,
    getAncestorData
  }
}
