'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  phone?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      login: async (email, password) => {
        set({ loading: true })
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          if (!res.ok) {
            set({ loading: false })
            return false
          }

          const data = await res.json()
          const user: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || '',
            phone: data.user.user_metadata?.phone || '',
          }
          set({ user, isAuthenticated: true, loading: false })
          return true
        } catch {
          set({ loading: false })
          return false
        }
      },

      register: async (name, email, password) => {
        set({ loading: true })
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
          })

          if (!res.ok) {
            set({ loading: false })
            return false
          }

          const data = await res.json()
          if (data.user) {
            const loginRes = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            })
            if (loginRes.ok) {
              const loginData = await loginRes.json()
              const user: User = {
                id: loginData.user.id,
                email: loginData.user.email,
                name,
              }
              set({ user, isAuthenticated: true, loading: false })
              return true
            }
          }
          set({ loading: false })
          return true
        } catch {
          set({ loading: false })
          return false
        }
      },

      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        set({ user: null, isAuthenticated: false })
      },

      fetchUser: async () => {
        set({ loading: true })
        try {
          const res = await fetch('/api/auth/me')
          if (res.ok) {
            const data = await res.json()
            if (data.user) {
              set({ user: data.user, isAuthenticated: true, loading: false })
              return
            }
          }
        } catch {}
        set({ user: null, isAuthenticated: false, loading: false })
      },

      updateProfile: async (data) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, ...data } })
        }
      },
    }),
    {
      name: 'marvvn-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
