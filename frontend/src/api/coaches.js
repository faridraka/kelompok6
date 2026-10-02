import { request, USE_MOCK } from './client'
import { generateCoaches } from '../data/coaches'

// COCH-2  GET /coaches/:id
export const getCoach = async (id) => {
  if (USE_MOCK) return generateCoaches(9).find((c) => String(c.id) === String(id)) ?? null
  return request(`/coaches/${id}`)
}
