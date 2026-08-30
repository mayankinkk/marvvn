'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from './store'

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
  login: (email: string, password: string) => Promise<boolean | string>
  register: (name: string, email: string, password: string) => Promise<boolean | string>
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

          const data = await res.json()

          if (!res.ok) {
            set({ loading: false })
            return data.error || 'Invalid email or password'
          }

          const user: User = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || '',
            phone: data.user.user_metadata?.phone || '',
          }
          set({ user, isAuthenticated: true, loading: false })
          useCartStore.getState().loadFromServer()
          useCartStore.getState().loadSavedFromServer()
          return true
        } catch {
          set({ loading: false })
          return 'Something went wrong. Please try again.'
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

          const data = await res.json()

          if (!res.ok) {
            set({ loading: false })
            return data.error || 'Registration failed'
          }

          if (data.needsConfirmation) {
            set({ loading: false })
            return 'confirmation_required'
          }

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
          return 'Something went wrong. Please try again.'
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
              useCartStore.getState().loadFromServer()
              useCartStore.getState().loadSavedFromServer()
              return
            }
          }

          // Server cookie session missing/expired — fall back to the client session.
          // This keeps Google/Apple OAuth users (whose session lives in browser
          // cookies) logged in even when the server round-trip hits a cookie issue.
          const supabase = createClient()
          const { data: sessionData } = await supabase.auth.getSession()
          const su = sessionData?.session?.user
          if (su) {
              set({
                user: {
                  id: su.id,
                  email: su.email || '',
                  name: su.user_metadata?.full_name || su.user_metadata?.name || su.user_metadata?.fullname || su.email?.split('@')[0] || '',
                  phone: su.user_metadata?.phone || '',
                },
                isAuthenticated: true,
                loading: false,
              })
              useCartStore.getState().loadFromServer()
              useCartStore.getState().loadSavedFromServer()
              return
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
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
