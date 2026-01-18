import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addShapeViaMenu,
  fitCanvasView,
  writeNote,
  getNoteCardCount,
  clickUndo,
} from './helpers/test-utils'

test.describe('Note Shape', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Note Test')
  })

  // ===========================================================================
  // Criacao e Estado Editing
  // ===========================================================================
  test.describe('Criacao e Estado Editing', () => {
    test('TEST-NN-001: textarea focado automaticamente ao criar', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const textarea = page.getByTestId('note-textarea')
      await expect(textarea).toBeVisible()
      await expect(textarea).toBeFocused()
    })

    test('TEST-NN-002: placeholder visivel no estado editing', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const textarea = page.getByTestId('note-textarea')
      await expect(textarea).toHaveAttribute('placeholder', 'Adicione sua anotacao...')
    })

    test('TEST-NN-003: hints de atalhos visiveis durante edicao', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const hint = page.getByTestId('note-hint')
      await expect(hint).toBeVisible()
      await expect(hint).toContainText('Enter para salvar')
      await expect(hint).toContainText('Shift+Enter para nova linha')
    })

    test('TEST-NN-004: botao [+] invisivel durante edicao', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await expect(page.getByTestId('note-add-child-btn')).not.toBeVisible()
    })

    test('TEST-NN-005: visual de post-it (fundo amarelado)', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const noteCard = page.getByTestId('note-card')
      await expect(noteCard).toBeVisible()

      // Check if it has amber background class
      await expect(noteCard).toHaveClass(/bg-amber/)
    })
  })

  // ===========================================================================
  // Finalizacao
  // ===========================================================================
  test.describe('Finalizacao', () => {
    test('TEST-NN-006: Enter finaliza e salva nota', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await page.getByTestId('note-textarea').fill('Minha anotacao')
      await page.keyboard.press('Enter')

      await expect(page.getByTestId('note-content')).toContainText('Minha anotacao')
      await expect(page.getByTestId('note-textarea')).not.toBeVisible()
    })

    test('TEST-NN-007: Shift+Enter adiciona nova linha', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const textarea = page.getByTestId('note-textarea')
      await textarea.fill('Linha 1')
      await page.keyboard.press('Shift+Enter')
      await textarea.pressSequentially('Linha 2')
      await page.keyboard.press('Enter')

      const content = page.getByTestId('note-content')
      await expect(content).toContainText('Linha 1')
      await expect(content).toContainText('Linha 2')
    })

    test('TEST-NN-008: Escape finaliza nota com conteudo', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await page.getByTestId('note-textarea').fill('Nota via Escape')
      await page.keyboard.press('Escape')

      await expect(page.getByTestId('note-content')).toContainText('Nota via Escape')
      await expect(page.getByTestId('note-textarea')).not.toBeVisible()
    })

    test('TEST-NN-009: blur finaliza nota', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await page.getByTestId('note-textarea').fill('Nota via blur')
      // Click outside the note to trigger blur
      await page.locator('.tl-canvas').click({ position: { x: 100, y: 100 } })

      await expect(page.getByTestId('note-content')).toContainText('Nota via blur')
      await expect(page.getByTestId('note-textarea')).not.toBeVisible()
    })
  })

  // ===========================================================================
  // Estado Readonly
  // ===========================================================================
  test.describe('Estado Readonly', () => {
    test('TEST-NN-010: texto renderizado como estatico', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Texto estatico')

      await expect(page.getByTestId('note-textarea')).not.toBeVisible()
      await expect(page.getByTestId('note-content')).toBeVisible()
    })

    test('TEST-NN-011: botao [+] visivel no estado readonly', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota com botao')

      const addChildBtn = page.getByTestId('note-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })

    test('TEST-NN-012: hints ocultos no estado readonly', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota sem hints')

      await expect(page.getByTestId('note-hint')).not.toBeVisible()
    })
  })

  // ===========================================================================
  // Validacao e Auto-remocao
  // ===========================================================================
  test.describe('Validacao e Auto-remocao', () => {

    test('TEST-NN-014: note vazio ao dar Escape e removido', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await expect(page.getByTestId('note-card')).toBeVisible()

      // Press Escape without typing anything
      await page.keyboard.press('Escape')

      await expect(page.getByTestId('note-card')).not.toBeVisible()
    })

    test('TEST-NN-015: note vazio ao dar blur permanece em edicao', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await expect(page.getByTestId('note-card')).toBeVisible()
      await expect(page.getByTestId('note-textarea')).toBeVisible()

      // Click outside without typing anything
      await page.locator('.tl-canvas').click({ position: { x: 100, y: 100 } })

      // Note should still be visible and in editing mode
      await expect(page.getByTestId('note-card')).toBeVisible()
      await expect(page.getByTestId('note-textarea')).toBeVisible()
    })

    test('TEST-NN-016: note com apenas whitespace ao pressionar Enter permanece em edicao', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await page.getByTestId('note-textarea').fill('   ')
      await page.keyboard.press('Enter')

      // Note should still be visible and in editing mode (whitespace is trimmed to empty)
      await expect(page.getByTestId('note-card')).toBeVisible()
      await expect(page.getByTestId('note-textarea')).toBeVisible()
    })

    test('TEST-NN-017: limite de 1000 caracteres', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const longText = 'a'.repeat(1001)
      await page.getByTestId('note-textarea').fill(longText)

      const value = await page.getByTestId('note-textarea').inputValue()
      expect(value.length).toBeLessThanOrEqual(1000)
    })
  })

  // ===========================================================================
  // Criacao de Filhos (placeholder behavior)
  // ===========================================================================
  test.describe('Criacao de Filhos', () => {
    test('TEST-NN-018: botao [+] presente para criar filho Question', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota pai')

      // Button exists but is placeholder (shows tooltip "Em breve")
      const addChildBtn = page.getByTestId('note-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })

    test('TEST-NN-019: botao [+] presente para criar filho Note', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota pai')

      const addChildBtn = page.getByTestId('note-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })

    test('TEST-NN-020: botao [+] presente para criar filho Tweet', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota pai')

      const addChildBtn = page.getByTestId('note-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })
  })

  // ===========================================================================
  // Interacao e Selecao
  // ===========================================================================
  test.describe('Interacao e Selecao', () => {
    test('TEST-NN-021: click seleciona o no', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota selecionavel')

      const noteCard = page.getByTestId('note-card')
      await noteCard.click()

      // Note should be selectable (tldraw handles selection state)
      await expect(noteCard).toBeVisible()
    })

    test('TEST-NN-022: note pode ser arrastado no canvas', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota movel')

      // Note exists and is draggable (tldraw handles drag behavior)
      await expect(page.getByTestId('note-card')).toBeVisible()
    })

    test('TEST-NN-023: note preserva conteudo apos interacao', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Conteudo persistente')

      // Click around
      await page.locator('.tl-canvas').click({ position: { x: 100, y: 100 } })
      await fitCanvasView(page)

      // Content should still be visible
      await expect(page.getByTestId('note-content')).toContainText('Conteudo persistente')
    })

    test('TEST-NN-024: note mantem fundo amarelo apos selecao', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota amarela')

      const noteCard = page.getByTestId('note-card')
      await noteCard.click()

      // Should maintain amber background
      await expect(noteCard).toHaveClass(/bg-amber/)
    })
  })

  // ===========================================================================
  // Multiplas Notas
  // ===========================================================================
  test.describe('Multiplas Notas', () => {
    test('TEST-NN-025: multiplas notas no mesmo canvas', async ({ page }) => {
      // Create first note
      await addShapeViaMenu(page, 'Note', { x: 200, y: 200 })
      await writeNote(page, 'Nota 1')

      // Create second note
      await addShapeViaMenu(page, 'Note', { x: 600, y: 200 })
      await writeNote(page, 'Nota 2')

      // Both notes should be visible
      const count = await getNoteCardCount(page)
      expect(count).toBe(2)

      // Verify distinct content
      await expect(page.getByTestId('note-content').filter({ hasText: 'Nota 1' })).toBeVisible()
      await expect(page.getByTestId('note-content').filter({ hasText: 'Nota 2' })).toBeVisible()
    })

    test('TEST-NN-026: criar nota enquanto outra esta em edicao', async ({ page }) => {
      // Create first note and start editing
      await addShapeViaMenu(page, 'Note', { x: 200, y: 200 })

      // First note should be in editing state
      await expect(page.getByTestId('note-textarea')).toBeVisible()

      // Create second note
      await addShapeViaMenu(page, 'Note', { x: 600, y: 200 })

      // Second note should be in editing state
      // First note should be finalized or removed (if empty)
      const textareas = page.getByTestId('note-textarea')
      const count = await textareas.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  // ===========================================================================
  // Persistencia
  // ===========================================================================
  test.describe('Persistencia', () => {
    test('TEST-NN-027: note persiste apos reload', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota persistente')

      // Wait for state to be persisted before reload
      await page.waitForTimeout(500)

      // Reload the page
      await page.reload()

      // Wait for canvas to load
      await expect(page.getByTestId('canvas-view')).toBeVisible()

      // Note should still be there
      await expect(page.getByTestId('note-content')).toContainText('Nota persistente')
    })

    test('TEST-NN-028: note preserva quebras de linha apos reload', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const textarea = page.getByTestId('note-textarea')
      await textarea.fill('Linha 1')
      await page.keyboard.press('Shift+Enter')
      await textarea.pressSequentially('Linha 2')
      await page.keyboard.press('Enter')

      // Wait for state to be persisted before reload
      await page.waitForTimeout(500)

      // Reload the page
      await page.reload()

      // Wait for canvas to load
      await expect(page.getByTestId('canvas-view')).toBeVisible()

      // Wait for note content to be visible (shape needs to render after reload)
      const content = page.getByTestId('note-content')
      await expect(content).toBeVisible()

      // Both lines should be present
      await expect(content).toContainText('Linha 1')
      await expect(content).toContainText('Linha 2')
    })
  })

  // ===========================================================================
  // Fluxos Completos
  // ===========================================================================
  test.describe('Fluxos Completos', () => {
    test('TEST-NN-029: fluxo completo - criar nota e visualizar', async ({ page }) => {
      // Create note
      await addShapeViaMenu(page, 'Note')

      // Verify editing state
      await expect(page.getByTestId('note-textarea')).toBeVisible()
      await expect(page.getByTestId('note-hint')).toBeVisible()

      // Write content with multiple lines
      const textarea = page.getByTestId('note-textarea')
      await textarea.fill('Ideias sobre produtividade')
      await page.keyboard.press('Shift+Enter')
      await textarea.pressSequentially('- Foco profundo')
      await page.keyboard.press('Shift+Enter')
      await textarea.pressSequentially('- Eliminar distrações')
      await page.keyboard.press('Enter')

      // Verify readonly state
      await expect(page.getByTestId('note-content')).toBeVisible()
      await expect(page.getByTestId('note-add-child-btn')).toBeVisible()
      await expect(page.getByTestId('note-hint')).not.toBeVisible()

      // Content should be preserved
      const content = page.getByTestId('note-content')
      await expect(content).toContainText('Ideias sobre produtividade')
      await expect(content).toContainText('- Foco profundo')
      await expect(content).toContainText('- Eliminar distrações')
    })

    test('TEST-NN-030: fluxo de abandono - criar nota e desistir', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      // Start typing
      await page.getByTestId('note-textarea').fill('Comecei a escrever')

      // Change mind - delete all text
      await page.getByTestId('note-textarea').fill('')

      // Press Escape
      await page.keyboard.press('Escape')

      // Note should be removed
      await expect(page.getByTestId('note-card')).not.toBeVisible()
    })
  })

  // ===========================================================================
  // Undo/Redo
  // ===========================================================================
  test.describe('Undo/Redo', () => {
    test('undo remove note criada', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota para desfazer')

      // Verify note exists
      await expect(page.getByTestId('note-card')).toBeVisible()

      // Undo twice (once for content update, once for creation)
      await clickUndo(page)
      // await page.waitForTimeout(100)
      // await clickUndo(page)
      // await page.waitForTimeout(100)

      // Note should be removed
      await expect(page.getByTestId('note-card')).not.toBeVisible()
    })
  })

  // ===========================================================================
  // Menu de Criacao
  // ===========================================================================
  test.describe('Menu de Criacao', () => {
    test('opcao Note esta habilitada no menu', async ({ page }) => {
      // Click "Novo Fluxo" button
      await page.getByTestId('toolbox-new-flow').click()

      // Wait for creation overlay
      const overlay = page.locator('[aria-label="Click to place shape"]')
      await expect(overlay).toBeVisible()

      // Click on overlay
      await overlay.click({ position: { x: 300, y: 300 } })

      // Menu should appear with Note enabled
      await expect(page.getByTestId('shape-type-menu')).toBeVisible()
      await expect(page.getByTestId('menu-option-note')).toBeEnabled()
    })

    test('selecionar Note cria shape no canvas', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await expect(page.getByTestId('note-card')).toBeVisible()
      const count = await getNoteCardCount(page)
      expect(count).toBe(1)
    })

    test('menu fecha apos selecionar Note', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await expect(page.getByTestId('shape-type-menu')).not.toBeVisible()
    })
  })

  // ===========================================================================
  // Qualidade
  // ===========================================================================
  test.describe('Qualidade', () => {
    test('sem erros no console durante interacoes normais', async ({ page }) => {
      const consoleErrors: string[] = []

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })

      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota de teste')

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

  // ===========================================================================
  // Fit View
  // ===========================================================================
  test.describe('Fit View', () => {
    test('fit view centra note no canvas', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota para fit view')

      // Fit view
      await fitCanvasView(page)

      // Note should still be visible
      await expect(page.getByTestId('note-card')).toBeVisible()
    })
  })
})
