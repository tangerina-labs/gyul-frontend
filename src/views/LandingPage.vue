<!--
  LandingPage.vue
  
  Minimalist landing page for gyul - visual thinking app for deep exploration.
  Inspirational design with generous whitespace and orange Design System.
-->
<template>
  <div class="min-h-screen bg-background flex flex-col">
    <!-- Hero Section -->
    <main class="flex-1 flex items-center justify-center px-4 md:px-8 py-16 md:py-24">
      <div class="max-w-2xl w-full text-center">
        <!-- Animated Logo -->
        <div class="mb-8 flex flex-col items-center">
          <div 
            ref="lottieContainer" 
            class="w-64 md:w-96 mx-auto"
            aria-label="gyul animated logo"
          />
        </div>

        <!-- Headline -->
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 leading-tight">
          Transform fleeting tweets into lasting understanding
        </h1>

        <!-- Subheadline -->
        <p class="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          Stop scrolling, start thinking. Gyul turns bite-sized content into structured knowledge you can explore, question, and build upon.
        </p>

        <!-- Input Section (Demonstrative) -->
        <div class="mb-6">
          <div class="relative max-w-md mx-auto">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg 
                class="w-5 h-5 text-muted-foreground" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <input
              type="text"
              readonly
              placeholder="Paste a tweet URL to begin..."
              class="w-full pl-12 pr-4 py-3 md:py-4 bg-input-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-default"
            />
          </div>
        </div>

        <!-- CTA Button -->
        <router-link 
          to="/canvases" 
          class="inline-flex items-center gap-2 px-8 py-3 md:py-4 bg-primary text-primary-foreground font-medium rounded-lg transition-colors duration-base hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Start exploring
          <svg 
            class="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </router-link>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-6 md:py-8 text-center border-t border-border">
      <div class="flex items-center justify-center gap-2 text-muted-foreground">
        <span class="font-medium text-foreground">gyul</span>
        <span class="text-border">|</span>
        <span class="text-sm">Peel ideas, one layer at a time</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import lottie from 'lottie-web'
import logoAnimationData from '@/assets/logo.json'

const lottieContainer = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (lottieContainer.value) {
    lottie.loadAnimation({
      container: lottieContainer.value,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: logoAnimationData
    })
  }
})
</script>
