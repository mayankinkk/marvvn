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
  login: (email: string, password: string) => boolean
  register: (name: string, email: string, password: string) => boolean
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'demo@bonkers.com': {
    password: 'demo123',
    user: { id: '1', name: 'Demo User', email: 'demo@bonkers.com', phone: '+91 98765 43210' },
  },
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const record = MOCK_USERS[email.toLowerCase()]
        if (record && record.password === password) {
          set({ user: record.user, isAuthenticated: true })
          return true
        }
        return false
      },

      register: (name, email, password) => {
        const lowerEmail = email.toLowerCase()
        if (MOCK_USERS[lowerEmail]) return false

        const newUser: User = {
          id: Date.now().toString(),
          name,
          email: lowerEmail,
        }
        MOCK_USERS[lowerEmail] = { password, user: newUser }
        set({ user: newUser, isAuthenticated: true })
        return true
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateProfile: (data) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, ...data } })
        }
      },
    }),
    {
      name: 'bonkers-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
