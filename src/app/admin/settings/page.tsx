'use client'

import { useState, useEffect } from 'react'
import { Save, Store, Truck, Globe, Palette, Shield, Bell, Search, Loader2, FileText } from 'lucide-react'

type Tab = 'general' | 'shipping' | 'seo' | 'social' | 'notifications' | 'appearance' | 'maintenance' | 'invoice'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'general', label: 'General', icon: Store },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'invoice', label: 'Invoice', icon: FileText },
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
      if (settings.tax_rate && (parseFloat(settings.tax_rate) < 0 || parseFloat(settings.tax_rate) > 100)) {
        alert('Tax rate must be between 0 and 100')
        setSaving(false)
        return
      }
      if (settings.free_shipping_threshold && parseFloat(settings.free_shipping_threshold) < 0) {
        alert('Free shipping threshold cannot be negative')
        setSaving(false)
        return
      }
      if (settings.shipping_fee && parseFloat(settings.shipping_fee) < 0) {
        alert('Shipping fee cannot be negative')
        setSaving(false)
        return
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        alert('Failed to save settings')
      }
    } catch {
      alert('Failed to save settings')
    }
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
                <label className="block text-sm font-medium mb-1">Announcement Bar</label>
                <input
                  type="text"
                  value={settings.announcement_bar || ''}
                  onChange={(e) => update('announcement_bar', e.target.value)}
                  className="input-field w-full"
                  placeholder="Text shown in the top scrolling bar..."
                />
                <p className="text-xs text-marvvn-gray-500 mt-1">Leave empty to hide the announcement bar.</p>
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

          {activeTab === 'invoice' && (
            <div className="space-y-6">
              <h2 className="font-medium text-lg">Invoice Template</h2>
              <p className="text-sm text-marvvn-gray-500">Customize how GST invoices look on your store.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="Invoice Logo URL"
                  value={settings.invoice_logo_url || ''}
                  onChange={(v) => update('invoice_logo_url', v)}
                  placeholder="https://..."
                />
                {settings.invoice_logo_url && (
                  <div className="mt-2 w-40 h-16 border rounded overflow-hidden bg-white">
                    <img src={settings.invoice_logo_url} alt="Invoice logo" className="w-full h-full object-contain" />
                  </div>
                )}
                <Field
                  label="GSTIN Number"
                  value={settings.invoice_gst_number || ''}
                  onChange={(v) => update('invoice_gst_number', v)}
                  placeholder="22AAAAA0000A1Z5"
                />
                <Field
                  label="GST Percentage (%)"
                  value={settings.invoice_gst_percentage || '12'}
                  onChange={(v) => update('invoice_gst_percentage', v)}
                  type="number"
                />
                <Field
                  label="Invoice Number Prefix"
                  value={settings.invoice_prefix || 'INV'}
                  onChange={(v) => update('invoice_prefix', v)}
                  placeholder="INV"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.invoice_primary_color || '#000000'}
                      onChange={(e) => update('invoice_primary_color', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.invoice_primary_color || '#000000'}
                      onChange={(e) => update('invoice_primary_color', e.target.value)}
                      className="input-field flex-1 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={settings.invoice_secondary_color || '#666666'}
                      onChange={(e) => update('invoice_secondary_color', e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.invoice_secondary_color || '#666666'}
                      onChange={(e) => update('invoice_secondary_color', e.target.value)}
                      className="input-field flex-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Toggle
                  label="Show Logo"
                  description="Display store logo on invoice"
                  checked={settings.invoice_show_logo !== 'false'}
                  onChange={(v) => update('invoice_show_logo', v ? 'true' : 'false')}
                />
                <Toggle
                  label="Show GST Breakdown"
                  description="Display GST amount separately"
                  checked={settings.invoice_show_gst !== 'false'}
                  onChange={(v) => update('invoice_show_gst', v ? 'true' : 'false')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Footer Text</label>
                <input
                  type="text"
                  value={settings.invoice_footer_text || ''}
                  onChange={(e) => update('invoice_footer_text', e.target.value)}
                  className="input-field w-full"
                  placeholder="Thank you for shopping with MARVVN!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Terms & Conditions</label>
                <textarea
                  value={settings.invoice_terms || ''}
                  onChange={(e) => update('invoice_terms', e.target.value)}
                  className="input-field w-full min-h-[80px]"
                  placeholder="Return policy, warranty info..."
                />
              </div>

              {/* Live Preview */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium mb-3">Live Preview</h3>
                <div className="border rounded-lg overflow-hidden" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <div style={{ padding: '20px', borderBottom: `3px solid ${settings.invoice_primary_color || '#000'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        {settings.invoice_show_logo !== 'false' && settings.invoice_logo_url ? (
                          <img src={settings.invoice_logo_url} alt="" style={{ height: '40px', objectFit: 'contain' }} />
                        ) : (
                          <h1 style={{ fontSize: '22px', letterSpacing: '3px', margin: 0, color: settings.invoice_primary_color || '#000' }}>
                            {settings.store_name || 'MARVVN'}
                          </h1>
                        )}
                        <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0' }}>{settings.store_address || 'Faridabad'}</p>
                        {settings.invoice_gst_number && <p style={{ color: '#666', fontSize: '11px', margin: '2px 0 0' }}>GSTIN: {settings.invoice_gst_number}</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h2 style={{ fontSize: '16px', margin: 0, color: '#333' }}>TAX INVOICE</h2>
                        <p style={{ fontSize: '11px', color: '#666', margin: '4px 0' }}>#{settings.invoice_prefix || 'INV'}-DEMO123</p>
                        <p style={{ fontSize: '11px', color: '#666', margin: '2px 0' }}>{new Date().toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <p style={{ fontSize: '11px', color: '#999', margin: '0 0 4px', textTransform: 'uppercase' }}>Bill To</p>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0' }}>Customer Name</p>
                    <p style={{ fontSize: '11px', color: '#666', margin: '2px 0' }}>123 Street, City, State 123456</p>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f5f5f5' }}>
                        <th style={{ padding: '8px', textAlign: 'left', fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>Item</th>
                        <th style={{ padding: '8px', textAlign: 'center', fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>Qty</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>Rate</th>
                        <th style={{ padding: '8px', textAlign: 'right', fontSize: '10px', textTransform: 'uppercase', color: '#666' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', fontSize: '12px' }}>Demo Product (M, Black)</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>2</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>₹999</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontSize: '12px' }}>₹1,998</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      {settings.invoice_show_gst !== 'false' && settings.invoice_gst_number && (
                        <>
                          <tr>
                            <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '12px' }}>Subtotal</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '12px' }}>₹1,998</td>
                          </tr>
                          <tr>
                            <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right', fontSize: '12px' }}>GST ({settings.invoice_gst_percentage || '12'}%)</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '12px' }}>₹240</td>
                          </tr>
                        </>
                      )}
                      <tr style={{ borderTop: `2px solid ${settings.invoice_primary_color || '#000'}` }}>
                        <td colSpan={3} style={{ padding: '10px 8px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>Total</td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>₹2,238</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
                    {settings.invoice_terms && (
                      <p style={{ fontSize: '10px', color: '#999', margin: '0 0 4px' }}>{settings.invoice_terms}</p>
                    )}
                    <p style={{ fontSize: '11px', color: settings.invoice_secondary_color || '#666', margin: 0 }}>{settings.invoice_footer_text || 'Thank you for shopping with MARVVN!'}</p>
                  </div>
                </div>
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
