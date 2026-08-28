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

  // Rehydrate all Zustand persist stores AFTER React hydration completes.
  // skipHydration:true on each store prevents the SSR mismatch; this effect
  // restores localStorage data once it's safe to do so.
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useWishlistStore.persist.rehydrate()
    useAuthStore.persist.rehydrate()
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (isAuthenticated) {
      loadCartFromServer()
      loadWishlistFromServer()
    }
  }, [isAuthenticated, loadCartFromServer, loadWishlistFromServer])

  // Sync maintenance mode cookie for middleware
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((settings) => {
        document.cookie = `store_maintenance=${settings.maintenance_mode || 'false'}; path=/; max-age=300`
      })
      .catch(() => {})
  }, [])

  return <>{children}</>
}

export const useAuth = () => useContext(AuthContext)
