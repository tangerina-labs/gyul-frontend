import { Page, expect } from '@playwright/test'

// =============================================================================
// SETUP HELPERS
// =============================================================================

/**
 * Sets up the test environment flag and clears state.
 * Call this at the beginning of each test.
 *
 * Note: addInitScript runs before every navigation/reload, so the flag persists.
 */
export async function startFresh(page: Page): Promise<void> {
  await page.addInitScript(() => {
    ;(window as any).__PLAYWRIGHT_TEST__ = true
  })

  // Go to canvases list (not landing page) to start fresh
  await page.goto('/canvases')

  await page.evaluate(() => localStorage.clear())

  await page.reload()
  await page.waitForLoadState('networkidle')
}

// =============================================================================
// CANVAS LIST HELPERS
// =============================================================================

/**
 * Creates a new canvas via UI.
 * Starts from canvas list view.
 */
export async function createCanvasViaUI(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Novo Canvas' }).click()

  await page.getByPlaceholder('Nome do canvas').fill(name)

  // Use exact match to avoid "Criar primeiro canvas" button
  await page.getByRole('button', { name: 'Criar', exact: true }).click()

  await page.waitForURL('**/canvas/**')

  await expect(page.getByRole('heading', { name })).toBeVisible()
}

/**
 * Goes back to canvas list from canvas view.
 */
export async function goBackToList(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Voltar' }).click()
  await page.waitForURL('**/canvases')
  await expect(page.getByText('gyul')).toBeVisible()
}

// =============================================================================
// NODE CREATION HELPERS
// =============================================================================

type NodeTypeName = 'Tweet' | 'Question' | 'Note'

/**
 * Fits all nodes in the canvas view.
 * Use this after creating multiple nodes to ensure they're all visible.
 */
export async function fitCanvasView(page: Page): Promise<void> {
  await page.getByTestId('controls-fit-view').click()
  await page.waitForTimeout(300)
}

/**
 * Opens the node type menu using the explicit flow creation pattern.
 *
 * Uses the toolbox "+ Novo Fluxo" button to activate create mode,
 * then clicks on the canvas to open the menu.
 *
 * Note: After fitView with multiple nodes, a regular click at arbitrary
 * positions may hit a node instead of the canvas pane. We dispatch the
 * click event directly to the pane element to ensure it's always received.
 */
export async function openNodeMenu(
  page: Page,
  position: { x: number; y: number } = { x: 300, y: 300 }
): Promise<void> {
  const existingMenu = page.getByTestId('node-type-menu')
  if (await existingMenu.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape')
    await expect(existingMenu).not.toBeVisible()
  }

  await page.getByTestId('toolbox-new-flow').click()

  await page.waitForTimeout(100)

  await page.evaluate((pos) => {
    const pane = document.querySelector('.vue-flow__pane')
    if (pane) {
      const rect = pane.getBoundingClientRect()
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + pos.x,
        clientY: rect.top + pos.y
      })
      pane.dispatchEvent(event)
    }
  }, position)

  await expect(page.getByTestId('node-type-menu')).toBeVisible({ timeout: 3000 })
}

/**
 * Adds a node by clicking on canvas and selecting type.
 * Automatically fits the canvas view after creation to ensure node is visible.
 */
export async function addNodeViaClick(
  page: Page,
  nodeType: NodeTypeName,
  position: { x: number; y: number } = { x: 300, y: 300 }
): Promise<void> {
  await openNodeMenu(page, position)

  await page.getByRole('menuitem', { name: new RegExp(nodeType, 'i') }).click()

  await expect(page.getByTestId('node-type-menu')).not.toBeVisible()

  const testIdMap: Record<NodeTypeName, string> = {
    Tweet: 'tweet-card',
    Question: 'question-card',
    Note: 'note-card'
  }
  await expect(page.getByTestId(testIdMap[nodeType]).last()).toBeVisible({ timeout: 3000 })

  await fitCanvasView(page)
}

/**
 * Adds a child node from an existing node.
 * Clicks the "add child" button and selects type.
 * Automatically fits the canvas view after creation.
 */
export async function addChildNode(page: Page, nodeType: NodeTypeName): Promise<void> {
  await page.getByRole('button', { name: /adicionar/i }).click()

  await page.getByRole('menuitem', { name: new RegExp(nodeType, 'i') }).click()

  const testIdMap: Record<NodeTypeName, string> = {
    Tweet: 'tweet-card',
    Question: 'question-card',
    Note: 'note-card'
  }
  await expect(page.getByTestId(testIdMap[nodeType]).last()).toBeVisible({ timeout: 3000 })

  await fitCanvasView(page)
}

// =============================================================================
// TWEET NODE HELPERS
// =============================================================================

/**
 * Loads a tweet by filling URL and clicking submit.
 * For multiple tweets, this will fill/click the LAST empty tweet node.
 */
export async function loadTweet(page: Page, url: string): Promise<void> {
  const urlInput = page.getByTestId('tweet-url-input').last()
  await urlInput.fill(url)

  await page.getByTestId('tweet-submit-btn').last().click()

  await expect(page.getByTestId('tweet-author-handle').last()).toBeVisible({ timeout: 10000 })
}

// =============================================================================
// QUESTION NODE HELPERS
// =============================================================================

/**
 * Submits a question to the AI.
 * Note: Call addNodeViaClick first to create the question node (which auto-fits the view).
 */
export async function submitQuestion(page: Page, question: string): Promise<void> {
  await fitCanvasView(page)
  await page.getByPlaceholder(/pergunta/i).last().fill(question)

  await page.getByRole('button', { name: 'Submeter' }).last().click()

  await fitCanvasView(page)
  await expect(page.getByTestId('question-ai-badge').first()).toBeVisible({ timeout: 10000 })
  await fitCanvasView(page)
}

// =============================================================================
// NOTE NODE HELPERS
// =============================================================================

/**
 * Writes content in a note and finalizes it.
 */
export async function writeNote(page: Page, content: string): Promise<void> {
  await page.getByPlaceholder(/anotacao/i).fill(content)

  await page.keyboard.press('Enter')
  await fitCanvasView(page)

  await expect(page.getByText(content, { exact: true })).toBeVisible()
}

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Verifies canvas is empty (shows empty hint).
 * Waits for the hint to appear since node removal might take a moment.
 */
export async function expectCanvasEmpty(page: Page): Promise<void> {
  await expect(page.getByTestId('canvas-empty-hint')).toBeVisible({ timeout: 5000 })
}

/**
 * Verifies canvas list is empty (shows empty state).
 */
export async function expectCanvasListEmpty(page: Page): Promise<void> {
  await expect(page.getByText('Nenhum canvas ainda')).toBeVisible()
}

/**
 * Verifies a canvas exists in the list by name.
 */
export async function expectCanvasInList(page: Page, name: string): Promise<void> {
  await expect(page.getByText(name)).toBeVisible()
}

/**
 * Verifies we are on the canvas view.
 */
export async function expectOnCanvasView(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: 'Voltar' })).toBeVisible()
  await expect(page.locator('.vue-flow__pane')).toBeVisible()
}

/**
 * Verifies we are on the canvas list view.
 */
export async function expectOnCanvasList(page: Page): Promise<void> {
  await expect(page.getByText('gyul')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Novo Canvas' })).toBeVisible()
}
