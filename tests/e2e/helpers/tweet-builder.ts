import type { Page } from "@playwright/test";
import type { TweetBuilder as ITweetBuilder, BuilderState } from "./shape-builder-types";
import { ShapeHandle, getShapeIdByTestCreationId, getTestIdFromType } from "./shape-handle";
import {
  addShapeViaMenu,
  loadTweet,
  loadTweetViaEnter,
  fitCanvasView,
} from "./test-utils";

/**
 * Builder for creating Tweet shapes with fluent API
 */
export class TweetBuilder implements ITweetBuilder {
  private url?: string;
  private useEnter = false;
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
    this.creationId = crypto.randomUUID();
    
    if (parentId && parentTestId) {
      this.state.isChild = true;
      this.state.parentId = parentId;
      this.parentTestId = parentTestId;
      this.parentLocator = parentLocator;
    }
  }

  /**
   * Load a tweet from the given URL by clicking the submit button
   */
  loadUrl(url: string): this {
    this.assertNotBuilt();
    this.url = url;
    this.useEnter = false;
    return this;
  }

  /**
   * Load a tweet from the given URL by pressing Enter
   */
  loadUrlViaEnter(url: string): this {
    this.assertNotBuilt();
    this.url = url;
    this.useEnter = true;
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

    if (this.state.isChild && this.state.parentId) {
      await this.performChildCreation();
    } else {
      await addShapeViaMenu(this.page, "Tweet", this.state.position);
    }

    await this.injectTestMetadata();

    const shapeId = await getShapeIdByTestCreationId(this.page, this.creationId);
    const testId = getTestIdFromType("tweet");
    const specificLocator = this.page.locator(`[data-testid="${testId}"][data-shape-id="${shapeId}"]`);

    if (this.url) {
      if (this.useEnter) {
        await loadTweetViaEnter(this.page, this.url, specificLocator);
      } else {
        await loadTweet(this.page, this.url, specificLocator);
      }
    }

    if (this.state.shouldFitView) {
      await fitCanvasView(this.page);
    }

    if (this.state.isChild) {
      await this.page.waitForTimeout(200);
    }

    return new ShapeHandle({
      id: shapeId,
      testId,
      type: "tweet",
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
    
    const parentCard = this.parentLocator || this.page.getByTestId(this.parentTestId);
    await parentCard.scrollIntoViewIfNeeded();
    await parentCard.waitFor({ state: "visible" });
    
    await parentCard.click();
    await this.page.waitForTimeout(100);

    const addChildBtnId = this.parentTestId.replace("-card", "-add-child-btn");
    const addChildBtn = parentCard.getByTestId(addChildBtnId);
    await addChildBtn.waitFor({ state: "visible" });
    await addChildBtn.click({ force: true });

    await this.page.getByTestId("shape-type-menu").waitFor({ state: "visible" });
    await this.page.getByTestId("menu-option-tweet").click();
    await this.page.getByTestId("shape-type-menu").waitFor({ state: "hidden" });
    await this.page.waitForTimeout(300);
  }

  private async injectTestMetadata(): Promise<void> {
    await this.page.evaluate((creationId) => {
      const editor = (window as any).__tldraw_editor__;
      if (!editor) return;
      
      const shapes = editor.getCurrentPageShapes();
      
      const targetShape = shapes
        .filter((s: any) => s.type === 'tweet')
        .find((s: any) => !s.meta?._testCreationId);
      
      if (!targetShape) {
        console.warn('No target shape found for test metadata injection');
        return;
      }
      
      editor.updateShape({
        id: targetShape.id,
        type: targetShape.type,
        meta: {
          ...targetShape.meta,
          _testCreationId: creationId,
        },
      });
    }, this.creationId);
    
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
