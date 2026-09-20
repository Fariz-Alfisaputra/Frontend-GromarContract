'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authApi } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean

  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role?: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateProfile: (data: { name?: string; email?: string; password?: string }) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const res = await authApi.login({ email, password })
          const { user, token } = res.data.data
          localStorage.setItem('gromar_token', token)
          set({ user, token })
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true })
        try {
          const res = await authApi.register({ name, email, password, role })
          const { user, token } = res.data.data
          localStorage.setItem('gromar_token', token)
          set({ user, token })
        } finally {
          set({ isLoading: false })
        }
      },

      logout: () => {
        localStorage.removeItem('gromar_token')
        localStorage.removeItem('gromar_user')
        set({ user: null, token: null })
      },

      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('gromar_token') : null
        if (!token) {
          // Tokens ada di persistent store tapi sesi sudah habis/bersih → anggap tidak login
          set({ user: null, token: null })
          return
        }

        try {
          const res = await authApi.getMe()
          set({ user: res.data.data, token })
        } catch {
          // Token invalid/expired → bersihkan semua jejak autentikasi
          localStorage.removeItem('gromar_token')
          localStorage.removeItem('gromar_user')
          set({ user: null, token: null })
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true })
        try {
          let updatedUser: User | null = null
          try {
            const res = await authApi.updateProfile(data)
            if (res.data?.data) {
              updatedUser = res.data.data
            }
          } catch {
            // Fallback: update user state locally if backend endpoint is unavailable
          }
          set((state) => {
            if (!state.user) return state
            const newUser: User = updatedUser ?? {
              ...state.user,
              ...(data.name ? { name: data.name } : {}),
              ...(data.email ? { email: data.email } : {}),
            }
            if (typeof window !== 'undefined') {
              localStorage.setItem('gromar_user', JSON.stringify(newUser))
            }
            return { user: newUser }
          })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'gromar-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
