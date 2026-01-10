import { test, expect } from '@playwright/test'
import { startFresh, expectCanvasListEmpty, expectCanvasEmpty } from '../helpers/test-utils'

test.describe('Primeiro Uso', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
  })

  test('usuario novo ve tela vazia e cria primeiro canvas', async ({ page }) => {
    await expectCanvasListEmpty(page)
    await expect(page.getByText('Crie seu primeiro canvas')).toBeVisible()

    await page.getByRole('button', { name: 'Criar primeiro canvas' }).click()

    await expect(page.getByRole('heading', { name: 'Novo Canvas' })).toBeVisible()

    await page.getByPlaceholder('Nome do canvas').fill('Meu Primeiro Canvas')
    await page.getByRole('button', { name: 'Criar', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'Meu Primeiro Canvas' })).toBeVisible()
    await expectCanvasEmpty(page)

    await page.getByTestId('toolbox-new-flow').click()

    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })

    await expect(page.getByText('Adicionar no')).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Tweet/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Question/i })).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Note/i })).toBeVisible()
  })

  test('modal fecha ao pressionar Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar primeiro canvas' }).click()
    await expect(page.getByRole('heading', { name: 'Novo Canvas' })).toBeVisible()

    // Escape handler is bound to input element
    const input = page.getByPlaceholder('Nome do canvas')
    await input.focus()
    await page.keyboard.press('Escape')

    await expect(page.getByRole('heading', { name: 'Novo Canvas' })).not.toBeVisible()
  })

  test('modal fecha ao clicar em Cancelar', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar primeiro canvas' }).click()
    await expect(page.getByRole('heading', { name: 'Novo Canvas' })).toBeVisible()

    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expect(page.getByRole('heading', { name: 'Novo Canvas' })).not.toBeVisible()
  })

  test('cria canvas com nome padrao se input vazio', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar primeiro canvas' }).click()

    await page.getByRole('button', { name: 'Criar', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'Novo Canvas' })).toBeVisible()
  })

  test('cria canvas pressionando Enter no input', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar primeiro canvas' }).click()

    await page.getByPlaceholder('Nome do canvas').fill('Canvas via Enter')
    await page.keyboard.press('Enter')

    await expect(page.getByRole('heading', { name: 'Canvas via Enter' })).toBeVisible()
  })

  test('menu fecha ao pressionar Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar primeiro canvas' }).click()
    await page.getByRole('button', { name: 'Criar', exact: true }).click()

    await page.getByTestId('toolbox-new-flow').click()
    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })
    await expect(page.getByText('Adicionar no')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByText('Adicionar no')).not.toBeVisible()
  })

  test('hint desaparece apos adicionar primeiro node', async ({ page }) => {
    await page.getByRole('button', { name: 'Criar primeiro canvas' }).click()
    await page.getByRole('button', { name: 'Criar', exact: true }).click()

    await expectCanvasEmpty(page)

    await page.getByTestId('toolbox-new-flow').click()
    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })
    await page.getByRole('menuitem', { name: /Note/i }).click()

    await expect(page.getByTestId('canvas-empty-hint')).not.toBeVisible()
  })
})
