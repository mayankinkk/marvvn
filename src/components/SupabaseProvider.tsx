'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/lib/auth-store'

const AuthContext = createContext(null)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return <>{children}</>
}

export const useAuth = () => useContext(AuthContext)
