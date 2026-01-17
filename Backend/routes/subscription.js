import { Hono } from 'hono'
import { userModel } from '../models/user.js'
import {
  UGPT_TOKEN_ADDRESS,
  TREASURY_WALLET,
  DEFAULT_UGPT_PRICE,
  formatTokenAmount,
  getUGPTPrice,
  calculateUGPTFromUSD,
  getSolBalance,
  getUGPTBalance,
  verifyTokenTransaction,
  getTreasuryTokenAccount,
  prepareTokenTransaction,
  confirmTransaction,
} from './utils/solana.js'

const router = new Hono()

const PREMIUM_CREDITS = 300
const SUBSCRIPTION_USD_PRICE = 15

const verifyUserAuth = async (c, userId) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return null
  }
  
  const token = authHeader.replace('Bearer ', '')
  const user = await userModel.findOne({ _id: userId, token: token }).lean()
  return user
}

router.get('/status/:userId', async (c) => {
  const userId = c.req.param('userId')

  try {
    const user = await verifyUserAuth(c, userId)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const subscription = user.subscription || {
      plan: 'free',
      status: 'active',
      premiumCredits: 0,
      premiumCreditsUsed: 0
    }

    if (subscription.plan === 'premium' && subscription.endDate) {
      const now = new Date()
      if (new Date(subscription.endDate) < now) {
        await userModel.findByIdAndUpdate(userId, {
          'subscription.plan': 'free',
          'subscription.status': 'expired'
        })
        subscription.plan = 'free'
        subscription.status = 'expired'
      }
    }

    return c.json({
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      nextBillingDate: subscription.nextBillingDate,
      premiumCredits: subscription.premiumCredits,
      premiumCreditsUsed: subscription.premiumCreditsUsed,
      remainingCredits: subscription.premiumCredits - subscription.premiumCreditsUsed,
      connectedWallet: user.connectedWallet
    }, 200)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

router.get('/payment-details', async (c) => {
  try {
    const { ugptAmount, ugptPrice } = await calculateUGPTFromUSD(SUBSCRIPTION_USD_PRICE)
    
    const treasuryTokenAccount = await getTreasuryTokenAccount()
    
    return c.json({
      tokenAddress: UGPT_TOKEN_ADDRESS,
      tokenSymbol: 'UGPT',
      treasuryWallet: TREASURY_WALLET,
      treasuryTokenAccount: treasuryTokenAccount,
      priceUGPT: ugptAmount,
      priceUGPTFormatted: formatTokenAmount(ugptAmount),
      priceUSD: SUBSCRIPTION_USD_PRICE,
      ugptPriceUSD: ugptPrice,
      premiumCredits: PREMIUM_CREDITS,
      features: {
        free: {
          name: 'Free Plan',
          price: 0,
          features: [
            'Unlimited messages',
            'Access to 40+ open-source models',
            'Standard rate limits',
            'Chat history',
            'Basic support'
          ]
        },
        premium: {
          name: 'Premium Plan',
          priceUGPT: ugptAmount,
          priceUGPTFormatted: formatTokenAmount(ugptAmount),
          priceUSD: SUBSCRIPTION_USD_PRICE,
          features: [
            'Everything in Free',
            'GPT-5.1, Claude Sonnet 4.5, Gemini 3.0',
            '300 premium messages/month',
            'Higher rate limits',
          ]
        }
      }
    }, 200)
  } catch (error) {
    console.error('Error fetching payment details:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

router.get('/wallet-balance/:walletAddress', async (c) => {
  const walletAddress = c.req.param('walletAddress')
  
  if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
    return c.json({ error: 'Invalid wallet address' }, 400)
  }
  
  try {
    const [solBalance, ugptBalance] = await Promise.all([
      getSolBalance(walletAddress),
      getUGPTBalance(walletAddress)
    ])
    
    return c.json({
      wallet: walletAddress,
      sol: solBalance,
      ugpt: ugptBalance,
      ugptFormatted: formatTokenAmount(ugptBalance),
      tokenAddress: UGPT_TOKEN_ADDRESS
    }, 200)
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return c.json({ error: 'Failed to fetch balance' }, 500)
  }
})

router.get('/current-price', async (c) => {
  try {
    const { ugptAmount, ugptPrice } = await calculateUGPTFromUSD(SUBSCRIPTION_USD_PRICE)
    
    return c.json({
      priceUGPT: ugptAmount,
      priceUGPTFormatted: formatTokenAmount(ugptAmount),
      priceUSD: SUBSCRIPTION_USD_PRICE,
      ugptPriceUSD: ugptPrice,
      tokenAddress: UGPT_TOKEN_ADDRESS,
      treasuryWallet: TREASURY_WALLET
    }, 200)
  } catch (error) {
    console.error('Error calculating price:', error)
    return c.json({ error: 'Failed to calculate price' }, 500)
  }
})

router.post('/verify-payment', async (c) => {
  const { userId, txnHash, walletAddress, amount } = await c.req.json()

  if (!userId || !txnHash || !walletAddress) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  if (!txnHash.match(/^[A-HJ-NP-Za-km-z1-9]{87,88}$/)) {
    return c.json({ error: 'Invalid transaction hash format' }, 400)
  }

  if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
    return c.json({ error: 'Invalid wallet address format' }, 400)
  }

  try {
    const user = await verifyUserAuth(c, userId)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const existingPayment = await userModel.findOne({
      'subscription.paymentHistory.txnHash': txnHash
    })

    if (existingPayment) {
      return c.json({ error: 'Transaction already used' }, 400)
    }

    const { ugptAmount: calculatedAmount } = await calculateUGPTFromUSD(SUBSCRIPTION_USD_PRICE)
    const expectedAmount = amount || calculatedAmount
    
    const verification = await verifyTokenTransaction(
      txnHash, 
      walletAddress, 
      TREASURY_WALLET, 
      expectedAmount
    )
    
    if (!verification.verified) {
      return c.json({ error: verification.error || 'Transaction verification failed' }, 400)
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)
    const nextBillingDate = new Date(endDate)

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          'subscription.plan': 'premium',
          'subscription.status': 'active',
          'subscription.startDate': startDate,
          'subscription.endDate': endDate,
          'subscription.nextBillingDate': nextBillingDate,
          'subscription.premiumCredits': PREMIUM_CREDITS,
          'subscription.premiumCreditsUsed': 0,
          'subscription.lastPayment': {
            amount: verification.amount || expectedAmount,
            currency: 'UGPT',
            txnHash: txnHash,
            walletAddress: walletAddress,
            timestamp: new Date()
          },
          'connectedWallet': walletAddress
        },
        $push: {
          'subscription.paymentHistory': {
            amount: verification.amount || expectedAmount,
            currency: 'UGPT',
            txnHash: txnHash,
            walletAddress: walletAddress,
            timestamp: new Date(),
            plan: 'premium'
          }
        }
      },
      { new: true }
    )

    if (!updatedUser) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      success: true,
      message: 'Subscription upgraded to Premium!',
      subscription: {
        plan: 'premium',
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        nextBillingDate: nextBillingDate,
        premiumCredits: PREMIUM_CREDITS,
        premiumCreditsUsed: 0,
        remainingCredits: PREMIUM_CREDITS
      }
    }, 200)
  } catch (error) {
    console.error('Error verifying payment:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

router.post('/use-credit/:userId', async (c) => {
  const userId = c.req.param('userId')

  try {
    const user = await verifyUserAuth(c, userId)
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    if (user.subscription?.plan !== 'premium') {
      return c.json({ error: 'Premium subscription required' }, 403)
    }

    const remaining = (user.subscription.premiumCredits || 0) - (user.subscription.premiumCreditsUsed || 0)
    
    if (remaining <= 0) {
      return c.json({ error: 'No premium credits remaining', remaining: 0 }, 403)
    }

    await userModel.findByIdAndUpdate(userId, {
      $inc: { 'subscription.premiumCreditsUsed': 1 }
    })

    return c.json({
      success: true,
      remaining: remaining - 1
    }, 200)
  } catch (error) {
    console.error('Error using credit:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

router.post('/connect-wallet', async (c) => {
  const { userId, walletAddress, signature, message } = await c.req.json()

  if (!userId || !walletAddress) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
    return c.json({ error: 'Invalid wallet address format' }, 400)
  }

  try {
    const user = await verifyUserAuth(c, userId)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    await userModel.findByIdAndUpdate(userId, {
      connectedWallet: walletAddress
    })

    return c.json({ success: true, walletAddress }, 200)
  } catch (error) {
    console.error('Error connecting wallet:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

router.post('/prepare-transaction', async (c) => {
  const { fromWallet, toWallet, amount } = await c.req.json()

  if (!fromWallet || !amount) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  if (fromWallet.length < 32 || fromWallet.length > 44) {
    return c.json({ error: 'Invalid wallet address' }, 400)
  }

  try {
    const targetWallet = toWallet || TREASURY_WALLET
    const serializedTransaction = await prepareTokenTransaction(fromWallet, targetWallet, amount)
    
    return c.json({ transaction: serializedTransaction }, 200)
  } catch (error) {
    console.error('Error preparing transaction:', error)
    return c.json({ error: error.message || 'Failed to prepare transaction' }, 500)
  }
})

router.post('/confirm-transaction', async (c) => {
  const { signature } = await c.req.json()

  if (!signature) {
    return c.json({ error: 'Missing signature' }, 400)
  }

  try {
    const confirmed = await confirmTransaction(signature)
    return c.json({ confirmed }, 200)
  } catch (error) {
    console.error('Error confirming transaction:', error)
    return c.json({ error: error.message || 'Failed to confirm transaction' }, 500)
  }
})

router.get('/verify-transaction/:signature', async (c) => {
  const signature = c.req.param('signature')

  if (!signature || !signature.match(/^[A-HJ-NP-Za-km-z1-9]{87,88}$/)) {
    return c.json({ verified: false, error: 'Invalid signature' }, 400)
  }

  try {
    const verification = await verifyTokenTransaction(signature, null, TREASURY_WALLET, null)
    return c.json(verification, 200)
  } catch (error) {
    console.error('Error verifying transaction:', error)
    return c.json({ verified: false, error: 'Verification failed' }, 500)
  }
})

export default router