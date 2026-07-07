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
        if (!token) return

        try {
          const res = await authApi.getMe()
          set({ user: res.data.data, token })
        } catch {
          localStorage.removeItem('gromar_token')
          set({ user: null, token: null })
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
