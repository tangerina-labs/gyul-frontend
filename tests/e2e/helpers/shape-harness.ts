/* eslint-disable @typescript-eslint/no-explicit-any */

import { type Page } from '@playwright/test';
import type { ShapeType } from '../../../src/types/shapes';

/**
 * Shape Harness - Page Object for shape interactions
 * 
 * Provides high-level methods to interact with shapes in the canvas,
 * abstracting away the details of UI interactions.
 * 
 * Note: eslint-disable any for page.evaluate callbacks (standard in E2E)
 */
export class ShapeHarness {
  constructor(private page: Page) {}

  /**
   * Creates a new shape and returns information about it.
   */
  async createShape(type: ShapeType, content?: string): Promise<{
    type: ShapeType;
    content?: string;
  }> {
    // Click toolbar to add shape
    await this.page.getByTestId('add-shape-button').click();
    await this.page.getByTestId(`menu-option-${type}`).click();

    // Fill content if provided
    if (content) {
      const testId = `${type}-content`;
      await this.page.getByTestId(testId).last().fill(content);
    }

    return { type, content };
  }

  /**
   * Adds a child shape to a parent shape via the add-child button.
   */
  async addChildToShape(
    parentType: ShapeType,
    childType: ShapeType,
    childContent?: string
  ): Promise<void> {
    // Click add child button on parent
    const addChildBtn = this.page.getByTestId(`${parentType}-add-child-btn`).last();
    await addChildBtn.click();

    // Select child type from menu
    await this.page.getByTestId(`menu-option-${childType}`).click();

    // Fill child content if provided
    if (childContent) {
      const testId = `${childType}-content`;
      await this.page.getByTestId(testId).last().fill(childContent);
    }

    // Wait for shape to be created
    await this.page.waitForTimeout(100);
  }

  /**
   * Gets shape count by type.
   */
  async getShapeCount(type: ShapeType): Promise<number> {
    return await this.page.evaluate((shapeType) => {
      const editor = (window as any).__tldraw_editor__;
      if (!editor) return 0;

      const shapes = editor.getCurrentPageShapes();
      return shapes.filter((s: any) => s.type === shapeType).length;
    }, type);
  }

  /**
   * Gets all shapes of a specific type with their properties.
   */
  async getShapesByType(type: ShapeType): Promise<Array<{
    id: string;
    flowId?: string;
    text?: string;
  }>> {
    return await this.page.evaluate((shapeType) => {
      const editor = (window as any).__tldraw_editor__;
      if (!editor) return [];

      const shapes = editor.getCurrentPageShapes();
      return shapes
        .filter((s: any) => s.type === shapeType)
        .map((s: any) => ({
          id: s.id,
          flowId: s.props.flowId,
          text: s.props.text || '',
        }));
    }, type);
  }

  /**
   * Gets arrow count (parent-child connections).
   */
  async getArrowCount(): Promise<number> {
    return await this.page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      if (!editor) return 0;

      const shapes = editor.getCurrentPageShapes();
      const arrows = shapes.filter((s: any) => s.type === 'arrow');
      
      // Count arrows with valid bindings
      return arrows.filter((arrow: any) => {
        const bindings = editor.getBindingsFromShape(arrow.id, 'arrow');
        const hasStart = bindings.some((b: any) => b.props.terminal === 'start');
        const hasEnd = bindings.some((b: any) => b.props.terminal === 'end');
        return hasStart && hasEnd;
      }).length;
    });
  }

  /**
   * Validates that an arrow exists between two shapes with correct bindings.
   */
  async validateArrowBetweenShapes(
    parentId: string,
    childId: string
  ): Promise<boolean> {
    return await this.page.evaluate(
      ([pId, cId]) => {
        const editor = (window as any).__tldraw_editor__;
        if (!editor) return false;

        const shapes = editor.getCurrentPageShapes();
        const arrows = shapes.filter((s: any) => s.type === 'arrow');

        // Find arrow connecting parent to child
        for (const arrow of arrows) {
          const bindings = editor.getBindingsFromShape(arrow.id, 'arrow');
          
          const startBinding = bindings.find((b: any) => b.props.terminal === 'start');
          const endBinding = bindings.find((b: any) => b.props.terminal === 'end');

          if (startBinding?.toId === pId && endBinding?.toId === cId) {
            return true;
          }
        }

        return false;
      },
      [parentId, childId] as const
    );
  }

  /**
   * Gets all shapes with their flowId for validation.
   */
  async getAllShapesWithFlowId(): Promise<Array<{
    id: string;
    type: string;
    flowId?: string;
  }>> {
    return await this.page.evaluate(() => {
      const editor = (window as any).__tldraw_editor__;
      if (!editor) return [];

      const shapes = editor.getCurrentPageShapes();
      return shapes
        .filter((s: any) => s.type !== 'arrow')
        .map((s: any) => ({
          id: s.id,
          type: s.type,
          flowId: s.props.flowId,
        }));
    });
  }

  /**
   * Validates that all shapes in a group have the same flowId.
   */
  async validateFlowIdConsistency(expectedFlowId: string): Promise<boolean> {
    const shapes = await this.getAllShapesWithFlowId();
    
    if (shapes.length === 0) return false;
    
    return shapes.every(shape => shape.flowId === expectedFlowId);
  }

  /**
   * Waits for editor to be ready.
   */
  async waitForEditor(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const editor = (window as any).__tldraw_editor__;
        return editor !== undefined;
      },
      { timeout: 5000 }
    );
    
    // Extra safety
    await this.page.waitForTimeout(100);
  }
}
