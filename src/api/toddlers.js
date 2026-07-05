import axiosClient from './axiosClient'

// GET /api/toddlers?gender=male|female
export function getToddlers(params = {}) {
  return axiosClient.get('/toddlers', { params })
}

// GET /api/toddlers/view/{toddler_id}
export function getToddler(toddlerId) {
  return axiosClient.get(`/toddlers/view/${toddlerId}`)
}

// POST /api/toddlers/add
export function createToddler(payload) {
  return axiosClient.post('/toddlers/add', payload)
}

// PUT /api/toddlers/edit/{toddler_id}
export function updateToddler(toddlerId, payload) {
  return axiosClient.put(`/toddlers/edit/${toddlerId}`, payload)
}

// DELETE /api/toddlers/delete/{toddler_id}
export function deleteToddler(toddlerId) {
  return axiosClient.delete(`/toddlers/delete/${toddlerId}`)
}
