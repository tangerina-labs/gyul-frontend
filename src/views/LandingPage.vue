<!--
  LandingPage.vue
  
  Landing page placeholder - will be pre-rendered for SEO.
  This page is SSG (Static Site Generation) optimized.
-->
<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50">
    <div class="text-center p-8">
      <h1 class="text-5xl font-semibold text-gray-900 mb-4">gyul</h1>
      <p class="text-lg text-gray-600 mb-8">Landing page placeholder</p>
      <router-link 
        to="/canvases" 
        class="inline-block px-6 py-3 bg-brand-500 text-white no-underline rounded-lg font-medium transition-colors duration-fast hover:bg-brand-600 hover:opacity-100"
      >
        Entrar no App
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// SSG-safe component - no client-side only APIs in setup
</script>
