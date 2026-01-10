// main.ts
// Entry point da aplicacao com SSG support

import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes, setupRouterGuards } from './router'
import './style.css'

/**
 * ViteSSG entry point
 * - Pre-renders specified routes at build time (SSG)
 * - Hydrates on client for SPA behavior
 */
export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL
  },
  ({ router, isClient }) => {
    // Setup router guards
    setupRouterGuards(router)
    
    // Client-only setup can go here
    if (isClient) {
      // Any client-specific initialization
    }
  }
)

/**
 * SSG route filter - exported for vite-ssg to use
 * Pre-renders only the landing page (/) for SEO
 * Other routes remain as SPA (client-side rendered)
 */
export function includedRoutes(paths: string[]) {
  return paths.filter((path) => path === '/')
}
