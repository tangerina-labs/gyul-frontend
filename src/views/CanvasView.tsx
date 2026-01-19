/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useCallback } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Tldraw,
  type Editor,
  type TLComponents,
  type TLCameraOptions,
} from "tldraw";
import "tldraw/tldraw.css";
import { useAppStore } from "../stores/appStore";
import { CanvasUI } from "../components/canvas/CanvasUI";
import { customShapeUtils } from "../shapes";
import { deleteShapesWithArrows } from "../utils/shapeDelete";

// Hide unnecessary tldraw UI components and add custom UI
const components: TLComponents = {
  Toolbar: null,
  PageMenu: null,
  StylePanel: null,
  ActionsMenu: null,
  ZoomMenu: null,
  NavigationPanel: null,
  HelpMenu: null,
  MainMenu: null,
  Minimap: null,
  DebugMenu: null,
  DebugPanel: null,
  QuickActions: null,
  KeyboardShortcutsDialog: null,
  // Custom UI with toolbox and empty hint
  InFrontOfTheCanvas: CanvasUI,
};

// Custom zoom limits (0.25x - 2x)
const cameraOptions: TLCameraOptions = {
  isLocked: false,
  wheelBehavior: "zoom",
  zoomSpeed: 1,
  zoomSteps: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  panSpeed: 1,
  constraints: {
    initialZoom: "default",
    baseZoom: "default",
    bounds: { x: 0, y: 0, w: 0, h: 0 },
    behavior: "free",
    origin: { x: 0.5, y: 0.5 },
    padding: { x: 0, y: 0 },
  },
};

/**
 * Creates action overrides for cascade delete functionality.
 * This properly intercepts tldraw's delete actions and replaces them with cascade delete.
 */
function createCascadeDeleteOverrides() {
  return {
    actions(_editor: Editor, actions: any) {
      // Override the delete action to use cascade delete
      return {
        ...actions,
        'delete': {
          ...actions['delete'],
          onSelect(source: any) {
            const selectedIds = _editor.getSelectedShapeIds()
            if (selectedIds.length > 0) {
              // Use cascade delete instead of default delete
              deleteShapesWithArrows(_editor, selectedIds)
            }
          },
        },
      }
    },
  }
}

export function CanvasView() {
  const { id } = useParams({ from: "/canvas/$id" });
  const navigate = useNavigate();
  const saveCanvasSnapshot = useAppStore((state) => state.saveCanvasSnapshot);
  
  // Select canvas directly from Zustand state (auto-hydrated from localStorage)
  const canvas = useAppStore((state) => state.state.canvases.find(c => c.id === id));

  // Redirect if canvas doesn't exist
  useEffect(() => {
    if (!canvas) {
      console.log("Canvas not found, redirecting...");
      navigate({ to: "/canvases" });
    }
  }, [canvas, navigate]);

  // Setup handleMount callback - must be before early returns
  const handleMount = useCallback(
    (editor: Editor) => {
      console.log("called");
      // Expose editor for E2E tests
      if (typeof window !== "undefined") {
        (window as Window & { __tldraw_editor__?: Editor }).__tldraw_editor__ =
          editor;
      }

      // Configure custom zoom limits (0.25x - 2x)
      editor.setCameraOptions({
        ...cameraOptions,
        zoomSteps: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      });

      // Load snapshot if exists
      if (canvas?.snapshot) {
        editor.store.loadStoreSnapshot(canvas?.snapshot);
      }

      // Disable arrow selection (arrows are visual only)
      editor.sideEffects.registerBeforeChangeHandler("shape", (prev, next) => {
        // If trying to select an arrow, prevent it
        if (
          next.type === "arrow" &&
          editor.getSelectedShapeIds().includes(next.id)
        ) {
          editor.setSelectedShapes([]);
          return prev;
        }
        return next;
      });

      // Auto-save on changes
      const unsubscribe = editor.store.listen(
        () => {
          const snapshot = editor.store.getStoreSnapshot();
          saveCanvasSnapshot(id, snapshot);
        },
        { source: "user", scope: "document" }
      );

      return () => {
        unsubscribe();
        
        // Clean up global reference
        if (typeof window !== "undefined") {
          delete (window as Window & { __tldraw_editor__?: Editor })
            .__tldraw_editor__;
        }
      };
    },
    [canvas?.snapshot, id, saveCanvasSnapshot]
  );

  const handleBack = useCallback(() => {
    navigate({ to: "/canvases" });
  }, [navigate]);

  // TypeScript safety check - this should never happen due to redirect above
  if (!canvas) {
    return null;
  }

  return (
    <div className="relative h-screen w-screen" data-testid="canvas-view">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-md transition-shadow hover:shadow-lg"
        data-testid="back-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span className="text-sm font-medium" data-testid="canvas-title">
          {canvas.name}
        </span>
      </button>

      {/* tldraw Canvas */}
      <Tldraw
        onMount={handleMount}
        components={components}
        cameraOptions={cameraOptions}
        shapeUtils={customShapeUtils}
        overrides={createCascadeDeleteOverrides()}
      />
    </div>
  );
}
