import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  goBackToList,
  expectOnCanvasList,
  expectOnCanvasView,
  expectCanvasInList,
  addNodeViaClick
} from '../helpers/test-utils'

test.describe('Navegacao', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
  })

  test('usuario navega entre lista e canvas', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Navegacao')

    await expect(page.getByRole('heading', { name: 'Canvas Navegacao' })).toBeVisible()
    await expectOnCanvasView(page)

    await goBackToList(page)
    await expectOnCanvasList(page)

    await page.getByText('Canvas Navegacao').click()
    await expect(page.getByRole('heading', { name: 'Canvas Navegacao' })).toBeVisible()

    await page.goBack()
    await expectOnCanvasList(page)

    await page.goForward()
    await expect(page.getByRole('heading', { name: 'Canvas Navegacao' })).toBeVisible()
  })

  test('rota raiz mostra landing page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('link', { name: 'Start exploring' })).toBeVisible()
  })

  test('rota desconhecida redireciona para /canvases', async ({ page }) => {
    await page.goto('/rota-que-nao-existe')
    await page.waitForURL('**/canvases')
    expect(page.url()).toContain('/canvases')
  })

  test('deep link para canvas funciona', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Deep Link')
    const canvasUrl = page.url()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.goto(canvasUrl)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Canvas Deep Link' })).toBeVisible()
  })

  test('titulo da pagina muda com navegacao', async ({ page }) => {
    await expect(page).toHaveTitle(/gyul/)

    await createCanvasViaUI(page, 'Canvas Titulo')

    await expect(page).toHaveTitle(/Canvas.*gyul/)

    await goBackToList(page)

    await expect(page).toHaveTitle(/Meus Canvas.*gyul/)
  })

  test('historico funciona corretamente com multiplas navegacoes', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas A')
    await goBackToList(page)

    await createCanvasViaUI(page, 'Canvas B')
    await goBackToList(page)

    await page.getByText('Canvas A').click()
    await expect(page.getByRole('heading', { name: 'Canvas A' })).toBeVisible()

    await page.goBack()
    await expectOnCanvasList(page)

    await page.goForward()
    await expect(page.getByRole('heading', { name: 'Canvas A' })).toBeVisible()
  })

  test('botao voltar leva para lista', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Voltar')

    await page.getByRole('button', { name: 'Voltar' }).click()

    await page.waitForURL('**/canvases')
    await expectOnCanvasList(page)
  })

  test('navegacao preserva estado do canvas', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Estado')

    await page.getByTestId('toolbox-new-flow').click()
    const canvas = page.locator('.vue-flow__pane')
    await canvas.click({ position: { x: 300, y: 300 } })
    await page.getByRole('menuitem', { name: /Note/i }).click()
    await page.getByPlaceholder(/anotacao/i).fill('Nota de teste')
    await page.keyboard.press('Enter')
    await expect(page.getByText('Nota de teste')).toBeVisible()

    await goBackToList(page)

    await page.getByText('Canvas Estado').click()

    await expect(page.getByText('Nota de teste')).toBeVisible()
  })

  test('URL contem ID do canvas', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas ID')

    const url = page.url()
    expect(url).toMatch(/\/canvas\/[^/]+$/)
  })

  test('refresh na lista mantem na lista', async ({ page }) => {
    await expectOnCanvasList(page)

    await page.reload()
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/canvases')
    await expectOnCanvasList(page)
  })

  test('refresh no canvas mantem no canvas', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Refresh')

    const url = page.url()

    await page.reload()
    await page.waitForLoadState('networkidle')

    expect(page.url()).toBe(url)
    await expect(page.getByRole('heading', { name: 'Canvas Refresh' })).toBeVisible()
  })

  test('sem erros de console durante navegacao', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await createCanvasViaUI(page, 'Canvas Navegacao Erro')

    await goBackToList(page)
    await page.getByText('Canvas Navegacao Erro').click()
    await page.goBack()
    await page.goForward()
    await goBackToList(page)

    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('favicon') && !error.includes('404') && !error.includes('network')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('controles de zoom funcionam corretamente', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Zoom')

    await addNodeViaClick(page, 'Note')
    await page.getByPlaceholder(/anotacao/i).fill('Nota para teste de zoom')
    await page.keyboard.press('Enter')

    await expect(page.getByTestId('controls-zoom-in')).toBeVisible()
    await expect(page.getByTestId('controls-zoom-out')).toBeVisible()
    await expect(page.getByTestId('controls-fit-view')).toBeVisible()

    await page.getByTestId('controls-zoom-in').click()
    await page.getByTestId('controls-zoom-out').click()
    await page.getByTestId('controls-fit-view').click()

    await expect(page.getByText('Nota para teste de zoom')).toBeVisible()
  })
})
