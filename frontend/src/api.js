// In dev, Vite proxies /api → localhost:5001
// In production, VITE_API_URL should be set to the Render backend URL
const BASE = import.meta.env.VITE_API_URL ?? ''

export async function apiFetch(path, options = {}) {
  return fetch(`${BASE}${path}`, options)
}
