import { NextRequest, NextResponse } from 'next/server'
import { getSession, signOut } from '@/shared/auth/config'
import { handleApiError, generateRequestId } from '@/shared/errors/handler'

export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    const session = await getSession(request.headers)

    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'No autenticado' }, requestId },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: session.user,
      session: session.session,
    })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  try {
    await signOut(request.headers)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, requestId)
  }
}
