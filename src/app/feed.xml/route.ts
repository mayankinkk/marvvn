import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()

  const { data: blogs } = await supabase
    .from('blogs')
    .select('handle, title, excerpt, image, author, created_at, category, tags')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(50)

  const siteUrl = 'https://marvvn.online'
  const posts = blogs || []

  const items = posts.map(post => {
    const pubDate = new Date(post.created_at).toUTCString()
    const categories = post.tags?.map((t: string) => `<![CDATA[${t}]]>`).join('') || ''
    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blogs/${post.handle}</link>
      <guid isPermaLink="true">${siteUrl}/blogs/${post.handle}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[<img src="${post.image}" alt="${post.title}" /><br/>${post.excerpt}]]></content:encoded>
      <author><![CDATA[${post.author || 'MARVVN'}]]></author>
      <pubDate>${pubDate}</pubDate>
      ${categories ? `<category>${categories}</category>` : ''}
    </item>`
  }).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MARVVN Blog</title>
    <link>${siteUrl}</link>
    <description>Stories, style guides, and behind-the-scenes from the MARVVN world</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
