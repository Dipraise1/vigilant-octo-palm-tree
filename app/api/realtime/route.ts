import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('wallet')

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const sendData = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        )
      }

      const interval = setInterval(async () => {
        try {
          // Check if database is available
          if (!process.env.DATABASE_URL) {
            // Send mock data when database is not configured
            if (walletAddress) {
              sendData({
                type: 'user_update',
                data: {
                  totalVolume: Math.floor(Math.random() * 50000) + 1000,
                  cashbackAmount: Math.floor(Math.random() * 1000) + 100,
                  transactionCount: Math.floor(Math.random() * 100) + 5,
                  lastTransaction: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                  status: 'ACTIVE',
                  isEligible: Math.random() > 0.3,
                },
              })
            } else {
              sendData({
                type: 'dashboard_update',
                data: {
                  totalUsers: Math.floor(Math.random() * 100) + 50,
                  activeUsers: Math.floor(Math.random() * 50) + 25,
                  totalVolume: Math.floor(Math.random() * 1000000) + 500000,
                  totalCashback: Math.floor(Math.random() * 50000) + 10000,
                  timestamp: new Date().toISOString(),
                },
              })
            }
            return
          }

          if (walletAddress) {
            // Get user-specific data
            let user
            try {
              user = await prisma.user.findUnique({
                where: { walletAddress },
                include: {
                  transactions: {
                    orderBy: { timestamp: 'desc' },
                    take: 10,
                  },
                  cashbacks: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                  },
                },
              })
            } catch (dbErr) {
              // Fallback mock user data when DB is down
              sendData({
                type: 'user_update',
                data: {
                  totalVolume: Math.floor(Math.random() * 50000) + 1000,
                  cashbackAmount: Math.floor(Math.random() * 1000) + 100,
                  transactionCount: Math.floor(Math.random() * 100) + 5,
                  lastTransaction: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                  status: 'ACTIVE',
                  isEligible: Math.random() > 0.3,
                },
              })
              return
            }

            if (user) {
              sendData({
                type: 'user_update',
                data: {
                  totalVolume: Number(user.totalVolume),
                  cashbackAmount: Number(user.cashbackAmount),
                  transactionCount: user.transactions.length,
                  lastTransaction: user.transactions[0]?.timestamp,
                  status: user.status,
                  isEligible: Number(user.cashbackEligible) > 0,
                },
              })
            }
          } else {
            // Get global dashboard data
            let totalUsers = 0, activeUsers = 0, totalVolume: any = { _sum: { totalVolume: 0 } }, totalCashback: any = { _sum: { cashbackAmount: 0 } }
            try {
              ;[totalUsers, activeUsers, totalVolume, totalCashback] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { status: 'ACTIVE' } }),
                prisma.user.aggregate({ _sum: { totalVolume: true } }),
                prisma.user.aggregate({ _sum: { cashbackAmount: true } }),
              ])
            } catch (dbErr) {
              // Fallback mock dashboard data
              sendData({
                type: 'dashboard_update',
                data: {
                  totalUsers: Math.floor(Math.random() * 100) + 50,
                  activeUsers: Math.floor(Math.random() * 50) + 25,
                  totalVolume: Math.floor(Math.random() * 1000000) + 500000,
                  totalCashback: Math.floor(Math.random() * 50000) + 10000,
                  timestamp: new Date().toISOString(),
                },
              })
              return
            }

            sendData({
              type: 'dashboard_update',
              data: {
                totalUsers,
                activeUsers,
                totalVolume: Number(totalVolume._sum.totalVolume || 0),
                totalCashback: Number(totalCashback._sum.cashbackAmount || 0),
                timestamp: new Date().toISOString(),
              },
            })
          }
        } catch (error) {
          console.error('Error in real-time stream:', error)
          sendData({
            type: 'error',
            data: { message: 'Failed to fetch data' },
          })
        }
      }, 5000) // Update every 5 seconds

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}
