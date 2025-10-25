import { NextRequest, NextResponse } from 'next/server'
import { blockchainService } from '@/services/blockchain'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!rateLimit(`eligibility:${clientIP}`, 10, 60000)) { // 10 requests per minute
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const { walletAddress } = await request.json()
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate wallet address format
    if (!/^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44})$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    console.log(`Checking eligibility for wallet: ${walletAddress}`)

    // Get all transactions from tax wallets
    const { transactions } = await blockchainService.getAllTaxWalletTransactions('all')
    
    // Filter transactions where the user's wallet sent to our tax wallets
    const userTransactions = transactions.filter(tx => 
      tx.from.toLowerCase() === walletAddress.toLowerCase() && 
      tx.isTaxWallet
    )

    console.log(`Found ${userTransactions.length} transactions from user to tax wallets`)

    // Calculate total amount sent to tax wallets (in USD)
    const totalAmountSent = userTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    
    // Check if user is eligible ($50+ threshold)
    const isEligible = totalAmountSent >= 50
    const cashbackAmount = isEligible ? totalAmountSent * 0.02 : 0 // 2% cashback

    // Get transaction details for display
    const transactionDetails = userTransactions.map(tx => ({
      hash: tx.hash,
      amount: tx.amount,
      chain: tx.chain,
      timestamp: tx.timestamp,
      to: tx.to
    }))

    const eligibilityResult = {
      walletAddress,
      isEligible,
      totalAmountSent: Math.round(totalAmountSent * 100) / 100, // Round to 2 decimal places
      cashbackAmount: Math.round(cashbackAmount * 100) / 100,
      transactionCount: userTransactions.length,
      transactions: transactionDetails,
      checkedAt: new Date().toISOString(),
      threshold: 50
    }

    // Log eligible user for admin dashboard
    if (isEligible) {
      console.log(`✅ ELIGIBLE USER: ${walletAddress} - $${totalAmountSent} sent, $${cashbackAmount} cashback`)
      
      // Store eligible user in the eligible-users API
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000'
        await fetch(`${baseUrl}/api/eligible-users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            totalAmountSent,
            cashbackAmount,
            transactionCount: userTransactions.length,
            transactions: transactionDetails
          })
        })
      } catch (error) {
        console.error('Error storing eligible user:', error)
        // Don't fail the request if logging fails
      }
    } else {
      console.log(`❌ NOT ELIGIBLE: ${walletAddress} - $${totalAmountSent} sent (need $50+)`)
    }

    return NextResponse.json(eligibilityResult)

  } catch (error) {
    console.error('Error checking eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    )
  }
}