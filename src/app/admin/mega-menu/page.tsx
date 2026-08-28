'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronRight } from 'lucide-react'

interface MegaLink {
  label: string
  href: string
}

interface MegaColumn {
  title: string
  links: MegaLink[]
}

interface MegaMenu {
  title: string
  columns: MegaColumn[]
}

const DEFAULT_MEGA_MENU: MegaMenu[] = [
  {
    title: 'Women',
    columns: [
      { title: 'Categories', links: [
        { label: 'New Arrivals', href: '/collections/womens-new-arrivals' },
        { label: 'Oversized T-Shirts', href: '/collections/oversized-t-shirt-women' },
      ]},
      { title: 'Collections', links: [
        { label: 'Freestyle Collection', href: '/collections/freestyle-women' },
      ]},
      { title: 'Collaborations', links: [
        { label: 'Marvel', href: '/collections/marvel-women' },
      ]},
    ],
  },
]

export default function MegaMenuPage() {
  const [menus, setMenus] = useState<MegaMenu[]>(DEFAULT_MEGA_MENU)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [expandedMenu, setExpandedMenu] = useState<number | null>(0)
  const [expandedColumn, setExpandedColumn] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        const raw = data.settings?.mega_menu
        if (raw && raw !== '[]' && raw !== 'null') {
          try {
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMenus(parsed)
            }
          } catch {}
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const updateMenu = (index: number, data: Partial<MegaMenu>) => {
    const updated = [...menus]
    updated[index] = { ...updated[index], ...data }
    setMenus(updated)
  }

  const addMenu = () => {
    setMenus([...menus, { title: 'New Menu', columns: [{ title: 'Column', links: [] }] }])
    setExpandedMenu(menus.length)
  }

  const removeMenu = (index: number) => {
    setMenus(menus.filter((_, i) => i !== index))
  }

  const updateColumn = (menuIdx: number, colIdx: number, data: Partial<MegaColumn>) => {
    const updated = [...menus]
    updated[menuIdx].columns[colIdx] = { ...updated[menuIdx].columns[colIdx], ...data }
    setMenus(updated)
  }

  const addColumn = (menuIdx: number) => {
    const updated = [...menus]
    updated[menuIdx].columns.push({ title: 'New Column', links: [] })
    setMenus(updated)
  }

  const removeColumn = (menuIdx: number, colIdx: number) => {
    const updated = [...menus]
    updated[menuIdx].columns.splice(colIdx, 1)
    setMenus(updated)
  }

  const updateLink = (menuIdx: number, colIdx: number, linkIdx: number, data: Partial<MegaLink>) => {
    const updated = [...menus]
    updated[menuIdx].columns[colIdx].links[linkIdx] = {
      ...updated[menuIdx].columns[colIdx].links[linkIdx],
      ...data,
    }
    setMenus(updated)
  }

  const addLink = (menuIdx: number, colIdx: number) => {
    const updated = [...menus]
    updated[menuIdx].columns[colIdx].links.push({ label: 'New Link', href: '/collections/' })
    setMenus(updated)
  }

  const removeLink = (menuIdx: number, colIdx: number, linkIdx: number) => {
    const updated = [...menus]
    updated[menuIdx].columns[colIdx].links.splice(linkIdx, 1)
    setMenus(updated)
  }

  const moveLink = (menuIdx: number, colIdx: number, linkIdx: number, dir: number) => {
    const updated = [...menus]
    const links = updated[menuIdx].columns[colIdx].links
    const newIdx = linkIdx + dir
    if (newIdx < 0 || newIdx >= links.length) return
    ;[links[linkIdx], links[newIdx]] = [links[newIdx], links[linkIdx]]
    setMenus(updated)
  }

  const moveColumn = (menuIdx: number, colIdx: number, dir: number) => {
    const updated = [...menus]
    const cols = updated[menuIdx].columns
    const newIdx = colIdx + dir
    if (newIdx < 0 || newIdx >= cols.length) return
    ;[cols[colIdx], cols[newIdx]] = [cols[newIdx], cols[colIdx]]
    setMenus(updated)
  }

  const moveMenu = (index: number, dir: number) => {
    const updated = [...menus]
    const newIdx = index + dir
    if (newIdx < 0 || newIdx >= updated.length) return
    ;[updated[index], updated[newIdx]] = [updated[newIdx], updated[index]]
    setMenus(updated)
    if (expandedMenu === index) setExpandedMenu(newIdx)
    else if (expandedMenu === newIdx) setExpandedMenu(index)
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { mega_menu: JSON.stringify(menus) } }),
      })
      if (res.ok) {
        setMsg('Mega menu saved!')
      } else {
        setMsg('Failed to save')
      }
    } catch {
      setMsg('Failed to save')
    }
    setSaving(false)
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mega Menu Editor</h1>
          <p className="text-sm text-gray-500 mt-1">Edit the navigation mega menus for Women, Men, and Accessories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addMenu} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-sm font-medium hover:bg-gray-200">
            <Plus className="w-4 h-4" /> Add Menu
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-4 p-3 text-sm ${msg.includes('saved') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="space-y-4">
        {menus.map((menu, menuIdx) => (
          <div key={menuIdx} className="border border-gray-200 bg-white">
            {/* Menu Header */}
            <div className="flex items-center gap-2 p-4 bg-gray-50 border-b">
              <button onClick={() => setExpandedMenu(expandedMenu === menuIdx ? null : menuIdx)} className="p-1">
                {expandedMenu === menuIdx ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <input
                value={menu.title}
                onChange={(e) => updateMenu(menuIdx, { title: e.target.value })}
                className="flex-1 px-3 py-1.5 text-sm font-bold border border-gray-300 focus:outline-none focus:border-blue-500"
                placeholder="Menu title (e.g. Women)"
              />
              <button onClick={() => moveMenu(menuIdx, -1)} disabled={menuIdx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">↑</button>
              <button onClick={() => moveMenu(menuIdx, 1)} disabled={menuIdx === menus.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">↓</button>
              <button onClick={() => removeMenu(menuIdx)} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
            </div>

            {/* Columns */}
            {expandedMenu === menuIdx && (
              <div className="p-4 space-y-4">
                {menu.columns.map((col, colIdx) => {
                  const colKey = `${menuIdx}-${colIdx}`
                  return (
                    <div key={colIdx} className="border border-gray-200 ml-4">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 border-b">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                        <input
                          value={col.title}
                          onChange={(e) => updateColumn(menuIdx, colIdx, { title: e.target.value })}
                          className="flex-1 px-2 py-1 text-sm font-semibold border border-gray-300 focus:outline-none focus:border-blue-500"
                          placeholder="Column title"
                        />
                        <button onClick={() => moveColumn(menuIdx, colIdx, -1)} disabled={colIdx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↑</button>
                        <button onClick={() => moveColumn(menuIdx, colIdx, 1)} disabled={colIdx === menu.columns.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↓</button>
                        <button onClick={() => removeColumn(menuIdx, colIdx)} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="p-3 space-y-2">
                        {col.links.map((link, linkIdx) => (
                          <div key={linkIdx} className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-4">{linkIdx + 1}</span>
                            <input
                              value={link.label}
                              onChange={(e) => updateLink(menuIdx, colIdx, linkIdx, { label: e.target.value })}
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-200 focus:outline-none focus:border-blue-500"
                              placeholder="Label"
                            />
                            <input
                              value={link.href}
                              onChange={(e) => updateLink(menuIdx, colIdx, linkIdx, { href: e.target.value })}
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-200 focus:outline-none focus:border-blue-500 font-mono"
                              placeholder="/collections/..."
                            />
                            <button onClick={() => moveLink(menuIdx, colIdx, linkIdx, -1)} disabled={linkIdx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↑</button>
                            <button onClick={() => moveLink(menuIdx, colIdx, linkIdx, 1)} disabled={linkIdx === col.links.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↓</button>
                            <button onClick={() => removeLink(menuIdx, colIdx, linkIdx)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        ))}
                        <button onClick={() => addLink(menuIdx, colIdx)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2">
                          <Plus className="w-3 h-3" /> Add Link
                        </button>
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => addColumn(menuIdx)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 ml-4">
                  <Plus className="w-4 h-4" /> Add Column
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
