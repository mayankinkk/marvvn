import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  return NextResponse.json({ blogs: data })
}

export async function POST(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { handle, title, excerpt, content, image, author, tags, published } = body

  if (!handle || !title || !excerpt || !image) {
    return NextResponse.json({ error: 'Handle, title, excerpt, and image are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('blogs')
    .insert({
      handle: handle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title,
      excerpt,
      content: content || '',
      image,
      author: author || 'MARVVN',
      tags: tags || [],
      published: published !== false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A blog with this handle already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 })
  }
  return NextResponse.json({ blog: data }, { status: 201 })
}

export async function PUT(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { id, handle, title, excerpt, content, image, author, tags, published } = body

  if (!id) return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 })

  const updates: Record<string, any> = {}
  if (handle !== undefined) updates.handle = handle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  if (title !== undefined) updates.title = title
  if (excerpt !== undefined) updates.excerpt = excerpt
  if (content !== undefined) updates.content = content
  if (image !== undefined) updates.image = image
  if (author !== undefined) updates.author = author
  if (tags !== undefined) updates.tags = tags
  if (published !== undefined) updates.published = published

  const { data, error } = await supabase
    .from('blogs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 })
  return NextResponse.json({ blog: data })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase.from('blogs').delete().eq('id', id)
  if (error) return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 })
  return NextResponse.json({ success: true })
}
