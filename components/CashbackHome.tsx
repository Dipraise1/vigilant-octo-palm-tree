'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Shield, Zap, DollarSign, Wallet, Search } from 'lucide-react'

interface EligibilityResult {
  isEligible: boolean
  tradingVolume: number
  cashbackAmount: number
  transactionCount: number
  lastTransaction: string
  chain: string
  status: 'active' | 'pending' | 'not_eligible'
}

export default function CashbackHome() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState('')
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckEligibility = async () => {
    if (!walletAddress.trim()) return
    
    setIsChecking(true)
    
    // Redirect to status page with wallet address
    router.push(`/status/${encodeURIComponent(walletAddress)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header Section */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 relative mb-4 sm:mb-0 sm:mr-4">
              <Image
                src="/icon.jpg"
                alt="Tax Cashback Program Icon"
                fill
                className="object-contain rounded-xl"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center">Cashback Program</h1>
          </div>
          
          <p className="text-lg lg:text-xl text-gray-300 mb-6 lg:mb-8 max-w-2xl mx-auto">
            Earn 2% cashback on all payments made to our verified wallets. 
            Check your eligibility by entering your wallet address below. No registration required.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mb-6 lg:mb-8">
            <div className="flex items-center space-x-2 bg-green-600/20 border border-green-500/30 rounded-full px-3 lg:px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-green-400 font-medium text-sm lg:text-base">Verified & Secure</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-3 lg:px-4 py-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium text-sm lg:text-base">Automatic Processing</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-3 lg:px-4 py-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium text-sm lg:text-base">$ No Fees</span>
            </div>
          </div>

        </div>

        {/* Eligibility Check Section */}
        <div className="bg-primary-800/50 backdrop-blur-sm rounded-2xl p-4 lg:p-8 border border-primary-700/50">
          <div className="text-center mb-6 lg:mb-8">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-6 h-6 lg:w-8 lg:h-8 text-purple-400" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-white mb-2">Eligibility Check</h2>
            <p className="text-gray-400 text-sm lg:text-base">
              Enter your wallet address to verify your payment history and check cashback eligibility.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="mb-4 lg:mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x... or 6GGfAXt5H7MNKuDrhmub8CuYabny97ux1J5qZTDPQwzC"
                className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <button
              onClick={handleCheckEligibility}
              disabled={!walletAddress.trim() || isChecking}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isChecking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Eligibility</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 lg:mt-8">
          <p className="text-sm text-gray-500">
            Supported chains: Solana, Ethereum, BSC
          </p>
        </div>
      </div>
    </div>
  )
}
