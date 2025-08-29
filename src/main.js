import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import axiosFunction from './Functions/axios.js'

// Funciones propias
import { formatDate, formatDateTime } from './Functions/formatDate'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.config.globalProperties.$axios = axiosFunction
app.config.globalProperties.$formatDate = formatDate
app.config.globalProperties.$formatDateTime = formatDateTime

app.mount('#app')
