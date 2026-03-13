import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './router/permission'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// import VueChartkick from 'vue-chartkick'
// import 'chartkick/chart.js'
const app = createApp(App)
.use(router)
.use(ElementPlus)
.use(createPinia())

// app.use(VueChartkick)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')