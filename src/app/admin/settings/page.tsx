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
                <Field
                  label="Site URL (for QR code)"
                  value={settings.site_url || 'https://marvvn.online'}
                  onChange={(v) => update('site_url', v)}
                  placeholder="https://marvvn.online"
                />
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
                <label className="block text-sm font-medium mb-1">Footer Tagline</label>
                <input
                  type="text"
                  value={settings.invoice_footer_text || ''}
                  onChange={(e) => update('invoice_footer_text', e.target.value)}
                  className="input-field w-full"
                  placeholder="NOT MADE TO FIT IN. | BUILT FOR THE REAL ONES. 🔥"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Terms & Conditions (below footer)</label>
                <textarea
                  value={settings.invoice_terms || ''}
                  onChange={(e) => update('invoice_terms', e.target.value)}
                  className="input-field w-full min-h-[60px]"
                  placeholder="Optional fine print below the tagline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Return Policy</label>
                <textarea
                  value={settings.invoice_return_policy || ''}
                  onChange={(e) => update('invoice_return_policy', e.target.value)}
                  className="input-field w-full min-h-[80px]"
                  placeholder="Return accepted within 3 days..."
                />
              </div>

              {/* Editable Labels */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Labels</h3>
                <p className="text-xs text-marvvn-gray-500 mb-4">Customize every text label on the invoice. Leave blank for defaults.</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <Field label="Invoice Title" value={settings.inv_invoice_label || ''} onChange={(v) => update('inv_invoice_label', v)} placeholder="TAX INVOICE" />
                  <Field label="Order Label" value={settings.inv_order_label || ''} onChange={(v) => update('inv_order_label', v)} placeholder="Order" />
                  <Field label="Date Label" value={settings.inv_date_label || ''} onChange={(v) => update('inv_date_label', v)} placeholder="Date" />
                  <Field label="Bill To" value={settings.inv_bill_to_label || ''} onChange={(v) => update('inv_bill_to_label', v)} placeholder="Bill To" />
                  <Field label="Payment Label" value={settings.inv_payment_label || ''} onChange={(v) => update('inv_payment_label', v)} placeholder="Payment Details" />
                  <Field label="Method Label" value={settings.inv_method_label || ''} onChange={(v) => update('inv_method_label', v)} placeholder="Method" />
                  <Field label="Status Label" value={settings.inv_status_label || ''} onChange={(v) => update('inv_status_label', v)} placeholder="Status" />
                  <Field label="Product Header" value={settings.inv_product_label || ''} onChange={(v) => update('inv_product_label', v)} placeholder="Product" />
                  <Field label="Variant Header" value={settings.inv_variant_label || ''} onChange={(v) => update('inv_variant_label', v)} placeholder="Variant" />
                  <Field label="Qty Header" value={settings.inv_qty_label || ''} onChange={(v) => update('inv_qty_label', v)} placeholder="Qty" />
                  <Field label="Rate Header" value={settings.inv_rate_label || ''} onChange={(v) => update('inv_rate_label', v)} placeholder="Rate" />
                  <Field label="Amount Header" value={settings.inv_amount_label || ''} onChange={(v) => update('inv_amount_label', v)} placeholder="Amount" />
                  <Field label="Subtotal" value={settings.inv_subtotal_label || ''} onChange={(v) => update('inv_subtotal_label', v)} placeholder="Subtotal" />
                  <Field label="Discount" value={settings.inv_discount_label || ''} onChange={(v) => update('inv_discount_label', v)} placeholder="Discount" />
                  <Field label="Shipping" value={settings.inv_shipping_label || ''} onChange={(v) => update('inv_shipping_label', v)} placeholder="Shipping" />
                  <Field label="Free Label" value={settings.inv_free_label || ''} onChange={(v) => update('inv_free_label', v)} placeholder="FREE" />
                  <Field label="Coupon Label" value={settings.inv_coupon_label || ''} onChange={(v) => update('inv_coupon_label', v)} placeholder="Coupon Applied" />
                  <Field label="You Saved" value={settings.inv_you_saved_label || ''} onChange={(v) => update('inv_you_saved_label', v)} placeholder="You saved" />
                  <Field label="Return Policy Header" value={settings.inv_return_policy_label || ''} onChange={(v) => update('inv_return_policy_label', v)} placeholder="Return Policy" />
                  <Field label="QR Scan Text" value={settings.inv_scan_label || ''} onChange={(v) => update('inv_scan_label', v)} placeholder="Scan to view order online" />
                </div>
              </div>

              {/* Demo Preview Values */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Preview Demo Values</h3>
                <p className="text-xs text-marvvn-gray-500 mb-4">Edit the demo amounts to see how your invoice looks with different order values.</p>
                <div className="grid md:grid-cols-4 gap-3">
                  <Field label="Demo Subtotal (₹)" value={settings.inv_demo_subtotal || '1998'} onChange={(v) => update('inv_demo_subtotal', v)} type="number" />
                  <Field label="Demo Discount (₹)" value={settings.inv_demo_discount || '200'} onChange={(v) => update('inv_demo_discount', v)} type="number" />
                  <Field label="Demo Coupon Code" value={settings.inv_demo_coupon || 'MARVVN10'} onChange={(v) => update('inv_demo_coupon', v)} />
                  <Field label="Demo GST (₹)" value={settings.inv_demo_gst || '240'} onChange={(v) => update('inv_demo_gst', v)} type="number" />
                </div>
              </div>

              {/* Live Preview */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-medium mb-3">Live Preview</h3>
                <div className="border rounded-lg overflow-hidden bg-white p-6" style={{ fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif', maxWidth: '680px' }}>
                  {/* Header */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', paddingBottom: '16px', borderBottom: '2px solid #000' }}>
                          {settings.invoice_show_logo !== 'false' && settings.invoice_logo_url ? (
                            <img src={settings.invoice_logo_url} alt="" style={{ height: '36px', objectFit: 'contain' }} />
                          ) : (
                            <div style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '3px', color: '#000' }}>{settings.store_name || 'MARVVN'}</div>
                          )}
                          <div style={{ fontSize: '10px', color: '#555', marginTop: '5px', lineHeight: 1.6 }}>
                            {settings.store_address || 'Faridabad'}
                            {settings.invoice_gst_number && <><br/>GSTIN: {settings.invoice_gst_number}</>}
                          </div>
                        </td>
                        <td style={{ verticalAlign: 'top', textAlign: 'right', paddingBottom: '16px', borderBottom: '2px solid #000' }}>
                          <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '2px', color: '#000', marginBottom: '5px' }}>{settings.inv_invoice_label || 'TAX INVOICE'}</div>
                          <table style={{ marginLeft: 'auto', borderCollapse: 'collapse' }}>
                            <tbody>
                              <tr>
                                <td style={{ fontSize: '10px', color: '#666', padding: '2px 8px 2px 0', textAlign: 'right' }}>{settings.inv_order_label || 'Order'} #</td>
                                <td style={{ fontSize: '11px', fontWeight: 600, padding: '2px 0', textAlign: 'right' }}>{settings.invoice_prefix || 'INV'}-DEMO123</td>
                              </tr>
                              <tr>
                                <td style={{ fontSize: '10px', color: '#666', padding: '2px 8px 2px 0', textAlign: 'right' }}>{settings.inv_order_label || 'Order'} #</td>
                                <td style={{ fontSize: '11px', fontWeight: 600, padding: '2px 0', textAlign: 'right' }}>A1B2C3D4</td>
                              </tr>
                              <tr>
                                <td style={{ fontSize: '10px', color: '#666', padding: '2px 8px 2px 0', textAlign: 'right' }}>{settings.inv_date_label || 'Date'}</td>
                                <td style={{ fontSize: '10px', padding: '2px 0', textAlign: 'right' }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Bill To + Payment */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '60%', paddingRight: '16px' }}>
                          <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', marginBottom: '4px' }}>{settings.inv_bill_to_label || 'Bill To'}</div>
                          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>Customer Name</div>
                          <div style={{ fontSize: '11px', color: '#333', lineHeight: 1.6 }}>123 Street, City, State 123456<br/>customer@email.com</div>
                        </td>
                        <td style={{ verticalAlign: 'top', width: '40%' }}>
                          <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', marginBottom: '4px' }}>{settings.inv_payment_label || 'Payment Details'}</div>
                          <div style={{ fontSize: '11px', color: '#666', marginBottom: '3px' }}><strong>{settings.inv_method_label || 'Method'}:</strong> Online</div>
                          <span style={{ fontSize: '10px', fontWeight: 700, border: '1px solid #000', padding: '2px 6px', letterSpacing: '0.5px' }}>{settings.inv_status_label || 'PAID'}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Product Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ background: '#000', color: '#fff' }}>
                        <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{settings.inv_product_label || 'Product'}</th>
                        <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{settings.inv_variant_label || 'Variant'}</th>
                        <th style={{ padding: '8px 6px', textAlign: 'center', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{settings.inv_qty_label || 'Qty'}</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{settings.inv_rate_label || 'Rate'}</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right', fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{settings.inv_amount_label || 'Amount'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                        <td style={{ padding: '8px 6px', fontSize: '12px', fontWeight: 600 }}>Demo Product</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '11px', color: '#444' }}>Black / M</td>
                        <td style={{ padding: '8px 6px', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>2</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', fontSize: '12px', color: '#444' }}>₹999</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', fontSize: '12px', fontWeight: 600 }}>₹1,998</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Totals */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '55%' }}></td>
                        <td style={{ width: '45%' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                              <tr><td style={{ padding: '4px 0', fontSize: '11px', color: '#444' }}>{settings.inv_subtotal_label || 'Subtotal'}</td><td style={{ padding: '4px 0', textAlign: 'right', fontSize: '11px', color: '#444' }}>₹{parseInt(settings.inv_demo_subtotal || '1998').toLocaleString('en-IN')}</td></tr>
                              <tr><td style={{ padding: '4px 0', fontSize: '11px', color: '#444' }}>{settings.inv_discount_label || 'Discount'} ({settings.inv_demo_coupon || 'MARVVN10'})</td><td style={{ padding: '4px 0', textAlign: 'right', fontSize: '11px', color: '#444' }}>-₹{parseInt(settings.inv_demo_discount || '200').toLocaleString('en-IN')}</td></tr>
                              <tr><td style={{ padding: '4px 0', fontSize: '11px', color: '#444' }}>{settings.inv_shipping_label || 'Shipping'}</td><td style={{ padding: '4px 0', textAlign: 'right', fontSize: '11px', color: '#444' }}>{settings.inv_free_label || 'FREE'}</td></tr>
                              {settings.invoice_show_gst !== 'false' && settings.invoice_gst_number && (
                                <tr><td style={{ padding: '4px 0', fontSize: '11px', color: '#444' }}>GST ({settings.invoice_gst_percentage || '12'}%)</td><td style={{ padding: '4px 0', textAlign: 'right', fontSize: '11px', color: '#444' }}>₹{parseInt(settings.inv_demo_gst || '240').toLocaleString('en-IN')}</td></tr>
                              )}
                              <tr style={{ borderTop: '2px solid #000' }}>
                                <td style={{ padding: '8px 0', fontSize: '13px', fontWeight: 800 }}>TOTAL</td>
                                <td style={{ padding: '8px 0', textAlign: 'right', fontSize: '13px', fontWeight: 800 }}>₹{(() => { const sub = parseInt(settings.inv_demo_subtotal || '1998'); const disc = parseInt(settings.inv_demo_discount || '200'); const gst = settings.invoice_show_gst !== 'false' && settings.invoice_gst_number ? parseInt(settings.inv_demo_gst || '240') : 0; return (sub - disc + gst).toLocaleString('en-IN'); })()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Coupon */}
                  <div style={{ border: '1px solid #000', padding: '8px 12px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#000' }}>{settings.inv_coupon_label || 'Coupon Applied'}: {settings.inv_demo_coupon || 'MARVVN10'}</div>
                    <div style={{ fontSize: '10px', color: '#555', marginTop: '1px' }}>{settings.inv_you_saved_label || 'You saved'} ₹{parseInt(settings.inv_demo_discount || '200').toLocaleString('en-IN')}</div>
                  </div>

                  {/* Return Policy + QR */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '65%', paddingRight: '16px' }}>
                          <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', marginBottom: '4px' }}>{settings.inv_return_policy_label || 'Return Policy'}</div>
                          <div style={{ fontSize: '10px', color: '#333', lineHeight: 1.7, borderLeft: '2px solid #000', paddingLeft: '10px' }}>
                            {settings.invoice_return_policy || '3 days return • Unused & undamaged • Non-refundable shipping • Quality inspection required'}
                          </div>
                        </td>
                        <td style={{ verticalAlign: 'top', width: '35%', textAlign: 'right' }}>
                          <div style={{ width: '80px', height: '80px', border: '1px solid #ddd', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>QR</div>
                          <div style={{ fontSize: '8px', color: '#888', marginTop: '3px' }}>{settings.inv_scan_label || 'Scan to view order'}</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Footer */}
                  <div style={{ borderTop: '2px solid #000', paddingTop: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1.5px', color: '#000', textTransform: 'uppercase', marginBottom: '3px' }}>
                      {settings.invoice_footer_text || 'NOT MADE TO FIT IN. | BUILT FOR THE REAL ONES.'}
                    </div>
                    <div style={{ fontSize: '9px', color: '#aaa' }}>{settings.store_name || 'MARVVN'}</div>
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
