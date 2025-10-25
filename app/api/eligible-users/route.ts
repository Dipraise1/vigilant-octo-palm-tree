import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for eligible users (in production, use a database)
let eligibleUsers: Array<{
  id: string
  walletAddress: string
  totalAmountSent: number
  cashbackAmount: number
  transactionCount: number
  transactions: Array<{
    hash: string
    amount: number
    chain: string
    timestamp: string
    to: string
  }>
  status: 'pending' | 'approved' | 'paid'
  eligibilityDate: string
  lastChecked: string
}> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let filteredUsers = eligibleUsers
    
    if (status && status !== 'all') {
      filteredUsers = eligibleUsers.filter(user => user.status === status)
    }
    
    // Calculate summary stats
    const totalUsers = eligibleUsers.length
    const activeUsers = eligibleUsers.filter(u => u.status === 'pending' || u.status === 'approved').length
    const totalCashbackOwed = eligibleUsers
      .filter(u => u.status !== 'paid')
      .reduce((sum, user) => sum + user.cashbackAmount, 0)
    
    return NextResponse.json({
      users: filteredUsers,
      summary: {
        totalUsers,
        activeUsers,
        totalCashbackOwed,
        pendingUsers: eligibleUsers.filter(u => u.status === 'pending').length,
        approvedUsers: eligibleUsers.filter(u => u.status === 'approved').length,
        paidUsers: eligibleUsers.filter(u => u.status === 'paid').length
      }
    })
  } catch (error) {
    console.error('Error fetching eligible users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch eligible users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    
    // Check if user already exists
    const existingUserIndex = eligibleUsers.findIndex(
      user => user.walletAddress.toLowerCase() === userData.walletAddress.toLowerCase()
    )
    
    if (existingUserIndex >= 0) {
      // Update existing user
      eligibleUsers[existingUserIndex] = {
        ...eligibleUsers[existingUserIndex],
        ...userData,
        lastChecked: new Date().toISOString()
      }
    } else {
      // Add new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        status: 'pending' as const,
        eligibilityDate: new Date().toISOString(),
        lastChecked: new Date().toISOString()
      }
      eligibleUsers.push(newUser)
    }
    
    console.log(`✅ Added/Updated eligible user: ${userData.walletAddress} - $${userData.cashbackAmount} cashback`)
    
    return NextResponse.json({ success: true, user: userData })
  } catch (error) {
    console.error('Error adding eligible user:', error)
    return NextResponse.json(
      { error: 'Failed to add eligible user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, status } = await request.json()
    
    const userIndex = eligibleUsers.findIndex(user => user.id === userId)
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    eligibleUsers[userIndex].status = status
    console.log(`Updated user ${userId} status to ${status}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    )
  }
}


