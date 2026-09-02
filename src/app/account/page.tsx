'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuthStore } from '@/lib/auth-store'
import { useCurrency } from '@/lib/hooks/useCurrency'
import {
  ChevronRight, User, Package, Heart, LogOut, Settings,
  Copy, Check, Edit3, Save, X, Lock, Eye, EyeOff, Bell, Mail, MessageCircle,
  Truck, Clock, CheckCircle, ArrowRight, Home, MapPin, Headphones, RotateCcw
} from 'lucide-react'

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
]

function OrderProgress({ status }: { status: string }) {
  const isCancelled = status === 'cancelled'
  const currentStepIndex = statusSteps.findIndex(s => s.key === status)
  return (
    <div className="px-4 py-3 border-b border-marvvn-gray-100">
      <div className="flex items-start justify-between">
        {statusSteps.map((step, i) => {
          const isCompleted = currentStepIndex >= i && !isCancelled
          return (
            <div key={step.key} className="flex-1 flex flex-col items-center text-center relative">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                isCancelled ? 'bg-marvvn-gray-100 text-marvvn-gray-400' :
                isCompleted ? 'bg-marvvn-black text-white' :
                'bg-marvvn-gray-100 text-marvvn-gray-400'
              }`}>
                <step.icon className="w-3.5 h-3.5" />
              </div>
              <p className={`text-[10px] font-medium ${isCompleted && !isCancelled ? 'text-marvvn-black' : 'text-marvvn-gray-400'}`}>
                {step.label}
              </p>
              {i < statusSteps.length - 1 && (
                <div className={`absolute top-3.5 left-1/2 w-full h-0.5 ${
                  isCompleted && !isCancelled ? 'bg-marvvn-black' : 'bg-marvvn-gray-200'
                }`} style={{ zIndex: 0 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
import ReturnsTab from '@/components/ReturnsTab'
import AddressesManager from '@/components/AddressesManager'

type Tab = 'dashboard' | 'orders' | 'addresses' | 'settings' | 'returns'

interface OrderStats {
  totalOrders: number
  totalSpent: number
  pendingOrders: number
  recentOrders: any[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: X,
}

export default function AccountPage() {
  const { user, isAuthenticated, loading, logout, fetchUser } = useAuthStore()
  const { format } = useCurrency()
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [notifications, setNotifications] = useState({ email: true, whatsapp: false })
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    fetchUser().finally(() => setAuthChecked(true))
  }, [fetchUser])

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.push('/account/login')
    }
  }, [authChecked, isAuthenticated, router])

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '')
      setProfilePhone(user.phone || '')
    }
  }, [user])

  useEffect(() => {
    if (isAuthenticated) {
      const fetchStats = () => {
        fetch('/api/account/stats')
          .then(r => r.json())
          .then(setStats)
          .catch(() => {})
      }
      fetchStats()
      const interval = setInterval(fetchStats, 15000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])
      fetch('/api/account/profile', { method: 'GET' })
        .then(r => r.json())
        .then(data => {
          if (data.profile?.notification_preferences) {
            setNotifications(data.profile.notification_preferences)
          }
        })
        .catch(() => {})
    }
  }, [isAuthenticated])

  useEffect(() => {
    const hash = pathname.split('#')[1] as Tab
    if (hash && ['dashboard', 'orders', 'addresses', 'settings'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [pathname])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, phone: profilePhone }),
      })
      if (res.ok) {
        setSaveMsg('Profile updated!')
        setEditingProfile(false)
        fetchUser()
      } else {
        const data = await res.json()
        setSaveMsg(data.error || 'Failed to update')
      }
    } catch {
      setSaveMsg('Something went wrong')
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        setSaveMsg('Password changed!')
        setShowPasswordChange(false)
        setCurrentPassword('')
        setNewPassword('')
      } else {
        const data = await res.json()
        setSaveMsg(data.error || 'Failed to change password')
      }
    } catch {
      setSaveMsg('Something went wrong')
    }
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (res.ok) {
        logout()
        router.push('/')
      } else {
        alert('Failed to delete account. Please try again.')
      }
    } catch {
      alert('Something went wrong. Please try again.')
    }
  }

  if (!isAuthenticated) return null

  const sidebarItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: Home },
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'returns' as Tab, label: 'Returns', icon: RotateCcw },
    { id: 'addresses' as Tab, label: 'Saved Addresses', icon: MapPin },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
  ]

  const supportLink = { href: '/support', label: 'Support', icon: Headphones }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container py-8 lg:py-12">
        <nav className="flex items-center gap-2 text-xs text-marvvn-gray-500 mb-8">
          <Link href="/" className="hover:text-marvvn-black">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-marvvn-black">My Account</span>
        </nav>

        {/* Welcome Banner */}
        <div className="bg-marvvn-black text-white p-6 lg:p-8 mb-8 flex items-center justify-between">
          <div>
            <p className="text-marvvn-gray-400 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl lg:text-3xl font-display font-medium">{user?.name || 'Guest'}</h1>
            <p className="text-marvvn-gray-400 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white/60" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 border border-marvvn-gray-200 p-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition-colors ${
                      activeTab === item.id
                        ? 'bg-marvvn-black text-white font-medium'
                        : 'hover:bg-marvvn-gray-50 text-marvvn-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                )
              })}
              <div className="border-t border-marvvn-gray-200 mt-2 pt-2">
                <Link
                  href={supportLink.href}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-marvvn-gray-700 hover:bg-marvvn-gray-50 transition-colors"
                >
                  <supportLink.icon className="w-4 h-4" />
                  {supportLink.label}
                </Link>
                <button
                  type="button"
                  onClick={async () => { await logout(); router.push('/') }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-marvvn-red hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {saveMsg && (
              <div className={`mb-4 p-3 text-sm ${saveMsg.includes('updated') || saveMsg.includes('changed') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {saveMsg}
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Account Details */}
                <div className="border border-marvvn-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-lg">Account Details</h2>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(!editingProfile)}
                      className="flex items-center gap-1 text-sm text-marvvn-gray-500 hover:text-marvvn-black"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                  {editingProfile ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-marvvn-gray-500 mb-1">Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full border border-marvvn-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-marvvn-black"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-marvvn-gray-500 mb-1">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full border border-marvvn-gray-200 px-3 py-2 text-sm bg-marvvn-gray-50 text-marvvn-gray-500"
                        />
                        <p className="text-xs text-marvvn-gray-400 mt-1">Email cannot be changed</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-marvvn-gray-500 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="+91 XXXXX XXXXX"
                          className="w-full border border-marvvn-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-marvvn-black"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 bg-marvvn-black text-white text-sm font-medium disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setEditingProfile(false); setProfileName(user?.name || ''); setProfilePhone(user?.phone || '') }}
                          className="flex items-center gap-2 px-4 py-2 border border-marvvn-gray-300 text-sm"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-marvvn-gray-400 text-xs mb-0.5">Name</p>
                        <p className="font-medium">{user?.name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-marvvn-gray-400 text-xs mb-0.5">Email</p>
                        <p className="font-medium">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-marvvn-gray-400 text-xs mb-0.5">Phone</p>
                        <p className="font-medium">{user?.phone || 'Not set'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="border border-marvvn-gray-200 p-5 hover:bg-marvvn-gray-50 transition-colors text-center group"
                  >
                    <Package className="w-6 h-6 mx-auto mb-2 text-marvvn-gray-400 group-hover:text-marvvn-black transition-colors" />
                    <span className="text-sm font-medium">My Orders</span>
                  </button>
                  <Link href="/wishlist" className="border border-marvvn-gray-200 p-5 hover:bg-marvvn-gray-50 transition-colors text-center group">
                    <Heart className="w-6 h-6 mx-auto mb-2 text-marvvn-gray-400 group-hover:text-marvvn-red transition-colors" />
                    <span className="text-sm font-medium">Wishlist</span>
                  </Link>
                </div>

                {/* Recent Orders */}
                {stats && stats.recentOrders.length > 0 && (
                  <div className="border border-marvvn-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-medium text-lg">Recent Orders</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('orders')}
                        className="text-sm text-marvvn-gray-500 hover:text-marvvn-black flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {stats.recentOrders.map((order: any) => {
                        const StatusIcon = statusIcons[order.status] || Clock
                        return (
                          <div key={order.id} className="flex items-center justify-between p-3 border border-marvvn-gray-100 hover:bg-marvvn-gray-50">
                            <div className="flex items-center gap-3">
                              <StatusIcon className="w-4 h-4 text-marvvn-gray-400" />
                              <div>
                                <p className="text-sm font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-xs text-marvvn-gray-500">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{format(order.total || 0)}</p>
                              <span className={`text-xs px-2 py-0.5 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-medium text-lg mb-6">My Orders</h2>
                {stats && stats.recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentOrders.map((order: any) => {
                      const StatusIcon = statusIcons[order.status] || Clock
                      return (
                        <div key={order.id} className="border border-marvvn-gray-200">
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-xs text-marvvn-gray-500 mt-1">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                              <span className={`flex items-center gap-1.5 text-xs px-3 py-1 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                <StatusIcon className="w-3 h-3" />
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-marvvn-gray-100">
                              <p className="text-sm text-marvvn-gray-500">Payment: {order.payment_status || 'Pending'}</p>
                              <p className="font-medium">{format(order.total || 0)}</p>
                            </div>
                            {order.tracking_number && (
                              <div className="mt-2 pt-2 border-t border-marvvn-gray-100 flex items-center gap-2">
                                <Truck className="w-3.5 h-3.5 text-marvvn-gray-400" />
                                <span className="text-xs text-marvvn-gray-500">Tracking:</span>
                                <span className="text-xs font-mono font-medium">{order.tracking_number}</span>
                              </div>
                            )}
                          </div>
                          <OrderProgress status={order.status} />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Package className="w-16 h-16 text-marvvn-gray-300 mx-auto mb-4" />
                    <p className="text-marvvn-gray-500 mb-2">No orders yet</p>
                    <p className="text-sm text-marvvn-gray-400 mb-6">Start shopping to see your orders here</p>
                    <Link href="/collections/new-arrivals" className="btn-primary">
                      Shop Now
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Returns Tab */}
            {activeTab === 'returns' && <ReturnsTab />}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && <AddressesManager />}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="font-medium text-lg">Settings</h2>

                {/* Password */}
                <div className="border border-marvvn-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Change Password</h3>
                    <button
                      type="button"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                      className="flex items-center gap-1 text-sm text-marvvn-gray-500 hover:text-marvvn-black"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {showPasswordChange ? 'Cancel' : 'Change'}
                    </button>
                  </div>
                  {showPasswordChange && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-marvvn-gray-500 mb-1">Current Password</label>
                        <div className="relative">
                          <input
                            type={showCurrentPw ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full border border-marvvn-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:border-marvvn-black"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-marvvn-gray-400"
                          >
                            {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-marvvn-gray-500 mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPw ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-marvvn-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:border-marvvn-black"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw(!showNewPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-marvvn-gray-400"
                          >
                            {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={saving || !currentPassword || !newPassword}
                        className="px-4 py-2 bg-marvvn-black text-white text-sm font-medium disabled:opacity-50"
                      >
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Notification Preferences */}
                <div className="border border-marvvn-gray-200 p-6">
                  <h3 className="font-medium mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-marvvn-gray-400" />
                        <div>
                          <p className="text-sm font-medium">Email Notifications</p>
                          <p className="text-xs text-marvvn-gray-500">Order updates, promotions, and newsletters</p>
                        </div>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.email ? 'bg-marvvn-black' : 'bg-marvvn-gray-300'}`}
                        onClick={() => {
                          const newVal = !notifications.email
                          setNotifications(n => ({ ...n, email: newVal }))
                          fetch('/api/account/profile', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notification_preferences: { ...notifications, email: newVal } }),
                          }).catch(() => {})
                        }}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.email ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-4 h-4 text-marvvn-gray-400" />
                        <div>
                          <p className="text-sm font-medium">WhatsApp Notifications</p>
                          <p className="text-xs text-marvvn-gray-500">Order confirmations and delivery updates via WhatsApp</p>
                        </div>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${notifications.whatsapp ? 'bg-marvvn-black' : 'bg-marvvn-gray-300'}`}
                        onClick={() => {
                          const newVal = !notifications.whatsapp
                          setNotifications(n => ({ ...n, whatsapp: newVal }))
                          fetch('/api/account/profile', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ notification_preferences: { ...notifications, whatsapp: newVal } }),
                          }).catch(() => {})
                        }}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.whatsapp ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 p-6">
                  <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-marvvn-gray-500 mb-4">Permanently delete your account and all associated data.</p>
                  <button type="button" onClick={handleDeleteAccount} className="px-4 py-2 border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors cursor-pointer">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
