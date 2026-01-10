// main.ts
// Entry point da aplicacao

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

// Usa Vue Router
app.use(router)

// Monta aplicacao
app.mount('#app')
