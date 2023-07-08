import './styles/index.scss'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.scss'
import { validateEnvironment } from './utils'
import { createPinia } from 'pinia'

createApp(App).use(createPinia()).use(router).mount('#app')

// Ensure the environment is appropriate for running the app
validateEnvironment()
