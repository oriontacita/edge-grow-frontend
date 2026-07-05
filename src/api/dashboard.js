import axiosClient from './axiosClient'

// GET /api/dashboard
export function getDashboard() {
  return axiosClient.get('/dashboard/')
}
