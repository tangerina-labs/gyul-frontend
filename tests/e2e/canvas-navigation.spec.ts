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
  test('should display canvas toolbox with all navigation buttons visible', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Toolbox Test')
    await waitForCanvas(page)

    await expectCanvasToolboxVisible(page)
    await expect(page.getByTestId('zoom-in-button')).toBeVisible()
    await expect(page.getByTestId('zoom-out-button')).toBeVisible()
    await expect(page.getByTestId('fit-view-button')).toBeVisible()
    await expect(page.getByTestId('undo-button')).toBeVisible()
    await expect(page.getByTestId('redo-button')).toBeVisible()
    await expect(page.getByTestId('zoom-level')).toBeVisible()
  })

  test('should show empty canvas hint with new flow prompt', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Empty Hint Test')
    await waitForCanvas(page)

    expect(await isCanvasEmpty(page)).toBe(true)
    await expectEmptyHintVisible(page)
    await expect(page.getByTestId('canvas-empty-hint')).toContainText(
      'Novo Fluxo'
    )
  })

  test('should hide default tldraw UI elements for clean interface', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Clean UI Test')
    await waitForCanvas(page)

    await expect(page.locator('.tlui-toolbar')).not.toBeVisible()
    await expect(page.locator('.tlui-page-menu')).not.toBeVisible()
    await expect(page.locator('.tlui-style-panel')).not.toBeVisible()
    await expect(page.locator('.tlui-actions-menu')).not.toBeVisible()
    await expect(page.locator('.tlui-navigation-zone')).not.toBeVisible()
  })

  test('should display initial zoom level at 100 percent', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Level Test')
    await waitForCanvas(page)

    const zoomLevel = page.getByTestId('zoom-level')
    await expect(zoomLevel).toContainText('100%')
  })
})

test.describe('Canvas Navigation - Zoom', () => {
  test('should increase zoom level when clicking zoom in button', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom In Test')
    await waitForCanvas(page)

    const initialZoom = await getCanvasZoom(page)
    await clickZoomIn(page)
    const newZoom = await getCanvasZoom(page)
    expect(newZoom).toBeGreaterThan(initialZoom)
  })

  test('should decrease zoom level when clicking zoom out button', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Out Test')
    await waitForCanvas(page)

    const initialZoom = await getCanvasZoom(page)
    await clickZoomOut(page)
    const newZoom = await getCanvasZoom(page)
    expect(newZoom).toBeLessThan(initialZoom)
  })

  test('should respect maximum zoom limit of 2x', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Max Test')
    await waitForCanvas(page)

    const finalZoom = await zoomToMax(page)

    expect(finalZoom).toBeLessThanOrEqual(2.0)
    expect(finalZoom).toBeGreaterThanOrEqual(1.5)
  })

  test('should respect minimum zoom limit of 0.25x', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Min Test')
    await waitForCanvas(page)

    const finalZoom = await zoomToMin(page)

    expect(finalZoom).toBeGreaterThanOrEqual(0.25)
    expect(finalZoom).toBeLessThanOrEqual(0.5)
  })

  test('should disable zoom in button when at maximum zoom level', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Max Disabled Test')
    await waitForCanvas(page)

    await zoomToMax(page)

    await expect(page.getByTestId('zoom-in-button')).toBeDisabled()
    expect(await isZoomInEnabled(page)).toBe(false)
  })

  test('should disable zoom out button when at minimum zoom level', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Zoom Min Disabled Test')
    await waitForCanvas(page)

    await zoomToMin(page)

    await expect(page.getByTestId('zoom-out-button')).toBeDisabled()
    expect(await isZoomOutEnabled(page)).toBe(false)
  })

  test('should zoom in using keyboard shortcut', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Keyboard Zoom In')
    await waitForCanvas(page)

    const initialZoom = await getCanvasZoom(page)

    const isMac = process.platform === 'darwin'
    await page.keyboard.press(isMac ? 'Meta+=' : 'Control+=')
    await page.waitForTimeout(250)

    const newZoom = await getCanvasZoom(page)
    expect(newZoom).toBeGreaterThan(initialZoom)
  })

  test('should zoom out using keyboard shortcut', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Keyboard Zoom Out')
    await waitForCanvas(page)

    const initialZoom = await getCanvasZoom(page)

    const isMac = process.platform === 'darwin'
    await page.keyboard.press(isMac ? 'Meta+-' : 'Control+-')
    await page.waitForTimeout(250)

    const newZoom = await getCanvasZoom(page)
    expect(newZoom).toBeLessThan(initialZoom)
  })
})

test.describe('Canvas Navigation - Pan', () => {
  test('should pan canvas using middle mouse button drag', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Pan Test')
    await waitForCanvas(page)

    const initialCamera = await getCanvasCamera(page)
    await panCanvas(page, 200, 100)
    const newCamera = await getCanvasCamera(page)

    const cameraChanged =
      newCamera.x !== initialCamera.x || newCamera.y !== initialCamera.y
    expect(cameraChanged).toBe(true)
  })
})

test.describe('Canvas Navigation - Fit View', () => {
  test('should reset zoom to 100 percent when clicking fit view on empty canvas', async ({
    page,
  }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Fit View Empty')
    await waitForCanvas(page)

    await clickZoomOut(page)
    await clickZoomOut(page)

    const zoomBefore = await getCanvasZoom(page)
    expect(zoomBefore).toBeLessThan(1)

    await clickFitView(page)

    const zoom = await getCanvasZoom(page)
    expect(zoom).toBe(1)
  })

  test('should reset zoom to 100 percent using keyboard shortcut', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Reset Zoom Keyboard')
    await waitForCanvas(page)

    await clickZoomOut(page)
    await clickZoomOut(page)

    const zoomBefore = await getCanvasZoom(page)
    expect(zoomBefore).toBeLessThan(1)

    await page.keyboard.press('Shift+0')
    await page.waitForTimeout(350)

    const zoom = await getCanvasZoom(page)
    expect(zoom).toBe(1)
  })
})

test.describe('Canvas Navigation - Undo/Redo', () => {
  test('should have undo button disabled on fresh canvas', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Undo Disabled Test')
    await waitForCanvas(page)

    await expect(page.getByTestId('undo-button')).toBeDisabled()
  })

  test('should have redo button disabled on fresh canvas', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Redo Disabled Test')
    await waitForCanvas(page)

    await expect(page.getByTestId('redo-button')).toBeDisabled()
  })

  test.skip('should remove created shape when clicking undo', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Undo Shape Test')
    await waitForCanvas(page)
  })

  test.skip('should restore undone shape when clicking redo', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Redo Shape Test')
    await waitForCanvas(page)
  })

  test.skip('should hide empty canvas hint when shapes are added', async ({
    page,
  }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Hint Hide Test')
    await waitForCanvas(page)

    await expectEmptyHintVisible(page)
  })

  test.skip('should center shapes in viewport when clicking fit view', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Fit View Shapes')
    await waitForCanvas(page)
  })
})

test.describe('Canvas Navigation - Persistence', () => {
  test.skip('should persist viewport state after page reload', async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Viewport Persist')
    await waitForCanvas(page)

    await clickZoomOut(page)
    await clickZoomOut(page)

    const zoomBefore = await getCanvasZoom(page)

    await page.reload()
    await waitForCanvas(page)

    const zoomAfter = await getCanvasZoom(page)
    expect(zoomAfter).toBeCloseTo(zoomBefore, 1)
  })

  test('should load canvas view correctly with toolbox and editor visible', async ({
    page,
  }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Navigation Test')
    await waitForCanvas(page)

    await expectOnCanvasView(page)
    await expectCanvasToolboxVisible(page)
    await expect(page.locator('.tl-container')).toBeVisible()
  })
})
