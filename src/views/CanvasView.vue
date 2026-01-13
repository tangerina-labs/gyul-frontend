<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  VueFlow,
  useVueFlow,
  applyEdgeChanges,
  ConnectionMode
} from "@vue-flow/core";
import type { EdgeChange, NodeDragEvent } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";

import type { NodeType, CanvasState, CustomNode, CustomEdge } from "@/types";
import { useStorage } from "@/composables/useStorage";
import {
  cleanNodeForStorage,
  cleanEdgeForStorage,
} from "@/services/storageService";
import {
  findFreePosition,
  countChildren,
  getChildOffset,
  getNodeSize,
  INITIAL_ZOOM_EMPTY,
  PAN_DURATION,
} from "@/composables/useNodePositioning";
import { getAnimationDuration } from "@/utils/timing";

import TweetNode from "@/components/nodes/TweetNode.vue";
import QuestionNode from "@/components/nodes/QuestionNode.vue";
import NoteNode from "@/components/nodes/NoteNode.vue";
import NodeTypeMenu from "@/components/canvas/NodeTypeMenu.vue";
import CanvasControls from "@/components/canvas/CanvasControls.vue";
import CanvasToolbox from "@/components/canvas/CanvasToolbox.vue";
import { useCanvasMode } from "@/composables/useCanvasMode";

const router = useRouter();
const route = useRoute();

const canvasId = computed(() => route.params.id as string);

const { getCanvasById, saveCanvasState } = useStorage();

const initialCanvas = computed(() => {
  return getCanvasById(canvasId.value) ?? createEmptyCanvasState();
});

function createEmptyCanvasState(): CanvasState {
  return {
    id: canvasId.value,
    name: "Novo Canvas",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  };
}

const edges = ref<CustomEdge[]>([...initialCanvas.value.edges]);

/**
 * Local nodes ref for controlled mode.
 * This ensures proper synchronization between Vue reactivity and VueFlow's drag handlers.
 */
const localNodes = ref<CustomNode[]>([...initialCanvas.value.nodes]);

const flowId = `canvas-${canvasId.value}`;
const {
  addNodes,
  removeNodes,
  updateNode,
  getNode,
  fitView: vueFlowFitView,
  zoomIn,
  zoomOut,
  setViewport,
  setCenter,
  getViewport,
  project,
} = useVueFlow({ id: flowId });

/**
 * Alias for compatibility with existing code that uses 'nodes'.
 */
const nodes = localNodes;

const { isCreating, enterCreateMode, exitCreateMode } = useCanvasMode();

function getNodeDimensions(
  nodeId: string
): { width: number; height: number } | null {
  const node = getNode.value(nodeId);
  if (!node?.dimensions?.width || !node?.dimensions?.height) {
    return null;
  }
  return {
    width: node.dimensions.width,
    height: node.dimensions.height,
  };
}

/**
 * Watch for changes to persist canvas state.
 * With v-model:nodes, VueFlow directly updates the nodes ref when dragging,
 * so this watch captures all position changes automatically.
 */
watch(
  [nodes, edges],
  () => {
    const cleanNodes = nodes.value.map((n) =>
      cleanNodeForStorage(n as unknown as CustomNode)
    );
    const cleanEdges = edges.value.map((e) =>
      cleanEdgeForStorage(e as unknown as CustomEdge)
    );
    saveCanvasState(canvasId.value, cleanNodes, cleanEdges);
  },
  { deep: true }
);

function isRootNode(nodeId: string): boolean {
  return !edges.value.some((e) => e.target === nodeId);
}

/**
 * Calculates the highlighted branch based on selected node.
 * Root nodes do NOT activate highlight since they have no ancestors to show.
 */
const highlightedBranch = computed(() => {
  const selectedNode = nodes.value.find(
    (n) => (n as unknown as { selected?: boolean }).selected
  );
  if (!selectedNode) {
    return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };
  }

  const nodeId = selectedNode.id;

  if (isRootNode(nodeId)) {
    return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };
  }

  const ancestorNodes = getAncestors(nodeId);
  const ancestorIds = ancestorNodes.map((n) => n.id);
  const descendantIds = getDescendants(nodeId);

  const nodeIds = new Set([nodeId, ...ancestorIds, ...descendantIds]);

  const edgeIds = new Set(
    edges.value
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => e.id)
  );

  return { nodeIds, edgeIds };
});

const edgesWithHighlight = computed(() => {
  const { edgeIds } = highlightedBranch.value;
  const hasHighlight = edgeIds.size > 0;

  return edges.value.map((edge) => ({
    ...edge,
    class: hasHighlight
      ? edgeIds.has(edge.id)
        ? "edge-highlighted"
        : "edge-faded"
      : "",
  }));
});

/**
 * Watch for node highlighting and update node classes.
 * We modify the class property directly on VueFlow's internal nodes
 * to avoid creating new object references that could break drag state.
 */
watch(
  highlightedBranch,
  ({ nodeIds }) => {
    const hasHighlight = nodeIds.size > 0;
    nodes.value.forEach((node) => {
      const shouldFade = hasHighlight && !nodeIds.has(node.id);
      if (node.class !== (shouldFade ? "node-faded" : "")) {
        node.class = shouldFade ? "node-faded" : "";
      }
    });
  },
  { immediate: true }
);

function onEdgesChange(changes: EdgeChange[]) {
  edges.value = applyEdgeChanges(changes, edges.value as any) as CustomEdge[];
}

/**
 * Handle node drag stop to explicitly persist position changes.
 * VueFlow updates its internal nodes automatically during drag,
 * but the deep watch might not detect mutations on existing objects.
 * We manually save after drag to ensure persistence.
 */
function onNodeDragStop(_event: NodeDragEvent) {
  // VueFlow has already updated node positions in its internal state
  // Manually save to ensure persistence since watch might not detect mutations
  const cleanNodes = nodes.value.map((n) =>
    cleanNodeForStorage(n as unknown as CustomNode)
  );
  const cleanEdges = edges.value.map((e) =>
    cleanEdgeForStorage(e as unknown as CustomEdge)
  );
  saveCanvasState(canvasId.value, cleanNodes, cleanEdges);
}

import { fetchTweet } from "@/services/tweetService";
import { generateAnswer } from "@/services/aiService";
import type {
  TweetData,
  QuestionData,
  NoteData,
  CustomNodeData,
} from "@/types";

function createNode(
  type: NodeType,
  position: { x: number; y: number },
  parentId?: string
): string {
  const id = `${type}-${Date.now()}`;

  let flowId: string;
  if (parentId) {
    const parentNode = nodes.value.find((n) => n.id === parentId);
    flowId =
      (parentNode?.data as CustomNodeData)?.flowId ?? crypto.randomUUID();
  } else {
    flowId = crypto.randomUUID();
  }

  const dataByType: Record<NodeType, CustomNodeData> = {
    tweet: { type: "tweet", flowId, url: "", status: "empty" },
    question: {
      type: "question",
      flowId,
      prompt: "",
      response: null,
      status: "draft",
    },
    note: { type: "note", flowId, content: "", isEditing: true },
  };

  const node: CustomNode = {
    id,
    type,
    position,
    data: dataByType[type],
  };

  addNodes([node]);

  if (parentId) {
    const newEdge: CustomEdge = {
      id: `edge-${parentId}-${id}`,
      source: parentId,
      target: id,
    };
    edges.value = [...edges.value, newEdge];
  }

  return id;
}

async function loadTweet(nodeId: string, url: string): Promise<void> {
  const node = nodes.value.find((n) => n.id === nodeId);
  if (!node) return;

  const data = node.data as TweetData;

  updateNode(nodeId, {
    data: { ...data, url, status: "loading" },
  });

  const result = await fetchTweet(url);

  if (result.success && result.data) {
    updateNode(nodeId, {
      data: {
        ...data,
        url,
        status: "loaded",
        author: result.data.author,
        text: result.data.text,
        timestamp: result.data.timestamp,
        error: undefined,
      },
    });
  } else {
    updateNode(nodeId, {
      data: {
        ...data,
        url,
        status: "error",
        error: result.error,
      },
    });
  }
}

async function submitQuestion(nodeId: string, prompt: string): Promise<void> {
  const node = nodes.value.find((n) => n.id === nodeId);
  if (!node) return;

  const data = node.data as QuestionData;

  updateNode(nodeId, {
    data: { ...data, prompt, status: "loading" },
  });

  const ancestors = getAncestors(nodeId);
  const ancestorData = ancestors.map((n) => n.data as CustomNodeData);

  const result = await generateAnswer({ ancestors: ancestorData, prompt });

  updateNode(nodeId, {
    data: {
      ...data,
      prompt,
      response: result.success ? result.content : "Erro ao gerar resposta",
      status: "done",
    },
  });
}

function getAncestors(nodeId: string): CustomNode[] {
  const ancestorIds = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    const parents = edges.value
      .filter((e) => e.target === current)
      .map((e) => e.source);

    for (const parentId of parents) {
      if (!ancestorIds.has(parentId)) {
        ancestorIds.add(parentId);
        stack.push(parentId);
      }
    }
  }

  return nodes.value.filter((n) =>
    ancestorIds.has(n.id)
  ) as unknown as CustomNode[];
}

function getDescendants(nodeId: string): string[] {
  const descendantIds = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    const children = edges.value
      .filter((e) => e.source === current)
      .map((e) => e.target);

    for (const childId of children) {
      if (!descendantIds.has(childId)) {
        descendantIds.add(childId);
        stack.push(childId);
      }
    }
  }

  return Array.from(descendantIds);
}

function updateNote(nodeId: string, content: string): void {
  const node = nodes.value.find((n) => n.id === nodeId);
  if (!node || (node.data as CustomNodeData).type !== "note") return;

  const data = node.data as NoteData;

  updateNode(nodeId, {
    data: { ...data, content },
  });
}

function finalizeNote(nodeId: string, content?: string): void {
  const node = nodes.value.find((n) => n.id === nodeId);
  if (!node || (node.data as CustomNodeData).type !== "note") return;

  const data = node.data as NoteData;
  const finalContent = content !== undefined ? content : data.content;

  if (finalContent.trim() === "") {
    edges.value = edges.value.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );
    removeNodes([nodeId]);
    return;
  }

  updateNode(nodeId, {
    data: { ...data, content: finalContent, isEditing: false },
  });
}

function nodeHasChildren(nodeId: string): boolean {
  return edges.value.some((e) => e.source === nodeId);
}

function deleteNode(nodeId: string): boolean {
  if (nodeHasChildren(nodeId)) return false;

  edges.value = edges.value.filter(
    (e) => e.source !== nodeId && e.target !== nodeId
  );
  removeNodes([nodeId]);
  return true;
}

/**
 * Custom keyboard handler for node deletion.
 * VueFlow's default delete behavior doesn't check for children,
 * so we disable it and implement our own that respects the rule.
 */
function handleKeyboardDelete(event: KeyboardEvent) {
  if (event.key !== "Delete" && event.key !== "Backspace") return;

  // Don't intercept if user is typing in an input/textarea
  const target = event.target as HTMLElement;
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  ) {
    return;
  }

  // Find selected nodes and try to delete them
  const selectedNodes = nodes.value.filter(
    (n) => (n as unknown as { selected?: boolean }).selected
  );

  for (const node of selectedNodes) {
    deleteNode(node.id);
  }
}

const showNodeTypeMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const pendingNodePosition = ref<{ x: number; y: number } | null>(null);
const pendingParentId = ref<string | null>(null);
const canvasContainerRef = ref<HTMLElement | null>(null);

/**
 * Handle pane click - open node type menu ONLY when in creating mode.
 * The create mode is disabled immediately after the click,
 * before the user even selects the node type.
 */
const handlePaneClick = (event: MouseEvent) => {
  if (!isCreating.value) {
    return;
  }

  exitCreateMode();

  const position = project({ x: event.clientX, y: event.clientY });
  pendingNodePosition.value = position;

  menuPosition.value = {
    x: event.clientX + 10,
    y: event.clientY + 10,
  };
  pendingParentId.value = null;
  showNodeTypeMenu.value = true;
};

const handleActivateCreateMode = () => {
  if (isCreating.value) {
    exitCreateMode();
  } else {
    enterCreateMode();
  }
};

const handleNodeTypeSelect = async (type: NodeType) => {
  if (pendingNodePosition.value) {
    const finalPosition = findFreePosition(
      pendingNodePosition.value,
      type,
      nodes.value as CustomNode[],
      undefined,
      getNodeDimensions
    );

    createNode(type, finalPosition, pendingParentId.value ?? undefined);

    await nextTick();
    const nodeSize = getNodeSize(type);
    const centerX = finalPosition.x + nodeSize.width / 2;
    const centerY = finalPosition.y + nodeSize.height / 2;
    const currentZoom = getViewport().zoom;

    setTimeout(() => {
      setCenter(centerX, centerY, {
        zoom: currentZoom,
        duration: PAN_DURATION,
      });
    }, getAnimationDuration('CENTER_DELAY'));
  }
  closeMenu();
};

const handleAddChild = (
  nodeId: string,
  _position: { x: number; y: number }
) => {
  const parentNode = nodes.value.find((n) => n.id === nodeId);
  if (!parentNode) return;

  const existingChildCount = countChildren(nodeId, edges.value);
  const offset = getChildOffset(existingChildCount);

  const childPosition = {
    x: parentNode.position.x + offset.x,
    y: parentNode.position.y + offset.y,
  };

  pendingParentId.value = nodeId;
  pendingNodePosition.value = childPosition;

  const parentElement = document.querySelector(`[data-id="${nodeId}"]`);
  if (parentElement) {
    const rect = parentElement.getBoundingClientRect();
    menuPosition.value = {
      x: rect.right + 20,
      y: rect.bottom,
    };
  } else {
    menuPosition.value = {
      x: childPosition.x + 150,
      y: childPosition.y,
    };
  }

  showNodeTypeMenu.value = true;
};

const closeMenu = () => {
  showNodeTypeMenu.value = false;
  pendingNodePosition.value = null;
  pendingParentId.value = null;
};

const handleMenuMounted = (menuRect: DOMRect) => {
  if (!canvasContainerRef.value) return;

  const containerRect = canvasContainerRef.value.getBoundingClientRect();
  const padding = 20;

  let adjustX = 0;
  let adjustY = 0;

  if (menuRect.right > containerRect.right - padding) {
    adjustX = containerRect.right - padding - menuRect.right;
  }

  if (menuRect.bottom > containerRect.bottom - padding) {
    adjustY = containerRect.bottom - padding - menuRect.bottom;
  }

  if (menuRect.left < containerRect.left + padding) {
    adjustX = containerRect.left + padding - menuRect.left;
  }

  if (menuRect.top < containerRect.top + padding) {
    adjustY = containerRect.top + padding - menuRect.top;
  }

  if (adjustX !== 0 || adjustY !== 0) {
    menuPosition.value = {
      x: menuPosition.value.x + adjustX,
      y: menuPosition.value.y + adjustY,
    };
  }
};

const handleLoadTweet = (nodeId: string, url: string) => {
  loadTweet(nodeId, url);
};

const handleSubmitQuestion = (nodeId: string, prompt: string) => {
  submitQuestion(nodeId, prompt);
};

const handleUpdateNote = (nodeId: string, content: string) => {
  updateNote(nodeId, content);
};

const handleFinalizeNote = (nodeId: string, content: string) => {
  finalizeNote(nodeId, content);
};

const handleDeleteNode = (nodeId: string) => {
  deleteNode(nodeId);
};

const handleZoomIn = () => {
  zoomIn();
};

const handleZoomOut = () => {
  zoomOut();
};

const handleFitView = () => {
  vueFlowFitView({ padding: 0.2 });
};

const defaultEdgeOptions = {
  type: "bezier",
  animated: false,
};

onMounted(async () => {
  // Wait for VueFlow to initialize with the nodes passed via v-model
  await nextTick();

  if (localNodes.value.length > 0) {
    setTimeout(() => {
      vueFlowFitView({ padding: 0.2, duration: PAN_DURATION });
    }, getAnimationDuration('FIT_VIEW_DELAY'));
  } else {
    setViewport({ x: 0, y: 0, zoom: INITIAL_ZOOM_EMPTY });
  }

  // Register custom keyboard handler for deletion
  window.addEventListener("keydown", handleKeyboardDelete);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeyboardDelete);
});
</script>

<template>
  <div class="flex flex-col w-full h-screen bg-gray-50" data-testid="canvas-view">
    <header class="flex items-center gap-4 px-6 py-4 bg-white border-b border-gray-200 z-controls" data-testid="canvas-header">
      <button
        type="button"
        class="flex items-center gap-1 px-4 py-2 bg-transparent border border-gray-200 rounded-lg text-gray-600 text-sm cursor-pointer transition-all duration-fast hover:bg-gray-50 hover:text-gray-900"
        data-testid="canvas-back-btn"
        @click="router.push({ name: 'canvases' })"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <h1 class="text-lg font-semibold text-gray-900" data-testid="canvas-title">
        {{ initialCanvas.name }}
      </h1>
    </header>

    <div
      ref="canvasContainerRef"
      class="flex-1 relative"
      :class="{ 'canvas-creating-mode': isCreating }"
      data-testid="canvas-container"
    >
      <VueFlow
        :id="flowId"
        v-model:nodes="localNodes"
        :edges="edgesWithHighlight"
        :default-edge-options="defaultEdgeOptions"
        :pan-on-drag="true"
        :zoom-on-scroll="true"
        :zoom-on-double-click="false"
        :min-zoom="0.25"
        :max-zoom="2"
        :connect-on-click="false"
        :nodes-connectable="false"
        :edges-connectable="false"
        :connection-mode="ConnectionMode.Loose"
        :delete-key-code="null"
        class="w-full h-full"
        data-testid="vue-flow"
        @edges-change="onEdgesChange"
        @node-drag-stop="onNodeDragStop"
        @pane-click="handlePaneClick"
      >
        <Background :gap="20" :size="1" />

        <CanvasControls
          @zoom-in="handleZoomIn"
          @zoom-out="handleZoomOut"
          @fit-view="handleFitView"
        />

        <CanvasToolbox
          :is-active="isCreating"
          @activate-create-mode="handleActivateCreateMode"
        />

        <template #node-tweet="nodeProps">
          <TweetNode
            v-bind="nodeProps"
            :has-children="nodeHasChildren(nodeProps.id)"
            @load-tweet="(url) => handleLoadTweet(nodeProps.id, url)"
            @add-child="(pos) => handleAddChild(nodeProps.id, pos)"
            @delete="handleDeleteNode(nodeProps.id)"
          />
        </template>

        <template #node-question="nodeProps">
          <QuestionNode
            v-bind="nodeProps"
            :has-children="nodeHasChildren(nodeProps.id)"
            @submit="(prompt) => handleSubmitQuestion(nodeProps.id, prompt)"
            @add-child="(pos) => handleAddChild(nodeProps.id, pos)"
            @delete="handleDeleteNode(nodeProps.id)"
          />
        </template>

        <template #node-note="nodeProps">
          <NoteNode
            v-bind="nodeProps"
            :has-children="nodeHasChildren(nodeProps.id)"
            @update="(content) => handleUpdateNote(nodeProps.id, content)"
            @finalize="(content) => handleFinalizeNote(nodeProps.id, content)"
            @add-child="(pos) => handleAddChild(nodeProps.id, pos)"
            @delete="handleDeleteNode(nodeProps.id)"
          />
        </template>
      </VueFlow>

      <div
        v-if="isCreating"
        class="canvas-view__overlay--creating"
        data-testid="canvas-creating-overlay"
      />
    </div>

    <NodeTypeMenu
      v-if="showNodeTypeMenu"
      :x="menuPosition.x"
      :y="menuPosition.y"
      @select="handleNodeTypeSelect"
      @close="closeMenu"
      @mounted="handleMenuMounted"
    />

    <div
      v-if="nodes.length === 0 && !isCreating"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-6 bg-white border-2 border-dashed border-gray-200 rounded-lg text-gray-600 text-center pointer-events-none"
      data-testid="canvas-empty-hint"
    >
      <p class="text-base m-0">Clique em "+ Novo Fluxo" para iniciar</p>
    </div>
  </div>
</template>
