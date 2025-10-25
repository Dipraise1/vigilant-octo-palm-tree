// Real blockchain API integration for live data
import axios from 'axios'

const HELIUS_RPC_URL = process.env.HELIUS_RPC_URL || process.env.EXPO_PUBLIC_HELIUS_URL || 'https://api.mainnet-beta.solana.com'
const MORALIS_API_KEY = process.env.MORALIS_API_KEY || process.env.EXPO_PUBLIC_MORALIS_KEY || ''

export interface BlockchainTransaction {
  hash: string
  from: string
  to: string
  amount: number
  timestamp: string
  chain: string
  isTaxWallet: boolean
}

export interface WalletBalance {
  chain: string
  symbol: string
  balance: number
  usdValue: number
  lastUpdated: string
}

class BlockchainAPIs {
  // Solana API integration (Helius JSON-RPC)
  async getSolanaBalance(walletAddress: string): Promise<number> {
    try {
      const response = await axios.post(
        HELIUS_RPC_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [walletAddress]
        },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const lamports = response.data?.result?.value ?? 0
      return lamports / 1_000_000_000 // lamports -> SOL
    } catch (error) {
      console.error('Error fetching Solana balance:', error)
      return 0
    }
  }

  // Ethereum native balance using Moralis Web3 Data API
  async getEthereumBalance(walletAddress: string): Promise<number> {
    try {
      // Preferred v2.2 path
      const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/native/balance?chain=eth`
      const response = await axios.get(url, { headers: { 'X-API-Key': MORALIS_API_KEY } })
      const wei = response.data?.balance ?? response.data?.result ?? '0'
      return Number(wei) / 1e18
    } catch (err: any) {
      // Fallback to legacy v2 path if 404
      if (err?.response?.status === 404) {
        try {
          const legacyUrl = `https://deep-index.moralis.io/api/v2/${walletAddress}/balance?chain=eth`
          const res2 = await axios.get(legacyUrl, { headers: { 'X-API-Key': MORALIS_API_KEY } })
          const wei2 = res2.data?.balance ?? res2.data?.result ?? '0'
          return Number(wei2) / 1e18
        } catch (e2) {
          console.error('Error fetching Ethereum balance (Moralis legacy):', e2)
          return 0
        }
      }
      console.error('Error fetching Ethereum balance (Moralis):', err)
      return 0
    }
  }

  // BSC native balance using Moralis Web3 Data API
  async getBSCBalance(walletAddress: string): Promise<number> {
    try {
      // Preferred v2.2 path
      const url = `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/native/balance?chain=bsc`
      const response = await axios.get(url, { headers: { 'X-API-Key': MORALIS_API_KEY } })
      const wei = response.data?.balance ?? response.data?.result ?? '0'
      return Number(wei) / 1e18
    } catch (err: any) {
      // Fallback to legacy v2 path if 404
      if (err?.response?.status === 404) {
        try {
          const legacyUrl = `https://deep-index.moralis.io/api/v2/${walletAddress}/balance?chain=bsc`
          const res2 = await axios.get(legacyUrl, { headers: { 'X-API-Key': MORALIS_API_KEY } })
          const wei2 = res2.data?.balance ?? res2.data?.result ?? '0'
          return Number(wei2) / 1e18
        } catch (e2) {
          console.error('Error fetching BSC balance (Moralis legacy):', e2)
          return 0
        }
      }
      console.error('Error fetching BSC balance (Moralis):', err)
      return 0
    }
  }

  // Get real-time prices
  async getTokenPrices(): Promise<Record<string, number>> {
    try {
      // Primary: CoinGecko
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum,binancecoin&vs_currencies=usd'
      )
      return {
        SOL: response.data?.solana?.usd ?? 0,
        ETH: response.data?.ethereum?.usd ?? 0,
        BNB: response.data?.binancecoin?.usd ?? 0,
      }
    } catch (cgError: any) {
      console.warn('CoinGecko price fetch failed, falling back to Binance:', cgError?.response?.status || cgError?.message)
      try {
        // Fallback: Binance
        const binance = await axios.get('https://api.binance.com/api/v3/ticker/price?symbols=%5B%22SOLUSDT%22,%22ETHUSDT%22,%22BNBUSDT%22%5D')
        const arr: Array<{ symbol: string, price: string }> = binance.data || []
        const map = Object.fromEntries(arr.map(x => [x.symbol, Number(x.price)]))
        return {
          SOL: map['SOLUSDT'] ?? 0,
          ETH: map['ETHUSDT'] ?? 0,
          BNB: map['BNBUSDT'] ?? 0,
        }
      } catch (binErr) {
        console.warn('Binance price fetch failed, using static defaults:', binErr)
        // Last resort static defaults (approximate)
        return { SOL: 180, ETH: 2800, BNB: 550 }
      }
    }
  }

  // Get wallet transactions for Solana via Helius JSON-RPC
  async getSolanaTransactions(walletAddress: string, limit: number = 10): Promise<BlockchainTransaction[]> {
    try {
      const sigRes = await axios.post(
        HELIUS_RPC_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignaturesForAddress',
          params: [walletAddress, { limit }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      )

      const signatures = sigRes.data?.result || []
      const transactions: BlockchainTransaction[] = []

      for (const sig of signatures) {
        try {
          const txResponse = await axios.post(
            HELIUS_RPC_URL,
            {
              jsonrpc: '2.0',
              id: 1,
              method: 'getTransaction',
              params: [sig.signature, { encoding: 'json' }]
            },
            { headers: { 'Content-Type': 'application/json' } }
          )

          const tx = txResponse.data?.result
          if (tx) {
            // Estimate amount as net balance change for the wallet if present
            let amountSol = 0
            try {
              const pre = tx.meta?.preBalances || []
              const post = tx.meta?.postBalances || []
              const accountKeys: string[] = tx.transaction?.message?.accountKeys?.map((k: any) => (typeof k === 'string' ? k : k.pubkey)) || []
              const idx = accountKeys.findIndex((k: string) => k?.toLowerCase() === walletAddress.toLowerCase())
              if (idx >= 0 && pre[idx] != null && post[idx] != null) {
                amountSol = (pre[idx] - post[idx]) / 1_000_000_000
              }
            } catch {}

            const toAddr = tx.transaction?.message?.instructions?.[0]?.parsed?.info?.destination || ''

            transactions.push({
              hash: sig.signature,
              from: walletAddress,
              to: toAddr,
              amount: amountSol,
              timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : new Date().toISOString(),
              chain: 'SOL',
              isTaxWallet: this.isTaxWallet(toAddr, 'SOL')
            })
          }
        } catch (txError) {
          console.error('Error fetching Solana tx details:', txError)
        }
      }

      return transactions
    } catch (error) {
      console.error('Error fetching Solana transactions:', error)
      return []
    }
  }

  // Get wallet transactions for Ethereum via Moralis Web3 Data API
  async getEthereumTransactions(walletAddress: string, limit: number = 10): Promise<BlockchainTransaction[]> {
    try {
      // Try v2.2 first
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/transactions?chain=eth&limit=${limit}`,
        { headers: { 'X-API-Key': MORALIS_API_KEY } }
      )

      const txs = response.data?.result || response.data?.transactions || []
      const transactions: BlockchainTransaction[] = txs.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from_address || tx.from,
        to: tx.to_address || tx.to,
        amount: Number(tx.value || tx.value_decimal || 0) / Math.pow(10, 18),
        timestamp: new Date((tx.block_timestamp ? Date.parse(tx.block_timestamp) : (tx.timeStamp ? Number(tx.timeStamp) * 1000 : Date.now()))).toISOString(),
        chain: 'ETH',
        isTaxWallet: this.isTaxWallet((tx.to_address || tx.to) || '', 'ETH')
      }))

      return transactions
    } catch (err: any) {
      // Fallback to legacy v2 if 404
      if (err?.response?.status === 404) {
        try {
          const legacyResponse = await axios.get(
            `https://deep-index.moralis.io/api/v2/${walletAddress}/transactions?chain=eth&limit=${limit}`,
            { headers: { 'X-API-Key': MORALIS_API_KEY } }
          )
          
          const txs = legacyResponse.data?.result || legacyResponse.data?.transactions || []
          const transactions: BlockchainTransaction[] = txs.map((tx: any) => ({
            hash: tx.hash,
            from: tx.from_address || tx.from,
            to: tx.to_address || tx.to,
            amount: Number(tx.value || tx.value_decimal || 0) / Math.pow(10, 18),
            timestamp: new Date((tx.block_timestamp ? Date.parse(tx.block_timestamp) : (tx.timeStamp ? Number(tx.timeStamp) * 1000 : Date.now()))).toISOString(),
            chain: 'ETH',
            isTaxWallet: this.isTaxWallet((tx.to_address || tx.to) || '', 'ETH')
          }))
          
          return transactions
        } catch (legacyErr) {
          console.error('Error fetching Ethereum transactions (Moralis legacy):', legacyErr)
          return []
        }
      }
      console.error('Error fetching Ethereum transactions (Moralis):', err)
      return []
    }
  }

  // Get wallet transactions for BSC via Moralis Web3 Data API
  async getBSCTransactions(walletAddress: string, limit: number = 10): Promise<BlockchainTransaction[]> {
    try {
      // Try the correct BSC endpoint format
      const response = await axios.get(
        `https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/transactions?chain=bsc&limit=${limit}`,
        { headers: { 'X-API-Key': MORALIS_API_KEY } }
      )

      const txs = response.data?.result || response.data?.transactions || []
      const transactions: BlockchainTransaction[] = txs.map((tx: any) => ({
        hash: tx.hash,
        from: tx.from_address || tx.from,
        to: tx.to_address || tx.to,
        amount: Number(tx.value || tx.value_decimal || 0) / Math.pow(10, 18),
        timestamp: new Date((tx.block_timestamp ? Date.parse(tx.block_timestamp) : (tx.timeStamp ? Number(tx.timeStamp) * 1000 : Date.now()))).toISOString(),
        chain: 'BNB',
        isTaxWallet: this.isTaxWallet((tx.to_address || tx.to) || '', 'BNB')
      }))

      return transactions
    } catch (err: any) {
      console.error('Error fetching BSC transactions:', err)
      // Try alternative endpoint format
      try {
        const altResponse = await axios.get(
          `https://deep-index.moralis.io/api/v2/${walletAddress}/transactions?chain=bsc&limit=${limit}`,
          { headers: { 'X-API-Key': MORALIS_API_KEY } }
        )
        
        const txs = altResponse.data?.result || altResponse.data?.transactions || []
        const transactions: BlockchainTransaction[] = txs.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from_address || tx.from,
          to: tx.to_address || tx.to,
          amount: Number(tx.value || tx.value_decimal || 0) / Math.pow(10, 18),
          timestamp: new Date((tx.block_timestamp ? Date.parse(tx.block_timestamp) : (tx.timeStamp ? Number(tx.timeStamp) * 1000 : Date.now()))).toISOString(),
          chain: 'BNB',
          isTaxWallet: this.isTaxWallet((tx.to_address || tx.to) || '', 'BNB')
        }))
        
        return transactions
      } catch (altErr) {
        console.error('Alternative BSC endpoint also failed:', altErr)
        return []
      }
    }
  }

  // Check if address is a tax wallet
  private isTaxWallet(address: string, chain: string): boolean {
    const taxWallets = {
      SOL: process.env.TAX_WALLET_SOL || '',
      ETH: process.env.TAX_WALLET_ETH || '',
      BNB: process.env.TAX_WALLET_BNB || ''
    }
    
    return address.toLowerCase() === taxWallets[chain as keyof typeof taxWallets]?.toLowerCase()
  }

  // Get wallet transactions for any chain
  async getWalletTransactions(walletAddress: string, chain: string, limit: number = 10): Promise<BlockchainTransaction[]> {
    try {
      switch (chain.toUpperCase()) {
        case 'SOL':
          return await this.getSolanaTransactions(walletAddress, limit)
        case 'ETH':
          return await this.getEthereumTransactions(walletAddress, limit)
        case 'BNB':
          return await this.getBSCTransactions(walletAddress, limit)
        default:
          console.warn(`Unsupported chain: ${chain}`)
          return []
      }
    } catch (error) {
      console.error(`Error fetching ${chain} transactions:`, error)
      return []
    }
  }

  // Get comprehensive wallet data
  async getWalletData(walletAddress: string): Promise<{
    balances: WalletBalance[]
    transactions: BlockchainTransaction[]
    totalVolume: number
  }> {
    try {
      const [solBalance, ethBalance, bnbBalance, prices] = await Promise.all([
        this.getSolanaBalance(walletAddress),
        this.getEthereumBalance(walletAddress),
        this.getBSCBalance(walletAddress),
        this.getTokenPrices()
      ])

      const [solTxs, ethTxs, bnbTxs] = await Promise.all([
        this.getSolanaTransactions(walletAddress, 5),
        this.getEthereumTransactions(walletAddress, 5),
        this.getBSCTransactions(walletAddress, 5)
      ])

      const balances: WalletBalance[] = [
        {
          chain: 'SOL',
          symbol: 'SOL',
          balance: solBalance,
          usdValue: solBalance * prices.SOL,
          lastUpdated: new Date().toISOString()
        },
        {
          chain: 'ETH',
          symbol: 'ETH',
          balance: ethBalance,
          usdValue: ethBalance * prices.ETH,
          lastUpdated: new Date().toISOString()
        },
        {
          chain: 'BNB',
          symbol: 'BNB',
          balance: bnbBalance,
          usdValue: bnbBalance * prices.BNB,
          lastUpdated: new Date().toISOString()
        }
      ]

      const allTransactions = [...solTxs, ...ethTxs, ...bnbTxs]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      const totalVolume = allTransactions
        .filter(tx => tx.isTaxWallet)
        .reduce((sum, tx) => sum + tx.amount, 0)

      return {
        balances,
        transactions: allTransactions,
        totalVolume
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error)
      return {
        balances: [],
        transactions: [],
        totalVolume: 0
      }
    }
  }
}

export const blockchainAPIs = new BlockchainAPIs()
