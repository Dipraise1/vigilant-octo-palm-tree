'use client'

import { useState, useEffect } from 'react'
import { Users, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { EligibleUser, CashbackCalculation } from '@/types'
import { getCashbackStats, formatCurrency, formatDate } from '@/utils/cashback'
import { useRealtime } from '@/hooks/useRealtime'

// Mock data - replace with real API calls
const mockEligibleUsers: EligibleUser[] = [
  {
    id: '1',
    walletAddress: '0x1234...5678',
    totalTradingVolume: 15000,
    taxWalletTransactions: 25,
    cashbackEligible: 15000,
    cashbackAmount: 300, // 2% of 15000
    lastTransaction: '2024-01-15T10:30:00Z',
    chain: 'ETH',
    status: 'active',
    joinDate: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    walletAddress: '0x9876...5432',
    totalTradingVolume: 8500,
    taxWalletTransactions: 18,
    cashbackEligible: 8500,
    cashbackAmount: 170, // 2% of 8500
    lastTransaction: '2024-01-14T15:45:00Z',
    chain: 'SOL',
    status: 'pending',
    joinDate: '2024-01-05T00:00:00Z'
  },
  {
    id: '3',
    walletAddress: '0x5555...9999',
    totalTradingVolume: 25000,
    taxWalletTransactions: 42,
    cashbackEligible: 25000,
    cashbackAmount: 500, // 2% of 25000
    lastTransaction: '2024-01-15T08:20:00Z',
    chain: 'BNB',
    status: 'processed',
    joinDate: '2023-12-15T00:00:00Z'
  }
]

export default function EligibleUsers() {
  const [users, setUsers] = useState<EligibleUser[]>(mockEligibleUsers)
  const [selectedUser, setSelectedUser] = useState<EligibleUser | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'processed'>('all')
  const [loading, setLoading] = useState(true)

  // Real-time data
  const { data: realtimeData, isConnected, error } = useRealtime({ enabled: true })

  const filteredUsers = users.filter(user => 
    filter === 'all' || user.status === filter
  )

  const stats = getCashbackStats(users)

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/eligible-users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching eligible users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Update user status
  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/eligible-users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      })
      
      if (response.ok) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus as any } : user
        ))
        console.log(`Updated user ${userId} status to ${newStatus}`)
      }
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // Update stats with real-time data
  useEffect(() => {
    if (realtimeData) {
      // Update local stats with real-time data
      // This will trigger a re-render with live data
    }
  }, [realtimeData])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-blue-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20'
      case 'processed':
        return 'text-blue-400 bg-blue-400/20'
      default:
        return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Real-time Connection Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Eligible Users & Cashback Management</h2>
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
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-primary-800 rounded-xl p-4 lg:p-6 border border-primary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Eligible Users</p>
              <p className="text-xl lg:text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <Users className="w-6 h-6 lg:w-8 lg:h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-primary-800 rounded-xl p-4 lg:p-6 border border-primary-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Active Users</p>
              <p className="text-xl lg:text-2xl font-bold text-white">{stats.activeUsers}</p>
            </div>
            <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-primary-800 rounded-xl p-4 lg:p-6 border border-primary-700 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Cashback Owed</p>
              <p className="text-xl lg:text-2xl font-bold text-white">{formatCurrency(stats.totalCashbackOwed)}</p>
            </div>
            <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 lg:gap-4">
        {(['all', 'active', 'pending', 'processed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-primary-700 text-gray-300 hover:bg-primary-600'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-primary-800 rounded-xl border border-primary-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Trading Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cashback Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Last Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-primary-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {user.walletAddress}
                      </div>
                      <div className="text-sm text-gray-400">
                        {user.chain} • {user.taxWalletTransactions} transactions
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {formatCurrency(user.totalTradingVolume)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-green-400">
                      {formatCurrency(user.cashbackAmount)}
                    </div>
                    <div className="text-xs text-gray-400">2% cashback</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1">{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {formatDate(user.lastTransaction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-purple-400 hover:text-purple-300 mr-3"
                    >
                      View Details
                    </button>
                    {user.status === 'pending' && (
                      <button 
                        onClick={() => updateUserStatus(user.id, 'approved')}
                        className="text-green-400 hover:text-green-300 mr-2"
                      >
                        Approve
                      </button>
                    )}
                    {user.status === 'approved' && (
                      <button 
                        onClick={() => updateUserStatus(user.id, 'paid')}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-primary-800 rounded-xl p-6 max-w-2xl w-full border border-primary-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Wallet Address</label>
                <p className="text-white font-mono">{selectedUser.walletAddress}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Trading Volume</label>
                  <p className="text-white font-semibold">{formatCurrency(selectedUser.totalTradingVolume)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Cashback Amount</label>
                  <p className="text-green-400 font-semibold">{formatCurrency(selectedUser.cashbackAmount)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Chain</label>
                  <p className="text-white">{selectedUser.chain}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {getStatusIcon(selectedUser.status)}
                    <span className="ml-1">{selectedUser.status}</span>
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Last Transaction</label>
                <p className="text-white">{formatDate(selectedUser.lastTransaction)}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
              {selectedUser.status === 'pending' && (
                <button 
                  onClick={() => {
                    updateUserStatus(selectedUser.id, 'approved')
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
                >
                  Approve
                </button>
              )}
              {selectedUser.status === 'approved' && (
                <button 
                  onClick={() => {
                    updateUserStatus(selectedUser.id, 'paid')
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
