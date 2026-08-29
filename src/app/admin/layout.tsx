'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Settings,
  Menu, X, FileText, Star, AlertTriangle, Image, Store, LogOut,
  ChevronDown, LayoutGrid, MessageSquare
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

interface NavGroup {
  label: string
  items: { href: string; label: string; icon: any }[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/banners', label: 'Banners', icon: Image },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/coupons', label: 'Coupons', icon: Tag },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/blogs', label: 'Blogs', icon: FileText },
      { href: '/admin/reviews', label: 'Reviews', icon: Star },
      { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/inventory', label: 'Inventory', icon: AlertTriangle },
      { href: '/admin/mega-menu', label: 'Mega Menu', icon: LayoutGrid },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.isAdmin) {
          setIsAdmin(true)
        } else {
          router.push('/')
        }
        setLoading(false)
      })
      .catch(() => {
        router.push('/account/login')
        setLoading(false)
      })
  }, [isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-marvvn-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#111318] text-white transform transition-all duration-300 ease-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#111318] font-display font-bold text-sm tracking-tight">M</span>
            </div>
            <div>
              <span className="text-[15px] font-semibold tracking-wide">MARVVN</span>
              <span className="block text-[11px] text-white/40 font-medium tracking-wider uppercase">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {navGroups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-6' : ''}>
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium rounded-lg transition-all duration-150 ${
                        isActive
                          ? 'bg-white/[0.08] text-white'
                          : 'text-white/50 hover:text-white/90 hover:bg-white/[0.04]'
                      }`}
                    >
                      <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-white/40'}`} />
                      {item.label}
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-1">
          <div className="px-3 py-3 mb-2 bg-white/[0.04] rounded-lg">
            <p className="text-[12px] text-white/50 truncate">{user?.email}</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-white/50 hover:text-white/90 hover:bg-white/[0.04] rounded-lg transition-all duration-150"
          >
            <Store className="w-[18px] h-[18px] text-white/40" />
            View Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden lg:block" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#111318] rounded-full flex items-center justify-center">
              <span className="text-white text-[11px] font-semibold uppercase">
                {user?.email?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
