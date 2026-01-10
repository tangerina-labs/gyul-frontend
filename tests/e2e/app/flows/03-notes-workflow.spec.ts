import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addNodeViaClick,
  writeNote,
  submitQuestion,
  fitCanvasView
} from '../helpers/test-utils'

test.describe('Workflow de Anotacoes', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Minhas Anotacoes')
  })

  test('usuario cria nota e faz pergunta relacionada', async ({ page }) => {
    await addNodeViaClick(page, 'Note')

    await expect(page.getByPlaceholder(/anotacao/i)).toBeVisible()

    await page.getByPlaceholder(/anotacao/i).fill('Ideias sobre produtividade e foco')

    await expect(page.getByText('Enter para salvar')).toBeVisible()

    await page.keyboard.press('Enter')

    await expect(page.getByText('Ideias sobre produtividade')).toBeVisible()
    await expect(page.getByPlaceholder(/anotacao/i)).not.toBeVisible()

    await page.getByTestId('note-add-child-btn').click({ force: true })
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)

    await page.getByPlaceholder(/pergunta/i).fill('Como posso aplicar isso no dia a dia?')
    await page.getByRole('button', { name: 'Submeter' }).click()

    await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })
  })

  test('nota finaliza ao perder foco (blur)', async ({ page }) => {
    await addNodeViaClick(page, 'Note')

    await page.getByPlaceholder(/anotacao/i).fill('Nota via blur')

    await page.getByRole('button', { name: 'Voltar' }).click({ force: true })
  })

  test('nota finaliza com Enter', async ({ page }) => {
    await addNodeViaClick(page, 'Note')
    await page.getByPlaceholder(/anotacao/i).fill('Nota finalizada com Enter')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Nota finalizada com Enter')).toBeVisible()
    await expect(page.getByPlaceholder(/anotacao/i)).not.toBeVisible()
  })

  test('Shift+Enter adiciona nova linha', async ({ page }) => {
    await addNodeViaClick(page, 'Note')

    await page.getByPlaceholder(/anotacao/i).fill('Linha 1')
    await page.keyboard.press('Shift+Enter')
    await page.keyboard.type('Linha 2')

    // Textarea should still be active (not finalized)
    await expect(page.getByPlaceholder(/anotacao/i)).toBeVisible()

    await page.keyboard.press('Enter')

    await expect(page.getByText('Linha 1')).toBeVisible()
    await expect(page.getByText('Linha 2')).toBeVisible()
  })

  test('nota vazia nao e salva ao finalizar', async ({ page }) => {
    await addNodeViaClick(page, 'Note')

    const textarea = page.getByPlaceholder(/anotacao/i)
    await textarea.focus()

    await page.keyboard.press('Enter')

    await expect(page.getByTestId('canvas-empty-hint')).toBeVisible({ timeout: 5000 })
  })

  test('nota com espacos apenas nao e salva', async ({ page }) => {
    await addNodeViaClick(page, 'Note')

    await page.getByPlaceholder(/anotacao/i).fill('   ')
    await page.keyboard.press('Enter')

    await expect(page.getByTestId('canvas-empty-hint')).toBeVisible()
  })

  test('multiplas notas podem existir no mesmo canvas', async ({ page }) => {
    await addNodeViaClick(page, 'Note', { x: 150, y: 150 })
    await page.getByPlaceholder(/anotacao/i).fill('Nota 1')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Nota 1')).toBeVisible()
    await expect(page.getByPlaceholder(/anotacao/i)).not.toBeVisible()

    // Position far enough from first (notes are ~300px wide)
    await addNodeViaClick(page, 'Note', { x: 550, y: 150 })
    await page.getByPlaceholder(/anotacao/i).fill('Nota 2')
    await page.keyboard.press('Enter')

    await expect(page.getByText('Nota 1')).toBeVisible()
    await expect(page.getByText('Nota 2')).toBeVisible()
  })

  test('escape finaliza nota', async ({ page }) => {
    await addNodeViaClick(page, 'Note')
    await page.getByPlaceholder(/anotacao/i).fill('Nota via Escape')
    await page.keyboard.press('Escape')

    await expect(page.getByText('Nota via Escape')).toBeVisible()
    await expect(page.getByPlaceholder(/anotacao/i)).not.toBeVisible()
  })
})
