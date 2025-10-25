import { NextRequest, NextResponse } from 'next/server'
import { blockchainAPIs } from '@/services/blockchain-apis'

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const walletAddress = params.address

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Get real blockchain data
    const walletData = await blockchainAPIs.getWalletData(walletAddress)

    return NextResponse.json({
      walletAddress,
      balances: walletData.balances,
      transactions: walletData.transactions,
      totalVolume: walletData.totalVolume,
      taxWalletTransactions: walletData.transactions.filter(tx => tx.isTaxWallet),
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching wallet data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    )
  }
}






