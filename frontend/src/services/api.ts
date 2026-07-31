/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
