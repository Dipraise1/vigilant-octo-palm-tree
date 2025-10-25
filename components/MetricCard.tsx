import { TrendingUp, DollarSign, Wallet, Activity } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
}

export default function MetricCard({ title, value, description, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="bg-primary-800 rounded-xl p-6 border border-primary-700 hover:border-purple-500 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-3 bg-purple-600/20 rounded-lg">
            <Icon className="w-6 h-6 text-purple-400" />
          </div>
          {trend === 'up' && (
            <TrendingUp className="w-5 h-5 text-green-400" />
          )}
        </div>
      </div>
    </div>
  )
}

// Predefined metric cards for common use cases
export function TotalVolumeCard({ value = "$37.92" }: { value?: string }) {
  return (
    <MetricCard
      title="Total Volume"
      value={value}
      description="Real Blockchain Data"
      icon={DollarSign}
      trend="up"
    />
  )
}

export function CurrentBalancesCard({ value = "$0.13" }: { value?: string }) {
  return (
    <MetricCard
      title="Current Balances"
      value={value}
      description="Live Wallet Data"
      icon={Wallet}
    />
  )
}

export function TotalTransactionsCard({ value = "123" }: { value?: string }) {
  return (
    <MetricCard
      title="Total Transactions"
      value={value}
      description="All Chains"
      icon={Activity}
      trend="up"
    />
  )
}

export function TransactionVolumeCard({ value = "$0.00" }: { value?: string }) {
  return (
    <MetricCard
      title="Transaction Volume"
      value={value}
      description="Processed"
      icon={TrendingUp}
      trend="up"
    />
  )
}






