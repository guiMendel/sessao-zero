import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { App } from './App'
import router from './router'
import './styles/index.scss'
import { validateEnvironment } from './utils'
import { initFontAwesome } from './utils/functions/initFontAwesome'

createApp(App)
  .use(createPinia())
  .use(router)
  .component(...initFontAwesome())
  .mount('#app')

// Ensure the environment is appropriate for running the app
validateEnvironment()
