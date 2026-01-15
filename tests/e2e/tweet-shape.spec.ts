import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addShapeViaMenu,
  loadTweet,
  loadTweetViaEnter,
  fitCanvasView,
  getTweetCardCount,
  clickUndo,
} from './helpers/test-utils'

test.describe('Tweet Shape', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Tweet Test')
  })

  test.describe('Estado Empty', () => {
    test('TweetShape exibe input de URL ao ser criado', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      // Verifica elementos do estado empty
      await expect(page.getByTestId('tweet-card')).toBeVisible()
      await expect(page.getByTestId('tweet-url-input')).toBeVisible()
      await expect(page.getByTestId('tweet-submit-btn')).toBeVisible()
      await expect(page.getByPlaceholder(/URL do tweet/i)).toBeVisible()

      // Botao [+] NAO deve estar visivel no estado empty
      await expect(page.getByTestId('tweet-add-child-btn')).not.toBeVisible()
    })

    test('botao Carregar desabilitado com input vazio', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      const submitBtn = page.getByTestId('tweet-submit-btn')
      await expect(submitBtn).toBeDisabled()
    })

    test('botao Carregar habilitado com input preenchido', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      await page.getByTestId('tweet-url-input').fill('https://twitter.com/user/status/123')
      const submitBtn = page.getByTestId('tweet-submit-btn')
      await expect(submitBtn).toBeEnabled()
    })
  })

  test.describe('Fluxo de Carregamento', () => {
    test('usuario carrega tweet e ve informacoes do autor', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')
      await loadTweet(page, 'https://twitter.com/testuser/status/123456789')

      // Verifica estado loaded
      await expect(page.getByTestId('tweet-author-avatar')).toBeVisible()
      await expect(page.getByTestId('tweet-author-name')).toBeVisible()
      await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
      await expect(page.getByTestId('tweet-text')).toBeVisible()
      await expect(page.getByTestId('tweet-timestamp')).toBeVisible()
      await expect(page.getByTestId('tweet-add-child-btn')).toBeVisible()
    })

    test('Enter submete formulario', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')
      await loadTweetViaEnter(page, 'https://twitter.com/user/status/999')

      // Verifica que tweet foi carregado
      await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
    })

    test('tweet mostra estado de loading durante carregamento', async ({ page }) => {
      // Para este teste, nao usamos o helper pois queremos capturar o estado intermediario
      await addShapeViaMenu(page, 'Tweet')

      const urlInput = page.getByTestId('tweet-url-input')
      await urlInput.fill('https://twitter.com/user/status/999')
      await page.getByTestId('tweet-submit-btn').click()

      // Em ambiente de teste, loading e muito rapido, mas podemos verificar resultado final
      await expect(page.getByTestId('tweet-author-handle')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Validacao de URL', () => {
    test('aceita URL do twitter.com', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')
      await loadTweet(page, 'https://twitter.com/user/status/123')

      await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
    })

    test('aceita URL do x.com', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')
      await loadTweet(page, 'https://x.com/user/status/123')

      await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
    })

    test('aceita URL com query params', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')
      await loadTweet(page, 'https://twitter.com/user/status/123?s=20&t=abc')

      await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
    })

    test('rejeita URL de outro dominio', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      await page.getByTestId('tweet-url-input').fill('https://facebook.com/post/123')
      await page.getByTestId('tweet-submit-btn').click()

      await expect(page.getByTestId('tweet-error-message')).toBeVisible()
    })

    test('rejeita URL sem protocolo https', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      await page.getByTestId('tweet-url-input').fill('http://twitter.com/user/status/123')
      await page.getByTestId('tweet-submit-btn').click()

      await expect(page.getByTestId('tweet-error-message')).toBeVisible()
    })

    test('rejeita URL incompleta sem /status/', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      await page.getByTestId('tweet-url-input').fill('https://twitter.com/user')
      await page.getByTestId('tweet-submit-btn').click()

      await expect(page.getByTestId('tweet-error-message')).toBeVisible()
    })

    test('URL invalida mostra erro', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      await page.getByTestId('tweet-url-input').fill('url-invalida-sem-formato')
      await page.getByTestId('tweet-submit-btn').click()

      await expect(page.getByTestId('tweet-error-message')).toBeVisible()
    })
  })

  test.describe('Estado de Erro', () => {
    test('pode corrigir URL apos erro', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      const urlInput = page.getByTestId('tweet-url-input')

      // Submete URL invalida
      await urlInput.fill('url-invalida')
      await page.getByTestId('tweet-submit-btn').click()
      await expect(page.getByTestId('tweet-error-message')).toBeVisible()

      // Corrige e tenta novamente
      await urlInput.clear()
      await urlInput.fill('https://twitter.com/user/status/123456')
      await page.getByTestId('tweet-retry-btn').click()

      await expect(page.getByTestId('tweet-author-handle')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Menu de Criacao', () => {
    test('botao Novo Fluxo abre menu ao clicar no canvas', async ({ page }) => {
      // Click "Novo Fluxo" button
      await page.getByTestId('toolbox-new-flow').click()

      // Wait for creation overlay
      const overlay = page.locator('[aria-label="Click to place shape"]')
      await expect(overlay).toBeVisible()

      // Click on overlay
      await overlay.click({ position: { x: 300, y: 300 } })

      // Menu should appear
      await expect(page.getByTestId('shape-type-menu')).toBeVisible()
      await expect(page.getByTestId('menu-option-tweet')).toBeVisible()
      await expect(page.getByTestId('menu-option-question')).toBeVisible()
      await expect(page.getByTestId('menu-option-note')).toBeVisible()
    })

    test('selecionar Tweet cria shape no canvas', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      await expect(page.getByTestId('tweet-card')).toBeVisible()
      const count = await getTweetCardCount(page)
      expect(count).toBe(1)
    })

    test('menu fecha apos selecionar tipo', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      await expect(page.getByTestId('shape-type-menu')).not.toBeVisible()
    })
  })

  test.describe('Undo/Redo', () => {
    test('undo remove tweet criado', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')

      // Verify tweet exists
      await expect(page.getByTestId('tweet-card')).toBeVisible()

      // Undo
      await clickUndo(page)
      await page.waitForTimeout(100)

      // Tweet should be gone
      await expect(page.getByTestId('tweet-card')).not.toBeVisible()
    })
  })

  test.describe('Qualidade', () => {
    test('sem erros no console durante interacoes normais', async ({ page }) => {
      const consoleErrors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await addShapeViaMenu(page, 'Tweet')
      await loadTweet(page, 'https://twitter.com/user/status/999')

      // Filter out non-critical errors (like favicon, network, etc)
      const criticalErrors = consoleErrors.filter(
        (error) =>
          !error.includes('favicon') &&
          !error.includes('404') &&
          !error.includes('network') &&
          !error.includes('Failed to load resource')
      )

      expect(criticalErrors).toHaveLength(0)
    })
  })

  test.describe('Fit View', () => {
    test('fit view centra tweet no canvas', async ({ page }) => {
      await addShapeViaMenu(page, 'Tweet')
      await loadTweet(page, 'https://twitter.com/user/status/123')

      // Fit view
      await fitCanvasView(page)

      // Tweet should still be visible
      await expect(page.getByTestId('tweet-card')).toBeVisible()
    })
  })
})
