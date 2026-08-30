'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Check, X, ExternalLink, Package, AlertTriangle, Loader2 } from 'lucide-react'

interface SyncProduct {
  id: string
  title: string
  handle: string
  price: number
  stock: number
  image: string
  synced: boolean
}

export default function InstagramSyncPage() {
  const [products, setProducts] = useState<SyncProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [stats, setStats] = useState({ catalogCount: 0, localCount: 0, synced: 0, notSynced: 0 })
  const [error, setError] = useState('')

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/instagram-sync')
      const data = await res.json()
      if (res.ok) {
        setProducts(data.products || [])
        setStats({
          catalogCount: data.catalogProductCount,
          localCount: data.localProductCount,
          synced: data.syncedCount,
          notSynced: data.notSyncedCount,
        })
      } else {
        setError(data.error || 'Failed to load')
      }
    } catch {
      setError('Failed to load sync status')
    }
    setLoading(false)
  }

  useEffect(() => { fetchStatus() }, [])

  const handleSyncAll = async () => {
    setSyncing(true)
    setSyncResult(null)
    setError('')
    try {
      const res = await fetch('/api/admin/instagram-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncAll: true }),
      })
      const data = await res.json()
      if (res.ok) {
        setSyncResult(data)
        fetchStatus()
      } else {
        setError(data.error || 'Sync failed')
      }
    } catch {
      setError('Sync failed')
    }
    setSyncing(false)
  }

  const handleSyncOne = async (productId: string) => {
    try {
      const res = await fetch('/api/admin/instagram-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (res.ok) {
        fetchStatus()
      }
    } catch {}
  }

  const hasEnvVars = process.env.NEXT_PUBLIC_META_CATALOG_ID !== undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-medium">Instagram Shop Sync</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">Sync your products to Facebook/Instagram Commerce catalog</p>
        </div>
        <a
          href="https://business.facebook.com/commerce-manager"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border text-sm rounded-lg hover:bg-marvvn-gray-50"
        >
          <ExternalLink className="w-4 h-4" />
          Commerce Manager
        </a>
      </div>

      {/* Setup Instructions */}
      {!process.env.NEXT_PUBLIC_META_CATALOG_ID && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="font-medium flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Setup Required
          </h2>
          <ol className="text-sm text-marvvn-gray-600 space-y-2 list-decimal pl-5">
            <li>Create a <a href="https://business.facebook.com" target="_blank" className="underline">Facebook Business Account</a></li>
            <li>Go to <a href="https://business.facebook.com/commerce-manager" target="_blank" className="underline">Commerce Manager</a> → Create a Shop</li>
            <li>Create a Product Catalog in Commerce Manager</li>
            <li>Get your <strong>Catalog ID</strong> from Commerce Manager → Catalog → Settings</li>
            <li>Create a <a href="https://developers.facebook.com" target="_blank" className="underline">Meta App</a> and get an <strong>Access Token</strong></li>
            <li>Add these environment variables to Vercel:</li>
          </ol>
          <pre className="bg-white border rounded p-3 mt-3 text-xs font-mono overflow-x-auto">
{`META_ACCESS_TOKEN=your_access_token
META_CATALOG_ID=your_catalog_id`}
          </pre>
          <p className="text-xs text-marvvn-gray-500 mt-2">Then redeploy and return here.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Local Products" value={stats.localCount} />
        <StatCard label="In Catalog" value={stats.catalogCount} icon={<Package className="w-4 h-4" />} />
        <StatCard label="Synced" value={stats.synced} icon={<Check className="w-4 h-4 text-green-500" />} />
        <StatCard label="Not Synced" value={stats.notSynced} icon={<X className="w-4 h-4 text-red-500" />} />
      </div>

      {/* Sync Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-3 bg-marvvn-black text-white text-sm font-medium rounded-lg hover:bg-marvvn-gray-800 disabled:opacity-50 cursor-pointer"
        >
          {syncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {syncing ? 'Syncing...' : 'Sync All Products'}
        </button>
        <button
          onClick={fetchStatus}
          className="flex items-center gap-2 px-4 py-3 border text-sm rounded-lg hover:bg-marvvn-gray-50 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className={`p-4 rounded-lg text-sm ${syncResult.failed === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          <p className="font-medium">
            Sync complete: {syncResult.synced} synced, {syncResult.failed} failed
          </p>
          {syncResult.errors?.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs">
              {syncResult.errors.slice(0, 5).map((err: string, i: number) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
      )}

      {/* Products Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-medium">Products ({products.length})</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-marvvn-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-marvvn-gray-400">No products found</div>
        ) : (
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {products.map(product => (
              <div key={product.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {product.image ? (
                    <img src={product.image} alt="" className="w-10 h-10 object-cover rounded" />
                  ) : (
                    <div className="w-10 h-10 bg-marvvn-gray-100 rounded flex items-center justify-center">
                      <Package className="w-5 h-5 text-marvvn-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-marvvn-gray-400">₹{product.price} · {product.stock} in stock</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${product.synced ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {product.synced ? 'Synced' : 'Not synced'}
                  </span>
                  {!product.synced && (
                    <button
                      onClick={() => handleSyncOne(product.id)}
                      className="text-xs text-marvvn-black underline hover:no-underline cursor-pointer"
                    >
                      Sync
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs text-marvvn-gray-500">{label}</p>
      </div>
      <p className="text-2xl font-medium">{value}</p>
    </div>
  )
}
