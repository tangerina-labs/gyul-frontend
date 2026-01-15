import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  waitForCanvas,
  expectOnCanvasView,
  getCanvasZoom,
  getCanvasCamera,
  clickZoomIn,
  clickZoomOut,
  clickFitView,
  panCanvas,
  expectCanvasToolboxVisible,
  expectEmptyHintVisible,
  isCanvasEmpty,
  zoomToMax,
  zoomToMin,
  isZoomInEnabled,
  isZoomOutEnabled,
} from './helpers/test-utils'

// =============================================================================
// CANVAS NAVIGATION TESTS
// =============================================================================

test.describe('Canvas Navigation - UI Elements', () => {
  test('TEST-CN-001: Canvas toolbox is visible', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Toolbox Test')
    await waitForCanvas(page)

    // Toolbox should be visible
    await expectCanvasToolboxVisible(page)

    // All buttons should be visible
    await expect(page.getByTestId('zoom-in-button')).toBeVisible()
    await expect(page.getByTestId('zoom-out-button')).toBeVisible()
    await expect(page.getByTestId('fit-view-button')).toBeVisible()
    await expect(page.getByTestId('undo-button')).toBeVisible()
    await expect(page.getByTestId('redo-button')).toBeVisible()
    await expect(page.getByTestId('zoom-level')).toBeVisible()
  })

  test('TEST-CN-002: Empty canvas shows hint', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Empty Hint Test')
    await waitForCanvas(page)

    // Should be empty
    expect(await isCanvasEmpty(page)).toBe(true)

    // Hint should be visible
    await expectEmptyHintVisible(page)

    // Should contain expected text
    await expect(page.getByTestId('canvas-empty-hint')).toContainText(
      'Novo Fluxo'
    )
  })

  test('TEST-CN-003: Unnecessary tldraw UI is hidden', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Clean UI Test')
    await waitForCanvas(page)

    // Native tldraw UI elements should not be visible
    await expect(page.locator('.tlui-toolbar')).not.toBeVisible()
    await expect(page.locator('.tlui-page-menu')).not.toBeVisible()
    await expect(page.locator('.tlui-style-panel')).not.toBeVisible()
    await expect(page.locator('.tlui-actions-menu')).not.toBeVisible()
    await expect(page.locator('.tlui-navigation-zone')).not.toBeVisible()
  })

  test('TEST-CN-004: Zoom level displays correctly', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Level Test')
    await waitForCanvas(page)

    // Initial zoom should be 100%
    const zoomLevel = page.getByTestId('zoom-level')
    await expect(zoomLevel).toContainText('100%')
  })
})

test.describe('Canvas Navigation - Zoom', () => {
  test('TEST-CN-005: Zoom in button increases zoom', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom In Test')
    await waitForCanvas(page)

    const initialZoom = await getCanvasZoom(page)

    // Click zoom in
    await clickZoomIn(page)

    const newZoom = await getCanvasZoom(page)
    expect(newZoom).toBeGreaterThan(initialZoom)
  })

  test('TEST-CN-006: Zoom out button decreases zoom', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Out Test')
    await waitForCanvas(page)

    const initialZoom = await getCanvasZoom(page)

    // Click zoom out
    await clickZoomOut(page)

    const newZoom = await getCanvasZoom(page)
    expect(newZoom).toBeLessThan(initialZoom)
  })

  test('TEST-CN-007: Zoom respects maximum limit (2x)', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Max Test')
    await waitForCanvas(page)

    // Zoom in until max is reached
    const finalZoom = await zoomToMax(page)

    expect(finalZoom).toBeLessThanOrEqual(2.0)
    expect(finalZoom).toBeGreaterThanOrEqual(1.5) // Should be near max
  })

  test('TEST-CN-008: Zoom respects minimum limit (0.25x)', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Min Test')
    await waitForCanvas(page)

    // Zoom out until min is reached
    const finalZoom = await zoomToMin(page)

    expect(finalZoom).toBeGreaterThanOrEqual(0.25)
    expect(finalZoom).toBeLessThanOrEqual(0.5) // Should be near min
  })

  test('TEST-CN-009: Zoom in button disabled at max zoom', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Max Disabled Test')
    await waitForCanvas(page)

    // Zoom in to max
    await zoomToMax(page)

    // Button should be disabled
    await expect(page.getByTestId('zoom-in-button')).toBeDisabled()
    expect(await isZoomInEnabled(page)).toBe(false)
  })

  test('TEST-CN-010: Zoom out button disabled at min zoom', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Min Disabled Test')
    await waitForCanvas(page)

    // Zoom out to min
    await zoomToMin(page)

    // Button should be disabled
    await expect(page.getByTestId('zoom-out-button')).toBeDisabled()
    expect(await isZoomOutEnabled(page)).toBe(false)
  })

  test('TEST-CN-011: Keyboard shortcut zoom in works', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Keyboard Zoom In')
    await waitForCanvas(page)

    const initialZoom = await getCanvasZoom(page)

    // Use keyboard shortcut
    const isMac = process.platform === 'darwin'
    await page.keyboard.press(isMac ? 'Meta+=' : 'Control+=')
    await page.waitForTimeout(250)

    const newZoom = await getCanvasZoom(page)
    expect(newZoom).toBeGreaterThan(initialZoom)
  })

  test('TEST-CN-012: Keyboard shortcut zoom out works', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Keyboard Zoom Out')
    await waitForCanvas(page)

    const initialZoom = await getCanvasZoom(page)

    // Use keyboard shortcut
    const isMac = process.platform === 'darwin'
    await page.keyboard.press(isMac ? 'Meta+-' : 'Control+-')
    await page.waitForTimeout(250)

    const newZoom = await getCanvasZoom(page)
    expect(newZoom).toBeLessThan(initialZoom)
  })
})

test.describe('Canvas Navigation - Pan', () => {
  test('TEST-CN-013: Middle mouse drag pans the canvas', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Pan Test')
    await waitForCanvas(page)

    const initialCamera = await getCanvasCamera(page)

    // Pan the canvas using middle mouse button
    await panCanvas(page, 200, 100)

    const newCamera = await getCanvasCamera(page)

    // Camera should have moved
    // Note: If x or y changed, pan worked
    const cameraChanged =
      newCamera.x !== initialCamera.x || newCamera.y !== initialCamera.y
    expect(cameraChanged).toBe(true)
  })
})

test.describe('Canvas Navigation - Fit View', () => {
  test('TEST-CN-014: Fit view button resets view on empty canvas', async ({
    page,
  }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Fit View Empty')
    await waitForCanvas(page)

    // Zoom out first
    await clickZoomOut(page)
    await clickZoomOut(page)

    const zoomBefore = await getCanvasZoom(page)
    expect(zoomBefore).toBeLessThan(1)

    // Click fit view (our custom button calls resetZoom when empty)
    await clickFitView(page)

    // Zoom should be reset to 1 (100%)
    const zoom = await getCanvasZoom(page)
    expect(zoom).toBe(1)
  })

  test('TEST-CN-015: Reset zoom keyboard shortcut works', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Reset Zoom Keyboard')
    await waitForCanvas(page)

    // Zoom out first
    await clickZoomOut(page)
    await clickZoomOut(page)

    const zoomBefore = await getCanvasZoom(page)
    expect(zoomBefore).toBeLessThan(1)

    // Use keyboard shortcut for reset zoom (Shift+0 in tldraw resets to 100%)
    await page.keyboard.press('Shift+0')
    await page.waitForTimeout(350)

    // Zoom should be reset to 1 (100%)
    const zoom = await getCanvasZoom(page)
    expect(zoom).toBe(1)
  })
})

test.describe('Canvas Navigation - Undo/Redo', () => {
  test('TEST-CN-016: Undo button is initially disabled', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Undo Disabled Test')
    await waitForCanvas(page)

    // Undo button should be disabled on fresh canvas
    await expect(page.getByTestId('undo-button')).toBeDisabled()
  })

  test('TEST-CN-017: Redo button is initially disabled', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Redo Disabled Test')
    await waitForCanvas(page)

    // Redo button should be disabled on fresh canvas
    await expect(page.getByTestId('redo-button')).toBeDisabled()
  })

  // Tests that depend on shapes - skip for now
  test.skip('TEST-CN-018: Undo removes created shape', async ({ page }) => {
    // This test requires shape creation which is in a future phase
    await startFresh(page)
    await createCanvasViaUI(page, 'Undo Shape Test')
    await waitForCanvas(page)

    // TODO: Create a shape
    // TODO: Click undo
    // TODO: Verify shape is removed
  })

  test.skip('TEST-CN-019: Redo restores undone shape', async ({ page }) => {
    // This test requires shape creation which is in a future phase
    await startFresh(page)
    await createCanvasViaUI(page, 'Redo Shape Test')
    await waitForCanvas(page)

    // TODO: Create a shape
    // TODO: Click undo
    // TODO: Click redo
    // TODO: Verify shape is restored
  })

  test.skip('TEST-CN-020: Hint disappears when shapes are added', async ({
    page,
  }) => {
    // This test requires shape creation which is in a future phase
    await startFresh(page)
    await createCanvasViaUI(page, 'Hint Hide Test')
    await waitForCanvas(page)

    // Hint should be visible initially
    await expectEmptyHintVisible(page)

    // TODO: Create a shape
    // TODO: Verify hint is hidden
  })

  test.skip('TEST-CN-021: Fit view centers shapes', async ({ page }) => {
    // This test requires shape creation which is in a future phase
    await startFresh(page)
    await createCanvasViaUI(page, 'Fit View Shapes')
    await waitForCanvas(page)

    // TODO: Create shapes at different positions
    // TODO: Pan away from shapes
    // TODO: Click fit view
    // TODO: Verify shapes are centered
  })
})

test.describe('Canvas Navigation - Persistence', () => {
  // Note: Viewport persistence depends on tldraw's snapshot scope.
  // The current implementation only persists document scope (shapes),
  // not camera/viewport state. This is expected behavior for MVP.
  test.skip('TEST-CN-022: Viewport persists after reload', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Viewport Persist')
    await waitForCanvas(page)

    // Zoom out
    await clickZoomOut(page)
    await clickZoomOut(page)

    const zoomBefore = await getCanvasZoom(page)

    // Reload page
    await page.reload()
    await waitForCanvas(page)

    // Viewport should be restored
    // TODO: Implement camera persistence if needed
    const zoomAfter = await getCanvasZoom(page)
    expect(zoomAfter).toBeCloseTo(zoomBefore, 1)
  })

  test('TEST-CN-023: Canvas view loads correctly after navigation', async ({
    page,
  }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Navigation Test')
    await waitForCanvas(page)

    // Should be on canvas view
    await expectOnCanvasView(page)

    // Toolbox should be there
    await expectCanvasToolboxVisible(page)

    // Canvas should be loaded
    await expect(page.locator('.tl-container')).toBeVisible()
  })
})
