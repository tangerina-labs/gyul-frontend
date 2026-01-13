import { test, expect } from '@playwright/test'
import { startFresh, createCanvasViaUI, expectCanvasEmpty } from '../helpers/test-utils'

test.describe('Criacao Explicita de Fluxos', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Test Canvas')
  })

  test('clique simples em area vazia NAO abre menu', async ({ page }) => {
    await expectCanvasEmpty(page)

    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })

    await expect(page.getByTestId('node-type-menu')).not.toBeVisible()
  })

  test('toolbox exibe botao "+ Novo Fluxo"', async ({ page }) => {
    await expect(page.getByTestId('canvas-toolbox')).toBeVisible()

    await expect(page.getByTestId('toolbox-new-flow')).toBeVisible()
    await expect(page.getByTestId('toolbox-new-flow')).toContainText('Novo Fluxo')
  })

  test('criar fluxo via botao + clique', async ({ page }) => {
    await page.getByTestId('toolbox-new-flow').click()

    await expect(page.getByTestId('toolbox-new-flow')).toHaveAttribute('data-active', 'true')
    await expect(page.getByTestId('canvas-creating-overlay')).toBeVisible()

    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })

    await expect(page.getByTestId('canvas-creating-overlay')).not.toBeVisible()
    await expect(page.getByTestId('toolbox-new-flow')).not.toHaveAttribute('data-active', 'true')

    await expect(page.getByTestId('node-type-menu')).toBeVisible()

    await page.getByRole('menuitem', { name: /Note/i }).click()

    await expect(page.getByTestId('note-card')).toBeVisible()
  })

  test('ESC cancela modo de criacao', async ({ page }) => {
    await page.getByTestId('toolbox-new-flow').click()
    await expect(page.getByTestId('canvas-creating-overlay')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByTestId('canvas-creating-overlay')).not.toBeVisible()
    await expect(page.getByTestId('toolbox-new-flow')).not.toHaveAttribute('data-active', 'true')

    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })
    await expect(page.getByTestId('node-type-menu')).not.toBeVisible()
  })

  test('modo desativa imediatamente apos clique no canvas', async ({ page }) => {
    await page.getByTestId('toolbox-new-flow').click()
    await expect(page.getByTestId('canvas-creating-overlay')).toBeVisible()

    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })

    await expect(page.getByTestId('canvas-creating-overlay')).not.toBeVisible()
    await expect(page.getByTestId('toolbox-new-flow')).not.toHaveAttribute('data-active', 'true')

    await expect(page.getByTestId('node-type-menu')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByTestId('node-type-menu')).not.toBeVisible()
  })

  test('hint atualizado para instruir sobre botao', async ({ page }) => {
    await expect(page.getByTestId('canvas-empty-hint')).toContainText('+ Novo Fluxo')
  })

  test('hint desaparece quando modo de criacao esta ativo', async ({ page }) => {
    await expect(page.getByTestId('canvas-empty-hint')).toBeVisible()

    await page.getByTestId('toolbox-new-flow').click()

    await expect(page.getByTestId('canvas-empty-hint')).not.toBeVisible()
  })

  test('clicar botao novamente desativa modo', async ({ page }) => {
    await page.getByTestId('toolbox-new-flow').click()
    await expect(page.getByTestId('canvas-creating-overlay')).toBeVisible()

    await page.getByTestId('toolbox-new-flow').click()

    await expect(page.getByTestId('canvas-creating-overlay')).not.toBeVisible()
    await expect(page.getByTestId('toolbox-new-flow')).not.toHaveAttribute('data-active', 'true')
  })
})
