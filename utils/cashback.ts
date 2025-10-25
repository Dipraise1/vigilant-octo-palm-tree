import { EligibleUser, CashbackCalculation } from '@/types'

export const CASHBACK_RATE = 0.02 // 2%

export interface TaxWalletTransaction {
  walletAddress: string
  amount: number
  timestamp: string
  chain: 'SOL' | 'ETH' | 'BNB'
  transactionHash: string
}

export interface EligibilityCriteria {
  minimumTradingVolume: number
  minimumTransactions: number
  supportedChains: string[]
  timeWindow: number // days
}

export const DEFAULT_ELIGIBILITY_CRITERIA: EligibilityCriteria = {
  minimumTradingVolume: 1000, // $1000 minimum
  minimumTransactions: 5, // 5 transactions minimum
  supportedChains: ['SOL', 'ETH', 'BNB'],
  timeWindow: 30 // 30 days
}

/**
 * Calculate cashback amount based on trading volume
 */
export function calculateCashback(tradingVolume: number, rate: number = CASHBACK_RATE): number {
  return tradingVolume * rate
}

/**
 * Check if a user is eligible for cashback based on their trading activity
 */
export function checkEligibility(
  transactions: TaxWalletTransaction[],
  criteria: EligibilityCriteria = DEFAULT_ELIGIBILITY_CRITERIA
): { isEligible: boolean; tradingVolume: number; transactionCount: number } {
  const now = new Date()
  const timeWindowMs = criteria.timeWindow * 24 * 60 * 60 * 1000
  const cutoffDate = new Date(now.getTime() - timeWindowMs)

  // Filter transactions within the time window
  const recentTransactions = transactions.filter(
    tx => new Date(tx.timestamp) >= cutoffDate
  )

  const tradingVolume = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0)
  const transactionCount = recentTransactions.length

  const isEligible = 
    tradingVolume >= criteria.minimumTradingVolume &&
    transactionCount >= criteria.minimumTransactions &&
    recentTransactions.some(tx => criteria.supportedChains.includes(tx.chain))

  return {
    isEligible,
    tradingVolume,
    transactionCount
  }
}

/**
 * Process cashback for eligible users
 */
export function processCashback(users: EligibleUser[]): CashbackCalculation[] {
  return users
    .filter(user => user.status === 'active' || user.status === 'pending')
    .map(user => ({
      user,
      tradingVolume: user.totalTradingVolume,
      cashbackRate: CASHBACK_RATE,
      calculatedCashback: calculateCashback(user.totalTradingVolume),
      status: 'pending' as const
    }))
}

/**
 * Get total cashback owed across all eligible users
 */
export function getTotalCashbackOwed(users: EligibleUser[]): number {
  return users
    .filter(user => user.status !== 'processed')
    .reduce((total, user) => total + user.cashbackAmount, 0)
}

/**
 * Get cashback statistics
 */
export function getCashbackStats(users: EligibleUser[]) {
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.status === 'active').length
  const pendingUsers = users.filter(user => user.status === 'pending').length
  const processedUsers = users.filter(user => user.status === 'processed').length
  
  const totalCashbackOwed = getTotalCashbackOwed(users)
  const totalTradingVolume = users.reduce((sum, user) => sum + user.totalTradingVolume, 0)
  
  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    processedUsers,
    totalCashbackOwed,
    totalTradingVolume,
    averageCashback: totalUsers > 0 ? totalCashbackOwed / totalUsers : 0
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}






