// router/index.ts
// Configuracao do Vue Router

import { type RouteRecordRaw } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import CanvasListView from '@/views/CanvasListView.vue'
import CanvasView from '@/views/CanvasView.vue'

/**
 * Definicao das rotas da aplicacao
 * Exportado para uso com ViteSSG
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
    meta: {
      title: 'gyul - Canvas de ideias'
    }
  },
  {
    path: '/canvases',
    name: 'canvases',
    component: CanvasListView,
    meta: {
      title: 'Meus Canvas - gyul'
    }
  },
  {
    path: '/canvas/:id',
    name: 'canvas',
    component: CanvasView,
    props: true,
    meta: {
      title: 'Canvas - gyul'
    }
  },
  {
    // Catch-all para rotas nao encontradas
    path: '/:pathMatch(.*)*',
    redirect: '/canvases'
  }
]

/**
 * Navigation guard callback para atualizar titulo da pagina
 * Usado pelo ViteSSG durante setup do router
 */
export function setupRouterGuards(router: ReturnType<typeof import('vue-router').createRouter>) {
  router.beforeEach((to, _from, next) => {
    // Atualiza titulo da pagina (apenas no cliente)
    if (typeof document !== 'undefined') {
      const title = to.meta.title as string | undefined
      if (title) {
        document.title = title
      }
    }
    next()
  })
}
