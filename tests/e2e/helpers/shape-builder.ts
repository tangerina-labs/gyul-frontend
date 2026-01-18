import type { Page } from "@playwright/test";
import { TweetBuilder } from "./tweet-builder";
import { QuestionBuilder } from "./question-builder";
import { NoteBuilder } from "./note-builder";
import type {
  TweetBuilder as ITweetBuilder,
  QuestionBuilder as IQuestionBuilder,
  NoteBuilder as INoteBuilder,
} from "./shape-builder-types";

/**
 * Factory class for creating shape builders.
 * Provides a clean entry point for the fluent builder API.
 * 
 * @example
 * ```typescript
 * // Create a tweet
 * const tweet = await ShapeBuilder.tweet(page)
 *   .loadUrl("https://twitter.com/user/status/123")
 *   .build();
 * 
 * // Create a child question
 * const question = await tweet.addChild("question")
 *   .submit("What is this about?")
 *   .build();
 * ```
 */
export class ShapeBuilder {
  /**
   * Create a new TweetBuilder
   */
  static tweet(page: Page): ITweetBuilder {
    return new TweetBuilder(page);
  }

  /**
   * Create a new QuestionBuilder
   */
  static question(page: Page): IQuestionBuilder {
    return new QuestionBuilder(page);
  }

  /**
   * Create a new NoteBuilder
   */
  static note(page: Page): INoteBuilder {
    return new NoteBuilder(page);
  }
}

/**
 * Internal helper function to create a child builder.
 * This is called by ShapeHandle.addChild() to handle the UI interaction
 * and return the appropriate builder.
 * 
 * @internal
 */
export function createChildBuilder(
  page: Page,
  type: string,
  parentId: string,
  parentTestId: string
): ITweetBuilder | IQuestionBuilder | INoteBuilder {
  // Create the builder marked as a child
  // The builder's build() method will perform the UI clicks before interacting with the shape
  
  let builder: TweetBuilder | QuestionBuilder | NoteBuilder;
  
  switch (type.toLowerCase()) {
    case "tweet":
      builder = new TweetBuilder(page, parentId, parentTestId);
      break;
    case "question":
      builder = new QuestionBuilder(page, parentId, parentTestId);
      break;
    case "note":
      builder = new NoteBuilder(page, parentId, parentTestId);
      break;
    default:
      throw new Error(`Unknown shape type: ${type}`);
  }

  return builder;
}

// Export builder classes for advanced usage
export { TweetBuilder } from "./tweet-builder";
export { QuestionBuilder } from "./question-builder";
export { NoteBuilder } from "./note-builder";
export { ShapeHandle } from "./shape-handle";
