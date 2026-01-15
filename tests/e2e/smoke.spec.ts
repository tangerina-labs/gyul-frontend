import { test, expect } from '@playwright/test'
import { startFresh, createCanvas, waitForCanvas } from './helpers/test-utils'

test.describe('Smoke Tests', () => {
  test('app loads and shows gyul header', async ({ page }) => {
    await startFresh(page)
    await expect(page.getByText('gyul')).toBeVisible()
  })

  test('can create a new canvas', async ({ page }) => {
    await startFresh(page)

    // Create a new canvas
    const canvasId = await createCanvas(page)

    // Verify we're on the canvas page
    expect(canvasId).toBeTruthy()
    await waitForCanvas(page)
  })

  test('can navigate back to canvas list', async ({ page }) => {
    await startFresh(page)

    // Create a canvas first
    await createCanvas(page)
    await waitForCanvas(page)

    // Navigate back
    await page.getByRole('button', { name: /new canvas/i }).click({ force: true })

    // Actually click the back button
    await page.locator('button').filter({ hasText: /canvas/i }).first().click()

    // Verify we're back on the list
    await expect(page.getByText('gyul')).toBeVisible()
  })
})
