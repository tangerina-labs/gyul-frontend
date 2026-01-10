<!-- src/components/ui/CanvasCardSkeleton.vue -->
<!--
  CanvasCardSkeleton - Skeleton loading para cards de canvas
  
  Exibe um placeholder animado enquanto os dados do canvas carregam.
  Usa animacao shimmer para indicar carregamento.
  
  Exemplo:
  <CanvasCardSkeleton v-if="isLoading" />
-->
<script setup lang="ts">
// Component sem props - placeholder estatico
</script>

<template>
  <div class="canvas-card-skeleton" data-testid="canvas-card-skeleton">
    <div class="skeleton skeleton--title" data-testid="skeleton-title" />
    <div class="skeleton skeleton--meta" data-testid="skeleton-meta" />
    <div class="skeleton skeleton--preview" data-testid="skeleton-preview" />
  </div>
</template>

<style scoped>
.canvas-card-skeleton {
  background: white;
  border: 1px solid var(--note-border);
  border-radius: var(--node-radius);
  padding: var(--spacing-md);
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--background) 25%,
    #E5E7EB 50%,
    var(--background) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton--title {
  width: 60%;
  height: 20px;
  margin-bottom: var(--spacing-sm);
}

.skeleton--meta {
  width: 40%;
  height: 14px;
  margin-bottom: var(--spacing-md);
}

.skeleton--preview {
  width: 100%;
  height: 80px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
