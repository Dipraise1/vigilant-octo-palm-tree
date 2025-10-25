import { NextRequest, NextResponse } from 'next/server'
import { blockchainService } from '@/services/blockchain'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'balances'

    switch (type) {
      case 'balances':
        const balances = await blockchainService.getCurrentBalances()
        const balancesForUI = balances.map(b => ({
          chain: b.chain,
          symbol: b.symbol,
          amount: b.balance.toFixed(6),
          usdValue: `$${b.usdValue.toFixed(2)}`,
        }))
        return NextResponse.json({ balances: balancesForUI })

      case 'dashboard':
        const dashboardData = await blockchainService.getDashboardData()
        const dashboardForUI = {
          balances: dashboardData.balances.map(b => ({
            chain: b.chain,
            symbol: b.symbol,
            amount: b.balance.toFixed(6),
            usdValue: `$${b.usdValue.toFixed(2)}`,
          })),
          totalVolume: dashboardData.totalVolume,
          totalTransactions: dashboardData.totalTransactions,
          lastUpdated: dashboardData.lastUpdated
        }
        return NextResponse.json(dashboardForUI)

      case 'volume':
        const totalVolume = await blockchainService.getTotalVolume()
        return NextResponse.json({ totalVolume })

      case 'tax-wallets':
        const taxWallets = blockchainService.getTaxWallets()
        return NextResponse.json({ taxWallets })

      case 'prices':
        const prices = await blockchainService.getPriceUpdates()
        return NextResponse.json({ prices })

      case 'transactions':
        const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | 'all' || 'all'
        const transactionData = await blockchainService.getAllTaxWalletTransactions(period)
        return NextResponse.json(transactionData)

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error fetching blockchain data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blockchain data' },
      { status: 500 }
    )
  }
}




