/**
 * AI Service - Mock implementation for MVP
 *
 * Provides contextual mock responses for questions.
 * Returns deterministic data based on prompt for consistency.
 */

export interface AiContext {
  tweet?: { text: string; author: string }
  previousQuestions?: Array<{ prompt: string; response: string }>
  notes?: string[]
}

export interface AiResponse {
  success: boolean
  content?: string
  error?: string
}

/**
 * Checks if running in Playwright test environment.
 */
function isTestEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  return (
    (window as Window & { __PLAYWRIGHT_TEST__?: boolean }).__PLAYWRIGHT_TEST__ ===
    true
  )
}

/**
 * Checks if AI error is forced (for testing error states).
 */
function isForceError(): boolean {
  if (typeof window === 'undefined') return false
  return (
    (window as Window & { __FORCE_AI_ERROR__?: boolean }).__FORCE_AI_ERROR__ ===
    true
  )
}

/**
 * Gets custom AI delay (for testing).
 */
function getCustomDelay(): number | null {
  if (typeof window === 'undefined') return null
  return (window as Window & { __AI_DELAY_MS__?: number }).__AI_DELAY_MS__ ?? null
}

/**
 * Simple hash function to generate deterministic values from string.
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Generates a contextual mock response based on prompt and context.
 */
function generateMockResponse(prompt: string, context: AiContext): string {
  const parts: string[] = []

  // Add tweet context if available
  if (context.tweet) {
    parts.push(`Analisando o tweet de @${context.tweet.author}`)
  }

  // Add previous questions context if available
  if (context.previousQuestions && context.previousQuestions.length > 0) {
    parts.push(
      `considerando as ${context.previousQuestions.length} perguntas anteriores`
    )
  }

  // Add notes context if available
  if (context.notes && context.notes.length > 0) {
    parts.push(`levando em conta suas ${context.notes.length} anotacoes`)
  }

  // Build response
  let response = ''

  if (parts.length > 0) {
    response = parts.join(', ') + ', '
  }

  // Generate response based on prompt content
  const promptLower = prompt.toLowerCase()
  const hash = hashCode(prompt)

  const genericResponses = [
    'Esta e uma resposta mockada que demonstra como a IA responderia a esta pergunta. Em producao, isso seria substituido por uma chamada real a um LLM.',
    'Baseado no contexto fornecido, posso oferecer a seguinte analise. Note que esta e uma resposta de demonstracao para validar a experiencia do usuario.',
    'Aqui esta minha perspectiva sobre sua pergunta. Esta resposta mockada simula o comportamento esperado do sistema em producao.',
    'Considerando todos os fatores relevantes, esta e minha resposta. O sistema real utilizaria um modelo de linguagem avancado para gerar respostas mais contextualizadas.',
    'Esta analise leva em conta o contexto disponivel. Em um ambiente de producao, a resposta seria gerada por um LLM como GPT ou Claude.',
  ]

  // Select response based on prompt hash for determinism
  const selectedResponse = genericResponses[hash % genericResponses.length]

  // Add specific prefix based on question type
  if (promptLower.includes('significa') || promptLower.includes('meaning')) {
    response += `aqui esta minha interpretacao sobre "${prompt.slice(0, 30)}...": `
  } else if (promptLower.includes('como') || promptLower.includes('how')) {
    response += `sobre como "${prompt.slice(0, 30)}...": `
  } else if (promptLower.includes('por que') || promptLower.includes('why')) {
    response += `explicando por que "${prompt.slice(0, 30)}...": `
  } else {
    response += `respondendo a "${prompt.slice(0, 30)}...": `
  }

  response += selectedResponse

  // Add line breaks for longer responses (testing ExpandableText)
  if (prompt.length > 50) {
    response +=
      '\n\nParagrafo adicional para demonstrar respostas mais longas que podem precisar de expansao.'
    response +=
      '\n\nMais um paragrafo que adiciona profundidade a resposta e testa a funcionalidade de "Ver mais".'
  }

  return response
}

/**
 * Generates a response for a question (mock implementation).
 *
 * - Validates prompt
 * - Returns deterministic mock data based on prompt and context
 * - Simulates network delay (1500ms in production, 0ms in tests)
 * - Has 5% chance of random error (disabled in tests)
 */
export async function generateResponse(
  prompt: string,
  context: AiContext = {}
): Promise<AiResponse> {
  // Check for forced error (testing)
  if (isForceError()) {
    const customDelay = getCustomDelay()
    const delay = customDelay ?? (isTestEnvironment() ? 0 : 1500)
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
    return {
      success: false,
      error: 'Erro ao gerar resposta. Tente novamente.',
    }
  }

  // Validate prompt
  const trimmedPrompt = prompt.trim()
  if (!trimmedPrompt || trimmedPrompt.length < 3) {
    return {
      success: false,
      error: 'Pergunta muito curta. Minimo de 3 caracteres.',
    }
  }

  if (trimmedPrompt.length > 1000) {
    return {
      success: false,
      error: 'Pergunta muito longa. Maximo de 1000 caracteres.',
    }
  }

  // Simulate network delay (skip in test environment)
  const customDelay = getCustomDelay()
  const delay = customDelay ?? (isTestEnvironment() ? 0 : 1500)
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  // Random error chance (5%) - disabled in tests
  if (!isTestEnvironment() && Math.random() < 0.05) {
    return {
      success: false,
      error: 'Erro ao gerar resposta. Tente novamente.',
    }
  }

  // Generate mock response
  const content = generateMockResponse(trimmedPrompt, context)

  return {
    success: true,
    content,
  }
}
