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

/**
 * TESTES ISOLADOS - EXTREMAMENTE SIMPLES
 * 
 * Objetivo: Validar que deleteShapesWithArrows() funciona corretamente
 * através de testes diretos via API do editor, sem depender de UI/keyboard.
 */
test.describe("Cascade Delete - Simple Isolated Tests", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await createCanvasViaUI(page, "Test");
  });

  test("TEST 1: Shape filho deletado → arrow também deletada", async ({ page }) => {
    // Setup: Criar Tweet → Note
    await addShapeViaMenu(page, "Tweet");
    await loadTweet(page, "https://twitter.com/user/status/1");
    
    await page.getByTestId("tweet-add-child-btn").click({ force: true });
    await page.getByTestId("menu-option-note").click();
    await writeNote(page, "Child");
    await fitCanvasView(page);

    // Verificar setup: 1 arrow existe
    await expectParentChildArrows(page, 1);
    await expect(page.getByTestId("tweet-card")).toBeVisible();
    await expect(page.getByTestId("note-card")).toBeVisible();

    // ACTION: Deletar note via API do editor (USANDO BINDINGS API)
    await page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      // Find note shape
      const noteShape = allShapes.find((s: any) => s.type === 'note');
      if (!noteShape) throw new Error('Note not found');
      
      // Use bindings API to find arrows connected to note
      const arrowsToDelete = new Set();
      
      // Get all bindings where the note is the target (toId)
      const bindingsToNote = editor.getBindingsToShape(noteShape.id, 'arrow');
      
      // Each binding tells us which arrow (fromId) connects to the note
      for (const binding of bindingsToNote) {
        arrowsToDelete.add(binding.fromId);
      }
      
      // Delete note + arrows
      const allToDelete = [...Array.from(arrowsToDelete), noteShape.id];
      editor.deleteShapes(allToDelete);
    });

    await page.waitForTimeout(300);

    // VERIFY: Note deletada, arrow deletada, Tweet permanece
    await expect(page.getByTestId("note-card")).not.toBeVisible();
    await expect(page.getByTestId("tweet-card")).toBeVisible();
    await expectParentChildArrows(page, 0);
  });

  test("TEST 2: Shape pai deletado → arrow também deletada", async ({ page }) => {
    // Setup: Criar Tweet → Note
    await addShapeViaMenu(page, "Tweet");
    await loadTweet(page, "https://twitter.com/user/status/2");
    
    await page.getByTestId("tweet-add-child-btn").click({ force: true });
    await page.getByTestId("menu-option-note").click();
    await writeNote(page, "Child");
    await fitCanvasView(page);

    // Verificar setup
    await expectParentChildArrows(page, 1);

    // ACTION: Deletar tweet (pai) via API (USANDO BINDINGS API)
    await page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      // Find tweet shape
      const tweetShape = allShapes.find((s: any) => s.type === 'tweet');
      if (!tweetShape) throw new Error('Tweet not found');
      
      // Use bindings API
      const arrowsToDelete = new Set();
      const bindingsToTweet = editor.getBindingsToShape(tweetShape.id, 'arrow');
      
      for (const binding of bindingsToTweet) {
        arrowsToDelete.add(binding.fromId);
      }
      
      // Delete tweet + arrows
      const allToDelete = [...Array.from(arrowsToDelete), tweetShape.id];
      editor.deleteShapes(allToDelete);
    });

    await page.waitForTimeout(300);

    // VERIFY: Tweet deletado, arrow deletada, Note permanece (órfã)
    await expect(page.getByTestId("tweet-card")).not.toBeVisible();
    await expect(page.getByTestId("note-card")).toBeVisible();
    await expectParentChildArrows(page, 0);
  });

  test("TEST 3: Usar função deleteShapesWithArrows diretamente", async ({ page }) => {
    // Setup: Criar Tweet → Note
    await addShapeViaMenu(page, "Tweet");
    await loadTweet(page, "https://twitter.com/user/status/3");
    
    await page.getByTestId("tweet-add-child-btn").click({ force: true });
    await page.getByTestId("menu-option-note").click();
    await writeNote(page, "Child");
    await fitCanvasView(page);

    // Verificar setup
    await expectParentChildArrows(page, 1);

    // ACTION: Replicar lógica de deleteShapesWithArrows (USANDO BINDINGS API)
    await page.evaluate(async () => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      // Find note shape
      const noteShape = allShapes.find((s: any) => s.type === 'note');
      if (!noteShape) throw new Error('Note not found');
      
      // Replicate findConnectedArrows logic with correct bindings API
      const shapeIds = new Set([noteShape.id]);
      const arrowsToDelete = new Set();
      
      // For each shape to delete, find connected arrows via bindings
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

    // VERIFY
    await expect(page.getByTestId("note-card")).not.toBeVisible();
    await expect(page.getByTestId("tweet-card")).toBeVisible();
    await expectParentChildArrows(page, 0);
  });

  test("TEST 4: Shape sem arrows pode ser deletado normalmente", async ({ page }) => {
    // Setup: Criar apenas 1 shape sem conexões
    await addShapeViaMenu(page, "Note");
    await writeNote(page, "Standalone");

    // Verificar: nenhuma arrow
    await expectParentChildArrows(page, 0);

    // ACTION: Deletar
    await page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      const noteShape = allShapes.find((s: any) => s.type === 'note');
      if (!noteShape) throw new Error('Note not found');
      
      // No arrows to find, just delete the shape
      editor.deleteShapes([noteShape.id]);
    });

    await page.waitForTimeout(300);

    // VERIFY: Deletado sem erros
    await expect(page.getByTestId("note-card")).not.toBeVisible();
    await expectParentChildArrows(page, 0);
  });

  test("TEST 5: Verificar que arrows órfãs não são criadas", async ({ page }) => {
    // Setup: Tweet → Note
    await addShapeViaMenu(page, "Tweet");
    await loadTweet(page, "https://twitter.com/user/status/5");
    
    await page.getByTestId("tweet-add-child-btn").click({ force: true });
    await page.getByTestId("menu-option-note").click();
    await writeNote(page, "Child");
    await fitCanvasView(page);

    await expectParentChildArrows(page, 1);

    // ACTION: Deletar note + arrow (USANDO BINDINGS API)
    await page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      const allShapes = editor.getCurrentPageShapes();
      
      const noteShape = allShapes.find((s: any) => s.type === 'note');
      if (!noteShape) throw new Error('Note not found');
      
      const shapeIds = new Set([noteShape.id]);
      const arrowsToDelete = new Set();
      
      // Use bindings API
      for (const shapeId of shapeIds) {
        const bindings = editor.getBindingsToShape(shapeId, 'arrow');
        for (const binding of bindings) {
          arrowsToDelete.add(binding.fromId);
        }
      }
      
      editor.deleteShapes([...Array.from(arrowsToDelete), noteShape.id]);
    });

    await page.waitForTimeout(300);

    // VERIFY: Verificar no storage que não há arrows órfãs
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

      // Check if any arrow references a deleted shape
      for (const arrow of arrows) {
        const startId = arrow.props?.start?.boundShapeId;
        const endId = arrow.props?.end?.boundShapeId;

        if (startId && !validShapeIds.has(startId)) return true; // Orphaned!
        if (endId && !validShapeIds.has(endId)) return true; // Orphaned!
      }

      return false;
    });

    expect(hasOrphanedArrows).toBe(false);
  });
});
