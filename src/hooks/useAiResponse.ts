import { useMutation } from '@tanstack/react-query'
import { generateResponse, type AiContext, type AiResponse } from '../services/aiService'

interface AskQuestionParams {
  prompt: string
  context: AiContext
}

/**
 * Hook to generate AI responses using TanStack Query mutation.
 *
 * Usage:
 * ```tsx
 * const { mutate: askQuestion, isPending, error } = useAskQuestion()
 *
 * askQuestion(
 *   { prompt: 'What does this mean?', context: { tweet: { ... } } },
 *   {
 *     onSuccess: (response) => { ... },
 *     onError: (error) => { ... }
 *   }
 * )
 * ```
 */
export function useAskQuestion() {
  return useMutation<AiResponse, Error, AskQuestionParams>({
    mutationFn: ({ prompt, context }) => generateResponse(prompt, context),
  })
}

export type { AiContext, AiResponse }
