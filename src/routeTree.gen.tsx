/* eslint-disable */
// @ts-nocheck

// This file is manually maintained since the router plugin
// has compatibility issues with rolldown-vite.

import {
  createRootRoute,
  createRoute,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { CanvasListView } from './views/CanvasListView'
import { CanvasView } from './views/CanvasView'
import { SHOW_DEV_TOOLS } from './config/env'

// Root Layout Component
function RootLayout() {
  return (
    <>
      <Outlet />
      {SHOW_DEV_TOOLS && (
        <TanStackRouterDevtools
          toggleButtonProps={{
            style: { bottom: '80px' },
          }}
          position="bottom-left"
        />
      )}
    </>
  )
}

// Root Route
export const rootRoute = createRootRoute({
  component: RootLayout,
})

// Index Route - redirects to /canvases
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/canvases' })
  },
})

// Canvases Route
const canvasesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/canvases',
  component: CanvasListView,
})

// Canvas Route with param
export const canvasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/canvas/$id',
  component: CanvasView,
})

// Route Tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  canvasesRoute,
  canvasRoute,
])
