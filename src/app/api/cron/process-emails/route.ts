import { NextResponse } from 'next/server'
import { processScheduledEmails } from '@/lib/scheduled-emails'

// This endpoint is called by Vercel Cron or manually
// It processes all scheduled emails that are due
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron or has the correct secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await processScheduledEmails()
    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
