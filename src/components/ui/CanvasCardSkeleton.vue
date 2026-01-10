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
  <div 
    class="bg-white border border-gray-200 rounded-lg p-4"
    data-testid="canvas-card-skeleton"
  >
    <div 
      class="w-3/5 h-5 mb-2 rounded bg-gradient-to-r from-gray-50 via-gray-200 to-gray-50 bg-[length:200%_100%] animate-shimmer"
      data-testid="skeleton-title" 
    />
    <div 
      class="w-2/5 h-3.5 mb-4 rounded bg-gradient-to-r from-gray-50 via-gray-200 to-gray-50 bg-[length:200%_100%] animate-shimmer"
      data-testid="skeleton-meta" 
    />
    <div 
      class="w-full h-20 rounded bg-gradient-to-r from-gray-50 via-gray-200 to-gray-50 bg-[length:200%_100%] animate-shimmer"
      data-testid="skeleton-preview" 
    />
  </div>
</template>
