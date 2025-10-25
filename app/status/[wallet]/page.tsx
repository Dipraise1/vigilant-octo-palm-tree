'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface EligibilityStatus {
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

export default function EligibilityStatusPage() {
  const params = useParams()
  const walletAddress = params.wallet as string
  
  const [status, setStatus] = useState<EligibilityStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching status:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStatus()
  }

  useEffect(() => {
    fetchStatus()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [walletAddress])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No transactions yet'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading eligibility status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      {/* Header */}
      <div className="bg-primary-800/50 backdrop-blur-sm border-b border-primary-700">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <div className="w-8 h-8 relative">
                <Image
                  src="/icon.jpg"
                  alt="Apeit Monitor"
                  fill
                  className="object-contain rounded"
                />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-white">Eligibility Status</h1>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-sm text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Wallet Info */}
        <div className="bg-primary-800/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-primary-700/50 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg lg:text-xl font-bold text-white mb-2">Wallet Address</h2>
              <p className="text-gray-300 font-mono text-xs lg:text-sm break-all">{walletAddress}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-400">Chain</p>
              <p className="text-white font-semibold">
                {status?.transactions && status.transactions.length > 0 ? status.transactions[0].chain : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-primary-800/50 backdrop-blur-sm rounded-xl p-6 border border-primary-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Trading Volume</p>
                <p className="text-xl font-bold text-white">
                  {status ? formatCurrency(status.totalAmountSent) : '$0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-800/50 backdrop-blur-sm rounded-xl p-6 border border-primary-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Cashback Amount</p>
                <p className="text-xl font-bold text-green-400">
                  {status ? formatCurrency(status.cashbackAmount) : '$0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-800/50 backdrop-blur-sm rounded-xl p-6 border border-primary-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Transactions</p>
                <p className="text-xl font-bold text-white">
                  {status?.transactionCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary-800/50 backdrop-blur-sm rounded-xl p-6 border border-primary-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                status?.isEligible 
                  ? 'bg-green-600/20' 
                  : 'bg-yellow-600/20'
              }`}>
                {status?.isEligible ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Status</p>
                <p className={`text-xl font-bold ${
                  status?.isEligible ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {status?.isEligible ? 'Eligible' : 'Not Eligible'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Status Display */}
        {status?.isEligible ? (
          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-green-400 mb-2">
                🎉 Congratulations! You're Eligible!
              </h3>
              <p className="text-green-300 text-lg">
                You qualify for our 2% cashback program
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-700/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Your Rewards</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trading Volume:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(status.totalAmountSent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cashback Rate:</span>
                    <span className="text-white font-semibold">2%</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-3">
                    <span className="text-green-400 font-semibold">Your Cashback:</span>
                    <span className="text-green-400 font-bold text-xl">
                      {formatCurrency(status.cashbackAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-700/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Activity Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Transactions:</span>
                    <span className="text-white font-semibold">
                      {status.transactionCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Transaction:</span>
                    <span className="text-white font-semibold">
                      {status?.transactions && status.transactions.length > 0 ? formatDate(status.transactions[0].timestamp) : 'No transactions'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chain:</span>
                    <span className="text-white font-semibold">
                      {status?.transactions && status.transactions.length > 0 ? status.transactions[0].chain : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-yellow-400 mb-2">
                Not Yet Eligible
              </h3>
              <p className="text-yellow-300 text-lg">
                Keep trading to reach eligibility requirements
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-700/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Current Progress</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Volume:</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(status?.totalAmountSent || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transactions:</span>
                    <span className="text-white font-semibold">
                      {status?.transactionCount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Required Volume:</span>
                    <span className="text-yellow-400 font-semibold">$50</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-700/50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Requirements</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Volume:</span>
                    <span className="text-white font-semibold">$50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Transactions:</span>
                    <span className="text-white font-semibold">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cashback Rate:</span>
                    <span className="text-green-400 font-semibold">2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Updates Notice */}
        <div className="bg-primary-800/50 backdrop-blur-sm rounded-xl p-6 border border-primary-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-white">
              <span className="font-semibold">Live Updates:</span> This page automatically refreshes every 30 seconds to show your latest eligibility status and trading activity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}




