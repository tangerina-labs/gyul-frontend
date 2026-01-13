import { test, expect } from '@playwright/test'

test.describe('Project Setup', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      ;(window as any).__PLAYWRIGHT_TEST__ = true
    })

    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should render the application without errors', async ({ page }) => {
    await page.goto('/')
    // The expect already waits for the element, no need for networkidle
    await expect(page.getByText('Transform fleeting tweets into lasting understanding')).toBeVisible()
  })

  test('should show landing page at root', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Start exploring' })).toBeVisible()
  })

  test('should redirect unknown routes to /canvases', async ({ page }) => {
    await page.goto('/unknown-route-that-does-not-exist')
    await page.waitForURL('**/canvases')
    expect(page.url()).toContain('/canvases')
  })

  test('should display canvas list view on /canvases', async ({ page }) => {
    await page.goto('/canvases')
    await expect(page.getByText('gyul')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Novo Canvas' })).toBeVisible()
  })

  test('should have no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    // Wait for app to be fully loaded before checking errors
    await expect(page.getByRole('link', { name: 'Start exploring' })).toBeVisible()

    const criticalErrors = consoleErrors.filter((error) => !error.includes('favicon'))

    expect(criticalErrors).toHaveLength(0)
  })

  test('should have proper page title', async ({ page }) => {
    await page.goto('/canvases')
    await expect(page.getByText('gyul')).toBeVisible()
    await expect(page).toHaveTitle('Meus Canvas - gyul')
  })

  test('should show empty state for new user', async ({ page }) => {
    await page.goto('/canvases')
    await expect(page.getByText('Nenhum canvas ainda')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Criar primeiro canvas' })).toBeVisible()
  })
})
