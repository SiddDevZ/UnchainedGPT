import {
  PublicKey,
  Transaction,
} from '@solana/web3.js';

export const UGPT_TOKEN_ADDRESS = '14CZKL5PNfQwgw4ZQNoGGkgbztachLXUJr5CqGkKBAGS';
export const UGPT_DECIMALS = 9;

const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || 'CZQg7RTm6pRadkCDbXYBCgx2RnTTuY3TtMjBCLwLR42E';

export const SUPPORTED_WALLETS = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: 'https://play-lh.googleusercontent.com/obRvW02OTYLzJuvic1ZbVDVXLXzI0Vt_JGOjlxZ92XMdBF_i3kqU92u9SgHvJ5pySdM',
    url: 'https://phantom.app/',
    detect: () => typeof window !== 'undefined' && (window?.phantom?.solana?.isPhantom || window?.solana?.isPhantom),
    getProvider: () => window?.phantom?.solana || window?.solana,
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'https://www.coinbase.com/img/favicon/favicon-256.png',
    url: 'https://www.coinbase.com/wallet',
    detect: () => typeof window !== 'undefined' && window?.coinbaseSolana,
    getProvider: () => window?.coinbaseSolana,
  },
];

let activeWallet = null;
let activeProvider = null;

export const getDetectedWallets = () => {
  if (typeof window === 'undefined') return [];
  return SUPPORTED_WALLETS.filter(wallet => wallet.detect());
};

export const getAllWallets = () => SUPPORTED_WALLETS;

export const getActiveWallet = () => activeWallet;
export const getActiveProvider = () => activeProvider;

export const connectWallet = async (walletId) => {
  const wallet = SUPPORTED_WALLETS.find(w => w.id === walletId);
  
  if (!wallet) {
    throw new Error('Wallet not supported');
  }

  if (!wallet.detect()) {
    window.open(wallet.url, '_blank');
    throw new Error(`${wallet.name} not installed`);
  }

  const provider = wallet.getProvider();
  
  if (!provider) {
    throw new Error(`Could not get ${wallet.name} provider`);
  }

  try {
    if (provider.isConnected) {
      try {
        await provider.disconnect();
      } catch (e) {
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await provider.connect();
    activeWallet = wallet;
    activeProvider = provider;
    
    return {
      publicKey: response.publicKey.toString(),
      connected: true,
      wallet: wallet,
    };
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Connection rejected');
    }
    throw error;
  }
};

export const disconnectWallet = async () => {
  const phantomProvider = window?.phantom?.solana || window?.solana;
  const solflareProvider = window?.solflare;
  
  const providers = [phantomProvider, solflareProvider, activeProvider].filter(Boolean);
  
  for (const provider of providers) {
    try {
      if (provider && provider.disconnect) {
        await provider.disconnect();
      }
    } catch (e) {
      console.error('Disconnect error:', e);
    }
  }
  
  activeWallet = null;
  activeProvider = null;
};

export const isWalletConnected = () => {
  return activeProvider?.isConnected || activeProvider?.connected || false;
};

export const getWalletBalance = async (publicKeyString) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/subscription/wallet-balance/${publicKeyString}`
    );
    const data = await response.json();
    return {
      sol: data.sol || 0,
      ugpt: data.ugpt || 0,
      ugptFormatted: data.ugptFormatted || '0'
    };
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return { sol: 0, ugpt: 0, ugptFormatted: '0' };
  }
};

export const sendUGPTPayment = async (amountUGPT, toAddress = TREASURY_WALLET) => {
  if (!activeProvider) {
    throw new Error('No wallet connected');
  }

  const fromPubkey = activeProvider.publicKey;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/prepare-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromWallet: fromPubkey.toString(),
        toWallet: toAddress,
        amount: amountUGPT,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to prepare transaction');
    }

    const { transaction: serializedTransaction } = await response.json();
    
    const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));

    const { signature } = await activeProvider.signAndSendTransaction(transaction);
    
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/confirm-transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signature }),
    });

    return {
      success: true,
      signature,
      fromWallet: fromPubkey.toString(),
      toWallet: toAddress,
      amount: amountUGPT,
    };
  } catch (error) {
    console.error('UGPT transfer error:', error);
    if (error.code === 4001) {
      throw new Error('Transaction rejected');
    }
    throw error;
  }
};

export const verifyTransaction = async (signature) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/verify-transaction/${signature}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { verified: false };
  }
};

export const formatWalletAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const processSubscriptionPayment = async (priceUGPT, treasuryWallet) => {
  if (!activeProvider) {
    throw new Error('No wallet connected');
  }

  const payment = await sendUGPTPayment(priceUGPT, treasuryWallet);
  const verification = await verifyTransaction(payment.signature);
  
  if (!verification.verified) {
    throw new Error('Transaction verification failed');
  }

  return {
    success: true,
    txnHash: payment.signature,
    walletAddress: payment.fromWallet,
    amount: payment.amount,
  };
};
