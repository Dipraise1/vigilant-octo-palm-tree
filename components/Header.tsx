'use client'

import { useState } from 'react'
import { RefreshCw, Shield, Clock } from 'lucide-react'

export default function Header() {
  const [timePeriod, setTimePeriod] = useState('Today')
  const [lastUpdated, setLastUpdated] = useState('02:48:27')

  const handleTimePeriodChange = (newPeriod: string) => {
    setTimePeriod(newPeriod)
    
    // Map UI periods to API periods
    const periodMap: { [key: string]: string } = {
      'Today': 'daily',
      'Week': 'weekly', 
      'Month': 'monthly',
      'Year': 'all'
    }
    
    const apiPeriod = periodMap[newPeriod] || 'all'
    
    // Dispatch custom event for LiveMetrics to listen
    const event = new CustomEvent('timePeriodChange', {
      detail: { period: apiPeriod }
    })
    window.dispatchEvent(event)
  }

  const handleRefresh = () => {
    // Simulate refresh
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    setLastUpdated(timeString)
  }

  return (
    <header className="bg-primary-900 border-b border-primary-700 px-4 lg:px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Tax Monitor Management System</p>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          {/* Time Period Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-300">Time Period:</label>
            <select 
              value={timePeriod}
              onChange={(e) => handleTimePeriodChange(e.target.value)}
              className="bg-primary-800 border border-primary-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-0 flex-1"
            >
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
              <option value="Year">This Year</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            <button className="flex items-center space-x-2 bg-primary-800 hover:bg-primary-700 text-white px-3 lg:px-4 py-2 rounded-lg border border-primary-600 transition-colors text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin Access</span>
            </button>
          </div>

          {/* Last Updated */}
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Last updated: {lastUpdated}</span>
            <span className="sm:hidden">{lastUpdated}</span>
          </div>
        </div>
      </div>
    </header>
  )
}




