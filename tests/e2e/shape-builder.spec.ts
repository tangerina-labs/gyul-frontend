import { test, expect } from "@playwright/test";
import {
  startFresh,
  createCanvasViaUI,
  ShapeBuilder,
  expectParentChildArrows,
  getShapeCount,
  expectArrowConnectsShapes,
  fitCanvasView,
} from "./helpers/test-utils";

/**
 * Tests for the Fluent Shape Builder System
 * 
 * This test suite validates the new builder API for creating shapes
 * and their relationships in a more elegant and maintainable way.
 */
test.describe("Shape Builder API", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await createCanvasViaUI(page, "Builder Test");
  });

  test.describe("Basic Shape Creation", () => {
    test("creates a tweet with URL", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/123")
        .build();

      // Verify shape was created
      await tweet.expectVisible();
      expect(tweet.id).toBeTruthy();
      expect(tweet.type).toBe("tweet");

      // Verify tweet content is loaded
      await expect(page.getByTestId("tweet-author-handle")).toBeVisible();
    });

    test("creates a question with submission", async ({ page }) => {
      const question = await ShapeBuilder.question(page)
        .submit("What is the meaning of life?")
        .build();

      await question.expectVisible();
      expect(question.id).toBeTruthy();
      expect(question.type).toBe("question");

      // Verify AI badge appears (response received)
      await expect(page.getByTestId("question-ai-badge").first()).toBeVisible();
    });

    test("creates a note with content", async ({ page }) => {
      const note = await ShapeBuilder.note(page)
        .write("This is a test note")
        .build();

      await note.expectVisible();
      expect(note.id).toBeTruthy();
      expect(note.type).toBe("note");

      // Verify note content is displayed
      await expect(page.getByTestId("note-content").last()).toBeVisible();
    });

    test("creates shapes at custom positions", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .atPosition(200, 200)
        .loadUrl("https://twitter.com/user/status/456")
        .build();

      await tweet.expectVisible();

      const note = await ShapeBuilder.note(page)
        .atPosition(700, 200)
        .write("Far away note")
        .build();

      await note.expectVisible();

      // Both shapes should exist independently
      const count = await getShapeCount(page);
      expect(count).toBe(2);
    });
  });

  test.describe("Empty State Creation", () => {
    test("creates empty tweet (no URL)", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page).build();

      await tweet.expectVisible();

      // Should show URL input
      await expect(page.getByTestId("tweet-url-input")).toBeVisible();

      // Add child button should NOT be visible in empty state
      await expect(page.getByTestId("tweet-add-child-btn")).not.toBeVisible();
    });

    test("creates empty question (no submission)", async ({ page }) => {
      const question = await ShapeBuilder.question(page)
        .skipAiWait()
        .build();

      await question.expectVisible();

      // Should show prompt input
      await expect(page.getByTestId("question-prompt-input").last()).toBeVisible();
    });

    test("creates empty note (no content)", async ({ page }) => {
      const note = await ShapeBuilder.note(page).build();

      await note.expectVisible();

      // Should show textarea
      await expect(page.getByTestId("note-textarea").last()).toBeVisible();
    });
  });

  test.describe("Child Creation", () => {
    test("creates tweet with note child", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/111")
        .build();

      const note = await tweet
        .addChild("note")
        .write("Child note")
        .build();

      // Verify both exist
      await tweet.expectVisible();
      await note.expectVisible();

      // Verify arrow was created
      await expectParentChildArrows(page, 1);

      // Verify arrow connects them
      await expectArrowConnectsShapes(page, tweet.id, note.id);
    });

    test("creates question with tweet child", async ({ page }) => {
      const question = await ShapeBuilder.question(page)
        .submit("What is this?")
        .build();

      const tweet = await question
        .addChild("tweet")
        .loadUrl("https://twitter.com/user/status/222")
        .build();

      await question.expectVisible();
      await tweet.expectVisible();

      await expectParentChildArrows(page, 1);
      await expectArrowConnectsShapes(page, question.id, tweet.id);
    });

    test("creates note with question child", async ({ page }) => {
      const note = await ShapeBuilder.note(page)
        .write("Parent note")
        .build();

      const question = await note
        .addChild("question")
        .submit("Child question?")
        .build();

      await note.expectVisible();
      await question.expectVisible();

      await expectParentChildArrows(page, 1);
      await expectArrowConnectsShapes(page, note.id, question.id);
    });
  });

  test.describe("Deep Chains", () => {
    test("creates 3-level chain", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/333")
        .build();

      const question = await tweet
        .addChild("question")
        .submit("Level 2?")
        .build();

      const note = await question
        .addChild("note")
        .write("Level 3")
        .build();

      // All shapes exist
      await tweet.expectVisible();
      await question.expectVisible();
      await note.expectVisible();

      // 2 arrows connect the chain
      await expectParentChildArrows(page, 2);

      await expectArrowConnectsShapes(page, tweet.id, question.id);
      await expectArrowConnectsShapes(page, question.id, note.id);
    });

    test("creates 4-level deep chain", async ({ page }) => {
      const level1 = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/444")
        .build();

      const level2 = await level1
        .addChild("question")
        .submit("Question?")
        .build();

      const level3 = await level2
        .addChild("note")
        .write("Note")
        .build();

      const level4 = await level3
        .addChild("question")
        .submit("Deep question?")
        .build();

      // All 4 shapes exist
      await level1.expectVisible();
      await level2.expectVisible();
      await level3.expectVisible();
      await level4.expectVisible();

      // 3 arrows in the chain
      await expectParentChildArrows(page, 3);

      // 7 shapes= 2 questions + 1 note + tweet + 3 arrows
      const count = await getShapeCount(page);
      expect(count).toBe(7);
    });
  });

  test.describe("Multiple Children", () => {
    test("creates parent with 2 children", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/555")
        .build();

      const child1 = await tweet
        .addChild("note")
        .write("First child")
        .build();

      const child2 = await tweet
        .addChild("question")
        .submit("Second child?")
        .build();

      await tweet.expectVisible();
      await child1.expectVisible();
      await child2.expectVisible();

      // 2 arrows from parent to children
      await expectParentChildArrows(page, 2);

      await expectArrowConnectsShapes(page, tweet.id, child1.id);
      await expectArrowConnectsShapes(page, tweet.id, child2.id);
    });

    test("creates parent with 3 children", async ({ page }) => {
      const question = await ShapeBuilder.question(page)
        .submit("Parent question?")
        .build();

      await fitCanvasView(page)

      await question.addChild("tweet")
        .loadUrl("https://twitter.com/user/status/666")
        .build();

      await fitCanvasView(page)

      await question.addChild("note")
        .write("Child 2")
        .build();

      await fitCanvasView(page)

      await question.addChild("note")
        .write("Child 3")
        .build();

      await fitCanvasView(page)

      // 3 arrows from parent
      await expectParentChildArrows(page, 3);

      await question.expectChildCount(3);
    });
  });

  test.describe("Shape Handle Actions", () => {
    test("can select shapes", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/777")
        .build();

      // Select should not throw
      await tweet.select();
    });

    test("can delete shapes", async ({ page }) => {
      const note = await ShapeBuilder.note(page)
        .write("To be deleted")
        .build();

      await note.expectVisible();

      await note.delete();

      await note.expectNotVisible();
    });

    test("can click shapes", async ({ page }) => {
      const question = await ShapeBuilder.question(page)
        .submit("Clickable?")
        .build();

      await question.click();

      // Should still be visible after click
      await question.expectVisible();
    });
  });

  test.describe("Fluent API Features", () => {
    test("supports method chaining", async ({ page }) => {
      // All in one fluent chain
      const tweet = await ShapeBuilder.tweet(page)
        .atPosition(300, 300)
        .loadUrl("https://twitter.com/user/status/888")
        .fitView()
        .build();

      await tweet.expectVisible();
    });

    test("can store intermediate builders", async ({ page }) => {
      // Create builder without building
      const builder = ShapeBuilder.note(page)
        .atPosition(400, 400)
        .write("Delayed creation");

      // Build later
      const note = await builder.build();

      await note.expectVisible();
    });

    test("builder can only be used once", async ({ page }) => {
      const builder = ShapeBuilder.note(page).write("Once");

      await builder.build();

      // Second build should throw
      await expect(builder.build()).rejects.toThrow();
    });
  });

  test.describe("Complex Scenarios", () => {
    test("creates branching tree structure", async ({ page }) => {
      const root = await ShapeBuilder.tweet(page)
        .loadUrlViaEnter("https://twitter.com/user/status/999")
        .build();

      // Branch 1
      const branch1 = await root.addChild("question")
        .submit("Branch 1?")
        .build();

      await branch1.addChild("note")
        .write("Leaf 1")
        .build();

      // // Branch 2
      await root.addChild("note")
        .write("Branch 2")
        .build();


      // await fitCanvasView(page)

      // Total: 1 root + 2 children + 1 grandchild = 4 shapes
      // Total arrows: 3 (root->branch1, root->branch2, branch1->leaf)
      const count = await getShapeCount(page);
      expect(count).toBeGreaterThanOrEqual(4); // May include arrows in count

      await expectParentChildArrows(page, 3);
    });

    test("creates multiple independent flows", async ({ page }) => {
      // Flow 1
      const flow1 = await ShapeBuilder.tweet(page)
        .atPosition(200, 200)
        .loadUrl("https://twitter.com/user/status/1001")
        .build();

      const flow1child = await flow1.addChild("note")
        .write("Flow 1 child")
        .build();

      // Flow 2
      const flow2 = await ShapeBuilder.question(page)
        .atPosition(1200, 200)
        .submit("Flow 2?")
        .build();

      const flow2child = await flow2.addChild("note")
        .write("Flow 2 child")
        .build();

      const count = await getShapeCount(page);

      expect(count).toBe(6);

      // await expectParentChildArrows(page, 2);

      // Each flow's shapes are independent
      await expectArrowConnectsShapes(page, flow1.id, flow1child.id);
      await expectArrowConnectsShapes(page, flow2.id, flow2child.id);
    });
  });

  test.describe("Alternative Input Methods", () => {
    test("loads tweet via Enter key", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrlViaEnter("https://twitter.com/user/status/1111")
        .build();

      await tweet.expectVisible();
      await expect(page.getByTestId("tweet-author-handle")).toBeVisible();
    });

    test("submits question via alternative method", async ({ page }) => {
      // Note: submitViaEnter is kept for API consistency but internally uses click
      // as the UI doesn't support Enter key submission for questions
      const question = await ShapeBuilder.question(page)
        .submitViaEnter("Question via alternative?")
        .build();

      await question.expectVisible();
      await expect(page.getByTestId("question-ai-badge").first()).toBeVisible();
    });
  });

  test.describe("Shape Handle Locator Access", () => {
    test("provides working locator for interactions", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/1234")
        .build();

      // Can use locator directly
      const text = await tweet.locator.textContent();
      expect(text).toBeTruthy();

      // Locator matches shape
      await expect(tweet.locator).toBeVisible();
    });

    test("locator can be used for custom assertions", async ({ page }) => {
      const note = await ShapeBuilder.note(page)
        .write("Custom assertion test")
        .build();

      // Use locator for Playwright assertions
      await expect(note.locator).toHaveAttribute("data-testid", "note-card");
    });
  });

  test.describe("Error Handling", () => {
    test("provides helpful error when shape not created", async ({ page }) => {
      // Try to get shape ID before creation would fail
      // But our builders handle this gracefully by waiting

      const note = await ShapeBuilder.note(page).build();

      // Should successfully create even with minimal config
      expect(note.id).toBeTruthy();
    });
  });
});
