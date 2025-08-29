import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axiosFunction from './Functions/axios.js'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.config.globalProperties.$axios = axiosFunction

app.mount('#app')
