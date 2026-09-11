import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

export const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Request interceptor: runs before every request leaves axios. Right now
// just logs — this is exactly where Step 5's auth slice will attach an
// Authorization header once we have a token to send.
axiosInstance.interceptors.request.use((config) => {
  console.log('[api] →', config.method?.toUpperCase(), config.url)
  //later we can do config.headers.Authorization = `Bearer ${token}` before returning config, once we have a token to send.
  return config
})

// Response interceptor: centralizes error shaping, so every thunk's catch
// block sees a plain, readable Error — regardless of whether the failure
// came from our mock or (later) a real backend's differently-shaped error.

//there are two paths, response success and response error. The first just returns the response as-is, 
// while the second extracts a message from the error object and rejects it as a new Error.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed'
    return Promise.reject(new Error(message))
  }
)

// Intercepts requests made through axiosInstance and resolves them locally —
// no real network call, no second server process. delayResponse simulates
// real latency so loading states in the UI are genuine, not instant.
export const mockAdapter = new MockAdapter(axiosInstance, { delayResponse: 500 })

export default axiosInstance
