import { useState, useCallback, useRef, useEffect, type KeyboardEvent } from "react";
import { useEditor } from "tldraw";
import type { QuestionShape } from "../../types/shapes";
import { useAskQuestion } from "../../hooks/useAiResponse";
import { useShapeContext } from "../../hooks/useShapeContext";
import { useAutoHeight } from "../../hooks/useAutoHeight";
import { BaseCard } from "../ui/BaseCard";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { ExpandableText } from "../ui/ExpandableText";
import { AddChildButton } from "./AddChildButton";
import { Interactive } from "../ui/Interactive";

interface QuestionCardProps {
  shape: QuestionShape;
}

const MIN_PROMPT_LENGTH = 3;
const MAX_PROMPT_LENGTH = 1000;

/** Minimum height for auto-sizing */
const MIN_HEIGHT = 180;

/**
 * Question card component that renders different states:
 * - draft: Textarea for writing question
 * - loading: Spinner with "Gerando resposta..." message
 * - done: Question and AI response with badge
 * - error: Error message with retry option
 *
 * Height is automatically measured and synced to shape via useAutoHeight.
 */
export function QuestionCard({ shape }: QuestionCardProps) {
  const editor = useEditor();
  const { mutate: askQuestion } = useAskQuestion();
  const context = useShapeContext(shape.id);
  const [prompt, setPrompt] = useState(shape.props.prompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoHeightRef = useAutoHeight(shape.id, "question", MIN_HEIGHT);

  // Auto-focus textarea when in draft state
  useEffect(() => {
    if (shape.props.status === "draft" && textareaRef.current) {
      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }, [shape.props.status]);

  const trimmedPrompt = prompt.trim();
  const isValidLength =
    trimmedPrompt.length >= MIN_PROMPT_LENGTH &&
    trimmedPrompt.length <= MAX_PROMPT_LENGTH;
  const isOverLimit = trimmedPrompt.length > MAX_PROMPT_LENGTH;

  const handleSubmit = useCallback(() => {
    if (!isValidLength) return;

    // Update shape to loading state
    editor.updateShape<QuestionShape>({
      id: shape.id,
      type: "question",
      props: {
        status: "loading",
        prompt: trimmedPrompt,
      },
    });

    askQuestion(
      { prompt: trimmedPrompt, context },
      {
        onSuccess: (response) => {
          if (response.success && response.content) {
            editor.updateShape<QuestionShape>({
              id: shape.id,
              type: "question",
              props: {
                status: "done",
                response: response.content,
                // Height is auto-measured by useAutoHeight
              },
            });
          } else {
            editor.updateShape<QuestionShape>({
              id: shape.id,
              type: "question",
              props: {
                status: "error",
                error:
                  response.error || "Erro ao gerar resposta. Tente novamente.",
              },
            });
          }
        },
        onError: (error) => {
          editor.updateShape<QuestionShape>({
            id: shape.id,
            type: "question",
            props: {
              status: "error",
              error:
                error.message || "Erro ao gerar resposta. Tente novamente.",
            },
          });
        },
      }
    );
  }, [editor, shape.id, trimmedPrompt, isValidLength, askQuestion, context]);

  const handleRetry = useCallback(() => {
    // Reset to loading and retry with same prompt
    editor.updateShape<QuestionShape>({
      id: shape.id,
      type: "question",
      props: {
        status: "loading",
        error: undefined,
      },
    });

    askQuestion(
      { prompt: shape.props.prompt, context },
      {
        onSuccess: (response) => {
          if (response.success && response.content) {
            editor.updateShape<QuestionShape>({
              id: shape.id,
              type: "question",
              props: {
                status: "done",
                response: response.content,
                error: undefined,
                // Height is auto-measured by useAutoHeight
              },
            });
          } else {
            editor.updateShape<QuestionShape>({
              id: shape.id,
              type: "question",
              props: {
                status: "error",
                error:
                  response.error || "Erro ao gerar resposta. Tente novamente.",
              },
            });
          }
        },
        onError: (error) => {
          editor.updateShape<QuestionShape>({
            id: shape.id,
            type: "question",
            props: {
              status: "error",
              error:
                error.message || "Erro ao gerar resposta. Tente novamente.",
            },
          });
        },
      }
    );
  }, [editor, shape.id, shape.props.prompt, askQuestion, context]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+Enter or Cmd+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isValidLength) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, isValidLength]
  );

  // Draft state - show textarea for question
  if (shape.props.status === "draft") {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="question-card"
          data-shape-id={shape.id}
          data-status="draft"
          borderColor="var(--color-question)"
        >
          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center gap-2 text-gray-400">
              <QuestionIcon />
              <span className="text-sm font-medium">Pergunta</span>
            </div>

            {/* Textarea */}
            <div data-testid="question-prompt-section">
              <Interactive>
                <textarea
                  ref={textareaRef}
                  data-testid="question-prompt-input"
                  placeholder="Escreva sua pergunta..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`
                    w-full min-h-[80px] rounded-md border px-3 py-2
                    text-sm placeholder-gray-400 resize-none
                    focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500
                    ${isOverLimit ? "border-red-300" : "border-gray-300"}
                  `}
                  autoFocus
                />
              </Interactive>
            </div>

            {/* Footer with char count and submit button */}
            <div className="flex items-center justify-between">
              <span
                data-testid="question-char-count"
                className={`text-xs ${
                  isOverLimit ? "text-red-500 font-medium" : "text-gray-400"
                }`}
              >
                {trimmedPrompt.length}/{MAX_PROMPT_LENGTH}
              </span>

              <Interactive>
                <button
                  type="button"
                  data-testid="question-submit-btn"
                  onClick={handleSubmit}
                  disabled={!isValidLength}
                  className="
                    flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2
                    text-sm font-medium text-white
                    transition-colors duration-150
                    hover:bg-purple-700
                    disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500
                  "
                >
                  Submeter
                  <span className="text-xs opacity-75">Ctrl+Enter</span>
                </button>
              </Interactive>
            </div>
          </div>
        </BaseCard>
      </div>
    );
  }

  // Loading state - show spinner
  if (shape.props.status === "loading") {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="question-card"
          data-shape-id={shape.id}
          data-status="loading"
          borderColor="var(--color-loading)"
          className="animate-pulse-border"
        >
          <div className="flex flex-col gap-3">
            {/* Prompt readonly */}
            <div data-testid="question-prompt-section">
              <p
                data-testid="question-prompt-text"
                className="text-gray-700 font-medium whitespace-pre-wrap"
              >
                {shape.props.prompt}
              </p>
            </div>

            {/* Divider */}
            <div data-testid="question-divider" className="h-px bg-gray-200" />

            {/* Loading indicator */}
            <div
              data-testid="question-loading"
              className="flex items-center gap-3 py-4"
            >
              <LoadingSpinner
                data-testid="question-spinner"
                size={24}
                color="var(--color-loading)"
              />
              <span className="text-sm text-gray-500">Gerando resposta...</span>
            </div>
          </div>
        </BaseCard>
      </div>
    );
  }

  // Error state - show error message with retry
  if (shape.props.status === "error") {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="question-card"
          data-shape-id={shape.id}
          data-status="error"
          borderColor="var(--color-error)"
        >
          <div className="flex flex-col gap-3">
            {/* Prompt readonly */}
            <div data-testid="question-prompt-section">
              <p
                data-testid="question-prompt-text"
                className="text-gray-700 font-medium whitespace-pre-wrap"
              >
                {shape.props.prompt}
              </p>
            </div>

            {/* Divider */}
            <div data-testid="question-divider" className="h-px bg-gray-200" />

            {/* Error message */}
            <div
              data-testid="question-error-message"
              className="rounded-md bg-red-50 p-3 text-sm text-red-600"
            >
              {shape.props.error || "Erro ao gerar resposta. Tente novamente."}
            </div>

            {/* Retry button */}
            <Interactive>
              <button
                type="button"
                data-testid="question-retry-btn"
                onClick={handleRetry}
                className="
                  w-full rounded-md bg-purple-600 px-4 py-2
                  text-sm font-medium text-white
                  transition-colors duration-150
                  hover:bg-purple-700
                "
              >
                Tentar novamente
              </button>
            </Interactive>
          </div>
        </BaseCard>
      </div>
    );
  }

  // Done state - show question and response
  if (shape.props.status === "done") {
    return (
      <div ref={autoHeightRef}>
        <BaseCard
          data-testid="question-card"
          data-shape-id={shape.id}
          data-status="done"
          borderColor="var(--color-question)"
        >
          <div className="flex flex-col gap-3">
            {/* Prompt readonly */}
            <div data-testid="question-prompt-section">
              <p
                data-testid="question-prompt-text"
                className="text-gray-500 font-medium whitespace-pre-wrap"
              >
                {shape.props.prompt}
              </p>
            </div>

            {/* Divider */}
            <div data-testid="question-divider" className="h-px bg-gray-200" />

            {/* Response section - no max-height, shape grows with content */}
            <div data-testid="question-response-section">
              {/* AI Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  data-testid="question-ai-badge"
                  className="
                    inline-block px-2 py-0.5 rounded
                    bg-green-100 text-green-700
                    text-xs font-semibold uppercase
                  "
                >
                  AI
                </span>
              </div>

              {/* Response text */}
              <ExpandableText
                data-testid="question-response-text"
                text={shape.props.response || ""}
                maxLines={5}
                className="text-gray-700"
              />
            </div>

            {/* Footer with add child button */}
            <div
              data-testid="question-footer"
              className="flex items-center justify-end border-t border-gray-100 pt-3"
            >
              <AddChildButton
                shapeId={shape.id}
                data-testid="question-add-child-btn"
              />
            </div>
          </div>
        </BaseCard>
      </div>
    );
  }

  // Fallback
  return null;
}

/**
 * Question icon component
 */
function QuestionIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
