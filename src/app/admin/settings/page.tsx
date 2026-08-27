'use client'

import { useState, useEffect } from 'react'
import { Save, Store, Truck, Globe, Palette, Shield, Bell, Search, Loader2 } from 'lucide-react'

type Tab = 'general' | 'shipping' | 'seo' | 'social' | 'notifications' | 'appearance' | 'maintenance'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'social', label: 'Social', icon: Globe },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'maintenance', label: 'Maintenance', icon: Shield },
]

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('general')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => { setSettings(data.settings || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const update = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {}
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-marvvn-black border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-medium">Store Settings</h1>
          <p className="text-sm text-marvvn-gray-500 mt-1">Configure your store details and preferences</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-56 flex-shrink-0">
          <nav className="bg-white border rounded-xl overflow-hidden sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-marvvn-black text-white font-medium'
                    : 'hover:bg-marvvn-gray-50 text-marvvn-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border rounded-xl p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="font-medium text-lg">General Settings</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Store Name" value={settings.store_name || ''} onChange={(v) => update('store_name', v)} />
                <Field label="Store Email" value={settings.store_email || ''} onChange={(v) => update('store_email', v)} type="email" />
                <Field label="Phone Number" value={settings.store_phone || ''} onChange={(v) => update('store_phone', v)} />
                <Field label="Currency Code" value={settings.currency || 'INR'} onChange={(v) => update('currency', v)} />
                <Field label="Currency Symbol" value={settings.currency_symbol || '₹'} onChange={(v) => update('currency_symbol', v)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Store Address</label>
                <textarea
                  value={settings.store_address || ''}
                  onChange={(e) => update('store_address', e.target.value)}
                  className="input-field w-full min-h-[80px]"
                  placeholder="Store address..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Store Description</label>
                <textarea
                  value={settings.store_description || ''}
                  onChange={(e) => update('store_description', e.target.value)}
                  className="input-field w-full min-h-[80px]"
                  placeholder="Short description of your store..."
                />
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h2 className="font-medium text-lg">Shipping Settings</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="Free Shipping Threshold (₹)"
                  value={settings.free_shipping_threshold || '999'}
                  onChange={(v) => update('free_shipping_threshold', v)}
                  type="number"
                />
                <Field
                  label="Standard Shipping Fee (₹)"
                  value={settings.shipping_fee || '99'}
                  onChange={(v) => update('shipping_fee', v)}
                  type="number"
                />
                <Field
                  label="Tax Rate (%)"
                  value={settings.tax_rate || '0'}
                  onChange={(v) => update('tax_rate', v)}
                  type="number"
                />
                <Field
                  label="Low Stock Alert Threshold"
                  value={settings.low_stock_threshold || '5'}
                  onChange={(v) => update('low_stock_threshold', v)}
                  type="number"
                />
              </div>
              <div className="bg-marvvn-gray-50 rounded-lg p-4 text-sm text-marvvn-gray-600">
                <p>Orders above <strong>₹{settings.free_shipping_threshold || '999'}</strong> get free shipping. Standard fee of <strong>₹{settings.shipping_fee || '99'}</strong> applies otherwise.</p>
                <p className="mt-2">Products with stock below <strong>{settings.low_stock_threshold || '5'}</strong> units will trigger a low stock alert.</p>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h2 className="font-medium text-lg">SEO Settings</h2>
              <div className="space-y-4">
                <Field
                  label="Default Meta Title"
                  value={settings.seo_title || ''}
                  onChange={(v) => update('seo_title', v)}
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Default Meta Description</label>
                  <textarea
                    value={settings.seo_description || ''}
                    onChange={(e) => update('seo_description', e.target.value)}
                    className="input-field w-full min-h-[80px]"
                  />
                </div>
                <Field
                  label="Meta Keywords (comma separated)"
                  value={settings.seo_keywords || ''}
                  onChange={(v) => update('seo_keywords', v)}
                />
              </div>
              <div className="bg-marvvn-gray-50 rounded-lg p-4 text-sm text-marvvn-gray-600">
                <p>These settings control the default meta tags for your site. Individual pages can override these values.</p>
                <p className="mt-2">Preview: <span className="font-medium">{settings.seo_title || 'MARVVN - Premium Streetwear'}</span></p>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h2 className="font-medium text-lg">Social Media</h2>
              <div className="space-y-4">
                <Field
                  label="WhatsApp Number (with country code)"
                  value={settings.whatsapp_number || ''}
                  onChange={(v) => update('whatsapp_number', v)}
                  placeholder="+919876543210"
                />
                <Field
                  label="Instagram URL"
                  value={settings.instagram_url || ''}
                  onChange={(v) => update('instagram_url', v)}
                  placeholder="https://instagram.com/marvvn"
                />
                <Field
                  label="Facebook URL"
                  value={settings.facebook_url || ''}
                  onChange={(v) => update('facebook_url', v)}
                  placeholder="https://facebook.com/marvvn"
                />
                <Field
                  label="Twitter/X URL"
                  value={settings.twitter_url || ''}
                  onChange={(v) => update('twitter_url', v)}
                  placeholder="https://x.com/marvvn"
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="font-medium text-lg">Appearance</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Logo URL</label>
                  <input
                    type="text"
                    value={settings.logo_url || ''}
                    onChange={(e) => update('logo_url', e.target.value)}
                    className="input-field"
                    placeholder="https://..."
                  />
                  {settings.logo_url && (
                    <div className="mt-2 w-32 h-12 border rounded overflow-hidden">
                      <img src={settings.logo_url} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    value={settings.banner_url || ''}
                    onChange={(e) => update('banner_url', e.target.value)}
                    className="input-field"
                    placeholder="https://..."
                  />
                  {settings.banner_url && (
                    <div className="mt-2 w-full h-24 border rounded overflow-hidden">
                      <img src={settings.banner_url} alt="Banner preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.primary_color || '#000000'}
                      onChange={(e) => update('primary_color', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primary_color || '#000000'}
                      onChange={(e) => update('primary_color', e.target.value)}
                      className="input-field flex-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.accent_color || '#666666'}
                      onChange={(e) => update('accent_color', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.accent_color || '#666666'}
                      onChange={(e) => update('accent_color', e.target.value)}
                      className="input-field flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="font-medium text-lg">Notification Settings</h2>
              <div className="space-y-4">
                <Toggle
                  label="Order confirmation emails"
                  description="Send email to customer when order is placed"
                  checked={settings.order_email_enabled === 'true'}
                  onChange={(v) => update('order_email_enabled', v ? 'true' : 'false')}
                />
              </div>
              <div className="bg-marvvn-gray-50 rounded-lg p-4 text-sm text-marvvn-gray-600">
                <p>Email notifications are sent via Supabase Auth. Make sure your SMTP settings are configured in the Supabase dashboard.</p>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h2 className="font-medium text-lg">Maintenance Mode</h2>
              <Toggle
                label="Enable Maintenance Mode"
                description="Show maintenance page to all visitors except admins"
                checked={settings.maintenance_mode === 'true'}
                onChange={(v) => update('maintenance_mode', v ? 'true' : 'false')}
              />
              {settings.maintenance_mode === 'true' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                  <p className="font-medium">⚠️ Maintenance mode is ON</p>
                  <p className="mt-1">All visitors will see the maintenance page. Admins can still access the site.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Maintenance Message</label>
                <textarea
                  value={settings.maintenance_message || ''}
                  onChange={(e) => update('maintenance_message', e.target.value)}
                  className="input-field w-full min-h-[80px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field w-full"
        placeholder={placeholder}
      />
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-marvvn-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-marvvn-black' : 'bg-marvvn-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </div>
  )
}
