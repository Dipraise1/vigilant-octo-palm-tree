export interface EligibleUser {
  id: string
  walletAddress: string
  totalTradingVolume: number
  taxWalletTransactions: number
  cashbackEligible: number
  cashbackAmount: number
  lastTransaction: string
  chain: 'SOL' | 'ETH' | 'BNB'
  status: 'active' | 'pending' | 'processed' | 'approved' | 'paid'
  joinDate: string
}

export interface TaxWallet {
  address: string
  chain: 'SOL' | 'ETH' | 'BNB'
  totalVolume: number
  transactionCount: number
  lastActivity: string
}

export interface CashbackCalculation {
  user: EligibleUser
  tradingVolume: number
  cashbackRate: number
  calculatedCashback: number
  status: 'pending' | 'approved' | 'paid'
}






