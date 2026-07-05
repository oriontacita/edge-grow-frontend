import axiosClient from './axiosClient'

/**
 * GET /api/settings/{user_id}
 * Response 200 -> { success, message, data: { user: {...} } }
 * Response 404 -> { success: false, message, data: null }
 */
export function getSettings(userId) {
  return axiosClient.get(`/settings/${userId}`)
}

/**
 * PUT /api/settings/edit/{user_id}
 * Body: { full_name, username, pin, gender }
 * Response 200 -> { success, message }
 * Endpoint ini full update, jadi body yang dikirim harus melampirkan
 * seluruh field (bukan hanya field yang berubah).
 */
export function updateSettings(userId, payload) {
  return axiosClient.put(`/settings/edit/${userId}`, payload)
}
