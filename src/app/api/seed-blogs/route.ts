import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = createClient()
  if (!(await isAdmin(supabase))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { blogPosts } = await import('@/lib/data')

  const seedData = blogPosts.map((p) => ({
    handle: p.handle,
    title: p.title,
    excerpt: p.excerpt,
    content: '',
    image: p.image,
    author: p.author || 'MARVVN',
    tags: p.tags,
    published: true,
  }))

  const { data, error } = await supabase
    .from('blogs')
    .upsert(seedData, { onConflict: 'handle' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const reviewSeedData = [
    {
      name: 'Tamchi Nyakum',
      text: 'It was so much worthy than buying a ₹1400 t-shirt from H&M or Zara. The quality was better and was the aesthetic!',
      rating: 5,
      featured: true,
    },
    {
      name: 'Saumya Raj',
      text: 'I Just love it. The quality is premium and i bought XS and it fits me best. I have been dying to get a billie ellish tee in India but always worried about quality but you can surely go for this one.',
      rating: 5,
      featured: true,
    },
    {
      name: 'Ansh Jadli',
      text: 'Change your name to quality.com I swear i lovedddddddd the quality so so so much Thanks MARVVN',
      rating: 5,
      featured: true,
    },
  ]

  await supabase.from('reviews').upsert(reviewSeedData, { onConflict: 'name' })

  return NextResponse.json({ success: true, blogs: seedData.length, reviews: reviewSeedData.length })
}
