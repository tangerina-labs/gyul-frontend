import type { CustomNodeData } from '@/types'
import { isTweetData, isQuestionData, isNoteData, isLoadedTweet, isDoneQuestion } from '@/types'

export interface AIContext {
  ancestors: CustomNodeData[]
  prompt: string
}

export interface AIResponse {
  success: boolean
  content?: string
  error?: string
}

const isTestEnv = typeof window !== 'undefined' && (window as any).__PLAYWRIGHT_TEST__
const MOCK_DELAY = isTestEnv ? 0 : 1500

const RESPONSE_TEMPLATES = {
  withTweet: [
    `Analisando o tweet mencionado, posso dizer que "{prompt}" e uma questao interessante. O autor aborda conceitos relacionados a inovacao e pensamento de longo prazo. A ideia central parece ser sobre como pequenas acoes consistentes podem levar a grandes resultados.`,
    `Excelente pergunta! O tweet traz uma perspectiva sobre "{prompt}" que merece reflexao. O ponto principal e que o conhecimento, assim como os juros compostos, cresce exponencialmente quando aplicado consistentemente ao longo do tempo.`,
    `Com base no contexto do tweet, "{prompt}" pode ser entendido de varias formas. O autor parece defender que a simplicidade e uma forma sofisticada de pensar, e que remover complexidade desnecessaria e tao importante quanto adicionar funcionalidades.`
  ],
  withPreviousQA: [
    `Continuando nossa exploracao, "{prompt}" se conecta com o que discutimos anteriormente. A ideia de aprendizado continuo e iterativo aparece novamente aqui - cada pergunta nos leva mais fundo no entendimento do tema.`,
    `Interessante voce perguntar isso! Considerando as questoes anteriores, "{prompt}" parece ser uma extensao natural do raciocinio. O padrao que emerge e sobre como ideias simples, quando aplicadas consistentemente, geram resultados extraordinarios.`,
    `Boa pergunta de follow-up! "{prompt}" expande o que ja exploramos. A conexao entre as ideias sugere um framework mental: comece simples, itere constantemente, e deixe os resultados compostos fazerem o trabalho pesado.`
  ],
  generic: [
    `"{prompt}" e uma questao que merece reflexao cuidadosa. De forma geral, a resposta envolve equilibrar multiplas perspectivas e considerar tanto beneficios de curto prazo quanto impactos de longo prazo.`,
    `Pensando sobre "{prompt}", existem varios angulos a considerar. A chave esta em identificar os principios fundamentais e aplica-los de forma consistente, adaptando-se ao contexto especifico.`,
    `Para responder "{prompt}", precisamos considerar o contexto mais amplo. A abordagem mais efetiva geralmente envolve comecar com o basico, validar hipoteses rapidamente, e iterar baseado em feedback real.`
  ]
}

export async function generateAnswer(context: AIContext): Promise<AIResponse> {
  if (!context.prompt.trim()) {
    return {
      success: false,
      error: 'Por favor, escreva uma pergunta.'
    }
  }

  await delay(MOCK_DELAY)

  // Random error disabled in test env to avoid flakiness
  const isTestEnv = typeof window !== 'undefined' &&
    (window.location.href.includes('test-harness') ||
     (window as any).__PLAYWRIGHT_TEST__)

  if (!isTestEnv && Math.random() < 0.05) {
    return {
      success: false,
      error: 'Erro ao gerar resposta. Por favor, tente novamente.'
    }
  }

  const response = generateContextualResponse(context)

  return {
    success: true,
    content: response
  }
}

interface ContextAnalysis {
  hasTweet: boolean
  tweetText: string | null
  hasPreviousQA: boolean
  previousQAs: Array<{ prompt: string; response: string }>
  hasNotes: boolean
  notes: string[]
}

function analyzeContext(ancestors: CustomNodeData[]): ContextAnalysis {
  const tweets = ancestors.filter(isLoadedTweet)
  const questions = ancestors.filter(isDoneQuestion)
  const notes = ancestors.filter(isNoteData)

  return {
    hasTweet: tweets.length > 0,
    tweetText: tweets[0]?.text ?? null,
    hasPreviousQA: questions.length > 0,
    previousQAs: questions.map(q => ({
      prompt: q.prompt,
      response: q.response ?? ''
    })),
    hasNotes: notes.length > 0,
    notes: notes.map(n => n.content)
  }
}

function generateContextualResponse(context: AIContext): string {
  const analysis = analyzeContext(context.ancestors)

  let templates: string[]

  if (analysis.hasTweet) {
    templates = RESPONSE_TEMPLATES.withTweet
  } else if (analysis.hasPreviousQA) {
    templates = RESPONSE_TEMPLATES.withPreviousQA
  } else {
    templates = RESPONSE_TEMPLATES.generic
  }

  const template = templates[Math.floor(Math.random() * templates.length)]!
  let response = template.replace('{prompt}', context.prompt)

  if (analysis.hasTweet && analysis.tweetText) {
    response += `\n\nO tweet original menciona: "${truncate(analysis.tweetText, 100)}"`
  }

  if (analysis.hasPreviousQA && analysis.previousQAs.length > 0) {
    const lastQA = analysis.previousQAs[analysis.previousQAs.length - 1]!
    response += `\n\nIsso se conecta com sua pergunta anterior sobre "${truncate(lastQA.prompt, 50)}".`
  }

  if (analysis.hasNotes && analysis.notes.length > 0) {
    response += `\n\nSuas anotacoes tambem sao relevantes para esta discussao.`
  }

  return response
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Formats context for debug/log.
 * Useful for verifying what would be sent to a real LLM.
 */
export function formatContextForDebug(context: AIContext): string {
  const lines: string[] = ['=== AI CONTEXT ===']

  lines.push('\n--- ANCESTORS ---')
  for (const node of context.ancestors) {
    if (isTweetData(node) && node.status === 'loaded') {
      lines.push(`[TWEET] @${node.author?.handle}: ${node.text}`)
    } else if (isQuestionData(node) && node.status === 'done') {
      lines.push(`[Q] ${node.prompt}`)
      lines.push(`[A] ${node.response}`)
    } else if (isNoteData(node)) {
      lines.push(`[NOTE] ${node.content}`)
    }
  }

  lines.push('\n--- PROMPT ---')
  lines.push(context.prompt)

  return lines.join('\n')
}
