import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addNodeViaClick,
  writeNote,
  fitCanvasView,
  expectCanvasEmpty
} from '../helpers/test-utils'

test.describe('Delecao de Nos', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Teste de Delecao')
  })

  test.describe('Botao de Delete - Estilo Visual', () => {
    test('botao de delete aparece ao selecionar no', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Nota para deletar')

      await page.getByText('Nota para deletar').click()

      const deleteBtn = page.getByTestId('note-delete-btn')
      await expect(deleteBtn).toBeVisible()
    })

    test('botao de delete tem icone de lixeira (nao X)', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Nota com lixeira')

      await page.getByText('Nota com lixeira').click()

      const deleteBtn = page.getByTestId('note-delete-btn')
      const svg = deleteBtn.locator('svg')
      await expect(svg).toBeVisible()

      const paths = svg.locator('path')
      await expect(paths).toHaveCount(5)
    })

    test('botao de delete mostra hover state com vermelho suave', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Nota hover test')

      await page.getByText('Nota hover test').click()

      const deleteBtn = page.getByTestId('note-delete-btn')

      await deleteBtn.hover()

      await expect(deleteBtn).toBeEnabled()
    })
  })

  test.describe('Delecao de Nos Folha (sem filhos)', () => {
    test('deletar nota folha remove o no', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Nota a ser deletada')

      await page.getByText('Nota a ser deletada').click()
      await page.getByTestId('note-delete-btn').click()

      await expectCanvasEmpty(page)
    })

    test('deletar tweet folha remove o no', async ({ page }) => {
      await addNodeViaClick(page, 'Tweet')

      await page.getByTestId('tweet-card').click()
      await page.getByTestId('tweet-delete-btn').click()

      await expectCanvasEmpty(page)
    })

    test('deletar question folha remove o no', async ({ page }) => {
      await addNodeViaClick(page, 'Question')

      await page.getByTestId('question-card').click()
      await page.getByTestId('question-delete-btn').click()

      await expectCanvasEmpty(page)
    })
  })

  test.describe('Estado Disabled para Nos com Filhos', () => {
    test('no pai tem botao de delete desabilitado', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Nota pai')

      await fitCanvasView(page)
      await page.getByTestId('note-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Nota filha')

      await page.getByText('Nota pai').click()

      const deleteBtn = page.getByTestId('note-delete-btn')
      await expect(deleteBtn).toBeVisible()
      await expect(deleteBtn).toBeDisabled()
    })

    test('botao desabilitado tem opacidade reduzida (Quiet UI)', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Pai com opacidade')

      await page.getByTestId('note-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho')

      await page.getByText('Pai com opacidade').click()

      const deleteBtn = page.getByTestId('note-delete-btn')

      await expect(deleteBtn).toHaveAttribute('aria-disabled', 'true')
      await expect(deleteBtn).toBeVisible()
    })

    test('botao desabilitado mostra tooltip explicativo', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Pai com tooltip')

      await page.getByTestId('note-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho tooltip')

      await page.getByText('Pai com tooltip').click()

      const deleteBtn = page.getByTestId('note-delete-btn')

      await expect(deleteBtn).toHaveAttribute('title', /filhos.*nao pode ser deletado/i)
    })

    test('clicar em botao desabilitado nao remove o no', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Pai protegido')

      await fitCanvasView(page)
      await page.getByTestId('note-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho protetor')

      await page.getByText('Pai protegido').click()
      await page.getByTestId('note-delete-btn').click({ force: true })

      await expect(page.getByText('Pai protegido')).toBeVisible()
      await expect(page.getByText('Filho protetor')).toBeVisible()
    })
  })

  test.describe('Delecao em Cadeia', () => {
    test('apos deletar filho, pai pode ser deletado', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Pai liberavel')

      await page.getByTestId('note-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho a remover')

      await page.getByText('Filho a remover').click()
      await page.getByTestId('note-delete-btn').click()

      await expect(page.getByText('Filho a remover')).not.toBeVisible()

      await page.getByText('Pai liberavel').click()
      const deleteBtn = page.getByTestId('note-delete-btn')
      await expect(deleteBtn).toBeEnabled()

      await deleteBtn.click()

      await expectCanvasEmpty(page)
    })

    test('no com multiplos filhos permanece protegido', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Pai multi')

      await fitCanvasView(page)
      await page.getByTestId('note-add-child-btn').first().click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho 1')

      await page.getByText('Pai multi').click()
      await page.getByTestId('note-add-child-btn').first().click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho 2')

      await page.getByText('Filho 1').click()
      await page.getByTestId('note-delete-btn').click()

      await page.getByText('Pai multi').click()
      await expect(page.getByTestId('note-delete-btn')).toBeDisabled()

      await page.getByText('Filho 2').click()
      await page.getByTestId('note-delete-btn').click()

      await page.getByText('Pai multi').click()
      await expect(page.getByTestId('note-delete-btn')).toBeEnabled()
    })
  })

  test.describe('Delecao via Teclado (Delete Key)', () => {
    test('tecla Delete remove no folha selecionado', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Nota para deletar via tecla')

      await page.getByText('Nota para deletar via tecla').click()
      await page.keyboard.press('Delete')

      await expectCanvasEmpty(page)
    })

    test('tecla Delete NAO remove no pai com filhos', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Pai protegido teclado')

      await fitCanvasView(page)
      await page.getByTestId('note-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho protetor teclado')

      await page.getByText('Pai protegido teclado').click()
      await page.keyboard.press('Delete')

      await expect(page.getByText('Pai protegido teclado')).toBeVisible()
      await expect(page.getByText('Filho protetor teclado')).toBeVisible()
    })

    test('tecla Backspace NAO remove no pai com filhos', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Pai protegido backspace')

      await fitCanvasView(page)
      await page.getByTestId('note-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho protetor backspace')

      await page.getByText('Pai protegido backspace').click()
      await page.keyboard.press('Backspace')

      await expect(page.getByText('Pai protegido backspace')).toBeVisible()
      await expect(page.getByText('Filho protetor backspace')).toBeVisible()
    })

    test('apos deletar filho via teclado, pai pode ser deletado via teclado', async ({ page }) => {
      await addNodeViaClick(page, 'Note')
      await writeNote(page, 'Pai cadeia teclado')

      await page.getByTestId('note-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Filho a remover teclado')

      await page.getByText('Filho a remover teclado').click()
      await page.keyboard.press('Delete')

      await expect(page.getByText('Filho a remover teclado')).not.toBeVisible()

      await page.getByText('Pai cadeia teclado').click()
      await page.keyboard.press('Delete')

      await expectCanvasEmpty(page)
    })
  })

  test.describe('Diferentes Tipos de Nos', () => {
    test('tweet pai com question filho tem delete desabilitado', async ({ page }) => {
      await addNodeViaClick(page, 'Tweet')

      await page.getByTestId('tweet-card').click()
    })

    test('question pai com note filho tem delete desabilitado', async ({ page }) => {
      await addNodeViaClick(page, 'Question')

      await page.getByPlaceholder(/pergunta/i).fill('Pergunta pai')
      await page.getByRole('button', { name: 'Submeter' }).click()

      await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })
      await fitCanvasView(page)

      await page.getByTestId('question-add-child-btn').click({ force: true })
      await page.getByRole('menuitem', { name: /Note/i }).click()
      await fitCanvasView(page)
      await writeNote(page, 'Nota filha de question')

      await page.getByText('Pergunta pai', { exact: true }).click()

      await expect(page.getByTestId('question-delete-btn')).toBeDisabled()
    })
  })
})
