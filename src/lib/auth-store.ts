'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

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
      loading: true,

      login: async (email, password) => {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })

        if (!res.ok) return false

        const data = await res.json()
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || '',
          phone: data.user.user_metadata?.phone || '',
        }
        set({ user, isAuthenticated: true })
        return true
      },

      register: async (name, email, password) => {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        })

        if (!res.ok) return false

        const data = await res.json()
        const user: User = {
          id: data.user.id,
          email: data.user.email,
          name,
        }
        set({ user, isAuthenticated: true })
        return true
      },

      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        set({ user: null, isAuthenticated: false })
      },

      fetchUser: async () => {
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
        set({ loading: false })
      },

      updateProfile: (data) => {
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
