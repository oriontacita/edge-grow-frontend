import axiosClient from './axiosClient'

// GET /api/toddlers?gender=male|female
export function getPrediction(toddlerId) {
  return axiosClient.post(`/ml/predict/${toddlerId}`)
}
