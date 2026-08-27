'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuthStore } from '@/lib/auth-store'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'

const AuthContext = createContext(null)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const loadCartFromServer = useCartStore((s) => s.loadFromServer)
  const loadWishlistFromServer = useWishlistStore((s) => s.loadFromServer)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromServer()
      loadWishlistFromServer()
    }
  }, [isAuthenticated, loadCartFromServer, loadWishlistFromServer])

  return <>{children}</>
}

export const useAuth = () => useContext(AuthContext)
