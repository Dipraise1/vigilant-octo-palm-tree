import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import LiveMetrics from '@/components/LiveMetrics'
import BlockchainData from '@/components/BlockchainData'
import EligibleUsers from '@/components/EligibleUsers'

export default function AdminDashboard() {
  return (
    <div className="flex h-screen bg-primary-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
          {/* Key Metrics */}
          <section>
            <h2 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-6">Key Metrics</h2>
            <LiveMetrics />
          </section>

          {/* Blockchain Data Overview */}
          <section>
            <BlockchainData />
          </section>

          {/* Eligible Users & Cashback Management */}
          <section>
            <EligibleUsers />
          </section>
        </main>
      </div>
    </div>
  )
}
