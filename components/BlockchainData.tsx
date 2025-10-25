'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Circle, Wifi, WifiOff } from 'lucide-react'
import { useRealtime } from '@/hooks/useRealtime'

interface BlockchainBalance {
  chain: string
  symbol: string
  amount: string
  usdValue: string
  color: string
}

interface VolumeSummary {
  totalVolume: string
  totalUSDBalance: string
  transactions: string
  lastUpdated: string
}

const mockBalances: BlockchainBalance[] = [
  { chain: 'SOL', symbol: 'SOL', amount: '0.123218', usdValue: '$24.91', color: 'text-purple-400' },
  { chain: 'ETH', symbol: 'ETH', amount: '0.003175', usdValue: '$13.01', color: 'text-blue-400' },
  { chain: 'BNB', symbol: 'BNB', amount: '0.000000', usdValue: '$0.00', color: 'text-yellow-400' },
]

const getChainColor = (chain: string) => {
  switch (chain) {
    case 'SOL':
      return 'bg-purple-400'
    case 'ETH':
      return 'bg-blue-400'
    case 'BNB':
      return 'bg-yellow-400'
    default:
      return 'bg-gray-400'
  }
}

const mockVolumeSummary: VolumeSummary = {
  totalVolume: '$0.00',
  totalUSDBalance: '$0.00',
  transactions: '0',
  lastUpdated: '--:--:--'
}

export default function BlockchainData() {
  const [balances, setBalances] = useState<BlockchainBalance[]>(mockBalances)
  const [volumeSummary, setVolumeSummary] = useState<VolumeSummary>(mockVolumeSummary)
  const [isLive, setIsLive] = useState(true)
  const [loading, setLoading] = useState(true)

  // Real-time data
  const { data: realtimeData, isConnected, error } = useRealtime({ enabled: true })

  // Fetch blockchain data
  const fetchBlockchainData = async () => {
    try {
      const response = await fetch('/api/blockchain?type=dashboard', { headers: { 'Accept': 'application/json' } })
      if (response.ok) {
        const data = await response.json()
        console.log('Live dashboard payload:', data)
        if (Array.isArray(data.balances) && data.balances.length > 0) {
          setBalances(data.balances)
          setVolumeSummary(prev => ({
            ...prev,
            totalVolume: `$${data.totalVolume.toLocaleString()}`,
            totalUSDBalance: `$${data.totalVolume.toLocaleString()}`,
            transactions: data.totalTransactions.toString(),
            lastUpdated: new Date(data.lastUpdated).toLocaleTimeString('en-US', { 
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          }))
          setIsLive(true)
        } else {
          setIsLive(false)
        }
      } else {
        setIsLive(false)
      }
    } catch (error) {
      console.error('Error fetching blockchain data:', error)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockchainData()
    
    // Set up interval for live updates
    const interval = setInterval(() => {
      fetchBlockchainData()
      const now = new Date()
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      setVolumeSummary(prev => ({
        ...prev,
        lastUpdated: timeString
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Update with real-time data (keep live data priority)
  useEffect(() => {
    if (realtimeData && typeof realtimeData.totalVolume === 'number' && !isLive) {
      setVolumeSummary(prev => ({
        ...prev,
        totalVolume: `$${realtimeData.totalVolume!.toLocaleString()}`,
        totalUSDBalance: `$${realtimeData.totalVolume!.toLocaleString()}`,
      }))
    }
  }, [realtimeData, isLive])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Blockchain Data Overview</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Live Updates</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Circle className={`w-2 h-2 ${isLive ? 'text-green-400 fill-green-400' : 'text-gray-400'}`} />
            <span className="text-sm text-gray-400">Live Data</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Balances */}
        <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Current Balances</h3>
          <div className="space-y-4">
            {balances.map((balance) => (
              <div key={balance.chain} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getChainColor(balance.chain)}`} />
                  <span className="text-white font-medium">{balance.symbol}</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{balance.amount}</p>
                  <p className="text-sm text-gray-400">{balance.usdValue}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volume Summary */}
        <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Volume Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Volume:</span>
              <span className="text-white">{volumeSummary.totalVolume}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total USD Balance:</span>
              <span className="text-green-400 font-semibold">{volumeSummary.totalUSDBalance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transactions:</span>
              <span className="text-white">{volumeSummary.transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Updated:</span>
              <span className="text-white">{volumeSummary.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Chain Breakdown */}
        <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
          <h3 className="text-lg font-semibold text-white mb-4">Chain Breakdown</h3>
          <div className="space-y-3">
            {balances.map((balance) => (
              <div key={balance.chain} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getChainColor(balance.chain)}`} />
                  <span className="text-white">{balance.chain}</span>
                </div>
                <span className="text-white font-semibold">{balance.usdValue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
