import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  goBackToList,
  expectCanvasInList,
  expectCanvasListEmpty,
  expectOnCanvasList
} from '../helpers/test-utils'

test.describe('Gestao de Canvases', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
  })

  test('usuario cria, lista e deleta canvases', async ({ page }) => {
    await page.getByRole('button', { name: 'Novo Canvas' }).click()
    await page.getByPlaceholder('Nome do canvas').fill('Canvas A')
    await page.getByRole('button', { name: 'Criar', exact: true }).click()

    await goBackToList(page)
    await expectCanvasInList(page, 'Canvas A')

    await page.getByRole('button', { name: 'Novo Canvas' }).click()
    await page.getByPlaceholder('Nome do canvas').fill('Canvas B')
    await page.getByRole('button', { name: 'Criar', exact: true }).click()
    await goBackToList(page)

    await expectCanvasInList(page, 'Canvas A')
    await expectCanvasInList(page, 'Canvas B')

    const canvasACard = page.locator('article').filter({ hasText: 'Canvas A' })
    await canvasACard.hover()
    await canvasACard.getByRole('button', { name: /deletar/i }).click()

    await expect(page.getByText(/certeza/i)).toBeVisible()
    await expect(page.getByText('"Canvas A"')).toBeVisible()
    await page.getByTestId('confirm-delete-btn').click()

    await expect(page.locator('article').filter({ hasText: 'Canvas A' })).not.toBeVisible()
    await expectCanvasInList(page, 'Canvas B')
  })

  test('botao deletar aparece ao passar mouse no card', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Hover')
    await goBackToList(page)

    const card = page.locator('article').filter({ hasText: 'Canvas Hover' })

    await card.hover()

    await expect(card.getByRole('button', { name: /deletar/i })).toBeVisible()
  })

  test('cancelar delecao mantem canvas', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Cancelar')
    await goBackToList(page)

    const card = page.locator('article').filter({ hasText: 'Canvas Cancelar' })
    await card.hover()
    await card.getByRole('button', { name: /deletar/i }).click()

    await page.getByRole('button', { name: 'Cancelar' }).click()

    await expectCanvasInList(page, 'Canvas Cancelar')
  })

  test('canvas mais recente aparece primeiro na lista', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Antigo')
    await goBackToList(page)

    await createCanvasViaUI(page, 'Canvas Recente')
    await goBackToList(page)

    const cards = page.locator('article')
    const firstCardText = await cards.first().textContent()
    expect(firstCardText).toContain('Canvas Recente')
  })

  test('exibe contagem de nodes no card', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Com Nodes')

    await page.getByTestId('toolbox-new-flow').click()
    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })
    await page.getByRole('menuitem', { name: /Note/i }).click()
    await page.getByPlaceholder(/anotacao/i).fill('Nota teste')
    await page.keyboard.press('Enter')

    await goBackToList(page)

    const card = page.locator('article').filter({ hasText: 'Canvas Com Nodes' })
    await expect(card.getByText(/1 no/i)).toBeVisible()
  })

  test('clicar no card navega para canvas', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Navegavel')
    await goBackToList(page)

    await page.getByText('Canvas Navegavel').click()

    await expect(page.getByRole('heading', { name: 'Canvas Navegavel' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Voltar' })).toBeVisible()
  })

  test('deletar ultimo canvas mostra estado vazio', async ({ page }) => {
    await createCanvasViaUI(page, 'Ultimo Canvas')
    await goBackToList(page)

    const card = page.locator('article').filter({ hasText: 'Ultimo Canvas' })
    await card.hover()
    await card.getByRole('button', { name: /deletar/i }).click()
    await page.getByTestId('confirm-delete-btn').click()

    await expectCanvasListEmpty(page)
  })

  test('criar canvas pelo header funciona igual ao estado vazio', async ({ page }) => {
    await createCanvasViaUI(page, 'Primeiro')
    await goBackToList(page)

    await page.getByRole('button', { name: 'Novo Canvas' }).click()
    await page.getByPlaceholder('Nome do canvas').fill('Via Header')
    await page.getByRole('button', { name: 'Criar', exact: true }).click()

    await expect(page.getByRole('heading', { name: 'Via Header' })).toBeVisible()
  })

  test('fechar modal de delete clicando fora', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Modal')
    await goBackToList(page)

    const card = page.locator('article').filter({ hasText: 'Canvas Modal' })
    await card.hover()
    await card.getByRole('button', { name: /deletar/i }).click()
    await expect(page.getByText(/certeza/i)).toBeVisible()

    await page.getByTestId('delete-modal').click({ position: { x: 10, y: 10 } })

    await expect(page.getByText(/certeza/i)).not.toBeVisible()
    await expectCanvasInList(page, 'Canvas Modal')
  })
})
