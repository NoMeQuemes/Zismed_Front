import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axiosFunction from './Functions/axios.js'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Funciones propias
import { formatDate, formatDateTime, calcularEdad } from './Functions/formatDate'
const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.config.globalProperties.$axios = axiosFunction
app.config.globalProperties.$formatDate = formatDate
app.config.globalProperties.$formatDateTime = formatDateTime
app.config.globalProperties.$calcularEdad = calcularEdad

app.mount('#app')
