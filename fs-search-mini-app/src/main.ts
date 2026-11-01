import { createApp } from 'vue'
import router from './router'
import { pinia } from './stores'
import App from './App.vue'
import eruda from 'eruda'

// Всегда инициализируем Eruda для дебага (включая production)
eruda.init()
console.log('Eruda initialized for debugging')

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
