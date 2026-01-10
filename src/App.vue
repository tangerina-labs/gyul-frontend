<script setup lang="ts">
import { RouterView } from 'vue-router'

/**
 * App - Componente raiz da aplicacao
 *
 * Apenas renderiza o RouterView.
 * Toda a logica de navegacao esta nas views.
 */

// Expose services to window for any remaining E2E tests
import {
  isTweetData,
  isQuestionData,
  isNoteData,
  isLoadedTweet,
  isDoneQuestion,
  type TweetData,
  type QuestionData,
  type NoteData
} from '@/types'
import { createEmptyCanvas, createInitialAppState } from '@/types'
import {
  STORAGE_KEY,
  loadState,
  saveState,
  clearState,
  addCanvas,
  removeCanvas,
  updateCanvas,
  getCanvas,
  setActiveCanvas,
  getActiveCanvas,
  initializeState,
  isValidAppState,
  isValidCanvasState
} from '@/services/storageService'
import {
  extractTweetId,
  isValidTweetUrl,
  fetchTweet,
  formatTweetTimestamp
} from '@/services/tweetService'
import { generateAnswer, formatContextForDebug } from '@/services/aiService'

// Expose API to window for E2E testing
if (typeof window !== 'undefined') {
  ;(window as any).__gyul = {
    // Type guards
    isTweetData,
    isQuestionData,
    isNoteData,
    isLoadedTweet,
    isDoneQuestion,
    // Factory functions
    createEmptyCanvas,
    createInitialAppState,
    // Storage service functions
    STORAGE_KEY,
    loadState,
    saveState,
    clearState,
    addCanvas,
    removeCanvas,
    updateCanvas,
    getCanvas,
    setActiveCanvas,
    getActiveCanvas,
    initializeState,
    isValidAppState,
    isValidCanvasState,
    // Tweet service functions
    extractTweetId,
    isValidTweetUrl,
    fetchTweet,
    formatTweetTimestamp,
    // AI service functions
    generateAnswer,
    formatContextForDebug,
    // Sample data for testing
    sampleTweetData: {
      type: 'tweet',
      flowId: 'test-flow-1',
      url: '',
      status: 'empty'
    } as TweetData,
    sampleLoadedTweetData: {
      type: 'tweet',
      flowId: 'test-flow-1',
      url: 'https://twitter.com/user/status/123',
      status: 'loaded',
      author: { name: 'Test User', handle: '@test', avatar: 'avatar.png' },
      text: 'Test tweet content',
      timestamp: new Date().toISOString()
    } as TweetData,
    sampleQuestionData: {
      type: 'question',
      flowId: 'test-flow-1',
      prompt: '',
      response: null,
      status: 'draft'
    } as QuestionData,
    sampleDoneQuestionData: {
      type: 'question',
      flowId: 'test-flow-1',
      prompt: 'What is this about?',
      response: 'This is a response from AI',
      status: 'done'
    } as QuestionData,
    sampleNoteData: {
      type: 'note',
      flowId: 'test-flow-1',
      content: 'Test note content',
      isEditing: false
    } as NoteData
  }
}
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
/* View Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
