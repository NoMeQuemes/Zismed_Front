import axios from 'axios'
import router from '@/router'

const axiosFunction = axios.create({
  baseURL: 'https://localhost:7296/api/',
})

export default axiosFunction
