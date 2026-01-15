import { expect, type Page } from "@playwright/test";

/**
 * Clears localStorage and navigates to the canvas list page.
 * Use this at the start of tests that need a fresh state.
 */
export async function startFresh(page: Page): Promise<void> {
  // Mark this as a Playwright test
  await page.addInitScript(() => {
    (
      window as unknown as { __PLAYWRIGHT_TEST__: boolean }
    ).__PLAYWRIGHT_TEST__ = true;
  });

  // Navigate to canvases list
  await page.goto("/canvases");

  // Clear localStorage
  await page.evaluate(() => localStorage.clear());

  // Reload to apply clean state
  await page.reload();

  // Wait for the app to be ready
  await expect(page.getByText("gyul")).toBeVisible();
}

/**
 * Opens the create canvas modal.
 */
export async function openCreateModal(page: Page): Promise<void> {
  // Check if there are canvases - use header button if so, otherwise empty state button
  const newCanvasButton = page.getByTestId("new-canvas-button");
  const createFirstButton = page.getByTestId("create-first-canvas-button");

  if (await newCanvasButton.isVisible()) {
    await newCanvasButton.click();
  } else {
    await createFirstButton.click();
  }

  // Wait for modal to be visible
  await expect(page.getByTestId("create-canvas-modal")).toBeVisible();
}

/**
 * Creates a new canvas via the UI modal.
 * Returns the canvas ID from the URL.
 */
export async function createCanvasViaUI(
  page: Page,
  name?: string
): Promise<string> {
  await openCreateModal(page);

  // Fill in name if provided
  if (name) {
    await page.getByTestId("canvas-name-input").fill(name);
  }

  // Click create button
  await page.getByTestId("create-button").click();

  // Wait for navigation to canvas view
  await page.waitForURL(/\/canvas\//);

  // Extract canvas ID from URL
  const url = page.url();
  const match = url.match(/\/canvas\/([^/]+)/);
  if (!match) {
    throw new Error("Could not extract canvas ID from URL");
  }

  return match[1];
}

/**
 * Creates a new canvas by pressing Enter in the modal.
 */
export async function createCanvasViaEnter(
  page: Page,
  name?: string
): Promise<string> {
  await openCreateModal(page);

  const input = page.getByTestId("canvas-name-input");

  // Fill in name if provided
  if (name) {
    await input.fill(name);
  }

  // Press Enter
  await input.press("Enter");

  // Wait for navigation to canvas view
  await page.waitForURL(/\/canvas\//);

  // Extract canvas ID from URL
  const url = page.url();
  const match = url.match(/\/canvas\/([^/]+)/);
  if (!match) {
    throw new Error("Could not extract canvas ID from URL");
  }

  return match[1];
}

/**
 * Legacy helper - creates canvas directly (for backwards compatibility)
 */
export async function createCanvas(page: Page, name?: string): Promise<string> {
  return createCanvasViaUI(page, name);
}

/**
 * Deletes a canvas via the UI with confirmation.
 */
export async function deleteCanvasViaUI(
  page: Page,
  canvasName: string
): Promise<void> {
  // Find the canvas card by name
  const card = page
    .getByTestId("canvas-card")
    .filter({ has: page.getByTestId("canvas-name").getByText(canvasName) });

  // Hover to reveal delete button
  await card.hover();

  // Click delete button
  await card.getByTestId("delete-canvas-button").click();

  // Wait for delete modal
  await expect(page.getByTestId("delete-canvas-modal")).toBeVisible();

  // Confirm deletion
  await page.getByTestId("confirm-delete-button").click();

  // Wait for modal to close
  await expect(page.getByTestId("delete-canvas-modal")).not.toBeVisible();
}

/**
 * Navigates back to the canvas list.
 */
export async function goToCanvasList(page: Page): Promise<void> {
  // Click back button if on canvas view
  const backButton = page.getByTestId("back-button");
  if (await backButton.isVisible()) {
    await backButton.click();
  } else {
    // Navigate directly
    await page.goto("/canvases");
  }
  await expectOnCanvasList(page);
}

/**
 * Waits for tldraw canvas to be fully loaded.
 */
export async function waitForCanvas(page: Page): Promise<void> {
  // Wait for tldraw container to be visible
  await expect(page.locator(".tl-container")).toBeVisible({ timeout: 10000 });
}

/**
 * Waits for the canvas state to be persisted to localStorage.
 * This is important before reloading the page to ensure the state is saved.
 */
export async function waitForStatePersistence(
  page: Page,
  canvasId: string
): Promise<void> {
  // Wait for localStorage to contain the canvas
  await page.waitForFunction(
    (id: string) => {
      const state = localStorage.getItem("gyul-state");
      if (!state) return false;
      try {
        const parsed = JSON.parse(state);
        return parsed.canvases?.some((c: { id: string }) => c.id === id);
      } catch {
        return false;
      }
    },
    canvasId,
    { timeout: 5000 }
  );
  // Add a small buffer to ensure the write completed
  await page.waitForTimeout(100);
}

/**
 * Verifies that a canvas exists in the list.
 */
export async function expectCanvasInList(
  page: Page,
  canvasName: string
): Promise<void> {
  const card = page
    .getByTestId("canvas-card")
    .filter({ has: page.getByTestId("canvas-name").getByText(canvasName) });

  await expect(card).toBeVisible();
}

/**
 * Verifies that the canvas list is empty (showing empty state).
 */
export async function expectCanvasListEmpty(page: Page): Promise<void> {
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await expect(page.getByText("No canvases yet")).toBeVisible();
  await expect(page.getByTestId("create-first-canvas-button")).toBeVisible();
}

/**
 * Verifies that we're on the Canvas View.
 */
export async function expectOnCanvasView(page: Page): Promise<void> {
  await expect(page.getByTestId("canvas-view")).toBeVisible();
  await expect(page.getByTestId("back-button")).toBeVisible();
}

/**
 * Verifies that we're on the Canvas List.
 */
export async function expectOnCanvasList(page: Page): Promise<void> {
  await expect(page.getByText("gyul")).toBeVisible();
  await expect(page.url()).toContain("/canvases");
}

/**
 * Gets the number of canvas cards in the list.
 */
export async function getCanvasCount(page: Page): Promise<number> {
  return page.getByTestId("canvas-card").count();
}

/**
 * Gets canvas names in order as displayed in the list.
 */
export async function getCanvasNamesInOrder(page: Page): Promise<string[]> {
  const names: string[] = [];
  const cards = page.getByTestId("canvas-card");
  const count = await cards.count();

  for (let i = 0; i < count; i++) {
    const name = await cards.nth(i).getByTestId("canvas-name").textContent();
    if (name) names.push(name);
  }

  return names;
}

// =============================================================================
// Canvas Navigation Helpers
// =============================================================================

/**
 * Gets the current zoom level of the canvas.
 * Returns a number where 1 = 100% zoom.
 */
export async function getCanvasZoom(page: Page): Promise<number> {
  return page.evaluate(() => {
    const editor = (
      window as Window & { __tldraw_editor__?: { getZoomLevel: () => number } }
    ).__tldraw_editor__;
    return editor?.getZoomLevel() ?? 1;
  });
}

/**
 * Gets the camera position (x, y) of the canvas.
 */
export async function getCanvasCamera(
  page: Page
): Promise<{ x: number; y: number; z: number }> {
  return page.evaluate(() => {
    const editor = (
      window as Window & {
        __tldraw_editor__?: {
          getCamera: () => { x: number; y: number; z: number };
        };
      }
    ).__tldraw_editor__;
    return editor?.getCamera() ?? { x: 0, y: 0, z: 1 };
  });
}

/**
 * Triggers fit view to center all shapes in the viewport.
 * Uses keyboard shortcut Shift+1.
 */
export async function fitCanvasView(page: Page): Promise<void> {
  await page.keyboard.press("Shift+1");
  // Wait for animation to complete
  await page.waitForTimeout(350);
}

/**
 * Triggers undo action via keyboard shortcut.
 */
export async function undoAction(page: Page): Promise<void> {
  const isMac = process.platform === "darwin";
  await page.keyboard.press(isMac ? "Meta+z" : "Control+z");
}

/**
 * Triggers redo action via keyboard shortcut.
 */
export async function redoAction(page: Page): Promise<void> {
  const isMac = process.platform === "darwin";
  await page.keyboard.press(isMac ? "Meta+Shift+z" : "Control+Shift+z");
}

/**
 * Checks if the canvas is empty (no shapes).
 */
export async function isCanvasEmpty(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const editor = (
      window as Window & {
        __tldraw_editor__?: { getCurrentPageShapes: () => unknown[] };
      }
    ).__tldraw_editor__;
    const shapes = editor?.getCurrentPageShapes() ?? [];
    return shapes.length === 0;
  });
}

/**
 * Gets the number of shapes on the canvas.
 */
export async function getShapeCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const editor = (
      window as Window & {
        __tldraw_editor__?: { getCurrentPageShapes: () => unknown[] };
      }
    ).__tldraw_editor__;
    return editor?.getCurrentPageShapes().length ?? 0;
  });
}

/**
 * Checks if the canvas toolbox is visible.
 */
export async function expectCanvasToolboxVisible(page: Page): Promise<void> {
  await expect(page.getByTestId("canvas-toolbox")).toBeVisible();
}

/**
 * Checks if the empty hint is visible.
 */
export async function expectEmptyHintVisible(page: Page): Promise<void> {
  await expect(page.getByTestId("canvas-empty-hint")).toBeVisible();
}

/**
 * Checks if the empty hint is hidden.
 */
export async function expectEmptyHintHidden(page: Page): Promise<void> {
  await expect(page.getByTestId("canvas-empty-hint")).not.toBeVisible();
}

/**
 * Checks if the zoom in button is enabled.
 */
export async function isZoomInEnabled(page: Page): Promise<boolean> {
  return page.getByTestId("zoom-in-button").isEnabled();
}

/**
 * Checks if the zoom out button is enabled.
 */
export async function isZoomOutEnabled(page: Page): Promise<boolean> {
  return page.getByTestId("zoom-out-button").isEnabled();
}

/**
 * Clicks the zoom in button in the toolbox.
 * Returns true if clicked, false if button was disabled.
 */
export async function clickZoomIn(page: Page): Promise<boolean> {
  const button = page.getByTestId("zoom-in-button");
  if (!(await button.isEnabled())) {
    return false;
  }
  await button.click();
  // Wait for zoom animation
  await page.waitForTimeout(250);
  return true;
}

/**
 * Clicks the zoom out button in the toolbox.
 * Returns true if clicked, false if button was disabled.
 */
export async function clickZoomOut(page: Page): Promise<boolean> {
  const button = page.getByTestId("zoom-out-button");
  if (!(await button.isEnabled())) {
    return false;
  }
  await button.click();
  // Wait for zoom animation
  await page.waitForTimeout(250);
  return true;
}

/**
 * Zooms in until the maximum zoom level is reached.
 * Returns the final zoom level.
 */
export async function zoomToMax(page: Page): Promise<number> {
  let clicked = true;
  while (clicked) {
    clicked = await clickZoomIn(page);
  }
  return getCanvasZoom(page);
}

/**
 * Zooms out until the minimum zoom level is reached.
 * Returns the final zoom level.
 */
export async function zoomToMin(page: Page): Promise<number> {
  let clicked = true;
  while (clicked) {
    clicked = await clickZoomOut(page);
  }
  return getCanvasZoom(page);
}

/**
 * Clicks the fit view button in the toolbox.
 */
export async function clickFitView(page: Page): Promise<void> {
  await page.getByTestId("fit-view-button").click();
  // Wait for fit animation
  await page.waitForTimeout(350);
}

/**
 * Clicks the undo button in the toolbox.
 */
export async function clickUndo(page: Page): Promise<void> {
  await page.getByTestId("undo-button").click();
}

/**
 * Clicks the redo button in the toolbox.
 */
export async function clickRedo(page: Page): Promise<void> {
  await page.getByTestId("redo-button").click();
}

/**
 * Performs a pan (drag) operation on the canvas using middle mouse button.
 */
export async function panCanvas(
  page: Page,
  deltaX: number,
  deltaY: number
): Promise<void> {
  const canvas = page.locator(".tl-canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Canvas not found");

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  // Use middle mouse button for pan (more reliable in tldraw)
  await page.mouse.move(startX, startY);
  await page.mouse.down({ button: "middle" });
  await page.mouse.move(startX + deltaX, startY + deltaY, { steps: 10 });
  await page.mouse.up({ button: "middle" });
  await page.waitForTimeout(100);
}

// =============================================================================
// Shape Creation Helpers
// =============================================================================

/**
 * Adds a shape to the canvas via the "Novo Fluxo" menu.
 * 1. Clicks "Novo Fluxo" button
 * 2. Clicks on the creation overlay at specified position
 * 3. Selects the shape type from menu
 */
export async function addShapeViaMenu(
  page: Page,
  shapeType: "Tweet" | "Question" | "Note",
  position: { x: number; y: number } = { x: 400, y: 300 }
): Promise<void> {
  // Click "Novo Fluxo" button
  await page.getByTestId("toolbox-new-flow").click();

  // Wait for creation overlay to appear
  const overlay = page.locator('[aria-label="Click to place shape"]');
  await expect(overlay).toBeVisible();

  // Click on the overlay at position (this triggers the menu)
  await overlay.click({ position });

  // Wait for menu to appear
  await expect(page.getByTestId("shape-type-menu")).toBeVisible();

  // Select shape type
  await page.getByTestId(`menu-option-${shapeType.toLowerCase()}`).click();

  // Wait for menu to close
  await expect(page.getByTestId("shape-type-menu")).not.toBeVisible();

  // Wait for shape to be created
  await page.waitForTimeout(100);
}

/**
 * Alias for addShapeViaMenu - adds a shape by clicking on the canvas.
 */
export const addShapeViaClick = addShapeViaMenu;

/**
 * Loads a tweet by filling the URL and clicking the submit button.
 * Waits until the tweet is loaded (author handle is visible).
 */
export async function loadTweet(page: Page, url: string): Promise<void> {
  const urlInput = page.getByTestId("tweet-url-input");
  const submitBtn = page.getByTestId("tweet-submit-btn");

  // Fill URL
  await urlInput.fill(url);

  // Click submit
  await submitBtn.click();

  // Wait for tweet to load (author handle becomes visible)
  await expect(page.getByTestId("tweet-author-handle")).toBeVisible({
    timeout: 10000,
  });
}

/**
 * Submits the tweet URL by pressing Enter.
 * Waits until the tweet is loaded (author handle is visible).
 */
export async function loadTweetViaEnter(
  page: Page,
  url: string
): Promise<void> {
  const urlInput = page.getByTestId("tweet-url-input");

  // Fill URL
  await urlInput.fill(url);

  // Press Enter
  await urlInput.press("Enter");

  // Wait for tweet to load (author handle becomes visible)
  await expect(page.getByTestId("tweet-author-handle")).toBeVisible({
    timeout: 10000,
  });
}

/**
 * Gets the count of tweet cards on the canvas.
 */
export async function getTweetCardCount(page: Page): Promise<number> {
  return page.getByTestId("tweet-card").count();
}

// =============================================================================
// Question Shape Helpers
// =============================================================================

/**
 * Submits a question in the most recent QuestionShape.
 * Waits until the AI badge appears (response received).
 */
export async function submitQuestion(
  page: Page,
  question: string
): Promise<void> {
  await fitCanvasView(page);
  const promptInput = page.getByTestId("question-prompt-input").last();
  await promptInput.fill(question);
  await page.getByTestId("question-submit-btn").last().click();
  await expect(page.getByTestId("question-ai-badge").first()).toBeVisible({
    timeout: 10000,
  });
  await fitCanvasView(page);
}

/**
 * Gets the count of question cards on the canvas.
 */
export async function getQuestionCardCount(page: Page): Promise<number> {
  return page.getByTestId("question-card").count();
}

/**
 * Verifies that a QuestionShape is in the specified state.
 */
export async function expectQuestionState(
  page: Page,
  state: "draft" | "loading" | "done" | "error",
  index = 0
): Promise<void> {
  const questionCard = page.getByTestId("question-card").nth(index);
  await expect(questionCard).toHaveAttribute("data-status", state);
}

// =============================================================================
// Note Shape Helpers
// =============================================================================

/**
 * Writes content to a note and finalizes it with Enter.
 * Waits for the note to become readonly (note-content visible).
 */
export async function writeNote(page: Page, content: string): Promise<void> {
  await fitCanvasView(page);
  const textarea = page.getByTestId("note-textarea").last();
  await textarea.fill(content);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("note-content").last()).toBeVisible();
  await fitCanvasView(page);
}

/**
 * Gets the count of note cards on the canvas.
 */
export async function getNoteCardCount(page: Page): Promise<number> {
  return page.getByTestId("note-card").count();
}

/**
 * Adds a child shape from a parent shape via the [+] button.
 */
export async function addChildShape(
  page: Page,
  parentTestId: string,
  childType: "Tweet" | "Question" | "Note"
): Promise<void> {
  // Click the parent shape to ensure it's focused
  await page.getByTestId(parentTestId).click();

  // Click the [+] button (add child button)
  const addChildBtnId = parentTestId.replace("-card", "-add-child-btn");
  await page.getByTestId(addChildBtnId).click({ force: true });

  // Select type from the menu
  await page
    .getByTestId(`menu-option-${childType.toLowerCase()}`)
    .click({ timeout: 5000 });

  // Wait for creation
  await page.waitForTimeout(300);
}

/**
 * Returns the count of arrows on the canvas.
 */
export async function getArrowCount(page: Page): Promise<number> {
  return await page.locator('[data-shape-type="arrow"]').count();
}

/**
 * Verifies that an arrow connects two shapes.
 * This is a basic check that verifies arrow existence and binding structure.
 * Note: parentTestId and childTestId are for future detailed validation
 */
export async function expectArrowConnects(
  page: Page,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _parentTestId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _childTestId: string
): Promise<void> {
  // Verify that at least one arrow exists
  const arrowCount = await getArrowCount(page);
  expect(arrowCount).toBeGreaterThan(0);

  // Additional verification via storage (checks binding structure)
  const storageData = await page.evaluate(() =>
    localStorage.getItem("gyul-state")
  );
  expect(storageData).not.toBeNull();

  interface ShapeRecord {
    typeName?: string;
    type?: string;
    props?: {
      start?: { type?: string; boundShapeId?: string };
      end?: { type?: string; boundShapeId?: string };
    };
  }

  const parsed = JSON.parse(storageData!);
  const snapshot = parsed.state.state.canvases[0].snapshot;
  const arrows = Object.values(snapshot.store as ShapeRecord[]).filter(
    (r) => r?.typeName === "shape" && r?.type === "arrow"
  );

  expect(arrows.length).toBeGreaterThan(0);

  // Verify that arrows have proper binding structure
  const arrowsWithBindings = arrows.filter(
    (a: ShapeRecord) =>
      a.props?.start?.type === "binding" &&
      a.props?.end?.type === "binding" &&
      a.props?.start?.boundShapeId &&
      a.props?.end?.boundShapeId
  );
  expect(arrowsWithBindings.length).toBeGreaterThan(0);
}

/**
 * Gets the count of parent-child connection arrows (created by system).
 * Uses custom metadata to identify arrows created automatically when adding child shapes.
 */
export async function getParentChildArrowCount(page: Page): Promise<number> {
  const storageData = await page.evaluate(() =>
    localStorage.getItem("gyul-state")
  );

  if (!storageData) return 0;

  interface ArrowRecord {
    typeName?: string;
    type?: string;
    meta?: {
      isParentChildConnection?: boolean;
      parentId?: string;
      childId?: string;
      createdBy?: string;
    };
  }

  const parsed = JSON.parse(storageData);

  const snapshot = parsed.state.state.canvases[0]?.snapshot;

  if (!snapshot) return 0;

  const parentChildArrows = Object.values(snapshot.store).filter(
    (r: ArrowRecord) =>
      r.typeName === "shape" &&
      r.type === "arrow" &&
      r.meta?.isParentChildConnection === true
  );

  return parentChildArrows.length;
}

/**
 * Expects a specific number of parent-child connection arrows to exist.
 */
export async function expectParentChildArrows(
  page: Page,
  count: number
): Promise<void> {
  const arrowCount = await getParentChildArrowCount(page);
  expect(arrowCount).toBe(count);
}
