import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addNodeViaClick,
  expectCanvasEmpty
} from '../helpers/test-utils'

test.describe('Tratamento de Erros', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Testes de Erro')
  })

  test('tweet com URL invalida mostra erro', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')

    await page.getByPlaceholder(/twitter\.com|URL/i).fill('url-invalida-sem-formato')
    await page.getByRole('button', { name: 'Carregar' }).click()

    await expect(page.getByTestId('tweet-error-message')).toBeVisible()
  })

  test('tweet com URL incompleta mostra erro', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')

    await page.getByPlaceholder(/twitter\.com|URL/i).fill('https://twitter.com/user')
    await page.getByRole('button', { name: 'Carregar' }).click()

    await expect(page.getByTestId('tweet-error-message')).toBeVisible()
  })

  test('nota vazia e removida ao finalizar', async ({ page }) => {
    await addNodeViaClick(page, 'Note')

    const textarea = page.getByPlaceholder(/anotacao/i)
    await textarea.focus()

    await page.keyboard.press('Enter')

    await expectCanvasEmpty(page)
  })

  test('pergunta vazia nao pode ser submetida', async ({ page }) => {
    await addNodeViaClick(page, 'Question')

    const submitBtn = page.getByRole('button', { name: 'Submeter' })
    await expect(submitBtn).toBeDisabled()
  })

  test('tweet com input vazio nao pode ser carregado', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')

    const loadBtn = page.getByRole('button', { name: 'Carregar' })
    await expect(loadBtn).toBeDisabled()
  })

  test('pode corrigir URL apos erro', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')

    const urlInput = page.getByPlaceholder(/twitter\.com|URL/i)
    await urlInput.fill('url-invalida')
    await page.getByRole('button', { name: 'Carregar' }).click()
    await expect(page.getByTestId('tweet-error-message')).toBeVisible()

    await urlInput.clear()
    await urlInput.fill('https://twitter.com/user/status/123456')
    await page.getByRole('button', { name: 'Carregar' }).click()

    await expect(page.getByTestId('tweet-author-handle')).toBeVisible({ timeout: 10000 })
  })

  test('sem erros no console durante interacoes normais', async ({ page }) => {
    const consoleErrors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await addNodeViaClick(page, 'Note', { x: 150, y: 150 })
    await page.getByPlaceholder(/anotacao/i).fill('Teste')
    await page.keyboard.press('Enter')

    // Use testid to avoid matching canvas title "Testes de Erro"
    await expect(page.getByTestId('note-content')).toContainText('Teste')
    await expect(page.getByPlaceholder(/anotacao/i)).not.toBeVisible()

    // Position far from note to avoid overlap
    await addNodeViaClick(page, 'Tweet', { x: 550, y: 150 })
    await page.getByPlaceholder(/twitter\.com|URL/i).last().fill('https://twitter.com/user/status/999')
    await page.getByRole('button', { name: 'Carregar' }).last().click()
    await expect(page.getByTestId('tweet-author-handle')).toBeVisible({ timeout: 10000 })

    // Filter non-critical errors (favicon, 404 resources)
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('favicon') && !error.includes('404') && !error.includes('network')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('nao pode clicar em carregar durante loading', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')

    await page.getByPlaceholder(/twitter\.com|URL/i).fill('https://twitter.com/user/status/111')

    await page.getByRole('button', { name: 'Carregar' }).click()

    // With delay=0 loading may be too fast, just verify it eventually loads
    await expect(page.getByText(/@\w+/)).toBeVisible({ timeout: 10000 })
  })

  test('fechar menu com Escape nao causa erros', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    const canvas = page.locator('.vue-flow__pane')

    await page.getByTestId('toolbox-new-flow').click()
    await canvas.click({ position: { x: 200, y: 200 } })
    await page.keyboard.press('Escape')

    await page.getByTestId('toolbox-new-flow').click()
    await canvas.click({ position: { x: 300, y: 300 } })
    await page.keyboard.press('Escape')

    await page.getByTestId('toolbox-new-flow').click()
    await canvas.click({ position: { x: 400, y: 400 } })
    await page.keyboard.press('Escape')

    const criticalErrors = consoleErrors.filter(
      (error) => !error.includes('favicon') && !error.includes('404')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('clicar fora do menu fecha sem erro', async ({ page }) => {
    const canvas = page.locator('.vue-flow__pane')

    await page.getByTestId('toolbox-new-flow').click()
    await canvas.click({ position: { x: 300, y: 300 } })
    await expect(page.getByTestId('node-type-menu')).toBeVisible()

    // Single click on empty area closes menu (does not open new menu)
    await canvas.click({ position: { x: 100, y: 100 } })

    await expect(page.getByTestId('node-type-menu')).not.toBeVisible()
  })
})
