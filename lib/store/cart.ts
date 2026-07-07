'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { cartApi } from '@/lib/api'

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  unit: string
  stock: number
}

export interface CartItem {
  id: string
  quantity: number
  product: CartProduct
}

interface CartState {
  items: CartItem[]
  total: number
  count: number
  isOpen: boolean
  isLoading: boolean

  // Actions
  setOpen: (open: boolean) => void
  fetchCart: () => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateItem: (id: string, quantity: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  clearCart: () => Promise<void>
  clearLocal: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      count: 0,
      isOpen: false,
      isLoading: false,

      setOpen: (open) => set({ isOpen: open }),

      fetchCart: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('gromar_token') : null
        if (!token) return

        set({ isLoading: true })
        try {
          const res = await cartApi.get()
          const { items, total, count } = res.data.data
          set({ items, total, count })
        } catch {
          // Silent fail if not authenticated
        } finally {
          set({ isLoading: false })
        }
      },

      addItem: async (productId, quantity = 1) => {
        set({ isLoading: true })
        try {
          await cartApi.add(productId, quantity)
          await get().fetchCart()
          set({ isOpen: true }) // Open drawer when item added
        } finally {
          set({ isLoading: false })
        }
      },

      updateItem: async (id, quantity) => {
        set({ isLoading: true })
        try {
          await cartApi.update(id, quantity)
          await get().fetchCart()
        } finally {
          set({ isLoading: false })
        }
      },

      removeItem: async (id) => {
        set({ isLoading: true })
        try {
          await cartApi.remove(id)
          await get().fetchCart()
        } finally {
          set({ isLoading: false })
        }
      },

      clearCart: async () => {
        set({ isLoading: true })
        try {
          await cartApi.clear()
          set({ items: [], total: 0, count: 0 })
        } finally {
          set({ isLoading: false })
        }
      },

      clearLocal: () => {
        set({ items: [], total: 0, count: 0 })
      },
    }),
    {
      name: 'gromar-cart',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items, total: state.total, count: state.count }),
    }
  )
)
