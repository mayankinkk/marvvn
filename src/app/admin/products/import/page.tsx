'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, Upload, FileText, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react'

export default function AdminImportPage() {
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCsvText(reader.result as string)
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!csvText.trim()) return
    setImporting(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
      } else {
        setResults(data)
      }
    } catch {
      setError('Import failed. Please try again.')
    }
    setImporting(false)
  }

  const downloadTemplate = () => {
    const template = `title,price,category,description,sizes,colors,images,stock,compare_at_price,flash_sale,flash_sale_price,flash_sale_ends_at,badge,featured,active,tags,season
Classic Tee,999,men,"A classic crew neck tee",S|M|L|XL|XXL,Black|White|Navy,https://example.com/img1.jpg|https://example.com/img2.jpg,50,1299,false,,,bestseller,true,true,cotton|summer,summer`
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link href="/admin" className="text-gray-500 hover:text-gray-900 transition-colors">Admin</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/admin/products" className="text-gray-500 hover:text-gray-900 transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-medium">Bulk Import</span>
          </nav>
          <h1 className="text-xl font-display font-medium text-gray-900">Bulk CSV Import</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left — CSV Input */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">CSV Data</h2>
                <button
                  onClick={downloadTemplate}
                  className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  Download Template
                </button>
              </div>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full h-64 px-4 py-3 text-sm font-mono border border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none resize-none"
                placeholder={`title,price,category,description,sizes,colors,images,stock\nClassic Tee,999,men,"A classic tee",S|M|L|XL,Black|White,https://img.jpg,50`}
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload CSV file
                </button>
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
              </div>
            </div>

            <button
              onClick={handleImport}
              disabled={!csvText.trim() || importing}
              className="w-full bg-gray-900 text-white py-3 text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Products
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Right — Results / Guide */}
          <div className="space-y-5">
            {results ? (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Import Results</h2>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{results.created}</p>
                    <p className="text-xs text-green-600">Created</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-700">{results.skipped}</p>
                    <p className="text-xs text-amber-600">Skipped</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">{results.errors.length}</p>
                    <p className="text-xs text-red-600">Errors</p>
                  </div>
                </div>
                {results.errors.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Errors</p>
                    {results.errors.map((err: string, i: number) => (
                      <p key={i} className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded">{err}</p>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <Link href="/admin/products" className="text-sm text-gray-600 hover:text-gray-900 underline">
                    View all products
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">CSV Format Guide</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <p className="font-medium text-gray-900">Required columns:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">title</code> — Product name</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">price</code> — Price in INR</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">category</code> — men / women / kids / accessories</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Optional columns:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">description</code> — Product description</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">sizes</code> — Pipe-separated: S|M|L|XL</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">colors</code> — Pipe-separated: Black|White</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">images</code> — Pipe-separated URLs</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">stock</code> — Quantity in stock</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">compare_at_price</code> — Original price for discounts</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">flash_sale</code> — true/false</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">flash_sale_price</code> — Sale price</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">flash_sale_ends_at</code> — ISO date</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">badge</code> — e.g. bestseller, new</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">featured</code> — true/false</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">active</code> — true/false (default true)</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">tags</code> — Pipe-separated tags</li>
                      <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">season</code> — summer/winter/all</li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mt-3">
                    <p className="text-xs text-amber-700">
                      <strong>Note:</strong> Products with duplicate slugs (same title) are skipped.
                      Use the template for the correct format.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
