import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function isAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  return profile?.is_admin || false
}

function parseCSVRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()

  try {
    const { csv } = await request.json()
    if (!csv) return NextResponse.json({ error: 'No CSV data' }, { status: 400 })

    const lines = csv.trim().split('\n')
    if (lines.length < 2) return NextResponse.json({ error: 'CSV must have a header row and at least one data row' }, { status: 400 })

    const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'))
    const results = { created: 0, skipped: 0, errors: [] as string[] }

    const requiredHeaders = ['title', 'price', 'category']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      return NextResponse.json({ error: `Missing required columns: ${missingHeaders.join(', ')}` }, { status: 400 })
    }

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = parseCSVRow(lines[i])
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => { row[h] = values[idx] || '' })

      if (!row.title || !row.price || !row.category) {
        results.errors.push(`Row ${i + 1}: missing title, price, or category`)
        results.skipped++
        continue
      }

      const price = parseFloat(row.price)
      if (isNaN(price) || price <= 0) {
        results.errors.push(`Row ${i + 1}: invalid price "${row.price}"`)
        results.skipped++
        continue
      }

      const slug = slugify(row.title)

      const { data: existing } = await admin
        .from('products')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existing) {
        results.skipped++
        continue
      }

      const product: any = {
        title: row.title,
        slug,
        description: row.description || row.title,
        price,
        category: row.category.toLowerCase(),
        sizes: row.sizes ? row.sizes.split('|').map((s: string) => s.trim()) : ['S', 'M', 'L', 'XL'],
        colors: row.colors ? row.colors.split('|').map((c: string) => c.trim()) : ['Black'],
        images: row.images ? row.images.split('|').map((i: string) => i.trim()) : [],
        stock: row.stock ? parseInt(row.stock) : 0,
        badge: row.badge || null,
        featured: row.featured === 'true' || row.featured === '1',
        active: row.active !== 'false' && row.active !== '0',
      }

      if (row.compare_at_price) {
        product.compare_at_price = parseFloat(row.compare_at_price)
      }
      if (row.flash_sale === 'true' || row.flash_sale === '1') {
        product.flash_sale = true
        if (row.flash_sale_price) product.flash_sale_price = parseFloat(row.flash_sale_price)
        if (row.flash_sale_ends_at) product.flash_sale_ends_at = row.flash_sale_ends_at
      }
      if (row.tags) {
        product.tags = row.tags.split('|').map((t: string) => t.trim())
      }
      if (row.season) {
        product.season = row.season
      }

      const { error } = await admin.from('products').insert(product)
      if (error) {
        results.errors.push(`Row ${i + 1}: ${error.message}`)
        results.skipped++
      } else {
        results.created++
      }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to parse CSV: ' + e.message }, { status: 500 })
  }
}
