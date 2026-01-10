<!-- src/components/ui/LoadingOverlay.vue -->
<!--
  LoadingOverlay - Overlay de carregamento global
  
  Exibe um overlay semi-transparente com spinner centralizado.
  Usado para estados de carregamento que afetam toda a interface.
  
  Props:
  - message: Mensagem opcional para exibir abaixo do spinner
  
  Exemplo:
  <LoadingOverlay v-if="isLoading" message="Carregando canvas..." />
-->
<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'

interface Props {
  message?: string
}

defineProps<Props>()
</script>

<template>
  <div 
    class="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-modal animate-fade-in"
    data-testid="loading-overlay"
  >
    <div class="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p 
        v-if="message" 
        class="text-gray-600 text-sm m-0"
        data-testid="loading-overlay-message"
      >
        {{ message }}
      </p>
    </div>
  </div>
</template>
