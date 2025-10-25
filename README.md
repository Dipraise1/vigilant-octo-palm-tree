# Apeit Admin Dashboard

A production-ready tax cashback management system with real-time blockchain data integration.

## Features

- **Real-time Blockchain Data**: Live balances and transactions from SOL, ETH, and BNB
- **Eligibility Checking**: Automatic user eligibility verification with $50 threshold
- **Cashback Management**: 10% cashback calculation and payment tracking
- **Admin Dashboard**: Complete user and transaction management
- **Multi-chain Support**: Solana (Helius), Ethereum & BSC (Moralis)

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **APIs**: Helius (Solana), Moralis (Ethereum/BSC)
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker, Vercel-ready

## Environment Variables

Create `.env.local` with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Moralis API Keys
MORALIS_API_KEY="your_moralis_key"
EXPO_PUBLIC_MORALIS_KEY="your_moralis_key"
EXPO_PUBLIC_MORALIS_KEY2="your_moralis_key_2"
EXPO_PUBLIC_MORALIS_KEY3="your_moralis_key_3"

# Helius API Keys
HELIUS_RPC_URL="https://mainnet.helius-rpc.com/?api-key=your_helius_key"
EXPO_PUBLIC_HELIUS_URL="https://mainnet.helius-rpc.com/?api-key=your_helius_key"
EXPO_PUBLIC_HELIUS2_URL="https://mainnet.helius-rpc.com/?api-key=your_helius_key_2"

# Tax Wallet Addresses
TAX_WALLET_ETH="0x353d58852e02Af7EFF9C4beB895a23ad316A1717"
TAX_WALLET_BNB="0x353d58852e02Af7EFF9C4beB895a23ad316A1717"
TAX_WALLET_SOL="6GGfAXt5H7MNKuDrhmub8CuYabny97ux1J5qZTDPQwzC"

# Production
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NODE_ENV="production"
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t apeit-dashboard .

# Run container
docker run -p 3000:3000 --env-file .env.production apeit-dashboard
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## API Endpoints

- `POST /api/eligibility` - Check user eligibility
- `GET /api/eligible-users` - Get all eligible users (admin)
- `POST /api/eligible-users` - Add eligible user
- `PUT /api/eligible-users` - Update user status
- `GET /api/blockchain?type=dashboard` - Get blockchain data
- `GET /api/blockchain?type=transactions` - Get transaction data

## Rate Limiting

- Eligibility checks: 10 requests per minute per IP
- API calls: 100 requests per 15 minutes per IP

## Security Features

- Input validation for wallet addresses
- Rate limiting on all endpoints
- CORS headers configured
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Environment variable validation

## Monitoring

- Real-time data updates every 10-30 seconds
- Error logging and fallback mechanisms
- Live status indicators
- Transaction history tracking

## Support

For issues or questions, please check the logs and ensure all environment variables are properly configured.# vigilant-octo-palm-tree
