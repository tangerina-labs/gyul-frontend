import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { TLStoreSnapshot } from "tldraw";
import type { AppState, CanvasState } from "../types";
import { createInitialAppState } from "../types";
import {
  addCanvas,
  removeCanvas,
  updateCanvas,
  getCanvas,
  setActiveCanvas,
  isValidAppState,
} from "../services/storageService";

interface AppStore {
  // State
  state: AppState;

  // Canvas Actions
  createCanvas: (name: string) => string;
  deleteCanvas: (canvasId: string) => void;
  selectCanvas: (canvasId: string | null) => void;

  // Snapshot Actions (for tldraw persistence)
  saveCanvasSnapshot: (canvasId: string, snapshot: TLStoreSnapshot) => void;
  getCanvasById: (canvasId: string) => CanvasState | undefined;
}

export const useAppStore = create<AppStore>()(
  persist(
    immer((set, get) => ({
      state: createInitialAppState(),

      createCanvas: (name: string) => {
        let canvasId = "";
        set((draft) => {
          const result = addCanvas(draft.state as AppState, name);
          (draft as { state: AppState }).state = result.newState;
          canvasId = result.canvasId;
        });
        return canvasId;
      },

      deleteCanvas: (canvasId: string) => {
        set((draft) => {
          (draft as { state: AppState }).state = removeCanvas(
            draft.state as AppState,
            canvasId
          );
        });
      },

      selectCanvas: (canvasId: string | null) => {
        set((draft) => {
          (draft as { state: AppState }).state = setActiveCanvas(
            draft.state as AppState,
            canvasId
          );
        });
      },

      saveCanvasSnapshot: (canvasId: string, snapshot: TLStoreSnapshot) => {
        set((draft) => {
          (draft as { state: AppState }).state = updateCanvas(
            draft.state as AppState,
            canvasId,
            { snapshot }
          );
        });
      },

      getCanvasById: (canvasId: string) => {
        return getCanvas(get().state, canvasId);
      },
    })),
    {
      name: "gyul-state",
      // Only persist the 'state' property
      partialize: (state) => ({ state: state.state }),
      // Validate loaded state
      onRehydrateStorage: () => (state) => {
        if (state && !isValidAppState(state.state)) {
          console.warn("Invalid state loaded from localStorage, using initial state");
          state.state = createInitialAppState();
        }
      },
    }
  )
);
