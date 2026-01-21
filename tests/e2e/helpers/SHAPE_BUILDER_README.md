# Shape Builder System - Usage Guide

## Overview

The Shape Builder system provides a fluent, chainable API for creating and interacting with shapes in E2E tests. It dramatically reduces code repetition, improves readability, and provides direct access to tldraw shape IDs for advanced assertions.

## Quick Start

### Basic Shape Creation

```typescript
import { ShapeBuilder } from "./helpers/test-utils";

// Create a tweet
const tweet = await ShapeBuilder.tweet(page)
  .loadUrl("https://twitter.com/user/status/123")
  .build();

// Create a question
const question = await ShapeBuilder.question(page)
  .submit("What is this about?")
  .build();

// Create a note
const note = await ShapeBuilder.note(page)
  .write("My note content")
  .build();
```

### Creating Child Shapes

```typescript
// Create parent and child in a fluent chain
const tweet = await ShapeBuilder.tweet(page)
  .loadUrl("https://twitter.com/user/status/123")
  .build();

const note = await tweet
  .addChild("note")
  .write("Child note")
  .build();

// Access shape IDs for assertions
await expectArrowConnectsShapes(page, tweet.id, note.id);
```

### Deep Chains

```typescript
// Create multi-level hierarchies elegantly
const level1 = await ShapeBuilder.tweet(page)
  .loadUrl("https://twitter.com/user/status/123")
  .build();

const level2 = await level1
  .addChild("question")
  .submit("Question?")
  .build();

const level3 = await level2
  .addChild("note")
  .write("Deep note")
  .build();

// 2 arrows connect the chain
await expectParentChildArrows(page, 2);
```

## API Reference

### ShapeBuilder Factory

Entry point for creating builders.

```typescript
class ShapeBuilder {
  static tweet(page: Page): TweetBuilder
  static question(page: Page): QuestionBuilder
  static note(page: Page): NoteBuilder
}
```

### TweetBuilder

```typescript
interface TweetBuilder {
  // Load tweet URL
  loadUrl(url: string): this
  loadUrlViaEnter(url: string): this
  
  // Position and view
  atPosition(x: number, y: number): this
  fitView(): this
  
  // Execute and return handle
  build(): Promise<ShapeHandle>
}
```

### QuestionBuilder

```typescript
interface QuestionBuilder {
  // Submit question
  submit(question: string): this
  submitViaEnter(question: string): this
  skipAiWait(): this  // Don't wait for AI response
  
  // Position and view
  atPosition(x: number, y: number): this
  fitView(): this
  
  // Execute and return handle
  build(): Promise<ShapeHandle>
}
```

### NoteBuilder

```typescript
interface NoteBuilder {
  // Write content
  write(content: string): this
  
  // Position and view
  atPosition(x: number, y: number): this
  fitView(): this
  
  // Execute and return handle
  build(): Promise<ShapeHandle>
}
```

### ShapeHandle

Returned by `.build()` - represents a created shape.

```typescript
interface ShapeHandle {
  // Properties
  readonly id: string           // Tldraw internal shape ID
  readonly testId: string        // data-testid value
  readonly type: ShapeType       // "tweet" | "question" | "note"
  readonly locator: Locator      // Playwright locator
  readonly page: Page
  
  // Create children
  addChild(type: "tweet"): TweetBuilder
  addChild(type: "question"): QuestionBuilder
  addChild(type: "note"): NoteBuilder
  
  // Actions
  select(): Promise<void>
  delete(): Promise<void>
  click(): Promise<void>
  
  // Assertions
  expectVisible(): Promise<void>
  expectNotVisible(): Promise<void>
  expectHasParentArrow(): Promise<void>
  expectChildCount(count: number): Promise<void>
}
```

## Usage Examples

### Creating Multiple Children

```typescript
const parent = await ShapeBuilder.question(page)
  .submit("Parent question?")
  .build();

const child1 = await parent.addChild("note").write("Child 1").build();
const child2 = await parent.addChild("note").write("Child 2").build();
const child3 = await parent.addChild("tweet")
  .loadUrl("https://twitter.com/user/status/123")
  .build();

await parent.expectChildCount(3);
await expectParentChildArrows(page, 3);
```

### Branching Tree Structure

```typescript
const root = await ShapeBuilder.tweet(page)
  .loadUrl("https://twitter.com/user/status/999")
  .build();

// Branch 1
const branch1 = await root.addChild("question")
  .submit("Branch 1?")
  .build();

const branch1leaf = await branch1.addChild("note")
  .write("Leaf 1")
  .build();

// Branch 2
const branch2 = await root.addChild("note")
  .write("Branch 2")
  .build();

// Total: 3 arrows (root->branch1, branch1->leaf, root->branch2)
await expectParentChildArrows(page, 3);
```

### Custom Positioning

```typescript
// Create shapes at specific coordinates for layout testing
const tweet = await ShapeBuilder.tweet(page)
  .atPosition(200, 200)
  .loadUrl("https://twitter.com/user/status/111")
  .build();

const note = await ShapeBuilder.note(page)
  .atPosition(700, 200)
  .write("Far away note")
  .build();

// These are independent shapes (different flows)
await expectParentChildArrows(page, 0);
```

### Empty State Testing

```typescript
// Create shapes without content to test empty states
const emptyTweet = await ShapeBuilder.tweet(page).build();
await expect(page.getByTestId("tweet-url-input")).toBeVisible();

const emptyQuestion = await ShapeBuilder.question(page)
  .skipAiWait()
  .build();
await expect(page.getByTestId("question-prompt-input").last()).toBeVisible();

const emptyNote = await ShapeBuilder.note(page).build();
await expect(page.getByTestId("note-textarea").last()).toBeVisible();
```

### Shape Actions

```typescript
const note = await ShapeBuilder.note(page)
  .write("To be deleted")
  .build();

// Select shape
await note.select();

// Click shape
await note.click();

// Delete shape
await note.delete();
await note.expectNotVisible();
```

### Using Shape IDs for Advanced Assertions

```typescript
const parent = await ShapeBuilder.tweet(page)
  .loadUrl("https://twitter.com/user/status/123")
  .build();

const child = await parent.addChild("note")
  .write("Child")
  .build();

// Use IDs to verify specific arrow connections
await expectArrowConnectsShapes(page, parent.id, child.id);

// Store IDs for later assertions
const parentId = parent.id;
const childId = child.id;

// ... perform other operations ...

// Verify relationship still exists
await expectArrowConnectsShapes(page, parentId, childId);
```

### Using Locators for Custom Assertions

```typescript
const tweet = await ShapeBuilder.tweet(page)
  .loadUrl("https://twitter.com/user/status/123")
  .build();

// Use the handle's locator for Playwright assertions
await expect(tweet.locator).toBeVisible();
await expect(tweet.locator).toHaveAttribute("data-testid", "tweet-card");

const text = await tweet.locator.textContent();
expect(text).toContain("expected content");
```

## Migration Guide

### Before (Old Pattern)

```typescript
// 7 lines to create parent with child
await addShapeViaMenu(page, "Tweet");
await loadTweet(page, "https://twitter.com/user/status/123");
await page.getByTestId("tweet-add-child-btn").click({ force: true });
await page.getByTestId("menu-option-note").click();
await writeNote(page, "Child note");
await fitCanvasView(page);
await expectParentChildArrows(page, 1);
```

### After (New Pattern)

```typescript
// 4 lines with fluent API
const tweet = await ShapeBuilder.tweet(page)
  .loadUrl("https://twitter.com/user/status/123")
  .build();

const note = await tweet.addChild("note")
  .write("Child note")
  .fitView()
  .build();

await expectParentChildArrows(page, 1);
```

### Before (Complex Chain)

```typescript
// 20+ lines
await addShapeViaMenu(page, "Tweet");
await loadTweet(page, "https://twitter.com/user/status/444");

await page.getByTestId("tweet-add-child-btn").click({ force: true });
await page.getByTestId("menu-option-question").click();
await fitCanvasView(page);
await submitQuestion(page, "Question?");

await clickZoomOut(page);
await clickZoomOut(page);
await page.getByTestId("question-add-child-btn").first().click({ force: true });
await page.getByTestId("menu-option-note").click();
await writeNote(page, "Note");
await fitCanvasView(page);

await expectParentChildArrows(page, 2);
```

### After (Complex Chain)

```typescript
// 9 lines - clean and readable
const tweet = await ShapeBuilder.tweet(page)
  .loadUrl("https://twitter.com/user/status/444")
  .build();

const question = await tweet.addChild("question")
  .submit("Question?")
  .build();

const note = await question.addChild("note")
  .write("Note")
  .build();

await expectParentChildArrows(page, 2);
```

## Benefits

1. **60-70% Code Reduction**: Fewer lines, less repetition
2. **Better Readability**: Self-documenting fluent syntax
3. **Type Safety**: Compile-time validation of operations
4. **Shape IDs**: Direct access to tldraw IDs for assertions
5. **Composability**: Store and reuse builders and handles
6. **Maintainability**: UI changes only affect builder implementations
7. **Discoverability**: IDE autocomplete reveals all operations

## Tips

1. **Always call `.build()`**: Builders don't execute until you call `.build()`
2. **Builders are one-shot**: Can't reuse a builder after calling `.build()`
3. **Store handles**: Keep references to handles for later assertions
4. **Use shape IDs**: Access `.id` property for advanced assertions
5. **Chain methods**: Take advantage of the fluent API
6. **Test-specific positioning**: Use `.atPosition()` when layout matters

## Examples Repository

See complete examples in:
- `tests/e2e/shape-builder.spec.ts` - Comprehensive builder tests
- `tests/e2e/cascade-delete-integration-migrated.spec.ts` - Real-world migration example

## Backwards Compatibility

All existing helpers (`addShapeViaMenu`, `loadTweet`, `submitQuestion`, etc.) remain available. You can migrate tests gradually at your own pace.
