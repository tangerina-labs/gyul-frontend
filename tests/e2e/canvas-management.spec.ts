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
  test('TEST-CM-001: Create canvas with custom name', async ({ page }) => {
    await startFresh(page)

    // Click create first canvas
    await page.getByTestId('create-first-canvas-button').click()

    // Modal should appear
    await expect(page.getByTestId('create-canvas-modal')).toBeVisible()

    // Fill in name
    await page.getByTestId('canvas-name-input').fill('My Canvas')

    // Click create
    await page.getByTestId('create-button').click()

    // Should navigate to canvas view
    await expect(page.url()).toContain('/canvas/')

    // Title should show canvas name
    await expect(page.getByTestId('canvas-title')).toHaveText('My Canvas')
  })

  test('TEST-CM-002: Create canvas without name (default name)', async ({
    page,
  }) => {
    await startFresh(page)

    // Open modal
    await openCreateModal(page)

    // Leave input empty, click create
    await page.getByTestId('create-button').click()

    // Should navigate to canvas view
    await expect(page.url()).toContain('/canvas/')

    // Title should show default name
    await expect(page.getByTestId('canvas-title')).toHaveText('New Canvas')

    // Go back to list
    await goToCanvasList(page)

    // Card should show "New Canvas"
    await expectCanvasInList(page, 'New Canvas')
  })

  test('TEST-CM-003: Create canvas by pressing Enter', async ({ page }) => {
    await startFresh(page)

    await createCanvasViaEnter(page, 'Canvas Enter')

    // Should be on canvas view
    await expectOnCanvasView(page)

    // Title should show canvas name
    await expect(page.getByTestId('canvas-title')).toHaveText('Canvas Enter')
  })

  test('TEST-CM-004: Cancel creation with Cancel button', async ({ page }) => {
    await startFresh(page)

    // Open modal
    await openCreateModal(page)

    // Click cancel
    await page.getByTestId('cancel-button').click()

    // Modal should close
    await expect(page.getByTestId('create-canvas-modal')).not.toBeVisible()

    // Should still be on canvas list
    await expectOnCanvasList(page)

    // List should still be empty
    await expectCanvasListEmpty(page)
  })

  test('TEST-CM-005: Cancel creation with Escape key', async ({ page }) => {
    await startFresh(page)

    // Open modal
    await openCreateModal(page)

    // Press Escape
    await page.keyboard.press('Escape')

    // Modal should close
    await expect(page.getByTestId('create-canvas-modal')).not.toBeVisible()

    // Should still be on canvas list
    await expectOnCanvasList(page)

    // List should still be empty
    await expectCanvasListEmpty(page)
  })

  test('TEST-CM-006: Cancel creation by clicking outside modal', async ({
    page,
  }) => {
    await startFresh(page)

    // Open modal
    await openCreateModal(page)

    // Click on overlay (outside modal)
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } })

    // Modal should close
    await expect(page.getByTestId('create-canvas-modal')).not.toBeVisible()

    // Should still be on canvas list
    await expectOnCanvasList(page)

    // List should still be empty
    await expectCanvasListEmpty(page)
  })

  test('TEST-CM-007: Input is focused when modal opens', async ({ page }) => {
    await startFresh(page)

    // Open modal
    await openCreateModal(page)

    // Input should be focused
    const input = page.getByTestId('canvas-name-input')
    await expect(input).toBeFocused()
  })

  test('TEST-CM-008: Create canvas via header button when list is not empty', async ({
    page,
  }) => {
    await startFresh(page)

    // Create first canvas
    await createCanvasViaUI(page, 'First Canvas')
    await goToCanvasList(page)

    // Now use header button
    await page.getByTestId('new-canvas-button').click()

    // Modal should open
    await expect(page.getByTestId('create-canvas-modal')).toBeVisible()

    // Fill and create
    await page.getByTestId('canvas-name-input').fill('Via Header')
    await page.getByTestId('create-button').click()

    // Should navigate to canvas view
    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Via Header')

    // Go back and verify both canvases exist
    await goToCanvasList(page)
    expect(await getCanvasCount(page)).toBe(2)
  })
})

// =============================================================================
// LISTING TESTS (6 tests)
// =============================================================================

test.describe('Canvas Listing', () => {
  test('TEST-CM-009: List shows all saved canvases', async ({ page }) => {
    await startFresh(page)

    // Create 3 canvases
    await createCanvasViaUI(page, 'Canvas 1')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Canvas 2')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Canvas 3')
    await goToCanvasList(page)

    // Should see 3 cards
    expect(await getCanvasCount(page)).toBe(3)

    // Each should have correct name
    await expectCanvasInList(page, 'Canvas 1')
    await expectCanvasInList(page, 'Canvas 2')
    await expectCanvasInList(page, 'Canvas 3')
  })

  test('TEST-CM-010: Canvases ordered by modification date (most recent first)', async ({
    page,
  }) => {
    await startFresh(page)

    // Create "Old Canvas"
    await createCanvasViaUI(page, 'Old Canvas')
    await goToCanvasList(page)

    // Wait a bit
    await page.waitForTimeout(1000)

    // Create "Recent Canvas"
    await createCanvasViaUI(page, 'Recent Canvas')
    await goToCanvasList(page)

    // Get names in order
    const names = await getCanvasNamesInOrder(page)

    // Recent should be first
    expect(names[0]).toBe('Recent Canvas')
    expect(names[1]).toBe('Old Canvas')
  })

  test('TEST-CM-011: Card shows shape count', async ({ page }) => {
    await startFresh(page)

    // Create canvas
    await createCanvasViaUI(page, 'My Canvas')
    await waitForCanvas(page)

    // Go back to list
    await goToCanvasList(page)

    // Should show "No shapes" initially
    const card = page.getByTestId('canvas-card').first()
    await expect(card.getByTestId('canvas-shape-count')).toHaveText('No shapes')
  })

  test('TEST-CM-012: Card shows relative date', async ({ page }) => {
    await startFresh(page)

    // Create canvas
    await createCanvasViaUI(page, 'My Canvas')
    await goToCanvasList(page)

    // Should show relative date (e.g., "less than a minute ago")
    const card = page.getByTestId('canvas-card').first()
    const dateText = await card.getByTestId('canvas-date').textContent()

    // Should contain some form of relative time
    expect(dateText).toBeTruthy()
    // Date-fns uses "ago" suffix
    expect(dateText).toContain('ago')
  })

  test('TEST-CM-013: Click on card navigates to Canvas View', async ({
    page,
  }) => {
    await startFresh(page)

    // Create canvas
    await createCanvasViaUI(page, 'Navigable Canvas')
    await goToCanvasList(page)

    // Click on the card
    await page.getByTestId('canvas-card').first().click()

    // Should navigate to canvas view
    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Navigable Canvas')
    await expect(page.getByTestId('back-button')).toBeVisible()
  })

  test('TEST-CM-014: Empty state when no canvases exist', async ({ page }) => {
    await startFresh(page)

    // Should show empty state
    await expectCanvasListEmpty(page)

    // Should have "Create your first canvas" button
    await expect(page.getByTestId('create-first-canvas-button')).toBeVisible()
  })
})

// =============================================================================
// DELETION TESTS (6 tests)
// =============================================================================

test.describe('Canvas Deletion', () => {
  test('TEST-CM-015: Delete button appears on hover', async ({ page }) => {
    await startFresh(page)

    // Create canvas
    await createCanvasViaUI(page, 'Hover Test')
    await goToCanvasList(page)

    const card = page.getByTestId('canvas-card').first()
    const deleteButton = card.getByTestId('delete-canvas-button')

    // Delete button should be hidden initially (opacity-0)
    await expect(deleteButton).toHaveCSS('opacity', '0')

    // Hover on card
    await card.hover()

    // Delete button should be visible (opacity-100 via group-hover)
    await expect(deleteButton).toBeVisible()
  })

  test('TEST-CM-016: Confirmation modal appears when clicking delete', async ({
    page,
  }) => {
    await startFresh(page)

    // Create canvas
    await createCanvasViaUI(page, 'Canvas X')
    await goToCanvasList(page)

    // Hover and click delete
    const card = page.getByTestId('canvas-card').first()
    await card.hover()
    await card.getByTestId('delete-canvas-button').click()

    // Modal should appear
    await expect(page.getByTestId('delete-canvas-modal')).toBeVisible()

    // Should show canvas name
    await expect(page.getByText('"Canvas X"')).toBeVisible()

    // Should ask for confirmation
    await expect(page.getByText(/cannot be undone/i)).toBeVisible()
  })

  test('TEST-CM-017: Confirm deletion removes canvas', async ({ page }) => {
    await startFresh(page)

    // Create canvas
    await createCanvasViaUI(page, 'To Delete')
    await goToCanvasList(page)

    expect(await getCanvasCount(page)).toBe(1)

    // Delete via UI
    await deleteCanvasViaUI(page, 'To Delete')

    // Canvas should be gone
    await expectCanvasListEmpty(page)
  })

  test('TEST-CM-018: Cancel deletion keeps canvas', async ({ page }) => {
    await startFresh(page)

    // Create canvas
    await createCanvasViaUI(page, 'Keep Me')
    await goToCanvasList(page)

    // Open delete modal
    const card = page.getByTestId('canvas-card').first()
    await card.hover()
    await card.getByTestId('delete-canvas-button').click()

    // Click cancel
    await page.getByTestId('cancel-delete-button').click()

    // Modal should close
    await expect(page.getByTestId('delete-canvas-modal')).not.toBeVisible()

    // Canvas should still exist
    await expectCanvasInList(page, 'Keep Me')
  })

  test('TEST-CM-019: Close delete modal by clicking outside', async ({
    page,
  }) => {
    await startFresh(page)

    // Create canvas
    await createCanvasViaUI(page, 'Keep Me Too')
    await goToCanvasList(page)

    // Open delete modal
    const card = page.getByTestId('canvas-card').first()
    await card.hover()
    await card.getByTestId('delete-canvas-button').click()

    // Click on overlay (outside modal)
    await page.getByTestId('modal-overlay').click({ position: { x: 10, y: 10 } })

    // Modal should close
    await expect(page.getByTestId('delete-canvas-modal')).not.toBeVisible()

    // Canvas should still exist
    await expectCanvasInList(page, 'Keep Me Too')
  })

  test('TEST-CM-020: Delete last canvas shows empty state', async ({ page }) => {
    await startFresh(page)

    // Create one canvas
    await createCanvasViaUI(page, 'Last One')
    await goToCanvasList(page)

    expect(await getCanvasCount(page)).toBe(1)

    // Delete it
    await deleteCanvasViaUI(page, 'Last One')

    // Should show empty state
    await expectCanvasListEmpty(page)
  })
})

// =============================================================================
// NAVIGATION TESTS (5 tests)
// =============================================================================

test.describe('Canvas Navigation', () => {
  test('TEST-CM-021: Back button returns to list', async ({ page }) => {
    await startFresh(page)

    // Create and enter canvas
    await createCanvasViaUI(page, 'Test Canvas')
    await expectOnCanvasView(page)

    // Click back button
    await page.getByTestId('back-button').click()

    // Should be on list
    await expectOnCanvasList(page)
  })

  test('TEST-CM-022: URL reflects active canvas', async ({ page }) => {
    await startFresh(page)

    // Create canvas
    const canvasId = await createCanvasViaUI(page, 'URL Test')

    // URL should contain canvas ID
    await expect(page.url()).toContain(`/canvas/${canvasId}`)

    // Should match UUID format
    expect(canvasId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    )
  })

  test('TEST-CM-023: Reload keeps canvas open', async ({ page }) => {
    await startFresh(page)

    // Create canvas
    const canvasId = await createCanvasViaUI(page, 'Persistent Canvas')
    await waitForCanvas(page)

    // Wait for state to be persisted before reload
    await page.waitForTimeout(500) // Give zustand subscription time to save

    // Reload page
    await page.reload()

    // Should still be on same canvas
    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Persistent Canvas')
  })

  test('TEST-CM-024: Deep link to existing canvas works', async ({ page }) => {
    await startFresh(page)

    // Create canvas and get ID
    const canvasId = await createCanvasViaUI(page, 'Deep Link Test')
    await page.waitForTimeout(500) // Give zustand subscription time to save
    await goToCanvasList(page)

    // Navigate directly to canvas URL
    await page.goto(`/canvas/${canvasId}`)

    // Should load the canvas
    await expectOnCanvasView(page)
    await expect(page.getByTestId('canvas-title')).toHaveText('Deep Link Test')
  })

  test('TEST-CM-025: Non-existent canvas redirects to list', async ({
    page,
  }) => {
    await startFresh(page)

    // Try to navigate to non-existent canvas
    await page.goto('/canvas/non-existent-id')

    // Should redirect to canvas list
    await expectOnCanvasList(page)
  })
})

// =============================================================================
// PERSISTENCE TESTS (2 tests)
// =============================================================================

test.describe('Canvas Persistence', () => {
  test('TEST-CM-026: Canvas list persists after reload', async ({ page }) => {
    await startFresh(page)

    // Create 3 canvases
    await createCanvasViaUI(page, 'Persist 1')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Persist 2')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Persist 3')
    await goToCanvasList(page)

    // Reload page
    await page.reload()

    // All 3 should still be there
    expect(await getCanvasCount(page)).toBe(3)
    await expectCanvasInList(page, 'Persist 1')
    await expectCanvasInList(page, 'Persist 2')
    await expectCanvasInList(page, 'Persist 3')
  })

  test('TEST-CM-027: Deletion persists after reload', async ({ page }) => {
    await startFresh(page)

    // Create 2 canvases
    await createCanvasViaUI(page, 'Keep')
    await goToCanvasList(page)

    await createCanvasViaUI(page, 'Delete Me')
    await goToCanvasList(page)

    expect(await getCanvasCount(page)).toBe(2)

    // Delete one
    await deleteCanvasViaUI(page, 'Delete Me')

    // Reload
    await page.reload()

    // Only one should remain
    expect(await getCanvasCount(page)).toBe(1)
    await expectCanvasInList(page, 'Keep')
  })
})
