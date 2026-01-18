import { expect, type Page, type Locator } from "@playwright/test";
import type {
  ShapeHandle as IShapeHandle,
  ShapeHandleConfig,
  TweetBuilder,
  QuestionBuilder,
  NoteBuilder,
  StorageShapeRecord,
} from "./shape-builder-types";
import type { ShapeType } from "../../../src/types/shapes";
import { getParentChildArrowCount } from "./test-utils";

// Import builder classes to avoid circular dependency issues
import { TweetBuilder as TweetBuilderImpl } from "./tweet-builder";
import { QuestionBuilder as QuestionBuilderImpl } from "./question-builder";
import { NoteBuilder as NoteBuilderImpl } from "./note-builder";

/**
 * Concrete implementation of ShapeHandle.
 * Represents a created shape and provides methods for interaction and assertion.
 */
export class ShapeHandle implements IShapeHandle {
  readonly id: string;
  readonly testId: string;
  readonly type: ShapeType;
  readonly locator: Locator;
  readonly page: Page;

  constructor(config: ShapeHandleConfig) {
    this.id = config.id;
    this.testId = config.testId;
    this.type = config.type;
    this.locator = config.locator;
    this.page = config.page;
  }

  /**
   * Create a child shape of the specified type.
   * This method handles the UI interaction of clicking the add-child button
   * and selecting the type from the menu.
   */
  addChild(type: "tweet"): TweetBuilder;
  addChild(type: "question"): QuestionBuilder;
  addChild(type: "note"): NoteBuilder;
  addChild(type: string): TweetBuilder | QuestionBuilder | NoteBuilder {
    // Create the appropriate builder based on type
    let builder: TweetBuilderImpl | QuestionBuilderImpl | NoteBuilderImpl;
    
    switch (type.toLowerCase()) {
      case "tweet":
        builder = new TweetBuilderImpl(this.page, this.id, this.testId);
        break;
      case "question":
        builder = new QuestionBuilderImpl(this.page, this.id, this.testId);
        break;
      case "note":
        builder = new NoteBuilderImpl(this.page, this.id, this.testId);
        break;
      default:
        throw new Error(`Unknown shape type: ${type}`);
    }

    return builder;
  }

  /**
   * Select this shape (click on it)
   */
  async select(): Promise<void> {
    await this.locator.click();
  }

  /**
   * Click on this shape
   */
  async click(): Promise<void> {
    await this.locator.click();
  }

  /**
   * Delete this shape using keyboard shortcut
   */
  async delete(): Promise<void> {
    await this.locator.click();
    await this.page.keyboard.press("Delete");
    await this.page.waitForTimeout(300);
  }

  /**
   * Assert that this shape is visible in the DOM
   */
  async expectVisible(): Promise<void> {
    await expect(this.locator).toBeVisible();
  }

  /**
   * Assert that this shape is not visible in the DOM
   */
  async expectNotVisible(): Promise<void> {
    await expect(this.locator).not.toBeVisible();
  }

  /**
   * Assert that this shape has a parent arrow connecting to it
   */
  async expectHasParentArrow(): Promise<void> {
    const storageData = await this.page.evaluate(() =>
      localStorage.getItem("gyul-state")
    );

    if (!storageData) {
      throw new Error("No storage data found");
    }

    const parsed = JSON.parse(storageData);
    const snapshot = parsed.state.state.canvases[0]?.snapshot;

    if (!snapshot) {
      throw new Error("No canvas snapshot found");
    }

    interface ArrowRecord {
      typeName?: string;
      type?: string;
      meta?: {
        isParentChildConnection?: boolean;
        childId?: string;
      };
      props?: {
        end?: {
          boundShapeId?: string;
        };
      };
    }

    const arrows = Object.values(snapshot.store as ArrowRecord[]).filter(
      (r) =>
        r.typeName === "shape" &&
        r.type === "arrow" &&
        r.meta?.isParentChildConnection === true
    );

    const hasParentArrow = arrows.some(
      (arrow) =>
        arrow.meta?.childId === this.id ||
        arrow.props?.end?.boundShapeId === this.id
    );

    expect(hasParentArrow).toBe(true);
  }

  /**
   * Assert that this shape has a specific number of children
   */
  async expectChildCount(count: number): Promise<void> {
    const storageData = await this.page.evaluate(() =>
      localStorage.getItem("gyul-state")
    );

    if (!storageData) {
      throw new Error("No storage data found");
    }

    const parsed = JSON.parse(storageData);
    const snapshot = parsed.state.state.canvases[0]?.snapshot;

    if (!snapshot) {
      throw new Error("No canvas snapshot found");
    }

    interface ArrowRecord {
      typeName?: string;
      type?: string;
      meta?: {
        isParentChildConnection?: boolean;
        parentId?: string;
      };
      props?: {
        start?: {
          boundShapeId?: string;
        };
      };
    }

    const arrows = Object.values(snapshot.store as ArrowRecord[]).filter(
      (r) =>
        r.typeName === "shape" &&
        r.type === "arrow" &&
        r.meta?.isParentChildConnection === true
    );

    const childArrows = arrows.filter(
      (arrow) =>
        arrow.meta?.parentId === this.id ||
        arrow.props?.start?.boundShapeId === this.id
    );

    expect(childArrows.length).toBe(count);
  }
}

/**
 * Helper function to get the latest shape ID of a specific type from localStorage.
 * Used by builders after creating a shape to get its tldraw ID.
 * Includes retry logic to wait for localStorage to be updated.
 */
export async function getLatestShapeId(
  page: Page,
  type: ShapeType
): Promise<string> {
  // Retry up to 10 times with 100ms intervals (1 second total)
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const storageData = await page.evaluate(() =>
      localStorage.getItem("gyul-state")
    );

    if (!storageData) {
      attempts++;
      await page.waitForTimeout(100);
      continue;
    }

    const parsed = JSON.parse(storageData);
    const snapshot = parsed.state.state.canvases[0]?.snapshot;

    if (!snapshot) {
      attempts++;
      await page.waitForTimeout(100);
      continue;
    }

    const shapes = (Object.values(snapshot.store) as StorageShapeRecord[])
      .filter((r) => r.typeName === "shape" && r.type === type)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // DEBUG LOGS
    console.log(`\n=== DEBUG getLatestShapeId for type: ${type} ===`);
    console.log(`Found ${shapes.length} shape(s) of type '${type}'`);
    shapes.forEach((s, i) => {
      console.log(`  Shape ${i + 1}:`);
      console.log(`    id: ${s.id}`);
      console.log(`    createdAt: ${s.createdAt}`);
      console.log(`    type: ${s.type}`);
    });
    console.log(`Returning: ${shapes[0]?.id}`);
    console.log('=== END DEBUG ===\n');

    if (shapes.length === 0) {
      attempts++;
      await page.waitForTimeout(100);
      continue;
    }

    const shapeId = shapes[0].id;
    if (!shapeId) {
      attempts++;
      await page.waitForTimeout(100);
      continue;
    }

    return shapeId;
  }
  
  throw new Error(`Failed to find shape of type '${type}' in storage after ${maxAttempts} attempts`);
}

/**
 * Helper to get shape test-id from type
 */
export function getTestIdFromType(type: ShapeType): string {
  return `${type}-card`;
}
