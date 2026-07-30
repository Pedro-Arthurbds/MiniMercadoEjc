/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      try {
        window.dispatchEvent(new Event('app:logout'))
      } catch (e) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
