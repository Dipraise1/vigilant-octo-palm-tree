import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createUserSchema = z.object({
  walletAddress: z.string().min(1),
  chain: z.enum(['SOL', 'ETH', 'BNB']),
})

const updateUserSchema = z.object({
  totalVolume: z.number().optional(),
  cashbackEligible: z.number().optional(),
  cashbackAmount: z.number().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'PROCESSED', 'SUSPENDED']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      // Return mock data when database is not configured
      const mockUsers = [
        {
          id: '1',
          walletAddress: '0x1234...5678',
          chain: 'ETH',
          totalVolume: 15000,
          cashbackEligible: 15000,
          cashbackAmount: 300,
          status: 'ACTIVE',
          createdAt: new Date(),
          transactions: [],
          cashbacks: [],
        },
        {
          id: '2',
          walletAddress: '0x9876...5432',
          chain: 'SOL',
          totalVolume: 8500,
          cashbackEligible: 8500,
          cashbackAmount: 170,
          status: 'PENDING',
          createdAt: new Date(),
          transactions: [],
          cashbacks: [],
        },
      ]
      
      return NextResponse.json({
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: mockUsers.length,
          pages: 1,
        },
      })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const chain = searchParams.get('chain')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    if (status) where.status = status
    if (chain) where.chain = chain

    let users, total
    try {
      ;[users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            transactions: {
              orderBy: { timestamp: 'desc' },
              take: 5,
            },
            cashbacks: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        }),
        prisma.user.count({ where }),
      ])
    } catch (dbErr) {
      console.warn('DB unavailable, using mock users:', dbErr)
      const mockUsers = [
        {
          id: '1',
          walletAddress: '0x1234...5678',
          chain: 'ETH',
          totalVolume: 15000,
          cashbackEligible: 15000,
          cashbackAmount: 300,
          status: 'ACTIVE',
          createdAt: new Date(),
          transactions: [],
          cashbacks: [],
        },
        {
          id: '2',
          walletAddress: '0x9876...5432',
          chain: 'SOL',
          totalVolume: 8500,
          cashbackEligible: 8500,
          cashbackAmount: 170,
          status: 'PENDING',
          createdAt: new Date(),
          transactions: [],
          cashbacks: [],
        },
      ]
      return NextResponse.json({
        users: mockUsers,
        pagination: { page: 1, limit: 10, total: mockUsers.length, pages: 1 },
      })
    }

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, chain } = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    const user = await prisma.user.create({
      data: {
        walletAddress,
        chain,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
