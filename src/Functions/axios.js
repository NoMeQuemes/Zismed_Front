import axios from 'axios'
import router from '@/router'

const axiosFunction = axios.create({
  baseURL: 'https://localhost:7296/api/',
  // baseURL: 'http://168.226.219.57:3004/Zismed_APIs/api/',
})

export default axiosFunction
