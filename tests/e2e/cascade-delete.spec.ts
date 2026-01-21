import { test, expect } from "@playwright/test";
import {
  startFresh,
  createCanvasViaUI,
  addShapeViaMenu,
  loadTweet,
  writeNote,
  fitCanvasView,
  expectParentChildArrows,
} from "./helpers/test-utils";

test.describe("Cascade Delete - Simple Isolated Tests", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await createCanvasViaUI(page, "Test");
  });

  test("should delete arrow when child shape is deleted using bindings API", async ({ page }) => {
    await addShapeViaMenu(page, "Tweet");
    await loadTweet(page, "https://twitter.com/user/status/1");
    
    await page.getByTestId("tweet-add-child-btn").click({ force: true });
    await page.getByTestId("menu-option-note").click();
    await writeNote(page, "Child");
    await fitCanvasView(page);

    await expectParentChildArrows(page, 1);
    await expect(page.getByTestId("tweet-card")).toBeVisible();
    await expect(page.getByTestId("note-card")).toBeVisible();

    await page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      const noteShape = allShapes.find((s: any) => s.type === 'note');
      if (!noteShape) throw new Error('Note not found');
      
      const arrowsToDelete = new Set();
      const bindingsToNote = editor.getBindingsToShape(noteShape.id, 'arrow');
      
      for (const binding of bindingsToNote) {
        arrowsToDelete.add(binding.fromId);
      }
      
      const allToDelete = [...Array.from(arrowsToDelete), noteShape.id];
      editor.deleteShapes(allToDelete);
    });

    await page.waitForTimeout(300);

    await expect(page.getByTestId("note-card")).not.toBeVisible();
    await expect(page.getByTestId("tweet-card")).toBeVisible();
    await expectParentChildArrows(page, 0);
  });

  test("should delete arrow when parent shape is deleted while child remains", async ({ page }) => {
    await addShapeViaMenu(page, "Tweet");
    await loadTweet(page, "https://twitter.com/user/status/2");
    
    await page.getByTestId("tweet-add-child-btn").click({ force: true });
    await page.getByTestId("menu-option-note").click();
    await writeNote(page, "Child");
    await fitCanvasView(page);

    await expectParentChildArrows(page, 1);

    await page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      const tweetShape = allShapes.find((s: any) => s.type === 'tweet');
      if (!tweetShape) throw new Error('Tweet not found');
      
      const arrowsToDelete = new Set();
      const bindingsToTweet = editor.getBindingsToShape(tweetShape.id, 'arrow');
      
      for (const binding of bindingsToTweet) {
        arrowsToDelete.add(binding.fromId);
      }
      
      const allToDelete = [...Array.from(arrowsToDelete), tweetShape.id];
      editor.deleteShapes(allToDelete);
    });

    await page.waitForTimeout(300);

    await expect(page.getByTestId("tweet-card")).not.toBeVisible();
    await expect(page.getByTestId("note-card")).toBeVisible();
    await expectParentChildArrows(page, 0);
  });

  test("should correctly replicate deleteShapesWithArrows logic with bindings API", async ({ page }) => {
    await addShapeViaMenu(page, "Tweet");
    await loadTweet(page, "https://twitter.com/user/status/3");
    
    await page.getByTestId("tweet-add-child-btn").click({ force: true });
    await page.getByTestId("menu-option-note").click();
    await writeNote(page, "Child");
    await fitCanvasView(page);

    await expectParentChildArrows(page, 1);

    await page.evaluate(async () => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      const noteShape = allShapes.find((s: any) => s.type === 'note');
      if (!noteShape) throw new Error('Note not found');
      
      const shapeIds = new Set([noteShape.id]);
      const arrowsToDelete = new Set();
      
      for (const shapeId of shapeIds) {
        const bindings = editor.getBindingsToShape(shapeId, 'arrow');
        for (const binding of bindings) {
          arrowsToDelete.add(binding.fromId);
        }
      }
      
      const allToDelete = [...Array.from(arrowsToDelete), noteShape.id];
      editor.deleteShapes(allToDelete);
    });

    await page.waitForTimeout(300);

    await expect(page.getByTestId("note-card")).not.toBeVisible();
    await expect(page.getByTestId("tweet-card")).toBeVisible();
    await expectParentChildArrows(page, 0);
  });

  test("should delete standalone shape without arrows without errors", async ({ page }) => {
    await addShapeViaMenu(page, "Note");
    await writeNote(page, "Standalone");

    await expectParentChildArrows(page, 0);

    await page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      const noteShape = allShapes.find((s: any) => s.type === 'note');
      if (!noteShape) throw new Error('Note not found');
      
      editor.deleteShapes([noteShape.id]);
    });

    await page.waitForTimeout(300);

    await expect(page.getByTestId("note-card")).not.toBeVisible();
    await expectParentChildArrows(page, 0);
  });

  test("should prevent orphaned arrows in storage after cascade delete", async ({ page }) => {
    await addShapeViaMenu(page, "Tweet");
    await loadTweet(page, "https://twitter.com/user/status/5");
    
    await page.getByTestId("tweet-add-child-btn").click({ force: true });
    await page.getByTestId("menu-option-note").click();
    await writeNote(page, "Child");
    await fitCanvasView(page);

    await expectParentChildArrows(page, 1);

    await page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      const noteShape = allShapes.find((s: any) => s.type === 'note');
      if (!noteShape) throw new Error('Note not found');
      
      const shapeIds = new Set([noteShape.id]);
      const arrowsToDelete = new Set();
      
      for (const shapeId of shapeIds) {
        const bindings = editor.getBindingsToShape(shapeId, 'arrow');
        for (const binding of bindings) {
          arrowsToDelete.add(binding.fromId);
        }
      }
      
      editor.deleteShapes([...Array.from(arrowsToDelete), noteShape.id]);
    });

    await page.waitForTimeout(300);

    const hasOrphanedArrows = await page.evaluate(() => {
      const storageData = localStorage.getItem("gyul-state");
      if (!storageData) return false;

      const parsed = JSON.parse(storageData);
      const snapshot = parsed.state.state.canvases[0].snapshot;
      const storeRecords = Object.values(snapshot.store) as any[];

      const arrows = storeRecords.filter((r) => r.typeName === "shape" && r.type === "arrow");
      const validShapeIds = new Set(
        storeRecords
          .filter((r) => r.typeName === "shape" && r.type !== "arrow")
          .map((r) => r.id)
      );

      for (const arrow of arrows) {
        const startId = arrow.props?.start?.boundShapeId;
        const endId = arrow.props?.end?.boundShapeId;

        if (startId && !validShapeIds.has(startId)) return true;
        if (endId && !validShapeIds.has(endId)) return true;
      }

      return false;
    });

    expect(hasOrphanedArrows).toBe(false);
  });
});
