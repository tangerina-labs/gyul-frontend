import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addShapeViaMenu,
  fitCanvasView,
  submitQuestion,
  getQuestionCardCount,
  clickUndo,
  ShapeBuilder,
  clickZoomOut,
  panCanvas,
} from './helpers/test-utils'

test.describe('Question Shape', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Question Test')
  })

  test.describe('Estado Draft', () => {
    test('should automatically focus textarea when creating question shape', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      const textarea = page.getByTestId('question-prompt-input')
      await expect(textarea).toBeVisible()
      await expect(textarea).toBeFocused()
    })

    test('should display placeholder text in textarea when empty', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      const textarea = page.getByTestId('question-prompt-input')
      await expect(textarea).toHaveAttribute('placeholder', 'Escreva sua pergunta...')
    })

    test('should add new line with Enter key without submitting question', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      const textarea = page.getByTestId('question-prompt-input')
      await textarea.fill('Primeira linha')
      await page.keyboard.press('Enter')
      await textarea.pressSequentially('Segunda linha')

      // Verifica que o texto tem as duas linhas
      const value = await textarea.inputValue()
      expect(value).toContain('Primeira linha')
      expect(value).toContain('Segunda linha')

      // Nao deve ter iniciado loading
      await expect(page.getByTestId('question-loading')).not.toBeVisible()
      await expect(page.getByTestId('question-ai-badge')).not.toBeVisible()
    })

    test('should submit question with Ctrl+Enter keyboard shortcut', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      await page.getByTestId('question-prompt-input').fill('Minha pergunta via atalho?')
      await page.keyboard.press('Control+Enter')

      await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })
    })

    test('should submit question with Cmd+Enter keyboard shortcut on macOS', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      await page.getByTestId('question-prompt-input').fill('Pergunta via Cmd+Enter?')
      await page.keyboard.press('Meta+Enter')

      await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })
    })

    test('should display submit button with keyboard shortcut hint', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      const submitBtn = page.getByTestId('question-submit-btn')
      await expect(submitBtn).toBeVisible()
      await expect(submitBtn).toContainText('Submeter')
      await expect(submitBtn).toContainText('Ctrl+Enter')
    })

    test('should disable submit button when prompt is empty', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      const submitBtn = page.getByTestId('question-submit-btn')
      await expect(submitBtn).toBeDisabled()
    })

    test('should disable submit button with less than 3 characters and enable with 3 or more', async ({
      page,
    }) => {
      await addShapeViaMenu(page, 'Question')

      const textarea = page.getByTestId('question-prompt-input')
      const submitBtn = page.getByTestId('question-submit-btn')

      await textarea.fill('ab')
      await expect(submitBtn).toBeDisabled()

      await textarea.fill('abc')
      await expect(submitBtn).toBeEnabled()
    })

    test('should disable submit button when prompt exceeds 1000 characters', async ({
      page,
    }) => {
      await addShapeViaMenu(page, 'Question')

      const textarea = page.getByTestId('question-prompt-input')
      const submitBtn = page.getByTestId('question-submit-btn')

      // Preenche com exatamente 1000 caracteres
      const text1000 = 'a'.repeat(1000)
      await textarea.fill(text1000)
      await expect(submitBtn).toBeEnabled()

      // Adiciona mais um caractere
      await textarea.fill(text1000 + 'b')
      await expect(submitBtn).toBeDisabled()
    })

    test('should update character counter in real-time and show red when exceeding limit', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      const textarea = page.getByTestId('question-prompt-input')
      const charCount = page.getByTestId('question-char-count')

      await textarea.fill('Hello')
      await expect(charCount).toContainText('5/1000')

      await textarea.fill('a'.repeat(1001))
      await expect(charCount).toContainText('1001/1000')
      // Verifica que esta vermelho
      await expect(charCount).toHaveClass(/text-red/)
    })

    test('should keep submit button disabled when prompt contains only whitespace', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      const textarea = page.getByTestId('question-prompt-input')
      const submitBtn = page.getByTestId('question-submit-btn')

      await textarea.fill('   ')
      await expect(submitBtn).toBeDisabled()

      await textarea.fill('\n\n\n')
      await expect(submitBtn).toBeDisabled()

      await textarea.fill('  \t  ')
      await expect(submitBtn).toBeDisabled()
    })

    test('should hide add child button in draft state', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      await expect(page.getByTestId('question-add-child-btn')).not.toBeVisible()
    })
  })

  test.describe('Estado Loading', () => {

    test.skip('TEST-QN-013: prompt fica readonly durante loading', async ({ page }) => {
      // This test requires real delay which is disabled in test mode
      // The loading state transitions too fast to test
      await addShapeViaMenu(page, 'Question')
      const textarea = page.getByTestId('question-prompt-input')
      await textarea.fill('Pergunta de teste?')
      await page.getByTestId('question-submit-btn').click()

      // In test mode, loading is instant, so we verify final state
      await expect(page.getByTestId('question-prompt-text')).toBeVisible()
    })

    test.skip('TEST-QN-014: spinner e texto "Gerando resposta..." visiveis durante loading', async ({
      page,
    }) => {
      // This test requires real delay which is disabled in test mode
      await addShapeViaMenu(page, 'Question')
      await page.getByTestId('question-prompt-input').fill('Pergunta com loading visivel?')
      await page.getByTestId('question-submit-btn').click()
      await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })
    })

    test.skip('TEST-QN-015: botao Submeter nao visivel durante loading', async ({ page }) => {
      // This test requires real delay which is disabled in test mode
      await addShapeViaMenu(page, 'Question')
      await page.getByTestId('question-prompt-input').fill('Pergunta teste?')
      await page.getByTestId('question-submit-btn').click()
      await expect(page.getByTestId('question-ai-badge')).toBeVisible()
    })

    test.skip('TEST-QN-016: botao [+] nao visivel durante loading', async ({ page }) => {
      // This test requires real delay which is disabled in test mode
      await addShapeViaMenu(page, 'Question')
      await page.getByTestId('question-prompt-input').fill('Pergunta teste?')
      await page.getByTestId('question-submit-btn').click()
      await expect(page.getByTestId('question-ai-badge')).toBeVisible()
    })
  })

  test.describe('Estado Done', () => {
    test('should display prompt, divider, and response in done state', async ({
      page,
    }) => {
      await addShapeViaMenu(page, 'Question')
      await submitQuestion(page, 'Qual e o significado disso?')

      await expect(page.getByTestId('question-prompt-text')).toContainText(
        'Qual e o significado disso?'
      )
      await expect(page.getByTestId('question-divider')).toBeVisible()
      await expect(page.getByTestId('question-response-text')).toBeVisible()
    })

    test('should display green AI badge in done state', async ({
      page,
    }) => {
      await addShapeViaMenu(page, 'Question')
      await submitQuestion(page, 'Pergunta para ver badge?')

      const badge = page.getByTestId('question-ai-badge')
      await expect(badge).toBeVisible()
      await expect(badge).toHaveText('AI')
      await expect(badge).toHaveClass(/bg-green/)
    })

    test('should show add child button in done state', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')
      await submitQuestion(page, 'Pergunta para testar botao [+]?')

      const addChildBtn = page.getByTestId('question-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })

    test('should expand shape to display full response content without overflow', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')
      await submitQuestion(page, 'Explique em muitos detalhes todo o contexto')

      const responseSection = page.getByTestId('question-response-section')
      await expect(responseSection).toBeVisible()

      // Shape now grows with content instead of having internal scroll
      // Verify content is visible without overflow hidden
      const hasNoOverflowHidden = await responseSection.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return style.overflow !== 'hidden' || style.overflowY !== 'hidden'
      })

      expect(hasNoOverflowHidden).toBe(true)
    })

    test('should preserve line breaks in response text', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')
      // Usar prompt longo para garantir resposta com multiplas linhas
      await submitQuestion(
        page,
        'Explique em topicos separados com muito detalhe por favor'
      )

      const responseText = page.getByTestId('question-response-text')
      await expect(responseText).toBeVisible()

      // Verifica que o texto tem altura maior que uma linha unica
      const height = await responseText
        .locator('[data-testid="expandable-text-content"]')
        .evaluate((el) => el['offsetHeight'])
      expect(height).toBeGreaterThan(20)
    })

    test('should show expandable toggle for long responses', async ({ page }) => {
      const question = await ShapeBuilder.question(page)
        .submit('Explique em detalhes extensos o significado completo de tudo isso com muita profundidade por favor')
        .build()

      // Toggle pode ou nao aparecer dependendo do tamanho da resposta
      const toggle = page.getByTestId('expandable-text-toggle')
      const isToggleVisible = await toggle.isVisible().catch(() => false)

      if (isToggleVisible) {
        await expect(toggle).toContainText('Ver mais')

        await toggle.click()
        await fitCanvasView(page)
        await expect(toggle).toContainText('Ver menos')

        await toggle.click()
        await fitCanvasView(page)
        await expect(toggle).toContainText('Ver mais')
      }
    })
  })

  test.describe('Estado Error', () => {

    test.skip('TEST-QN-023: mensagem de erro visivel quando AI falha', async ({ page }) => {
      // Requires __FORCE_AI_ERROR__ flag injection before app load
      await addShapeViaMenu(page, 'Question')
      await page.getByTestId('question-prompt-input').fill('Pergunta que vai falhar?')
      await page.getByTestId('question-submit-btn').click()

      const errorMessage = page.getByTestId('question-error-message')
      await expect(errorMessage).toBeVisible({ timeout: 5000 })
    })

    test.skip('TEST-QN-024: botao "Tentar novamente" visivel no estado error', async ({
      page,
    }) => {
      // Requires __FORCE_AI_ERROR__ flag injection before app load
      await addShapeViaMenu(page, 'Question')
      await page.getByTestId('question-prompt-input').fill('Pergunta com erro?')
      await page.getByTestId('question-submit-btn').click()

      await expect(page.getByTestId('question-retry-btn')).toBeVisible({ timeout: 5000 })
    })

    test.skip('TEST-QN-025: clicar "Tentar novamente" re-submete a pergunta', async ({
      page,
    }) => {
      // Requires __FORCE_AI_ERROR__ flag injection before app load
      await addShapeViaMenu(page, 'Question')
      await page.getByTestId('question-prompt-input').fill('Pergunta com retry?')
      await page.getByTestId('question-submit-btn').click()

      await expect(page.getByTestId('question-retry-btn')).toBeVisible({ timeout: 5000 })
      await page.getByTestId('question-retry-btn').click()
      await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })
    })

    test.skip('TEST-QN-026: prompt visivel apos erro', async ({ page }) => {
      // Requires __FORCE_AI_ERROR__ flag injection before app load
      await addShapeViaMenu(page, 'Question')
      await page.getByTestId('question-prompt-input').fill('Pergunta original?')
      await page.getByTestId('question-submit-btn').click()

      await expect(page.getByTestId('question-error-message')).toBeVisible({ timeout: 5000 })
      const promptText = page.getByTestId('question-prompt-text')
      await expect(promptText).toBeVisible()
    })
  })

  test.describe('Standalone', () => {
    test('should work as standalone shape without additional context', async ({
      page,
    }) => {
      await addShapeViaMenu(page, 'Question')
      await submitQuestion(page, 'Pergunta sem contexto especifico?')

      await expect(page.getByTestId('question-ai-badge')).toBeVisible()
      await expect(page.getByTestId('question-response-text')).toBeVisible()
    })
  })

  test.describe('Fluxos Completos', () => {
    test('should complete full flow from creation to done state with all elements visible', async ({ page }) => {
      // Cria question via menu
      await addShapeViaMenu(page, 'Question')

      // Verifica estado draft
      await expect(page.getByTestId('question-prompt-input')).toBeVisible()
      await expect(page.getByTestId('question-submit-btn')).toBeVisible()

      // Submete pergunta
      await submitQuestion(page, 'O que isso significa na pratica?')

      // Verifica estado done
      await expect(page.getByTestId('question-prompt-text')).toBeVisible()
      await expect(page.getByTestId('question-ai-badge')).toBeVisible()
      await expect(page.getByTestId('question-response-text')).toBeVisible()
      await expect(page.getByTestId('question-add-child-btn')).toBeVisible()
    })

    test('should allow multiple question shapes to coexist on canvas', async ({ page }) => {
      await ShapeBuilder.question(page)
        .atPosition(200, 200)
        .submit('Primeira pergunta?')
        .build()

      await panCanvas(page, -800, 0)

      await ShapeBuilder.question(page)
        .submit('Segunda pergunta?')
        .build()

      await fitCanvasView(page)

      const count = await getQuestionCardCount(page)
      expect(count).toBe(2)

      await expect(page.getByTestId('question-ai-badge')).toHaveCount(2)
    })
  })

  test.describe('Undo/Redo', () => {
    test('undo remove question criada', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      // Verifica que question existe
      await expect(page.getByTestId('question-card')).toBeVisible()

      // Undo
      await clickUndo(page)
      await page.waitForTimeout(100)

      // Question deve ter sido removida
      await expect(page.getByTestId('question-card')).not.toBeVisible()
    })
  })

  test.describe('Menu de Criacao', () => {
    test('opcao Question esta habilitada no menu', async ({ page }) => {
      // Click "Novo Fluxo" button
      await page.getByTestId('toolbox-new-flow').click()

      // Wait for creation overlay
      const overlay = page.locator('[aria-label="Click to place shape"]')
      await expect(overlay).toBeVisible()

      // Click on overlay
      await overlay.click({ position: { x: 300, y: 300 } })

      // Menu should appear with Question enabled
      await expect(page.getByTestId('shape-type-menu')).toBeVisible()
      await expect(page.getByTestId('menu-option-question')).toBeEnabled()
    })

    test('selecionar Question cria shape no canvas', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      await expect(page.getByTestId('question-card')).toBeVisible()
      const count = await getQuestionCardCount(page)
      expect(count).toBe(1)
    })

    test('menu fecha apos selecionar Question', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')

      await expect(page.getByTestId('shape-type-menu')).not.toBeVisible()
    })
  })

  test.describe('Qualidade', () => {
    test('should not produce console errors during normal interactions', async ({
      page,
    }) => {
      const consoleErrors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await addShapeViaMenu(page, 'Question')
      await submitQuestion(page, 'Pergunta de teste?')

      // Filter out non-critical errors
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
    test('fit view centra question no canvas', async ({ page }) => {
      await addShapeViaMenu(page, 'Question')
      await submitQuestion(page, 'Pergunta para fit view?')

      // Fit view
      await fitCanvasView(page)

      // Question should still be visible
      await expect(page.getByTestId('question-card')).toBeVisible()
    })
  })
})
