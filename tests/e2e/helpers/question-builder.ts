import type { Page } from "@playwright/test";
import type { QuestionBuilder as IQuestionBuilder, BuilderState } from "./shape-builder-types";
import { ShapeHandle, getShapeIdByTestCreationId, getTestIdFromType } from "./shape-handle";
import {
  addShapeViaMenu,
  submitQuestion,
  fitCanvasView,
} from "./test-utils";

/**
 * Builder for creating Question shapes with fluent API
 */
export class QuestionBuilder implements IQuestionBuilder {
  private question?: string;
  private useEnter = false;
  private shouldWaitForAi = true;
  private parentTestId?: string;
  private creationId: string;
  private state: BuilderState = {
    isChild: false,
    position: { x: 400, y: 300 },
    shouldFitView: false,
    hasBuilt: false,
  };

  constructor(
    private page: Page,
    parentId?: string,
    parentTestId?: string
  ) {
    // Gerar UUID único para esta criação
    this.creationId = crypto.randomUUID();
    
    if (parentId && parentTestId) {
      this.state.isChild = true;
      this.state.parentId = parentId;
      this.parentTestId = parentTestId;
    }
  }

  /**
   * Submit a question and wait for AI response
   */
  submit(question: string): this {
    this.assertNotBuilt();
    this.question = question;
    this.useEnter = false;
    this.shouldWaitForAi = true;
    return this;
  }

  /**
   * Submit question using Enter key
   */
  submitViaEnter(question: string): this {
    this.assertNotBuilt();
    this.question = question;
    this.useEnter = true;
    this.shouldWaitForAi = true;
    return this;
  }

  /**
   * Skip waiting for AI response (useful for testing empty/loading states)
   */
  skipAiWait(): this {
    this.assertNotBuilt();
    this.shouldWaitForAi = false;
    return this;
  }

  /**
   * Position the shape at specific coordinates
   */
  atPosition(x: number, y: number): this {
    this.assertNotBuilt();
    this.state.position = { x, y };
    return this;
  }

  /**
   * Fit the canvas view after shape creation
   */
  fitView(): this {
    this.assertNotBuilt();
    this.state.shouldFitView = true;
    return this;
  }

  /**
   * Execute all operations and return a handle to the created shape
   */
  async build(): Promise<ShapeHandle> {
    this.assertNotBuilt();
    this.state.hasBuilt = true;

    // If this is a child, perform the UI clicks to create it
    if (this.state.isChild && this.state.parentId) {
      await this.performChildCreation();
    } else {
      // Create the shape via menu
      await addShapeViaMenu(this.page, "Question", this.state.position);
    }

    // Injetar metadata de teste APÓS criação
    await this.injectTestMetadata();

    // Submit question if provided
    if (this.question) {
      if (this.useEnter) {
        // For Enter submission, we need to manually implement it
        // The Enter key on the input doesn't submit - need to click the button
        await fitCanvasView(this.page);
        const promptInput = this.page.getByTestId("question-prompt-input").last();
        await promptInput.fill(this.question);
        // Use click instead of Enter since the UI requires button click
        await this.page.getByTestId("question-submit-btn").last().click();
        
        if (this.shouldWaitForAi) {
          await this.page.getByTestId("question-ai-badge").first().waitFor({ 
            state: "visible",
            timeout: 10000 
          });
        }
        await fitCanvasView(this.page);
      } else {
        await submitQuestion(this.page, this.question);
      }
    }

    // Fit view if requested (and not already done by submitQuestion)
    if (this.state.shouldFitView && !this.question) {
      await fitCanvasView(this.page);
    }

    // Buscar shape pelo creation ID
    const shapeId = await getShapeIdByTestCreationId(this.page, this.creationId);
    const testId = getTestIdFromType("question");

    // If this was a child, wait a bit more for arrow creation
    if (this.state.isChild) {
      await this.page.waitForTimeout(200);
    }

    // Return handle
    return new ShapeHandle({
      id: shapeId,
      testId,
      type: "question",
      page: this.page,
      locator: this.page.getByTestId(testId).last(),
    });
  }

  /**
   * Perform the UI clicks to create a child shape
   */
  private async performChildCreation(): Promise<void> {
    if (!this.parentTestId) {
      throw new Error("Parent test ID not set for child builder");
    }
    
    // Ensure parent is in view and visible
    const parentCard = this.page.getByTestId(this.parentTestId);
    await parentCard.scrollIntoViewIfNeeded();
    await parentCard.waitFor({ state: "visible" });
    
    // Click parent to focus
    await parentCard.click();
    await this.page.waitForTimeout(100);

    // Click add-child button
    const addChildBtnId = this.parentTestId.replace("-card", "-add-child-btn");
    const addChildBtn = this.page.getByTestId(addChildBtnId);
    await addChildBtn.waitFor({ state: "visible" });
    await addChildBtn.click({ force: true });

    // Wait for menu to appear
    await this.page.getByTestId("shape-type-menu").waitFor({ state: "visible" });
    
    // Select type from menu
    await this.page.getByTestId("menu-option-question").click();

    // Wait for menu to close and shape to be created
    await this.page.getByTestId("shape-type-menu").waitFor({ state: "hidden" });
    await this.page.waitForTimeout(300);
  }

  /**
   * Injeta metadata de teste na shape mais recente do tipo
   */
  private async injectTestMetadata(): Promise<void> {
    await this.page.evaluate((creationId) => {
      const editor = (window as any).__tldraw_editor__;
      if (!editor) return;
      
      // Pegar todas as shapes do canvas atual
      const shapes = editor.getCurrentPageShapes();
      
      // Filtrar por tipo 'question' e pegar a que não tem _testCreationId
      const targetShape = shapes
        .filter((s: any) => s.type === 'question')
        .find((s: any) => !s.meta?._testCreationId);
      
      if (!targetShape) {
        console.warn('No target shape found for test metadata injection');
        return;
      }
      
      // Atualizar shape com metadata de teste
      editor.updateShape({
        id: targetShape.id,
        type: targetShape.type,
        meta: {
          ...targetShape.meta,
          _testCreationId: creationId,
        },
      });
    }, this.creationId);
    
    // Aguardar persistência
    await this.page.waitForTimeout(100);
  }

  /**
   * Mark this builder as a child shape
   * @internal
   */
  _markAsChild(parentId: string): void {
    this.state.isChild = true;
    this.state.parentId = parentId;
  }

  private assertNotBuilt(): void {
    if (this.state.hasBuilt) {
      throw new Error(
        "Builder has already been built and cannot be reused. Create a new builder instance."
      );
    }
  }
}
