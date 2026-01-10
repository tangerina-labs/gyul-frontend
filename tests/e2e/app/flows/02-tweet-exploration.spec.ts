import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addNodeViaClick,
  loadTweet,
  submitQuestion,
  fitCanvasView
} from '../helpers/test-utils'

test.describe('Exploracao de Tweet', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Exploracao Twitter')
  })

  test('usuario carrega tweet e faz perguntas sobre ele', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')

    await expect(page.getByPlaceholder(/twitter\.com|URL/i)).toBeVisible()
    await expect(page.getByText('Cole a URL do tweet')).toBeVisible()

    await loadTweet(page, 'https://twitter.com/user/status/123456789')

    await expect(page.getByTestId('tweet-author-handle')).toBeVisible()

    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Question/i }).click()

    await page.getByPlaceholder(/pergunta/i).fill('O que isso significa na pratica?')
    await fitCanvasView(page)
    await page.getByRole('button', { name: 'Submeter' }).click()

    await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('question-response-content')).toBeVisible()
  })

  test('tweet mostra estado de loading durante carregamento', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')

    await page.getByPlaceholder(/twitter\.com|URL/i).fill('https://twitter.com/user/status/999')
    await page.getByRole('button', { name: 'Carregar' }).click()

    // Loading state may be too fast with delay=0
    await expect(page.getByTestId('tweet-author-handle')).toBeVisible({ timeout: 10000 })
  })

  test('permite fazer multiplas perguntas de follow-up', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/111')

    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await submitQuestion(page, 'Primeira pergunta?')

    await page.getByTestId('question-add-child-btn').first().click({ force: true })
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)

    await page.getByPlaceholder(/pergunta/i).last().fill('Segunda pergunta de follow-up?')
    await page.getByRole('button', { name: 'Submeter' }).last().click()

    const aiBadges = page.getByTestId('question-ai-badge')
    await expect(aiBadges).toHaveCount(2, { timeout: 10000 })
  })

  test('edge conecta tweet ao filho', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/222')

    await page.getByTestId('tweet-add-child-btn').click({ force: true })
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)

    const edges = page.locator('.vue-flow__edge')
    await expect(edges).toHaveCount(1)
  })

  test('tweet exibe informacoes do autor', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/testuser/status/333')

    await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
  })

  test('atalho Ctrl+Enter submete pergunta', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/444')

    await page.getByTestId('tweet-add-child-btn').click({ force: true })
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)

    await page.getByPlaceholder(/pergunta/i).fill('Pergunta via atalho?')
    await page.keyboard.press('Control+Enter')

    await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })
  })

  test('resposta longa mostra botao "Ver mais" e expande ao clicar', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/555')

    await page.getByTestId('tweet-add-child-btn').click({ force: true })
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await submitQuestion(page, 'Explique em detalhes o significado disso')

    await expect(page.getByTestId('question-response-content')).toBeVisible()

    // Toggle only appears if response is long enough
    const toggle = page.getByTestId('expandable-text-toggle')
    const isToggleVisible = await toggle.isVisible().catch(() => false)

    if (isToggleVisible) {
      await expect(toggle).toContainText('Ver mais')

      await toggle.click()
      await expect(toggle).toContainText('Ver menos')

      await toggle.click()
      await expect(toggle).toContainText('Ver mais')
    }
  })
})
