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
  <div class="loading-overlay" data-testid="loading-overlay">
    <div class="loading-overlay__content">
      <LoadingSpinner size="lg" />
      <p v-if="message" class="loading-overlay__message" data-testid="loading-overlay-message">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  z-index: var(--z-modal);
  animation: fadeIn var(--transition-fast);
}

.loading-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.loading-overlay__message {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin: 0;
}
</style>
