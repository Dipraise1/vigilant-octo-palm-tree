import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const processCashbackSchema = z.object({
  userId: z.string(),
  amount: z.number(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    if (status) where.status = status

    const [cashbacks, total] = await Promise.all([
      prisma.cashback.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
        },
      }),
      prisma.cashback.count({ where }),
    ])

    return NextResponse.json({
      cashbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching cashbacks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cashbacks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, amount } = processCashbackSchema.parse(body)

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create cashback record
    const cashback = await prisma.cashback.create({
      data: {
        userId,
        userWallet: user.walletAddress,
        amount,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    })

    return NextResponse.json(cashback, { status: 201 })
  } catch (error) {
    console.error('Error creating cashback:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create cashback' },
      { status: 500 }
    )
  }
}






