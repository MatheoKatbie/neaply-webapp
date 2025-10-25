import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })
    return NextResponse.json({ exists: !!user })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json({ exists: false })
  }
}
