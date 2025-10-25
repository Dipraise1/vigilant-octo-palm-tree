import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@apeit.com' },
    update: {},
    create: {
      email: 'admin@apeit.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create tax wallets
  const taxWallets = [
    {
      address: process.env.TAX_WALLET_SOL || 'So11111111111111111111111111111111111111112',
      chain: 'SOL',
      totalVolume: 0,
      transactionCount: 0,
    },
    {
      address: process.env.TAX_WALLET_ETH || '0x0000000000000000000000000000000000000000',
      chain: 'ETH',
      totalVolume: 0,
      transactionCount: 0,
    },
    {
      address: process.env.TAX_WALLET_BNB || '0x0000000000000000000000000000000000000000',
      chain: 'BNB',
      totalVolume: 0,
      transactionCount: 0,
    },
  ]

  for (const wallet of taxWallets) {
    await prisma.taxWallet.upsert({
      where: { address: wallet.address },
      update: {},
      create: wallet,
    })
  }

  console.log('✅ Tax wallets created')

  // Create sample users
  const sampleUsers = [
    {
      walletAddress: '0x1234567890123456789012345678901234567890',
      chain: 'ETH',
      totalVolume: 15000,
      cashbackEligible: 15000,
      cashbackAmount: 300,
      status: 'ACTIVE',
    },
    {
      walletAddress: '0x9876543210987654321098765432109876543210',
      chain: 'SOL',
      totalVolume: 8500,
      cashbackEligible: 8500,
      cashbackAmount: 170,
      status: 'PENDING',
    },
    {
      walletAddress: '0x5555555555555555555555555555555555555555',
      chain: 'BNB',
      totalVolume: 25000,
      cashbackEligible: 25000,
      cashbackAmount: 500,
      status: 'PROCESSED',
    },
  ]

  for (const userData of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { walletAddress: userData.walletAddress },
      update: {},
      create: userData,
    })

    // Create sample transactions
    for (let i = 0; i < 5; i++) {
      await prisma.transaction.create({
        data: {
          userWallet: user.walletAddress,
          amount: Math.random() * 1000 + 100,
          chain: user.chain,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          isTaxWallet: Math.random() > 0.3,
        },
      })
    }

    // Create cashback records
    if (userData.cashbackAmount > 0) {
      await prisma.cashback.create({
        data: {
          userId: user.id,
          userWallet: user.walletAddress,
          amount: userData.cashbackAmount,
          status: userData.status === 'PROCESSED' ? 'PAID' : 'PENDING',
        },
      })
    }
  }

  console.log('✅ Sample users and data created')
  console.log('🎉 Database seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })






