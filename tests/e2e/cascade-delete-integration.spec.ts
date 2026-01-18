import { test, expect } from "@playwright/test";
import {
  startFresh,
  createCanvasViaUI,
  ShapeBuilder,
  expectParentChildArrows,
  undoAction,
  redoAction,
  getShapeCount,
} from "./helpers/test-utils";

/**
 * Cascade Delete Integration Tests
 * 
 * Validates cascade delete behavior with keyboard events (Delete/Backspace)
 * and UI interactions using the ShapeBuilder API.
 */
test.describe("Cascade Delete - Integration", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await createCanvasViaUI(page, "Integration Test");
  });

  test.describe("Group 1: Basic Keyboard Actions", () => {
    test("deve deletar child e arrow com tecla Delete", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/100")
        .build();

      const note = await tweet
        .addChild("note")
        .write("Child note")
        .fitView()
        .build();

      await expectParentChildArrows(page, 1);

      // Delete via keyboard
      await note.delete();

      await note.expectNotVisible();
      await expectParentChildArrows(page, 0);
      await tweet.expectVisible();
    });

    test("deve deletar child e arrow com tecla Backspace", async ({ page }) => {
      const question = await ShapeBuilder.question(page)
        .submit("What is cascade delete?")
        .build();

      const note = await question
        .addChild("note")
        .write("Answer note")
        .build();

      await expectParentChildArrows(page, 1);

      // Delete via Backspace
      await note.click();
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(300);

      await note.expectNotVisible();
      await expectParentChildArrows(page, 0);
      await question.expectVisible();
    });
  });

  test.describe("Group 2: Chain Operations", () => {
    test("deve deletar shape do meio em cadeia A→B→C", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/200")
        .build();

      const question = await tweet
        .addChild("question")
        .submit("Middle")
        .fitView()
        .build();

      const note = await question
        .addChild("note")
        .write("End")
        .fitView()
        .build();

      await expectParentChildArrows(page, 2);

      // Delete B (middle)
      await question.delete();

      // Both arrows deleted
      await expectParentChildArrows(page, 0);
      await tweet.expectVisible();
      await note.expectVisible();
      await question.expectNotVisible();
    });

    test("deve deletar parent com 3 children e todas as arrows", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/201")
        .build();

      // Add 3 children
      const child1 = await tweet
        .addChild("note")
        .write("Child 1")
        .fitView()
        .build();

      const child2 = await tweet
        .addChild("note")
        .write("Child 2")
        .fitView()
        .build();

      const child3 = await tweet
        .addChild("note")
        .write("Child 3")
        .fitView()
        .build();

      await expectParentChildArrows(page, 3);

      // Delete parent
      await tweet.delete();

      await expectParentChildArrows(page, 0);
      await tweet.expectNotVisible();
      
      // All 3 children still exist
      expect(await page.getByTestId("note-card").count()).toBe(3);
    });
  });

  test.describe("Group 3: Undo/Redo", () => {
    test("deve fazer undo e restaurar shape + arrow", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/500")
        .build();

      const note = await tweet
        .addChild("note")
        .write("Child")
        .fitView()
        .build();

      await expectParentChildArrows(page, 1);

      // Delete
      await note.delete();

      await note.expectNotVisible();
      await expectParentChildArrows(page, 0);

      // Undo
      await undoAction(page);
      await page.waitForTimeout(500);

      // Both restored
      await expect(page.getByTestId("note-card")).toBeVisible();
      await expectParentChildArrows(page, 1);
    });

    test("deve fazer redo e deletar novamente", async ({ page }) => {
      const question = await ShapeBuilder.question(page)
        .submit("Test?")
        .build();

      const note = await question
        .addChild("note")
        .write("Child")
        .build();

      // Delete and undo
      await note.delete();
      
      await undoAction(page);
      await page.waitForTimeout(500);

      await expect(page.getByTestId("note-card")).toBeVisible();
      await expectParentChildArrows(page, 1);

      // Redo
      await redoAction(page);
      await page.waitForTimeout(500);

      await expect(page.getByTestId("note-card")).not.toBeVisible();
      await expectParentChildArrows(page, 0);
    });
  });

  test.describe("Group 4: Edge Cases", () => {
    test("deve deletar shape sem arrows sem erros", async ({ page }) => {
      const note = await ShapeBuilder.note(page)
        .write("Standalone")
        .build();

      await expectParentChildArrows(page, 0);

      await note.delete();

      await note.expectNotVisible();
      await expectParentChildArrows(page, 0);
    });

    test("deve lidar com seleção vazia (não deve crashar)", async ({ page }) => {
      const note = await ShapeBuilder.note(page)
        .write("Test note")
        .build();

      // Deselect
      await page.locator(".tl-canvas").click({ position: { x: 100, y: 100 } });

      // Delete with nothing selected
      await page.keyboard.press("Delete");
      await page.waitForTimeout(300);

      // Shape still exists
      await note.expectVisible();
    });
  });

  test.describe("Group 5: Persistence", () => {
    test("deve persistir deleção após reload", async ({ page }) => {
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/600")
        .build();

      const note = await tweet
        .addChild("note")
        .write("Child")
        .fitView()
        .build();

      await expectParentChildArrows(page, 1);

      // Delete
      await note.delete();
      await page.waitForTimeout(500);

      // Reload
      await page.reload();
      await expect(page.getByTestId("canvas-view")).toBeVisible();
      await page.waitForTimeout(500);

      // Deletion persisted
      await expect(page.getByTestId("note-card")).not.toBeVisible();
      await expectParentChildArrows(page, 0);
      await tweet.expectVisible();
    });
  });
});
