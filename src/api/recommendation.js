import axiosClient from './axiosClient'

// GET /api/toddlers?gender=male|female
export function getMenuRecommendation(toddlerId) {
  return axiosClient.get(`/recommendations/menus/${toddlerId}`)
}
