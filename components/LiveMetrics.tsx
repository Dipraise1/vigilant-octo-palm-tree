'use client'

import { useState, useEffect } from 'react'
import { 
  TotalVolumeCard, 
  CurrentBalancesCard, 
  TotalTransactionsCard, 
  TransactionVolumeCard 
} from '@/components/MetricCard'

interface DashboardData {
  balances: Array<{
    chain: string
    symbol: string
    amount: string
    usdValue: string
  }>
  totalVolume: number
  totalTransactions: number
  lastUpdated: string
}

interface TransactionData {
  transactions: Array<{
    hash: string
    from: string
    to: string
    amount: number
    timestamp: string
    chain: string
    isTaxWallet: boolean
  }>
  summary: {
    total: number
    daily: number
    weekly: number
    monthly: number
    totalVolume: number
  }
}

export default function LiveMetrics() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all')

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, transactionResponse] = await Promise.all([
        fetch('/api/blockchain?type=dashboard', { headers: { 'Accept': 'application/json' } }),
        fetch(`/api/blockchain?type=transactions&period=${timePeriod}`, { headers: { 'Accept': 'application/json' } })
      ])
      
      if (dashboardResponse.ok && transactionResponse.ok) {
        const dashboard = await dashboardResponse.json()
        const transactions = await transactionResponse.json()
        
        console.log('Live metrics data:', dashboard)
        console.log('Transaction data:', transactions)
        
        setDashboardData(dashboard)
        setTransactionData(transactions)
        setIsLive(true)
      } else {
        setIsLive(false)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    
    // Update every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000)
    return () => clearInterval(interval)
  }, [timePeriod])

  // Listen for time period changes from navigation
  useEffect(() => {
    const handleTimePeriodChange = (event: CustomEvent) => {
      setTimePeriod(event.detail.period)
    }
    
    window.addEventListener('timePeriodChange', handleTimePeriodChange as EventListener)
    return () => window.removeEventListener('timePeriodChange', handleTimePeriodChange as EventListener)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-primary-800 rounded-xl p-6 border border-primary-700 animate-pulse">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-8 bg-gray-600 rounded mb-1"></div>
            <div className="h-3 bg-gray-600 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  // Get transaction count based on time period
  const getTransactionCount = () => {
    if (!transactionData) return '0'
    
    switch (timePeriod) {
      case 'daily':
        return transactionData.summary.daily.toString()
      case 'weekly':
        return transactionData.summary.weekly.toString()
      case 'monthly':
        return transactionData.summary.monthly.toString()
      default:
        return transactionData.summary.total.toString()
    }
  }

  const totalVolume = dashboardData?.totalVolume ? `$${dashboardData.totalVolume.toLocaleString()}` : '$0.00'
  const currentBalances = dashboardData?.totalVolume ? `$${dashboardData.totalVolume.toLocaleString()}` : '$0.00'
  const totalTransactions = getTransactionCount()
  const transactionVolume = dashboardData?.totalVolume ? `$${dashboardData.totalVolume.toLocaleString()}` : '$0.00'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <div className="relative">
        <TotalVolumeCard value={totalVolume} />
        {isLive && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </div>
      
      <div className="relative">
        <CurrentBalancesCard value={currentBalances} />
        {isLive && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </div>
      
      <div className="relative">
        <TotalTransactionsCard value={totalTransactions} />
        {isLive && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </div>
      
      <div className="relative">
        <TransactionVolumeCard value={transactionVolume} />
        {isLive && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  )
}
