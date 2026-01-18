import type { Page, Locator } from "@playwright/test";
import type { ShapeType } from "../../../src/types/shapes";

/**
 * Configuration for creating a ShapeHandle
 */
export interface ShapeHandleConfig {
  id: string;
  testId: string;
  type: ShapeType;
  page: Page;
  locator: Locator;
}

/**
 * A handle representing a created shape on the canvas.
 * Provides access to the tldraw shape ID, DOM locator, and methods
 * for creating children and performing actions/assertions.
 */
export interface ShapeHandle {
  /** Tldraw internal shape ID */
  readonly id: string;
  
  /** data-testid value for the shape card */
  readonly testId: string;
  
  /** Shape type */
  readonly type: ShapeType;
  
  /** Playwright locator for DOM interactions */
  readonly locator: Locator;
  
  /** Playwright page instance */
  readonly page: Page;
  
  // Child creation methods (return type-specific builders)
  addChild(type: "tweet"): TweetBuilder;
  addChild(type: "question"): QuestionBuilder;
  addChild(type: "note"): NoteBuilder;
  
  // Actions
  select(): Promise<void>;
  delete(): Promise<void>;
  click(): Promise<void>;
  
  // Assertions
  expectVisible(): Promise<void>;
  expectNotVisible(): Promise<void>;
  expectHasParentArrow(): Promise<void>;
  expectChildCount(count: number): Promise<void>;
}

/**
 * Base builder interface that all shape builders must implement
 */
export interface BaseBuilder<T extends ShapeHandle> {
  /**
   * Execute all queued operations and return a handle to the created shape
   */
  build(): Promise<T>;
  
  /**
   * Fit the canvas view after shape creation
   */
  fitView(): this;
  
  /**
   * Position the shape at specific coordinates
   */
  atPosition(x: number, y: number): this;
}

/**
 * Builder for creating Tweet shapes
 */
export interface TweetBuilder extends BaseBuilder<ShapeHandle> {
  /**
   * Load a tweet from the given URL
   */
  loadUrl(url: string): this;
  
  /**
   * Load tweet using Enter key instead of clicking submit
   */
  loadUrlViaEnter(url: string): this;
}

/**
 * Builder for creating Question shapes
 */
export interface QuestionBuilder extends BaseBuilder<ShapeHandle> {
  /**
   * Submit a question and wait for AI response
   */
  submit(question: string): this;
  
  /**
   * Submit question using Enter key
   */
  submitViaEnter(question: string): this;
  
  /**
   * Skip waiting for AI response (for testing empty state)
   */
  skipAiWait(): this;
}

/**
 * Builder for creating Note shapes
 */
export interface NoteBuilder extends BaseBuilder<ShapeHandle> {
  /**
   * Write content to the note and finalize it
   */
  write(content: string): this;
}

/**
 * Internal state tracking for builders
 */
export interface BuilderState {
  isChild: boolean;
  parentId?: string;
  position: { x: number; y: number };
  shouldFitView: boolean;
  hasBuilt: boolean;
}

/**
 * Shape record structure from localStorage
 */
export interface StorageShapeRecord {
  id?: string;
  typeName?: string;
  type?: string;
  createdAt?: number;
  props?: {
    flowId?: string;
    [key: string]: unknown;
  };
  meta?: {
    isParentChildConnection?: boolean;
    parentId?: string;
    childId?: string;
    [key: string]: unknown;
  };
}
