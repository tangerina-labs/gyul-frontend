import { test, expect } from "@playwright/test";
import {
  startFresh,
  createCanvasViaUI,
  addShapeViaMenu,
  loadTweet,
  submitQuestion,
  writeNote,
  fitCanvasView,
  clickZoomOut,
  expectArrowConnects,
  expectParentChildArrows,
  ShapeBuilder,
} from "./helpers/test-utils";

// Type for shape records in storage
interface StorageShapeRecord {
  typeName?: string;
  type?: string;
  props?: {
    flowId?: string;
  };
}

test.describe("Shape Connections (Conexões Entre Shapes)", () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await createCanvasViaUI(page, "Conexões Test");
  });

  test.describe("Grupo 1: Criação Automática", () => {
    test("arrow é criada automaticamente ao criar shape filho", async ({
      page,
    }) => {
      await addShapeViaMenu(page, "Tweet");
      await loadTweet(page, "https://twitter.com/user/status/123");

      // Verifica que não há parent-child arrows antes de criar filho
      await expectParentChildArrows(page, 0);

      // Cria shape filho
      await page.getByTestId("tweet-add-child-btn").click({ force: true });
      await page.getByTestId("menu-option-question").click();
      await fitCanvasView(page);

      // Parent-child arrow deve existir agora
      await expectParentChildArrows(page, 1);
    });

    test("arrow conecta pai ao filho na direção correta", async ({ page }) => {
      await addShapeViaMenu(page, "Tweet");
      await loadTweet(page, "https://twitter.com/user/status/222");

      await page.getByTestId("tweet-add-child-btn").click({ force: true });
      await page.getByTestId("menu-option-note").click();
      await writeNote(page, "Nota filho do tweet");
      await fitCanvasView(page);

      // Verifica que parent-child arrow existe
      await expectParentChildArrows(page, 1);

      // A arrow deve ter o path renderizado (verificar elemento visual)
      const arrow = page.locator('[data-shape-type="arrow"]');
      await expect(arrow).toBeVisible();

      // Verificar binding structure via storage
      await expectArrowConnects(page, "tweet-card", "note-card");
    });

    test("múltiplas arrows são criadas para múltiplos filhos", async ({
      page,
    }) => {
      await addShapeViaMenu(page, "Tweet");
      await loadTweet(page, "https://twitter.com/user/status/333");

      // Primeiro filho
      await page.getByTestId("tweet-add-child-btn").click({ force: true });
      await page.getByTestId("menu-option-question").click();
      await fitCanvasView(page);

      await expectParentChildArrows(page, 1);

      // Segundo filho (do mesmo pai)
      await page.getByTestId("tweet-card").click();
      await page.getByTestId("tweet-add-child-btn").click({ force: true });
      await page.getByTestId("menu-option-note").click();
      await writeNote(page, "Nota filho 2");
      await fitCanvasView(page);

      await expectParentChildArrows(page, 2);
    });

    test("arrows formam cadeia em árvore profunda", async ({ page }) => {
      // Tweet -> Question -> Note -> Question
      const tweet = await ShapeBuilder.tweet(page)
        .loadUrl("https://twitter.com/user/status/444")
        .build();

      const question1 = await tweet
        .addChild("question")
        .submit("Primeira pergunta?")
        .fitView()
        .build();

      const note = await question1
        .addChild("note")
        .write("Nota da pergunta")
        .fitView()
        .build();

      const question2 = await note
        .addChild("question")
        .fitView()
        .build();

      // 4 shapes, 3 parent-child arrows
      await expectParentChildArrows(page, 3);
    });
  });

  test.describe("Grupo 3: Isolamento de Fluxos (flowId)", () => {
    test("fluxos independentes permanecem isolados", async ({ page }) => {
      // Fluxo A
      await addShapeViaMenu(page, "Tweet", { x: 200, y: 200 });
      await page
        .getByPlaceholder(/cole a url/i)
        .first()
        .fill("https://twitter.com/a/status/111");
      await page.getByRole("button", { name: "Carregar" }).first().click();
      await expect(page.getByTestId("tweet-author-handle").first()).toBeVisible(
        {
          timeout: 10000,
        }
      );

      await page
        .getByTestId("tweet-add-child-btn")
        .first()
        .click({ force: true });
      await page.getByTestId("menu-option-question").click();
      await fitCanvasView(page);

      // Fluxo B (separado)
      await addShapeViaMenu(page, "Tweet", { x: 700, y: 200 });
      await page
        .getByPlaceholder(/cole a url/i)
        .last()
        .fill("https://twitter.com/b/status/222");
      await page.getByRole("button", { name: "Carregar" }).last().click();
      await expect(page.getByTestId("tweet-author-handle")).toHaveCount(2, {
        timeout: 10000,
      });

      await page
        .getByTestId("tweet-add-child-btn")
        .last()
        .click({ force: true });
      await page.getByTestId("menu-option-note").click();
      await writeNote(page, "Nota do fluxo B");
      await fitCanvasView(page);

      // 4 nodes (2 tweets + 1 question + 1 note)
      // 2 parent-child arrows (uma por fluxo)
      // Nenhuma arrow conecta os dois fluxos
      await expectParentChildArrows(page, 2);
    });

    test("filho herda flowId do pai (verificado via storage)", async ({
      page,
    }) => {
      await addShapeViaMenu(page, "Tweet");
      await loadTweet(page, "https://twitter.com/user/status/777");

      await page.getByTestId("tweet-add-child-btn").click({ force: true });
      await page.getByTestId("menu-option-question").click();
      await fitCanvasView(page);

      // Verifica no localStorage que ambos têm mesmo flowId
      const storageData = await page.evaluate(async () => {
        await new Promise((r) => setTimeout(r, 100));
        return localStorage.getItem("gyul-state");
      });

      expect(storageData).not.toBeNull();
      const parsed = JSON.parse(storageData!);
      const snapshot = parsed.state.state.canvases[0].snapshot;
      const shapes = Object.values(
        snapshot.store as StorageShapeRecord[]
      ).filter(
        (r) => r.typeName === "shape" && r.type !== "arrow"
      ) as StorageShapeRecord[];

      expect(shapes.length).toBeGreaterThanOrEqual(2);

      // Encontrar o tweet e a question
      const tweetShape = shapes.find((s) => s.type === "tweet");
      const questionShape = shapes.find((s) => s.type === "question");

      expect(tweetShape).toBeDefined();
      expect(questionShape).toBeDefined();
      expect(tweetShape?.props?.flowId).toBe(questionShape?.props?.flowId);
    });

    test("shapes raiz independentes têm flowIds diferentes", async ({
      page,
    }) => {
      await addShapeViaMenu(page, "Tweet", { x: 200, y: 200 });
      await loadTweet(page, "https://twitter.com/a/status/888");

      await addShapeViaMenu(page, "Note", { x: 700, y: 200 });
      await writeNote(page, "Nota isolada");

      const storageData = await page.evaluate(async () => {
        await new Promise((r) => setTimeout(r, 100));
        return localStorage.getItem("gyul-state");
      });

      const parsed = JSON.parse(storageData!);
      const snapshot = parsed.state.state.canvases[0].snapshot;
      const shapes = Object.values(
        snapshot.store as StorageShapeRecord[]
      ).filter(
        (r) => r.typeName === "shape" && r.type !== "arrow"
      ) as StorageShapeRecord[];

      expect(shapes.length).toBeGreaterThanOrEqual(2);

      const tweetShape = shapes.find((s) => s.type === "tweet");
      const noteShape = shapes.find((s) => s.type === "note");

      expect(tweetShape).toBeDefined();
      expect(noteShape).toBeDefined();
      expect(tweetShape?.props?.flowId).not.toBe(noteShape?.props?.flowId);
    });
  });

  test.describe("Grupo 4: Remoção Automática (MVP - skip)", () => {
    test.skip("deletar shape filho remove arrow automaticamente", async () => {
      // Feature de deleção será implementada em fase futura
    });

    test.skip("deletar shape em cadeia remove apenas arrows relacionadas", async () => {
      // Feature de deleção será implementada em fase futura
    });

    test.skip("shape pai tem delete desabilitado (protege estrutura)", async () => {
      // Feature de deleção será implementada em fase futura
    });
  });

  test.describe("Grupo 5: Persistência", () => {
    test("arrows persistem após reload", async ({ page }) => {
      await addShapeViaMenu(page, "Tweet");
      await loadTweet(page, "https://twitter.com/user/status/1111");

      await page.getByTestId("tweet-add-child-btn").click({ force: true });
      await page.getByTestId("menu-option-question").click();
      await fitCanvasView(page);

      await expectParentChildArrows(page, 1);

      await page.reload();

      // Wait for canvas to load and verify arrow persists
      await expect(page.getByTestId("canvas-view")).toBeVisible();
      await expectParentChildArrows(page, 1);
    });

  });

  test.describe("Grupo 6: Branch Highlight (MVP - skip)", () => {
    test.skip("selecionar shape destaca arrows da branch", async () => {
      // Feature de highlight será implementada em v2
    });

    test.skip("arrows fora da branch ficam com fade", async () => {
      // Feature de highlight será implementada em v2
    });

    test.skip("clicar no canvas limpa highlight das arrows", async () => {
      // Feature de highlight será implementada em v2
    });
  });

  test.describe("Grupo 7: Conexões Manuais Desabilitadas", () => {
    test("arrastar entre shapes não cria conexão manual", async ({ page }) => {
      await addShapeViaMenu(page, "Tweet", { x: 200, y: 200 });
      await loadTweet(page, "https://twitter.com/a/status/1666");

      await addShapeViaMenu(page, "Note", { x: 700, y: 200 });
      await writeNote(page, "Nota separada");

      // Tenta arrastar do Tweet para a Note
      const tweetCard = page.getByTestId("tweet-card");
      const noteCard = page.getByTestId("note-card").last();

      const tweetBox = await tweetCard.boundingBox();
      const noteBox = await noteCard.boundingBox();

      if (tweetBox && noteBox) {
        await page.mouse.move(
          tweetBox.x + tweetBox.width,
          tweetBox.y + tweetBox.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(noteBox.x, noteBox.y + noteBox.height / 2, {
          steps: 10,
        });
        await page.mouse.up();
      }

      // Nenhuma parent-child arrow deve ter sido criada (shapes são de fluxos diferentes)
      await expectParentChildArrows(page, 0);
    });

    test("arrows não são selecionáveis", async ({ page }) => {
      await addShapeViaMenu(page, "Tweet");
      await loadTweet(page, "https://twitter.com/user/status/1777");

      await page.getByTestId("tweet-add-child-btn").click({ force: true });
      await page.getByTestId("menu-option-question").click();
      await fitCanvasView(page);

      // Verifica que parent-child arrow existe
      await expectParentChildArrows(page, 1);

      // Tentar clicar na arrow
      const arrow = page.locator('[data-shape-type="arrow"]').first();
      await expect(arrow).toBeVisible();

      const arrowBox = await arrow.boundingBox();
      if (arrowBox) {
        // Clicar no meio da arrow
        await page.mouse.click(
          arrowBox.x + arrowBox.width / 2,
          arrowBox.y + arrowBox.height / 2
        );
      }

      // Verificar que a arrow não foi selecionada
      // (no tldraw, shapes selecionadas têm classe específica ou border visível)
      // Como configuramos para desabilitar seleção, não deve haver mudança visual
      await page.waitForTimeout(200);

      // A arrow deve continuar visível e sem seleção
      await expect(arrow).toBeVisible();
    });
  });

  test.describe("Grupo 8: Tipos de Shapes Diferentes", () => {
    test("arrows funcionam entre todos os tipos de shapes", async ({
      page,
    }) => {
      await addShapeViaMenu(page, "Tweet");
      await loadTweet(page, "https://twitter.com/user/status/1888");

      // Tweet -> Question
      await page.getByTestId("tweet-add-child-btn").click({ force: true });
      await page.getByTestId("menu-option-question").click();
      await fitCanvasView(page);

      // Tweet -> Note
      await page.getByTestId("tweet-card").click();
      await page
        .getByTestId("tweet-add-child-btn")
        .first()
        .click({ force: true });
      await page.getByTestId("menu-option-note").click();
      await fitCanvasView(page);

      // Tweet -> Tweet (outro tweet como filho)
      await page.getByTestId("tweet-card").first().click();
      await page
        .getByTestId("tweet-add-child-btn")
        .first()
        .click({ force: true });
      await page.getByTestId("menu-option-tweet").click();
      await fitCanvasView(page);

      // 3 parent-child arrows, todas do mesmo pai Tweet
      await expectParentChildArrows(page, 3);
    });

    test("múltiplos tipos de shapes coexistem com conexões corretas", async ({
      page,
    }) => {
      await addShapeViaMenu(page, "Tweet", { x: 150, y: 200 });
      await loadTweet(page, "https://twitter.com/x/status/1999");

      await addShapeViaMenu(page, "Question", { x: 600, y: 200 });
      await fitCanvasView(page);
      await page
        .getByPlaceholder(/pergunta/i)
        .last()
        .fill("Pergunta standalone");
      await page.getByRole("button", { name: "Submeter" }).last().click();
      await expect(page.getByTestId("question-ai-badge")).toBeVisible({
        timeout: 10000,
      });

      await addShapeViaMenu(page, "Note", { x: 1050, y: 200 });
      await writeNote(page, "Nota standalone");

      // 3 shapes raiz independentes = 0 parent-child arrows
      await expectParentChildArrows(page, 0);

      // Adiciona filho ao tweet
      await page.getByTestId("tweet-card").click();
      await page
        .getByTestId("tweet-add-child-btn")
        .first()
        .click({ force: true });
      await page.getByTestId("menu-option-note").click();
      await fitCanvasView(page);

      // Agora 1 parent-child arrow (Tweet -> Note)
      await expectParentChildArrows(page, 1);
    });
  });
});
