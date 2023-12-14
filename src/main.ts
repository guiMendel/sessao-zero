import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { App } from './App'
import './styles/index.scss'
import { validateEnvironment } from './utils/functions'
import { initFontAwesome } from './utils/functions/initFontAwesome'
import { router } from './router'

createApp(App)
  .use(createPinia())
  .use(router)
  .component(...initFontAwesome())
  .mount('#app')

// Ensure the environment is appropriate for running the app
validateEnvironment()
