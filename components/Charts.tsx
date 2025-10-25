'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const taxDistributionData = [
  { name: 'SOL', value: 66, color: '#a855f7' },
  { name: 'ETH', value: 34, color: '#3b82f6' },
  { name: 'BNB', value: 0, color: '#f59e0b' },
]

const performanceData = [
  { name: 'Performance', value: 95, color: '#10b981' },
]

export function TaxDistributionChart() {
  return (
    <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
      <h3 className="text-lg font-semibold text-white mb-4">Chain Performance - Tax Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={taxDistributionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {taxDistributionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {taxDistributionData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-white">{item.name}</span>
            </div>
            <span className="text-white font-semibold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PerformanceComparisonChart() {
  return (
    <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
      <h3 className="text-lg font-semibold text-white mb-4">Performance Comparison</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#ffffff' }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#ffffff' }}
              axisLine={{ stroke: '#374151' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ChainAnalytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Chain Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TaxDistributionChart />
        <PerformanceComparisonChart />
      </div>
    </div>
  )
}






