'use client'

import { useState, useEffect, useRef } from 'react'

interface RealtimeData {
  totalUsers?: number
  activeUsers?: number
  totalVolume?: number
  totalCashback?: number
  totalVolume?: number
  cashbackAmount?: number
  transactionCount?: number
  lastTransaction?: string
  status?: string
  isEligible?: boolean
  timestamp?: string
}

interface UseRealtimeOptions {
  walletAddress?: string
  enabled?: boolean
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const [data, setData] = useState<RealtimeData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!options.enabled) return

    const url = new URL('/api/realtime', window.location.origin)
    if (options.walletAddress) {
      url.searchParams.set('wallet', options.walletAddress)
    }

    const eventSource = new EventSource(url.toString())
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data)
        setData(parsedData.data)
      } catch (err) {
        console.error('Error parsing real-time data:', err)
        setError('Failed to parse real-time data')
      }
    }

    eventSource.onerror = (event) => {
      console.error('EventSource error:', event)
      setError('Connection lost')
      setIsConnected(false)
    }

    return () => {
      eventSource.close()
      eventSourceRef.current = null
    }
  }, [options.walletAddress, options.enabled])

  const reconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }
    setError(null)
    setIsConnected(false)
  }

  return {
    data,
    isConnected,
    error,
    reconnect,
  }
}






