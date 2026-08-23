import axios from 'axios'

// In production, NEXT_PUBLIC_API_URL must end with '/api' so the relative
// endpoint paths below resolve correctly, e.g. https://api.example.com/api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('gromar_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle 401 - auto logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('gromar_token')
      localStorage.removeItem('gromar_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; email?: string; password?: string }) =>
    api.put('/auth/profile', data),
}

// ── Products ──────────────────────────────────────
export const productApi = {
  getAll: (params?: {
    category?: string
    search?: string
    page?: number
    limit?: number
    sort?: string
  }) => api.get('/products', { params }),
  getBySlug: (slug: string) => api.get(`/products/${slug}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

// ── Categories ────────────────────────────────────
export const categoryApi = {
  getAll: () => api.get('/categories'),
  create: (data: { name: string; slug: string }) => api.post('/categories', data),
}

// ── Cart ──────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),
  add: (productId: string, quantity: number = 1) =>
    api.post('/cart', { productId, quantity }),
  update: (id: string, quantity: number) =>
    api.put(`/cart/${id}`, { quantity }),
  remove: (id: string) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart/clear'),
}

// ── Orders ────────────────────────────────────────
export const orderApi = {
  create: (data?: { notes?: string }) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  getAllAdmin: () => api.get('/orders/all'),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
}

// ── Payment ───────────────────────────────────────
export const paymentApi = {
  getSnapToken: (orderId: string) => api.get(`/payment/snap-token/${orderId}`),
}

// ── B2B Contracts ─────────────────────────────────
export const contractApi = {
  create: (data: { sector: string; productName: string; minVolume: string; price: string; region: string }) =>
    api.post('/contracts', data),
  getAll: () => api.get('/contracts'),
  delete: (id: string) => api.delete(`/contracts/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/contracts/${id}/status`, { status }),
}

// ── Upload ────────────────────────────────────────
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export default api
