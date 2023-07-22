import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { VueFire, VueFireAuth } from 'vuefire'
import App from './App.vue'
import { firebaseApp } from './api/firebase'
import router from './router'
import './styles/index.scss'
import { validateEnvironment } from './utils'
import { initFontAwesome } from './utils/functions/initFontAwesome'

createApp(App)
  .use(VueFire, { firebaseApp, modules: [VueFireAuth()] })
  .use(createPinia())
  .use(router)
  .component(...initFontAwesome())
  .mount('#app')

// Ensure the environment is appropriate for running the app
validateEnvironment()
