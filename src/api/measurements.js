import axiosClient from './axiosClient'

// GET /api/toddlers/{toddler_id}/measurements
export function getMeasurementsByToddler(toddlerId) {
  return axiosClient.get(`/toddlers/${toddlerId}/measurements`)
}

// GET /api/measurements/{measurement_id}/detail
export function getMeasurementDetail(measurementId) {
  return axiosClient.get(`/measurements/${measurementId}/detail`)
}

// POST /api/toddlers/{toddler_id}/measurements/add
export function createMeasurement(toddlerId, payload) {
  return axiosClient.post(`/toddlers/${toddlerId}/measurements/add`, payload)
}

// PUT /api/measurements/edit/{measurement_id}
export function updateMeasurement(measurementId, payload) {
  return axiosClient.put(`/measurements/edit/${measurementId}`, payload)
}

// DELETE /api/measurements/delete/{measurement_id}
export function deleteMeasurement(measurementId) {
  return axiosClient.delete(`/measurements/delete/${measurementId}`)
}
