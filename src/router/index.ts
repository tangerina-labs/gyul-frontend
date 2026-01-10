// router/index.ts
// Configuracao do Vue Router

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import CanvasListView from '@/views/CanvasListView.vue'
import CanvasView from '@/views/CanvasView.vue'

/**
 * Definicao das rotas da aplicacao
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/canvases'
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
 * Instancia do router
 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * Navigation guard para atualizar titulo da pagina
 */
router.beforeEach((to, _from, next) => {
  // Atualiza titulo da pagina
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = title
  }

  next()
})

export default router
