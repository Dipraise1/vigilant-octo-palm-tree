import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import EligibleUsers from '@/components/EligibleUsers'

export default function UserDashboard() {
  return (
    <div className="flex h-screen bg-primary-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
          {/* Eligible Users & Cashback Management */}
          <section>
            <EligibleUsers />
          </section>
        </main>
      </div>
    </div>
  )
}