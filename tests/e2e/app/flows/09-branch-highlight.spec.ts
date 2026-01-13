import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addNodeViaClick,
  addChildNode,
  loadTweet,
  submitQuestion,
  writeNote,
  fitCanvasView
} from '../helpers/test-utils'

test.describe('Branch Highlight', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
    await createCanvasViaUI(page, 'Branch Highlight Test')
  })

  test('clicar em no destaca a branch (ancestrais + descendentes) e aplica fade nos demais', async ({ page }) => {
    //       Tweet
    //      /     \
    //  Question  Note2 (sibling branch)
    //     |
    //   Note1
    //
    // Click Question: highlight Tweet, Question, Note1 / fade Note2

    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/123')

    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)
    await submitQuestion(page, 'O que isso significa?')

    await page.getByRole('button', { name: /adicionar/i }).last().click()
    await page.getByRole('menuitem', { name: /Note/i }).click()
    await fitCanvasView(page)
    await writeNote(page, 'Nota filha da Question')

    await page.getByTestId('tweet-card').click()
    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Note/i }).click()
    await fitCanvasView(page)
    await writeNote(page, 'Nota irma - fora da branch')

    await page.getByTestId('question-card').click()

    const highlightedEdges = page.locator('.vue-flow__edge.edge-highlighted')
    await expect(highlightedEdges).toHaveCount(2)

    const edgePath = highlightedEdges.first().locator('.vue-flow__edge-path')
    await expect(edgePath).toHaveCSS('stroke', 'rgb(20, 184, 166)')

    const fadedEdges = page.locator('.vue-flow__edge.edge-faded')
    await expect(fadedEdges).toHaveCount(1)

    const fadedNodes = page.locator('.vue-flow__node.node-faded')
    await expect(fadedNodes).toHaveCount(1)
  })

  test('nos fora da branch ficam com fade (quando no selecionado NAO e root)', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet', { x: 200, y: 200 })
    await loadTweet(page, 'https://twitter.com/user/status/111')

    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)
    await submitQuestion(page, 'Pergunta para teste')

    await addNodeViaClick(page, 'Note', { x: 500, y: 200 })
    await writeNote(page, 'Nota isolada')

    await page.getByTestId('question-card').click()

    const fadedNodes = page.locator('.vue-flow__node.node-faded')
    await expect(fadedNodes).toHaveCount(1)
  })

  test('clicar no mesmo no desativa highlight (toggle)', async ({ page }) => {
    await addNodeViaClick(page, 'Note')
    await writeNote(page, 'Nota para toggle')

    await page.getByTestId('note-card').click()

    const selectedNode = page.locator('.vue-flow__node.selected')
    await expect(selectedNode).toBeVisible()

    await page.locator('.vue-flow__pane').click({ position: { x: 50, y: 50 } })

    const fadedNodes = page.locator('.vue-flow__node.node-faded')
    await expect(fadedNodes).toHaveCount(0)
  })

  test('clicar em outro no muda highlight para nova branch', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet', { x: 200, y: 200 })
    await loadTweet(page, 'https://twitter.com/user/status/222')

    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)
    await submitQuestion(page, 'Primeira pergunta')

    await page.getByTestId('tweet-card').click()
    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Note/i }).click()
    await fitCanvasView(page)
    await writeNote(page, 'Nota irma')

    await page.getByTestId('question-card').click()

    let fadedNodes = page.locator('.vue-flow__node.node-faded')
    await expect(fadedNodes).toHaveCount(1)

    await page.getByTestId('note-card').click()

    fadedNodes = page.locator('.vue-flow__node.node-faded')
    await expect(fadedNodes).toHaveCount(1)
  })

  test('clicar no canvas vazio desativa highlight', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/333')

    await page.getByTestId('tweet-card').click()

    const selectedNode = page.locator('.vue-flow__node.selected')
    await expect(selectedNode).toBeVisible()

    await page.locator('.vue-flow__pane').click({ position: { x: 50, y: 50 } })

    await expect(page.locator('.vue-flow__node.selected')).toHaveCount(0)
    await expect(page.locator('.vue-flow__node.node-faded')).toHaveCount(0)
  })

  test('edges fora da branch ficam com fade', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/444')

    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)
    await submitQuestion(page, 'Primeira pergunta')

    await page.getByTestId('tweet-card').click()
    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Note/i }).click()
    await fitCanvasView(page)
    await writeNote(page, 'Nota irmã')

    await page.getByTestId('question-card').click()

    const highlightedEdges = page.locator('.vue-flow__edge.edge-highlighted')
    await expect(highlightedEdges).toHaveCount(1)

    const fadedEdges = page.locator('.vue-flow__edge.edge-faded')
    await expect(fadedEdges).toHaveCount(1)
  })

  test('highlight bidirecional mostra ancestrais e descendentes', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/555')

    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)
    await submitQuestion(page, 'Pergunta do meio')

    await page.getByRole('button', { name: /adicionar/i }).last().click()
    await page.getByRole('menuitem', { name: /Note/i }).click()
    await fitCanvasView(page)
    await writeNote(page, 'Nota final')

    await page.getByTestId('question-card').click()

    const highlightedEdges = page.locator('.vue-flow__edge.edge-highlighted')
    await expect(highlightedEdges).toHaveCount(2)

    const fadedNodes = page.locator('.vue-flow__node.node-faded')
    await expect(fadedNodes).toHaveCount(0)
  })

  test('clicar em no root NAO ativa highlight', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet', { x: 200, y: 200 })
    await loadTweet(page, 'https://twitter.com/user/status/666')

    await addNodeViaClick(page, 'Note', { x: 500, y: 200 })
    await writeNote(page, 'Nota separada')

    await page.getByTestId('tweet-card').click()

    const highlightedEdges = page.locator('.vue-flow__edge.edge-highlighted')
    await expect(highlightedEdges).toHaveCount(0)

    const fadedNodes = page.locator('.vue-flow__node.node-faded')
    await expect(fadedNodes).toHaveCount(0)
  })

  test('clicar em no filho de root ATIVA highlight normalmente', async ({ page }) => {
    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://twitter.com/user/status/777')

    await page.getByRole('button', { name: /adicionar/i }).first().click()
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)
    await submitQuestion(page, 'Pergunta filha')

    await addNodeViaClick(page, 'Note', { x: 500, y: 200 })
    await writeNote(page, 'Nota separada')

    await page.getByTestId('question-card').click()

    const highlightedEdges = page.locator('.vue-flow__edge.edge-highlighted')
    await expect(highlightedEdges).toHaveCount(1)

    const fadedNodes = page.locator('.vue-flow__node.node-faded')
    await expect(fadedNodes).toHaveCount(1)
  })
})
