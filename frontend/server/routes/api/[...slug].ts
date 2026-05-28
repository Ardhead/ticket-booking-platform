import { proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const base = process.env.NUXT_API_PROXY || 'http://backend:3000'
  const path = event.path
  return proxyRequest(event, base + path)
})
