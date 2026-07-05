import axiosClient from './axiosClient'

// POST /api/auth/login
export function login(username, pin) {
  return axiosClient.post('/auth/login', { username, pin })
}
