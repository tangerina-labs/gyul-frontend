import { test, expect } from '@playwright/test'
import {
  startFresh,
  createCanvasViaUI,
  addNodeViaClick,
  loadTweet,
  writeNote,
  goBackToList,
  expectCanvasInList,
  fitCanvasView
} from '../helpers/test-utils'

test.describe('Persistencia de Dados', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page)
  })

  test('dados sobrevivem reload da pagina', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Persistente')

    await addNodeViaClick(page, 'Note')
    await writeNote(page, 'Conteudo importante que deve persistir')

    await expect(page.getByText('Conteudo importante')).toBeVisible()

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('Conteudo importante')).toBeVisible()

    await goBackToList(page)
    await page.reload()
    await page.waitForLoadState('networkidle')

    await expectCanvasInList(page, 'Canvas Persistente')

    await page.getByText('Canvas Persistente').click()
    await expect(page.getByText('Conteudo importante')).toBeVisible()
  })

  test('tweet carregado persiste apos reload', async ({ page }) => {
    await createCanvasViaUI(page, 'Tweet Persistente')

    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://x.com/user/status/123')

    await expect(page.getByTestId('tweet-author-handle')).toBeVisible()

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
  })

  test('pergunta e resposta persistem apos reload', async ({ page }) => {
    await createCanvasViaUI(page, 'Pergunta Persistente')

    await addNodeViaClick(page, 'Question')
    await page.getByPlaceholder(/pergunta/i).fill('Pergunta que deve persistir?')
    await page.getByRole('button', { name: 'Submeter' }).click()

    await expect(page.getByTestId('question-ai-badge')).toBeVisible({ timeout: 10000 })

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('question-prompt-text')).toContainText('Pergunta que deve persistir')
    await expect(page.getByTestId('question-ai-badge')).toBeVisible()
  })

  test('edges persistem apos reload', async ({ page }) => {
    await createCanvasViaUI(page, 'Edges Persistentes')

    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://x.com/user/status/123')

    await page.getByTestId('tweet-add-child-btn').click({ force: true })
    await page.getByRole('menuitem', { name: /Question/i }).click()
    await fitCanvasView(page)

    await expect(page.locator('.vue-flow__edge')).toHaveCount(1)

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.vue-flow__edge')).toHaveCount(1, { timeout: 5000 })
  })

  test('multiplos nodes persistem apos reload', async ({ page }) => {
    await createCanvasViaUI(page, 'Multiplos Nodes')

    await addNodeViaClick(page, 'Tweet', { x: 200, y: 200 })
    await loadTweet(page, 'https://x.com/user/status/123')

    await addNodeViaClick(page, 'Note', { x: 500, y: 200 })
    await writeNote(page, 'Nota multipla')

    await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
    await expect(page.getByText('Nota multipla')).toBeVisible()

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.getByTestId('tweet-author-handle')).toBeVisible()
    await expect(page.getByText('Nota multipla')).toBeVisible()
  })

  test('lista de canvases persiste apos reload', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas 1')
    await goBackToList(page)

    await createCanvasViaUI(page, 'Canvas 2')
    await goBackToList(page)

    await createCanvasViaUI(page, 'Canvas 3')
    await goBackToList(page)

    await expectCanvasInList(page, 'Canvas 1')
    await expectCanvasInList(page, 'Canvas 2')
    await expectCanvasInList(page, 'Canvas 3')

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expectCanvasInList(page, 'Canvas 1')
    await expectCanvasInList(page, 'Canvas 2')
    await expectCanvasInList(page, 'Canvas 3')
  })

  test('delecao de canvas persiste apos reload', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Para Deletar')
    await goBackToList(page)

    const card = page.locator('article').filter({ hasText: 'Canvas Para Deletar' })
    await card.hover()
    await card.getByRole('button', { name: /deletar/i }).click()
    await page.getByTestId('confirm-delete-btn').click()

    await expect(page.locator('article').filter({ hasText: 'Canvas Para Deletar' })).not.toBeVisible()

    await page.reload()
    await page.waitForLoadState('networkidle')

    await expect(page.locator('article').filter({ hasText: 'Canvas Para Deletar' })).not.toBeVisible()
  })

  test('navegacao direta para canvas existente funciona', async ({ page }) => {
    await createCanvasViaUI(page, 'Canvas Direto')

    const url = page.url()

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.goto(url)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: 'Canvas Direto' })).toBeVisible()
  })

  // ===========================================================================
  // Storage Structure - Only structural properties persisted
  // ===========================================================================

  test('localStorage persists only structural node properties', async ({ page }) => {
    await createCanvasViaUI(page, 'Node Structure Test')

    await addNodeViaClick(page, 'Note')
    await writeNote(page, 'Testing storage structure')

    await page.waitForTimeout(500)

    const storageData = await page.evaluate(() => {
      return localStorage.getItem('gyul-state')
    })

    expect(storageData).not.toBeNull()
    const parsed = JSON.parse(storageData!)
    const node = parsed.canvases[0].nodes[0]

    expect(Object.keys(node).sort()).toEqual(['data', 'id', 'position', 'type'].sort())

    expect(node.id).toBeDefined()
    expect(node.type).toBe('note')
    expect(node.position).toHaveProperty('x')
    expect(node.position).toHaveProperty('y')
    expect(node.data.content).toBe('Testing storage structure')
  })

  test('localStorage persists only structural edge properties', async ({ page }) => {
    await createCanvasViaUI(page, 'Edge Structure Test')

    await addNodeViaClick(page, 'Tweet')
    await loadTweet(page, 'https://x.com/user/status/123')

    await page.getByTestId('tweet-add-child-btn').click({ force: true })
    await page.getByRole('menuitem', { name: /Note/i }).click()

    await page.waitForTimeout(500)

    const storageData = await page.evaluate(() => {
      return localStorage.getItem('gyul-state')
    })

    expect(storageData).not.toBeNull()
    const parsed = JSON.parse(storageData!)
    const edge = parsed.canvases[0].edges[0]

    expect(Object.keys(edge).sort()).toEqual(['id', 'source', 'target'].sort())

    expect(edge.id).toBeDefined()
    expect(edge.source).toBeDefined()
    expect(edge.target).toBeDefined()
  })
})
