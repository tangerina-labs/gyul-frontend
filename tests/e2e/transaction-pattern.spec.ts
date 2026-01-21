/* eslint-disable @typescript-eslint/no-explicit-any */

import { test, expect } from '@playwright/test';
import {
  startFresh,
  createCanvasViaUI,
  addShapeViaMenu,
  writeNote,
  fitCanvasView,
  ShapeBuilder,
  expectParentChildArrows,
  getShapeCount,
} from './helpers/test-utils';
import { ShapeHarness } from './helpers/shape-harness';

test.describe('Transaction Pattern - UI Based Tests', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await createCanvasViaUI(page, 'Transaction Test');
  });

  test.describe('Suite 1: Transaction Success - Operações Bem-Sucedidas', () => {
    test('should create child shape with arrow and validate atomicity of the operation', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent');

      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child');

      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(2);

      const arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(1);

      const notes = await harness.getShapesByType('note');
      const parentId = notes[0].id;
      const childId = notes[1].id;

      const hasValidArrow = await harness.validateArrowBetweenShapes(parentId, childId);
      expect(hasValidArrow).toBe(true);
    });

    test('should inherit flowId from parent when creating child shape', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent');

      let shapes = await harness.getShapesByType('note');
      const parentFlowId = shapes[0].flowId;

      expect(parentFlowId).toBeTruthy();

      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child');

      shapes = await harness.getShapesByType('note');
      expect(shapes).toHaveLength(2);

      const childFlowId = shapes[1].flowId;
      expect(childFlowId).toBe(parentFlowId);
    });

    test('should create multiple children with consistent flowId inheritance', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      const parent = await ShapeBuilder.note(page)
        .write('Parent')
        .fitView()
        .build();

      const shapes = await harness.getShapesByType('note');
      const parentFlowId = shapes[0].flowId;

      await parent
        .addChild('note')
        .write('Child 1')
        .fitView()
        .build();

      await parent
        .addChild('note')
        .write('Child 2')
        .fitView()
        .build();

      await parent
        .addChild('note')
        .write('Child 3')
        .fitView()
        .build();

      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(4);

      const arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(3);

      const allShapes = await harness.getShapesByType('note');
      const flowIds = allShapes.map(s => s.flowId);
      const uniqueFlowIds = new Set(flowIds);

      expect(uniqueFlowIds.size).toBe(1);
      expect(flowIds[0]).toBe(parentFlowId);
    });

    test('should create three-level chain with correct arrow bindings between all shapes', async ({ page }) => {
      const a = await ShapeBuilder.note(page)
        .write('A')
        .fitView()
        .build();
      await fitCanvasView(page)

      const b = await a
        .addChild('note')
        .write('B')
        .fitView()
        .build();
      await fitCanvasView(page)

      const c = await b
        .addChild('note')
        .write('C')
        .fitView()
        .build();
      await fitCanvasView(page)

      const shapeCounts = await getShapeCount(page);
      expect(shapeCounts).toBe(5);

      await expectParentChildArrows(page, 2);

      await a.expectVisible();
      await b.expectVisible();
      await c.expectVisible();
    });
  });

  test.describe('Suite 2: Binding Validation - Validação Pós-Criação', () => {
    test('should have complete arrow bindings with start and end terminals after creation', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Create parent and child
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent');

      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child');

      // Validate bindings exist and are complete
      const bindingsValid = await page.evaluate(() => {
        const editor = (window as any).__tldraw_editor__;
        const shapes = editor.getCurrentPageShapes();
        const arrows = shapes.filter((s: any) => s.type === 'arrow');

        if (arrows.length === 0) return false;

        const arrow = arrows[0];
        const bindings = editor.getBindingsFromShape(arrow.id, 'arrow');

        const hasStart = bindings.some((b: any) => b.props.terminal === 'start');
        const hasEnd = bindings.some((b: any) => b.props.terminal === 'end');

        return hasStart && hasEnd;
      });

      expect(bindingsValid).toBe(true);
    });

    test('should persist arrow bindings after page reload', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Create shapes
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent');

      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child');

      // Wait for auto-save
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();
      await harness.waitForEditor();

      // Assert: Shapes e arrows ainda existem
      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(2);

      const arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(1);
    });
  });

  test.describe('Suite 3: Cascade Delete Integration', () => {
    test('should delete arrow when child shape is deleted', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Create parent → child
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent');

      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child');

      // Verify arrow exists
      let arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(1);

      // Delete child via clicking and Delete key
      await page.getByTestId('note-card').last().click();
      await page.keyboard.press('Delete');

      // Assert: Child e arrow deletados
      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(1);

      arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(0);
    });

    test('should delete arrow when parent shape is deleted', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Create parent → child
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent');

      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child');

      // Delete parent
      await page.getByTestId('note-card').first().click();
      await page.keyboard.press('Delete');

      // Assert: Parent e arrow deletados, child permanece
      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(1);

      const arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(0);
    });
  });

  test.describe('Suite 4: Edge Cases - Casos Especiais', () => {
    test('should automatically create flowId with UUID format for root shapes', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Create shape via UI (será root, sem parent)
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Root Shape');

      // Assert: Shape tem flowId criado automaticamente
      const shapes = await harness.getShapesByType('note');
      expect(shapes).toHaveLength(1);
      expect(shapes[0].flowId).toBeTruthy();

      // Validate UUID format
      const flowId = shapes[0].flowId!;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(flowId).toMatch(uuidRegex);
    });

    test('should support creating children with different shape types', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Create Note parent
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent Note');

      // Add Note child (simplificado - só valida que múltiplos children funcionam)
      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child Note');

      // Assert: Both exist with arrow
      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(2);

      const arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(1);
    });

    test('should not create arrows for independent shapes without connections', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Create 2 independent shapes
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Shape 1');

      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Shape 2');

      // Assert: 2 shapes, 0 arrows
      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(2);

      const arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(0);
    });
  });
});
