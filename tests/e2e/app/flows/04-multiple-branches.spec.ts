import { test, expect } from "@playwright/test";
import {
  startFresh,
  createCanvasViaUI,
  addNodeViaClick,
  loadTweet,
  writeNote,
  fitCanvasView,
} from "../helpers/test-utils";

test.describe("Multiplas Branches", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await createCanvasViaUI(page, "Branches");
  });

  test("usuario explora diferentes caminhos e alterna foco", async ({
    page,
  }) => {
    await addNodeViaClick(page, "Tweet", { x: 200, y: 200 });
    await loadTweet(page, "https://twitter.com/a/status/111");

    await addNodeViaClick(page, "Tweet", { x: 600, y: 200 });
    await page
      .getByPlaceholder(/twitter\.com|URL/i)
      .last()
      .fill("https://twitter.com/b/status/222");
    await page.getByRole("button", { name: "Carregar" }).last().click();

    const authorHandles = page.getByTestId("tweet-author-handle");
    await expect(authorHandles).toHaveCount(2, { timeout: 10000 });

    const tweetNodes = page.locator(".vue-flow__node");
    await expect(tweetNodes).toHaveCount(2);
  });

  test("clicar em node de uma branch destaca ela", async ({ page }) => {
    await addNodeViaClick(page, "Tweet", { x: 200, y: 200 });
    await loadTweet(page, "https://twitter.com/a/status/333");

    await addNodeViaClick(page, "Note", { x: 600, y: 200 });
    await writeNote(page, "Nota em branch separada");

    const tweetNode = page.locator(".vue-flow__node-tweet").first();
    await tweetNode.click({ force: true });

    // Verify node is selected (has selected class)
    await expect(tweetNode).toHaveClass(/selected/);
  });

  test("clicar no canvas limpa highlight", async ({ page }) => {
    await addNodeViaClick(page, "Tweet", { x: 200, y: 200 });
    await loadTweet(page, "https://twitter.com/a/status/444");

    await page
      .getByRole("button", { name: /adicionar/i })
      .first()
      .click();
    await page.getByRole("menuitem", { name: /Note/i }).click();
    await fitCanvasView(page);
    await writeNote(page, "Nota filha");

    const noteNode = page.locator(".vue-flow__node-note");
    await fitCanvasView(page);
    await noteNode.click({ force: true });
    await expect(noteNode).toHaveClass(/selected/);

    const canvas = page.locator(".vue-flow__pane");
    await canvas.click({ position: { x: 50, y: 50 } });

    await expect(noteNode).not.toHaveClass(/selected/);
  });

  test("clicar no canvas desseleciona node selecionado", async ({ page }) => {
    await addNodeViaClick(page, "Tweet", { x: 200, y: 200 });
    await loadTweet(page, "https://twitter.com/a/status/555");

    const tweetNode = page.locator(".vue-flow__node-tweet").first();

    // Click to select
    await tweetNode.click({ force: true });
    await expect(tweetNode).toHaveClass(/selected/);

    // Click canvas to deselect
    await page.locator(".vue-flow__pane").click({ position: { x: 50, y: 50 } });
    await expect(tweetNode).not.toHaveClass(/selected/);
  });

  test("nodes filhos pertencem a mesma branch do pai", async ({ page }) => {
    await addNodeViaClick(page, "Tweet", { x: 200, y: 150 });
    await loadTweet(page, "https://twitter.com/a/status/666");

    await page
      .getByRole("button", { name: /adicionar/i })
      .first()
      .click();
    await page.getByRole("menuitem", { name: /Question/i }).click();

    await addNodeViaClick(page, "Note", { x: 600, y: 150 });
    await writeNote(page, "Branch separada");

    const questionNode = page
      .locator(".vue-flow__node")
      .filter({ hasText: "Pergunta" });
    await questionNode.click();
    await expect(questionNode).toHaveClass(/selected/);
  });

  test("edges ficam dimmed quando branch diferente", async ({ page }) => {
    await addNodeViaClick(page, "Tweet", { x: 200, y: 150 });
    await loadTweet(page, "https://twitter.com/a/status/777");

    await page
      .getByRole("button", { name: /adicionar/i })
      .first()
      .click();
    await page.getByRole("menuitem", { name: /Question/i }).click();

    await expect(page.locator(".vue-flow__edge")).toHaveCount(1);

    await addNodeViaClick(page, "Note", { x: 600, y: 150 });
    await writeNote(page, "Nota standalone");

    const noteNode = page.locator(".vue-flow__node").last();
    await noteNode.click();
    await expect(noteNode).toHaveClass(/selected/);
  });

  test("multiplos tipos de nodes podem coexistir", async ({ page }) => {
    await addNodeViaClick(page, "Tweet", { x: 150, y: 200 });
    await loadTweet(page, "https://twitter.com/x/status/888");

    await addNodeViaClick(page, "Question", { x: 400, y: 200 });
    await fitCanvasView(page);
    await page.getByPlaceholder(/pergunta/i).last().fill("Pergunta standalone");
    await page.getByRole("button", { name: "Submeter" }).last().click();
    await expect(page.getByTestId("question-ai-badge")).toBeVisible({
      timeout: 10000,
    });

    await addNodeViaClick(page, "Note", { x: 650, y: 200 });
    await writeNote(page, "Nota standalone");

    await fitCanvasView(page);
    await expect(page.getByTestId("tweet-author-handle")).toBeVisible();
    await expect(page.getByTestId("question-prompt-text")).toContainText(
      "Pergunta standalone"
    );
    await expect(page.getByText("Nota standalone")).toBeVisible();
  });
});
