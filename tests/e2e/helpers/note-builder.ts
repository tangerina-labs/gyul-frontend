import type { Page } from "@playwright/test";
import type { NoteBuilder as INoteBuilder, BuilderState } from "./shape-builder-types";
import { ShapeHandle, getShapeIdByTestCreationId, getTestIdFromType } from "./shape-handle";
import {
  addShapeViaMenu,
  writeNote,
  fitCanvasView,
} from "./test-utils";

/**
 * Builder for creating Note shapes with fluent API
 */
export class NoteBuilder implements INoteBuilder {
  private content?: string;
  private parentTestId?: string;
  private parentLocator?: any;
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
    parentTestId?: string,
    parentLocator?: any
  ) {
    // Gerar UUID único para esta criação
    this.creationId = crypto.randomUUID();
    
    if (parentId && parentTestId) {
      this.state.isChild = true;
      this.state.parentId = parentId;
      this.parentTestId = parentTestId;
      this.parentLocator = parentLocator;
    }
  }

  /**
   * Write content to the note and finalize it
   */
  write(content: string): this {
    this.assertNotBuilt();
    this.content = content;
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
      await addShapeViaMenu(this.page, "Note", this.state.position);
    }

    // Injetar metadata de teste APÓS criação
    await this.injectTestMetadata();

    // Write content if provided
    if (this.content) {
      await writeNote(this.page, this.content);
    }

    // Fit view if requested (and not already done by writeNote)
    if (this.state.shouldFitView && !this.content) {
      await fitCanvasView(this.page);
    }

    // Buscar shape pelo creation ID
    const shapeId = await getShapeIdByTestCreationId(this.page, this.creationId);
    const testId = getTestIdFromType("note");

    // If this was a child, wait a bit more for arrow creation
    if (this.state.isChild) {
      await this.page.waitForTimeout(200);
    }

    // Create a specific locator using the shapeId
    // Filter by the data-shape-id attribute (we'll need to add this in the component)
    // For now, use a more specific approach: filter by matching shape in DOM
    const specificLocator = this.page.locator(`[data-testid="${testId}"][data-shape-id="${shapeId}"]`);

    // Return handle
    return new ShapeHandle({
      id: shapeId,
      testId,
      type: "note",
      page: this.page,
      locator: specificLocator,
    });
  }

  /**
   * Perform the UI clicks to create a child shape
   */
  private async performChildCreation(): Promise<void> {
    if (!this.parentTestId) {
      throw new Error("Parent test ID not set for child builder");
    }
    
    // Use specific parent locator if available, otherwise fallback to generic testId
    const parentCard = this.parentLocator || this.page.getByTestId(this.parentTestId);
    await parentCard.scrollIntoViewIfNeeded();
    await parentCard.waitFor({ state: "visible" });
    
    // Click parent to focus
    await parentCard.click();
    await this.page.waitForTimeout(100);

    // Click add-child button within the parent card
    const addChildBtnId = this.parentTestId.replace("-card", "-add-child-btn");
    const addChildBtn = parentCard.getByTestId(addChildBtnId);
    await addChildBtn.waitFor({ state: "visible" });
    await addChildBtn.click({ force: true });

    // Wait for menu to appear
    await this.page.getByTestId("shape-type-menu").waitFor({ state: "visible" });
    
    // Select type from menu
    await this.page.getByTestId("menu-option-note").click();

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
      
      // Filtrar por tipo 'note' e pegar a que não tem _testCreationId
      const targetShape = shapes
        .filter((s: any) => s.type === 'note')
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
