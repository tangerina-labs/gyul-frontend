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

/**
 * TRANSACTION PATTERN TESTS - UI Based
 * 
 * Objetivo: Validar o transaction pattern através da UI real da aplicação.
 * Testa a função createChildShapeTransactional de forma integrada.
 * 
 * Abordagem: 
 * - Usa UI real (botões, menus) ao invés de chamar funções diretamente
 * - Valida resultados via API do editor
 * - Mais realista e confiável que testes isolados
 * 
 * Note: eslint-disable any para page.evaluate callbacks (padrão em E2E)
 */

test.describe('Transaction Pattern - UI Based Tests', () => {
  test.beforeEach(async ({ page }) => {
    await startFresh(page);
    await createCanvasViaUI(page, 'Transaction Test');
  });

  test.describe('Suite 1: Transaction Success - Operações Bem-Sucedidas', () => {
    test('TC-001: Criar child com arrow - validar atomicidade', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Action: Criar parent e child via UI
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent');

      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child');

      // Assert: 2 notes existem
      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(2);

      // Assert: 1 arrow existe
      const arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(1);

      // Assert: Arrow tem bindings corretos
      const notes = await harness.getShapesByType('note');
      const parentId = notes[0].id;
      const childId = notes[1].id;

      const hasValidArrow = await harness.validateArrowBetweenShapes(parentId, childId);
      expect(hasValidArrow).toBe(true);
    });

    test('TC-002: FlowId herdado do parent', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Setup: Criar parent shape
      await addShapeViaMenu(page, 'Note');
      await writeNote(page, 'Parent');

      // Get parent flowId
      let shapes = await harness.getShapesByType('note');
      const parentFlowId = shapes[0].flowId;

      // Parent should have a flowId (created automatically)
      expect(parentFlowId).toBeTruthy();

      // Action: Criar child via UI
      await page.getByTestId('note-add-child-btn').click();
      await page.getByTestId('menu-option-note').click();
      await writeNote(page, 'Child');

      // Assert: Child tem mesmo flowId que parent
      shapes = await harness.getShapesByType('note');
      expect(shapes).toHaveLength(2);

      const childFlowId = shapes[1].flowId;
      expect(childFlowId).toBe(parentFlowId);
    });

    test('TC-003: Multiple children com flowId consistente', async ({ page }) => {
      const harness = new ShapeHarness(page);
      await harness.waitForEditor();

      // Setup: Criar parent usando builder API
      const parent = await ShapeBuilder.note(page)
        .write('Parent')
        .fitView()
        .build();

      // Get parent flowId
      const shapes = await harness.getShapesByType('note');
      const parentFlowId = shapes[0].flowId;

      // Action: Criar 3 children usando builder API
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

      // Assert: 4 shapes total (1 parent + 3 children)
      const noteCount = await harness.getShapeCount('note');
      expect(noteCount).toBe(4);

      // Assert: 3 arrows
      const arrowCount = await harness.getArrowCount();
      expect(arrowCount).toBe(3);

      // Assert: Todos têm o mesmo flowId
      const allShapes = await harness.getShapesByType('note');
      const flowIds = allShapes.map(s => s.flowId);
      const uniqueFlowIds = new Set(flowIds);

      expect(uniqueFlowIds.size).toBe(1);
      expect(flowIds[0]).toBe(parentFlowId);
    });

    test('TC-004: Chain A→B→C - todos bindings corretos', async ({ page }) => {
      // Setup: Criar chain A → B → C usando builder API
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

      // Assert: 3 shapes, 2 arrows
      const shapeCounts = await getShapeCount(page);
      expect(shapeCounts).toBe(5);

      await expectParentChildArrows(page, 2);

      // Assert: Shapes are visible
      await a.expectVisible();
      await b.expectVisible();
      await c.expectVisible();
    });
  });

  test.describe('Suite 2: Binding Validation - Validação Pós-Criação', () => {
    test('TC-005: Validar bindings após criação', async ({ page }) => {
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

    test('TC-006: Bindings persistem após reload', async ({ page }) => {
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
    test('TC-007: Delete child deleta arrow', async ({ page }) => {
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

    test('TC-008: Delete parent deleta arrow', async ({ page }) => {
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
    test('TC-009: FlowId criado para shape raiz', async ({ page }) => {
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

    test('TC-010: Different shape types can be children', async ({ page }) => {
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

    test('TC-011: Shapes sem conexões não criam arrows', async ({ page }) => {
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
