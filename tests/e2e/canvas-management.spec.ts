import { test, expect } from '@playwright/test'
import {
  startFresh,
  openCreateModal,
  createCanvasViaUI,
  createCanvasViaEnter,
  deleteCanvasViaUI,
  goToCanvasList,
  waitForCanvas,
  expectCanvasInList,
  expectCanvasListEmpty,
  expectOnCanvasView,
  expectOnCanvasList,
  getCanvasCount,
  getCanvasNamesInOrder,
} from './helpers/test-utils'

// =============================================================================
// CREATION TESTS (8 tests)
// =============================================================================

test.describe('Canvas Creation', () => {
  test('should create canvas with custom name and navigate to canvas view', async ({ page }) => {
    await startFresh(page)

    await page.getByTestId('create-first-canvas-button').click()
    await expect(page.getByTestId('create-canvas-modal')).toBeVisible()
    await page.getByTestId('canvas-name-input').fill('My Canvas')
    await page.getByTestId('create-button').click()
    await expect(page.url()).toContain('/canvas/')
    await expect(page.getByTestId('canvas-title')).toHaveText('My Canvas')
  })

  test('should create canvas with default name when input is empty', async ({
    page,
  }) => {
    await startFresh(page)

    await openCreateModal(page)
    await page.getByTestId('create-button').click()
    await expect(page.url()).toContain('/canvas/')
    await expect(page.getByTestId('canvas-title')).toHaveText('New Canvas')
    await goToCanvasList(page)
    await expectCanvasInList(page, 'New Canvas')
  })

  test('should create canvas when pressing Enter in name input', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaEnter(page, 'Canvas Enter')
    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Canvas Enter')
  })

  test('should close modal and stay on canvas list when clicking cancel button', async ({ page }) => {
    await startFresh(page)

    await openCreateModal(page)
    await page.getByTestId('cancel-button').click()
    await expect(page.getByTestId('create-canvas-modal')).not.toBeVisible()
    await expectOnCanvasList(page)
    await expectCanvasListEmpty(page)
  })

  test('should close modal when pressing Escape key', async ({ page }) => {
    await startFresh(page)

    await openCreateModal(page)
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('create-canvas-modal')).not.toBeVisible()
    await expectOnCanvasList(page)
    await expectCanvasListEmpty(page)
  })

  test('should close modal when clicking outside on overlay', async ({
    page,
  }) => {
    await startFresh(page)

    await openCreateModal(page)
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } })
    await expect(page.getByTestId('create-canvas-modal')).not.toBeVisible()
    await expectOnCanvasList(page)
    await expectCanvasListEmpty(page)
  })

  test('should automatically focus name input when modal opens', async ({ page }) => {
    await startFresh(page)

    await openCreateModal(page)
    const input = page.getByTestId('canvas-name-input')
    await expect(input).toBeFocused()
  })

  test('should create additional canvas using header button on non-empty list', async ({
    page,
  }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'First Canvas')
    await goToCanvasList(page)
    await page.getByTestId('new-canvas-button').click()
    await expect(page.getByTestId('create-canvas-modal')).toBeVisible()
    await page.getByTestId('canvas-name-input').fill('Via Header')
    await page.getByTestId('create-button').click()
    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Via Header')
    await goToCanvasList(page)
    expect(await getCanvasCount(page)).toBe(2)
  })
})

// =============================================================================
// LISTING TESTS (6 tests)
// =============================================================================

test.describe('Canvas Listing', () => {
  test('should display all created canvases in list with correct names', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Canvas 1')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Canvas 2')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Canvas 3')
    await goToCanvasList(page)

    expect(await getCanvasCount(page)).toBe(3)
    await expectCanvasInList(page, 'Canvas 1')
    await expectCanvasInList(page, 'Canvas 2')
    await expectCanvasInList(page, 'Canvas 3')
  })

  test('should order canvases by modification date with most recent first', async ({
    page,
  }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Old Canvas')
    await goToCanvasList(page)
    await page.waitForTimeout(1000)
    await createCanvasViaUI(page, 'Recent Canvas')
    await goToCanvasList(page)

    const names = await getCanvasNamesInOrder(page)

    expect(names[0]).toBe('Recent Canvas')
    expect(names[1]).toBe('Old Canvas')
  })

  test('should display shape count on canvas card', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'My Canvas')
    await waitForCanvas(page)
    await goToCanvasList(page)

    const card = page.getByTestId('canvas-card').first()
    await expect(card.getByTestId('canvas-shape-count')).toHaveText('No shapes')
  })

  test('should display relative date on canvas card', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'My Canvas')
    await goToCanvasList(page)

    const card = page.getByTestId('canvas-card').first()
    const dateText = await card.getByTestId('canvas-date').textContent()

    expect(dateText).toBeTruthy()
    expect(dateText).toContain('ago')
  })

  test('should navigate to canvas view when clicking on canvas card', async ({
    page,
  }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Navigable Canvas')
    await goToCanvasList(page)
    await page.getByTestId('canvas-card').first().click()
    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Navigable Canvas')
    await expect(page.getByTestId('back-button')).toBeVisible()
  })

  test('should show empty state with create button when no canvases exist', async ({ page }) => {
    await startFresh(page)

    await expectCanvasListEmpty(page)
    await expect(page.getByTestId('create-first-canvas-button')).toBeVisible()
  })
})

// =============================================================================
// DELETION TESTS (6 tests)
// =============================================================================

test.describe('Canvas Deletion', () => {
  test('should show delete button when hovering over canvas card', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Hover Test')
    await goToCanvasList(page)

    const card = page.getByTestId('canvas-card').first()
    const deleteButton = card.getByTestId('delete-canvas-button')

    await expect(deleteButton).toHaveCSS('opacity', '0')
    await card.hover()
    await expect(deleteButton).toBeVisible()
  })

  test('should show confirmation modal when clicking delete button', async ({
    page,
  }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Canvas X')
    await goToCanvasList(page)

    const card = page.getByTestId('canvas-card').first()
    await card.hover()
    await card.getByTestId('delete-canvas-button').click()

    await expect(page.getByTestId('delete-canvas-modal')).toBeVisible()
    await expect(page.getByText('"Canvas X"')).toBeVisible()
    await expect(page.getByText(/cannot be undone/i)).toBeVisible()
  })

  test('should remove canvas from list when confirming deletion', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'To Delete')
    await goToCanvasList(page)

    expect(await getCanvasCount(page)).toBe(1)

    await deleteCanvasViaUI(page, 'To Delete')

    await expectCanvasListEmpty(page)
  })

  test('should keep canvas when canceling deletion', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Keep Me')
    await goToCanvasList(page)

    const card = page.getByTestId('canvas-card').first()
    await card.hover()
    await card.getByTestId('delete-canvas-button').click()

    await page.getByTestId('cancel-delete-button').click()

    await expect(page.getByTestId('delete-canvas-modal')).not.toBeVisible()
    await expectCanvasInList(page, 'Keep Me')
  })

  test('should close delete modal when clicking outside and keep canvas', async ({
    page,
  }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Keep Me Too')
    await goToCanvasList(page)

    const card = page.getByTestId('canvas-card').first()
    await card.hover()
    await card.getByTestId('delete-canvas-button').click()

    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } })

    await expect(page.getByTestId('delete-canvas-modal')).not.toBeVisible()
    await expectCanvasInList(page, 'Keep Me Too')
  })

  test('should show empty state after deleting last canvas', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Last One')
    await goToCanvasList(page)

    expect(await getCanvasCount(page)).toBe(1)

    await deleteCanvasViaUI(page, 'Last One')

    await expectCanvasListEmpty(page)
  })
})

// =============================================================================
// NAVIGATION TESTS (5 tests)
// =============================================================================

test.describe('Canvas Navigation', () => {
  test('should return to canvas list when clicking back button', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Test Canvas')
    await expectOnCanvasView(page)

    await page.getByTestId('back-button').click()

    await expectOnCanvasList(page)
  })

  test('should update URL to reflect active canvas with UUID', async ({ page }) => {
    await startFresh(page)

    const canvasId = await createCanvasViaUI(page, 'URL Test')

    await expect(page.url()).toContain(`/canvas/${canvasId}`)

    expect(canvasId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  test('should keep canvas open after page reload', async ({ page }) => {
    await startFresh(page)

    const canvasId = await createCanvasViaUI(page, 'Persistent Canvas')
    await waitForCanvas(page)

    await page.waitForTimeout(500)

    await page.reload()

    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Persistent Canvas')
  })

  test('should load canvas when navigating directly to canvas URL', async ({ page }) => {
    await startFresh(page)

    const canvasId = await createCanvasViaUI(page, 'Deep Link Test')
    await page.waitForTimeout(500)
    await goToCanvasList(page)

    await page.goto(`/canvas/${canvasId}`)

    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Deep Link Test')
  })

  test('should redirect to canvas list when accessing non-existent canvas', async ({
    page,
  }) => {
    await startFresh(page)

    await page.goto('/canvas/non-existent-id')

    await expectOnCanvasList(page)
  })
})

// =============================================================================
// PERSISTENCE TESTS (2 tests)
// =============================================================================

test.describe('Canvas Persistence', () => {
  test('should persist all canvases in list after page reload', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Persist 1')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Persist 2')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Persist 3')
    await goToCanvasList(page)

    await page.reload()

    expect(await getCanvasCount(page)).toBe(3)
    await expectCanvasInList(page, 'Persist 1')
    await expectCanvasInList(page, 'Persist 2')
    await expectCanvasInList(page, 'Persist 3')
  })

  test('should persist canvas deletion after page reload', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaUI(page, 'Keep')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Delete Me')
    await goToCanvasList(page)

    expect(await getCanvasCount(page)).toBe(2)

    await deleteCanvasViaUI(page, 'Delete Me')

    await page.reload()

    expect(await getCanvasCount(page)).toBe(1)
    await expectCanvasInList(page, 'Keep')
  })
})
