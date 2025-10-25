'use client'

import { useState, useEffect } from 'react'
import { Activity, TrendingUp, Calendar, DollarSign, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface TransactionData {
  hash: string
  from: string
  to: string
  amount: number
  timestamp: string
  chain: string
  isTaxWallet: boolean
}

interface TransactionSummary {
  total: number
  daily: number
  weekly: number
  monthly: number
  totalVolume: number
}

interface TransactionAnalyticsData {
  transactions: TransactionData[]
  summary: TransactionSummary
}

export default function TransactionAnalytics() {
  const [data, setData] = useState<TransactionAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all')
  const [isLive, setIsLive] = useState(false)

  const fetchTransactionData = async (period: string = 'all') => {
    try {
      const response = await fetch(`/api/blockchain?type=transactions&period=${period}`, {
        headers: { 'Accept': 'application/json' }
      })
      
      if (response.ok) {
        const transactionData = await response.json()
        console.log('Transaction analytics data:', transactionData)
        setData(transactionData)
        setIsLive(true)
      } else {
        setIsLive(false)
      }
    } catch (error) {
      console.error('Error fetching transaction data:', error)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactionData(selectedPeriod)
    
    // Update every 30 seconds
    const interval = setInterval(() => {
      fetchTransactionData(selectedPeriod)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedPeriod])

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'SOL': return 'text-purple-400 bg-purple-400/20'
      case 'ETH': return 'text-blue-400 bg-blue-400/20'
      case 'BNB': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getFilteredTransactions = () => {
    if (!data) return []
    
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    switch (selectedPeriod) {
      case 'daily':
        return data.transactions.filter(tx => new Date(tx.timestamp) >= oneDayAgo)
      case 'weekly':
        return data.transactions.filter(tx => new Date(tx.timestamp) >= oneWeekAgo)
      case 'monthly':
        return data.transactions.filter(tx => new Date(tx.timestamp) >= oneMonthAgo)
      default:
        return data.transactions
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-600 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-primary-800 rounded-xl p-6 border border-primary-700">
                <div className="h-4 bg-gray-600 rounded mb-2"></div>
                <div className="h-8 bg-gray-600 rounded mb-1"></div>
                <div className="h-3 bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const filteredTransactions = getFilteredTransactions()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Transaction Analytics</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-400">{isLive ? 'Live Data' : 'Offline'}</span>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex space-x-2">
        {['daily', 'weekly', 'monthly', 'all'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-purple-600 text-white'
                : 'bg-primary-700 text-gray-300 hover:bg-primary-600'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-white">{data.summary.total}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Daily</p>
                <p className="text-2xl font-bold text-white">{data.summary.daily}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Weekly</p>
                <p className="text-2xl font-bold text-white">{data.summary.weekly}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-white">{formatAmount(data.summary.totalVolume)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-primary-800 rounded-xl border border-primary-700">
        <div className="p-6 border-b border-primary-700">
          <h3 className="text-lg font-semibold text-white">
            Recent Transactions ({filteredTransactions.length})
          </h3>
        </div>
        
        <div className="divide-y divide-primary-700">
          {filteredTransactions.slice(0, 10).map((tx, index) => (
            <div key={tx.hash} className="p-6 hover:bg-primary-700/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getChainColor(tx.chain)}`}>
                    <span className="text-xs font-bold">{tx.chain}</span>
                  </div>
                  
                  <div>
                    <p className="text-white font-medium">
                      {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {tx.isTaxWallet ? 'Tax Wallet' : 'Regular Transaction'}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-white font-semibold">{formatAmount(tx.amount)}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(tx.timestamp)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {tx.isTaxWallet ? (
                    <ArrowDownRight className="w-5 h-5 text-green-400" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-blue-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="p-12 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No transactions found for the selected period</p>
          </div>
        )}
      </div>
    </div>
  )
}


