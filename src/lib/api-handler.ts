import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }

  if (error instanceof Error) {
    console.error('API error:', error.message, error.stack)
  } else {
    console.error('Unknown API error:', error)
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}

export async function withErrorHandling(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler()
  } catch (error) {
    return handleApiError(error)
  }
}

export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): void {
  for (const field of fields) {
    if (!data[field]) {
      throw new ApiError(400, `${field} is required`)
    }
  }
}

export function validateEmail(email: string): void {
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'Valid email is required')
  }
}

export function validateAuth(user: { id: string } | null): asserts user is { id: string } {
  if (!user) {
    throw new ApiError(401, 'Unauthorized')
  }
}
