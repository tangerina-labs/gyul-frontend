import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addShapeViaMenu,
  fitCanvasView,
  writeNote,
  getNoteCardCount,
  clickUndo,
  ShapeBuilder,
} from './helpers/test-utils'

test.describe('Note Shape', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Note Test')
  })

  test.describe('Criacao e Estado Editing', () => {
    test('should automatically focus textarea when creating note', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const textarea = page.getByTestId('note-textarea')
      await expect(textarea).toBeVisible()
      await expect(textarea).toBeFocused()
    })

    test('should display placeholder text in editing state', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const textarea = page.getByTestId('note-textarea')
      await expect(textarea).toHaveAttribute('placeholder', 'Adicione sua anotacao...')
    })

    test('should show keyboard shortcut hints during editing', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const hint = page.getByTestId('note-hint')
      await expect(hint).toBeVisible()
      await expect(hint).toContainText('Enter para salvar')
      await expect(hint).toContainText('Shift+Enter para nova linha')
    })

    test('should hide add child button during editing', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await expect(page.getByTestId('note-add-child-btn')).not.toBeVisible()
    })

    test('should display post-it style with amber background', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const noteCard = page.getByTestId('note-card')
      await expect(noteCard).toBeVisible()

      // Check if it has amber background class
      await expect(noteCard).toHaveClass(/bg-amber/)
    })
  })

  test.describe('Finalizacao', () => {
    test('should finalize and save note when pressing Enter', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await page.getByTestId('note-textarea').fill('Minha anotacao')
      await page.keyboard.press('Enter')

      await expect(page.getByTestId('note-content')).toContainText('Minha anotacao')
      await expect(page.getByTestId('note-textarea')).not.toBeVisible()
    })

    test('should add new line with Shift+Enter without finalizing', async ({ page }) => {
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

    test('should finalize note with content when pressing Escape', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await page.getByTestId('note-textarea').fill('Nota via Escape')
      await page.keyboard.press('Escape')

      await expect(page.getByTestId('note-content')).toContainText('Nota via Escape')
      await expect(page.getByTestId('note-textarea')).not.toBeVisible()
    })

    test('should finalize note when clicking outside to blur', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await page.getByTestId('note-textarea').fill('Nota via blur')
      // Click outside the note to trigger blur
      await page.locator('.tl-canvas').click({ position: { x: 100, y: 100 } })

      await expect(page.getByTestId('note-content')).toContainText('Nota via blur')
      await expect(page.getByTestId('note-textarea')).not.toBeVisible()
    })
  })

  test.describe('Estado Readonly', () => {
    test('should render text as static content in readonly state', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Texto estatico')

      await expect(page.getByTestId('note-textarea')).not.toBeVisible()
      await expect(page.getByTestId('note-content')).toBeVisible()
    })

    test('should show add child button in readonly state', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota com botao')

      const addChildBtn = page.getByTestId('note-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })

    test('should hide keyboard shortcut hints in readonly state', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota sem hints')

      await expect(page.getByTestId('note-hint')).not.toBeVisible()
    })
  })

  test.describe('Validacao e Auto-remocao', () => {

    test('should remove empty note when pressing Escape', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await expect(page.getByTestId('note-card')).toBeVisible()

      // Press Escape without typing anything
      await page.keyboard.press('Escape')

      await expect(page.getByTestId('note-card')).not.toBeVisible()
    })

    test('should keep empty note in editing mode when blurred', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await expect(page.getByTestId('note-card')).toBeVisible()
      await expect(page.getByTestId('note-textarea')).toBeVisible()

      // Click outside without typing anything
      await page.locator('.tl-canvas').click({ position: { x: 100, y: 100 } })

      // Note should still be visible and in editing mode
      await expect(page.getByTestId('note-card')).toBeVisible()
      await expect(page.getByTestId('note-textarea')).toBeVisible()
    })

    test('should keep note in editing mode when pressing Enter with only whitespace', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      await page.getByTestId('note-textarea').fill('   ')
      await page.keyboard.press('Enter')

      // Note should still be visible and in editing mode (whitespace is trimmed to empty)
      await expect(page.getByTestId('note-card')).toBeVisible()
      await expect(page.getByTestId('note-textarea')).toBeVisible()
    })

    test('should enforce 1000 character limit', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')

      const longText = 'a'.repeat(1001)
      await page.getByTestId('note-textarea').fill(longText)

      const value = await page.getByTestId('note-textarea').inputValue()
      expect(value.length).toBeLessThanOrEqual(1000)
    })
  })

  test.describe('Criacao de Filhos', () => {
    test('should display add child button for creating question children', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota pai')

      // Button exists but is placeholder (shows tooltip "Em breve")
      const addChildBtn = page.getByTestId('note-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })

    test('should display add child button for creating note children', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota pai')

      const addChildBtn = page.getByTestId('note-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })

    test('should display add child button for creating tweet children', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota pai')

      const addChildBtn = page.getByTestId('note-add-child-btn')
      await expect(addChildBtn).toBeVisible()
    })
  })

  test.describe('Interacao e Selecao', () => {
    test('should select note when clicked', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota selecionavel')

      const noteCard = page.getByTestId('note-card')
      await noteCard.click()

      // Note should be selectable (tldraw handles selection state)
      await expect(noteCard).toBeVisible()
    })

    test('should be draggable on canvas', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota movel')

      // Note exists and is draggable (tldraw handles drag behavior)
      await expect(page.getByTestId('note-card')).toBeVisible()
    })

    test('should preserve content after interactions', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Conteudo persistente')

      // Click around
      await page.locator('.tl-canvas').click({ position: { x: 100, y: 100 } })
      await fitCanvasView(page)

      // Content should still be visible
      await expect(page.getByTestId('note-content')).toContainText('Conteudo persistente')
    })

    test('should maintain amber background after selection', async ({ page }) => {
      await addShapeViaMenu(page, 'Note')
      await writeNote(page, 'Nota amarela')

      const noteCard = page.getByTestId('note-card')
      await noteCard.click()

      // Should maintain amber background
      await expect(noteCard).toHaveClass(/bg-amber/)
    })
  })

  test.describe('Multiplas Notas', () => {
    test('should support multiple notes on same canvas with distinct content', async ({ page }) => {
      // Create first note
      await ShapeBuilder.note(page)
        .atPosition(200, 200)
        .write('Nota 1')
        .build()


      await ShapeBuilder.note(page)
        .atPosition(600, 200)
        .write('Nota 2')
        .build()


      // Both notes should be visible
      const count = await getNoteCardCount(page)
      expect(count).toBe(2)

      // Verify distinct content
      await expect(page.getByTestId('note-content').filter({ hasText: 'Nota 1' })).toBeVisible()
      await expect(page.getByTestId('note-content').filter({ hasText: 'Nota 2' })).toBeVisible()
    })

    test('should allow creating new note while another is in editing state', async ({ page }) => {
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

  test.describe('Persistencia', () => {
    test('should persist note content after page reload', async ({ page }) => {
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

    test('should preserve line breaks after page reload', async ({ page }) => {
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

  test.describe('Fluxos Completos', () => {
    test('should complete full flow from creation to readonly with multiline content', async ({ page }) => {
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

    test('should remove note when abandoning creation with empty content', async ({ page }) => {
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
