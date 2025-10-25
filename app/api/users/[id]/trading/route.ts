import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { blockchainAPIs } from '@/services/blockchain-apis'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, walletAddress: true }
    })

    if (!user || !user.walletAddress) {
      return NextResponse.json({ error: 'User or wallet not found' }, { status: 404 })
    }

    const data = await blockchainAPIs.getWalletData(user.walletAddress)

    return NextResponse.json({
      userId: user.id,
      walletAddress: user.walletAddress,
      balances: data.balances,
      transactions: data.transactions,
      totalVolume: data.totalVolume,
      taxWalletTransactions: data.transactions.filter(tx => tx.isTaxWallet),
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching user trading data:', error)
    return NextResponse.json({ error: 'Failed to fetch trading data' }, { status: 500 })
  }
}


