import { axiosInstance, mockAdapter } from './index'

const FAKE_USERS = [{ email: 'demo@example.com', password: 'password123', name: 'Demo User' }]

mockAdapter.onPost('/auth/login').reply((config) => {
  const { email, password } = JSON.parse(config.data)
  const user = FAKE_USERS.find((u) => u.email === email && u.password === password)

  if (!user) {
    return [401, { message: 'Invalid email or password' }]
  }

  const token = `fake-token-${Date.now()}`
  return [200, { data: { user: { email: user.email, name: user.name }, token } }]
})

mockAdapter.onPost('/auth/logout').reply(() => [200, { data: { message: 'Logged out' } }])

export const LoginAPI = ({ email, password }) => axiosInstance.post('/auth/login', { email, password })

export const LogoutAPI = () => axiosInstance.post('/auth/logout')
