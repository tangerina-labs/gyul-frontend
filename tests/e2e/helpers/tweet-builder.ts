import type { Page } from "@playwright/test";
import type { TweetBuilder as ITweetBuilder, BuilderState } from "./shape-builder-types";
import { ShapeHandle, getLatestShapeId, getTestIdFromType } from "./shape-handle";
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
    if (parentId && parentTestId) {
      this.state.isChild = true;
      this.state.parentId = parentId;
      this.parentTestId = parentTestId;
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

    // If this is a child, perform the UI clicks to create it
    if (this.state.isChild && this.state.parentId) {
      await this.performChildCreation();
    } else {
      // Create the shape via menu
      await addShapeViaMenu(this.page, "Tweet", this.state.position);
    }

    // Load tweet if URL provided
    if (this.url) {
      if (this.useEnter) {
        await loadTweetViaEnter(this.page, this.url);
      } else {
        await loadTweet(this.page, this.url);
      }
    }

    // Fit view if requested
    if (this.state.shouldFitView) {
      await fitCanvasView(this.page);
    }

    // Get the tldraw shape ID
    const shapeId = await getLatestShapeId(this.page, "tweet");
    const testId = getTestIdFromType("tweet");

    // If this was a child, wait a bit more for arrow creation
    if (this.state.isChild) {
      await this.page.waitForTimeout(200);
    }

    // Return handle
    return new ShapeHandle({
      id: shapeId,
      testId,
      type: "tweet",
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
    await this.page.getByTestId("menu-option-tweet").click();

    // Wait for menu to close and shape to be created
    await this.page.getByTestId("shape-type-menu").waitFor({ state: "hidden" });
    await this.page.waitForTimeout(300);
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
