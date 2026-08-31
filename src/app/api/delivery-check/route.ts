import { NextRequest, NextResponse } from 'next/server'
import { withErrorHandling, ApiError } from '@/lib/api-handler'

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const { searchParams } = new URL(request.url)
    const pincode = searchParams.get('pincode')

    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      throw new ApiError(400, 'Enter a valid 6-digit pincode')
    }

    const firstDigit = parseInt(pincode[0])

    let minDays = 3
    let maxDays = 5
    if (firstDigit <= 1) { minDays = 2; maxDays = 4 }
    else if (firstDigit <= 3) { minDays = 3; maxDays = 5 }
    else if (firstDigit <= 5) { minDays = 4; maxDays = 6 }
    else if (firstDigit <= 7) { minDays = 5; maxDays = 7 }
    else { minDays = 5; maxDays = 8 }

    const now = new Date()
    const startDate = new Date(now)
    startDate.setDate(now.getDate() + minDays)
    const endDate = new Date(now)
    endDate.setDate(now.getDate() + maxDays)

    const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

    return NextResponse.json({
      deliverable: true,
      estimate: `Expected delivery between ${formatDate(startDate)} - ${formatDate(endDate)}`,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    })
  })
}
