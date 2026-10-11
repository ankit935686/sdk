import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export function withAuth(token) {
  return { headers: { Authorization: `Bearer ${token}` } }
}
