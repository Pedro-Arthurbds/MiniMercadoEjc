/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'
import { getToken, clearAuth } from './tokenStorage'

const baseURL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL,
})

api.interceptors.request.use((config) => {
  const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token} `
    }
    return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth()
      try{
        window.dispatchEvent(new Event('app:logout'))
      } catch (e){
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)