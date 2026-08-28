import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'MARVVN'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect fill="#000" width="1200" height="630"/>
    <text fill="#fff" font-family="Arial,sans-serif" font-size="48" font-weight="bold" letter-spacing="8" text-anchor="middle" x="600" y="280">MARVVN</text>
    <text fill="#fff" font-family="Arial,sans-serif" font-size="28" text-anchor="middle" x="600" y="340">${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
    <text fill="#666" font-family="Arial,sans-serif" font-size="18" text-anchor="middle" x="600" y="400">marvvn.online</text>
  </svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
