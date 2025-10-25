'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Gift, 
  Shield,
  Wallet,
  Menu,
  X
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Cashback', href: '/', icon: Gift },
  { name: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'User Dashboard', href: '/user', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-primary-800 rounded-lg border border-primary-700 text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "flex h-screen w-64 flex-col bg-primary-800 border-r border-primary-700 transition-transform duration-300",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-primary-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 relative">
              <Image
                src="/logo.png"
                alt="Apeit Monitor Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">Apeit Monitor</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={clsx(
                  'flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-primary-700 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-primary-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                0x1234...7890
              </p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
