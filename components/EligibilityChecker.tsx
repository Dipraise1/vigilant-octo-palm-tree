'use client'

import { useState } from 'react'
import { Search, CheckCircle, XCircle, DollarSign, Activity, Clock } from 'lucide-react'

interface EligibilityResult {
  walletAddress: string
  isEligible: boolean
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
  checkedAt: string
  threshold: number
}

export default function EligibilityChecker() {
  const [walletAddress, setWalletAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EligibilityResult | null>(null)
  const [error, setError] = useState('')

  const handleCheckEligibility = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: walletAddress.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to check eligibility')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Eligibility Checker</h2>
        <p className="text-gray-400">Check if a wallet is eligible for cashback based on tax wallet transactions</p>
      </div>

      {/* Input Form */}
      <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Wallet Address
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address (e.g., 0x... or 6GGfAXt5H7MNKuDrhmub8CuYabny97ux1J5qZTDPQwzC)"
                className="flex-1 bg-primary-700 border border-primary-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <button
                onClick={handleCheckEligibility}
                disabled={loading || !walletAddress.trim()}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>{loading ? 'Checking...' : 'Check Eligibility'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Eligibility Status */}
          <div className={`rounded-xl p-6 border ${
            result.isEligible 
              ? 'bg-green-900/20 border-green-500/50' 
              : 'bg-red-900/20 border-red-500/50'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {result.isEligible ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h3 className={`text-xl font-bold ${
                  result.isEligible ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.isEligible ? 'ELIGIBLE FOR CASHBACK' : 'NOT ELIGIBLE'}
                </h3>
                <p className="text-gray-400">
                  {result.isEligible 
                    ? 'This wallet qualifies for cashback rewards!' 
                    : `Need $${result.threshold - result.totalAmountSent} more to qualify`
                  }
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-gray-300">Total Sent</span>
                </div>
                <p className="text-xl font-bold text-white">{formatAmount(result.totalAmountSent)}</p>
              </div>

              <div className="bg-primary-800/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-gray-300">Transactions</span>
                </div>
                <p className="text-xl font-bold text-white">{result.transactionCount}</p>
              </div>

              {result.isEligible && (
                <div className="bg-primary-800/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">Cashback (10%)</span>
                  </div>
                  <p className="text-xl font-bold text-green-400">{formatAmount(result.cashbackAmount)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History */}
          {result.transactions.length > 0 && (
            <div className="bg-primary-800 rounded-xl border border-primary-700">
              <div className="p-6 border-b border-primary-700">
                <h3 className="text-lg font-semibold text-white">
                  Transaction History ({result.transactions.length})
                </h3>
                <p className="text-sm text-gray-400">
                  Transactions sent to tax wallets
                </p>
              </div>
              
              <div className="divide-y divide-primary-700">
                {result.transactions.map((tx, index) => (
                  <div key={tx.hash} className="p-6 hover:bg-primary-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getChainColor(tx.chain)}`}>
                          <span className="text-xs font-bold">{tx.chain}</span>
                        </div>
                        
                        <div>
                          <p className="text-white font-medium">
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-400">
                            To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


