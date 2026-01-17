import fetch from 'node-fetch';

export const UGPT_TOKEN_ADDRESS = '14CZKL5PNfQwgw4ZQNoGGkgbztachLXUJr5CqGkKBAGS';

export const TREASURY_WALLET = process.env.TREASURY_WALLET || 'CZQg7RTm6pRadkCDbXYBCgx2RnTTuY3TtMjBCLwLR42E';

const getAlchemyUrl = () => {
  const alchemyKey = process.env.ALCHEMY_SOLANA_API_KEY;
  if (alchemyKey) {
    return `https://solana-mainnet.g.alchemy.com/v2/${alchemyKey}`;
  }
  return process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
};

export const DEFAULT_UGPT_PRICE = 100;

export const calculateUGPTFromUSD = async (usdAmount) => {
  const ugptPrice = await getUGPTPrice();
  if (ugptPrice <= 0) {
    return { ugptAmount: DEFAULT_UGPT_PRICE, ugptPrice: 0.002 };
  }
  const ugptAmount = Math.ceil(usdAmount / ugptPrice);
  return { ugptAmount, ugptPrice };
};

const solanaRpcCall = async (method, params) => {
  const url = getAlchemyUrl();
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });
  return response.json();
};

export const formatTokenAmount = (amount) => {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'B';
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K';
  }
  return amount.toLocaleString();
};

export const getUGPTPrice = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${UGPT_TOKEN_ADDRESS}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const price = parseFloat(data.pairs[0].priceUsd);
      if (price > 0) return price;
    }
  } catch (error) {
    console.error('Error fetching price from DexScreener:', error.message);
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://public-api.birdeye.so/defi/price?address=${UGPT_TOKEN_ADDRESS}`,
      {
        signal: controller.signal,
        headers: { 'X-API-KEY': 'public' }
      }
    );
    clearTimeout(timeoutId);
    
    const data = await response.json();
    if (data.data?.value > 0) return data.data.value;
  } catch (error) {
    console.error('Error fetching price from Birdeye:', error.message);
  }
  
  return 0.002;
};

export const calculateUGPTAmount = async (usdAmount) => {
  const ugptPrice = await getUGPTPrice();
  if (ugptPrice <= 0) {
    return DEFAULT_UGPT_PRICE;
  }
  return Math.ceil(usdAmount / ugptPrice);
};

export const getSolBalance = async (walletAddress) => {
  try {
    const data = await solanaRpcCall('getBalance', [walletAddress]);
    if (data.error) {
      throw new Error(data.error.message);
    }
    return (data.result?.value || 0) / 1e9;
  } catch (error) {
    console.error('Error getting SOL balance:', error);
    return 0;
  }
};

export const getUGPTBalance = async (walletAddress) => {
  try {
    const data = await solanaRpcCall('getTokenAccountsByOwner', [
      walletAddress,
      { mint: UGPT_TOKEN_ADDRESS },
      { encoding: 'jsonParsed' }
    ]);
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    const accounts = data.result?.value || [];
    if (accounts.length === 0) {
      return 0;
    }
    
    let totalBalance = 0;
    for (const account of accounts) {
      const tokenAmount = account.account?.data?.parsed?.info?.tokenAmount;
      if (tokenAmount) {
        totalBalance += parseFloat(tokenAmount.uiAmount || 0);
      }
    }
    
    return totalBalance;
  } catch (error) {
    console.error('Error getting UGPT balance:', error);
    return 0;
  }
};

export const verifyTokenTransaction = async (txnHash, fromWallet, toWallet, expectedAmount) => {
  try {
    const data = await solanaRpcCall('getTransaction', [
      txnHash,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
    ]);
    
    if (!data.result) {
      return { verified: false, error: 'Transaction not found' };
    }

    const transaction = data.result;
    
    if (transaction.meta?.err !== null) {
      return { verified: false, error: 'Transaction failed' };
    }

    if (!transaction.slot || transaction.slot < 1) {
      return { verified: false, error: 'Transaction not confirmed' };
    }

    const instructions = transaction.transaction?.message?.instructions || [];
    const innerInstructions = transaction.meta?.innerInstructions || [];
    
    let tokenTransferFound = false;
    let transferAmount = 0;
    let destinationMatches = false;
    
    const treasuryTokenAccount = await getTreasuryTokenAccount();
    
    const checkTransfer = (ix) => {
      if (ix.parsed?.type === 'transfer' || ix.parsed?.type === 'transferChecked') {
        const info = ix.parsed.info;
        if (info.mint === UGPT_TOKEN_ADDRESS || ix.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
          tokenTransferFound = true;
          transferAmount = parseFloat(info.tokenAmount?.uiAmount || info.amount || 0);
          
          if (info.destination === treasuryTokenAccount || info.destination === toWallet) {
            destinationMatches = true;
          }
        }
      }
    };
    
    for (const ix of instructions) {
      checkTransfer(ix);
    }
    
    for (const inner of innerInstructions) {
      for (const ix of inner.instructions || []) {
        checkTransfer(ix);
      }
    }

    if (!tokenTransferFound) {
      return { verified: false, error: 'No token transfer found in transaction' };
    }

    if (!destinationMatches) {
      return { verified: false, error: 'Transfer destination does not match treasury' };
    }

    if (expectedAmount && transferAmount < expectedAmount * 0.99) {
      return { verified: false, error: 'Transfer amount mismatch' };
    }

    return { 
      verified: true, 
      amount: transferAmount,
      txnHash 
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { verified: false, error: error.message };
  }
};

export const getAssociatedTokenAddress = async (walletAddress) => {
  try {
    const data = await solanaRpcCall('getTokenAccountsByOwner', [
      walletAddress,
      { mint: UGPT_TOKEN_ADDRESS },
      { encoding: 'jsonParsed' }
    ]);
    
    if (data.result?.value?.length > 0) {
      return data.result.value[0].pubkey;
    }
    return null;
  } catch (error) {
    console.error('Error getting token account:', error);
    return null;
  }
};

export const getTreasuryTokenAccount = async () => {
  return getAssociatedTokenAddress(TREASURY_WALLET);
};

const UGPT_DECIMALS = 9;

export const prepareTokenTransaction = async (fromWallet, toWallet, amount) => {
  const amountLamports = BigInt(Math.round(amount * Math.pow(10, UGPT_DECIMALS)));
  
  const fromTokenAccount = await getAssociatedTokenAddress(fromWallet);
  const toTokenAccount = await getAssociatedTokenAddress(toWallet);
  
  const { blockhash } = await solanaRpcCall('getLatestBlockhash', [{ commitment: 'confirmed' }])
    .then(res => res.result?.value || {});
  
  if (!blockhash) {
    throw new Error('Failed to get blockhash');
  }

  let needsCreateAccount = false;
  if (toTokenAccount) {
    const accountInfo = await solanaRpcCall('getAccountInfo', [toTokenAccount, { encoding: 'jsonParsed' }]);
    if (!accountInfo.result?.value) {
      needsCreateAccount = true;
    }
  } else {
    needsCreateAccount = true;
  }

  const { PublicKey, Transaction, TransactionInstruction } = await import('@solana/web3.js');
  const { createTransferInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
  
  const fromPubkey = new PublicKey(fromWallet);
  const toPubkey = new PublicKey(toWallet);
  const mintPubkey = new PublicKey(UGPT_TOKEN_ADDRESS);
  
  const fromTokenPubkey = getAssociatedTokenAddressSync(mintPubkey, fromPubkey);
  const toTokenPubkey = getAssociatedTokenAddressSync(mintPubkey, toPubkey);
  
  const transaction = new Transaction();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromPubkey;
  
  if (needsCreateAccount) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromPubkey,
        toTokenPubkey,
        toPubkey,
        mintPubkey
      )
    );
  }
  
  transaction.add(
    createTransferInstruction(
      fromTokenPubkey,
      toTokenPubkey,
      fromPubkey,
      amountLamports
    )
  );
  
  const serializedTransaction = transaction.serialize({ requireAllSignatures: false }).toString('base64');
  return serializedTransaction;
};

export const confirmTransaction = async (signature) => {
  let confirmed = false;
  let attempts = 0;
  const maxAttempts = 30;
  
  while (!confirmed && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
    
    try {
      const data = await solanaRpcCall('getSignatureStatuses', [[signature]]);
      const status = data.result?.value?.[0];
      
      if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
        if (status.err) {
          throw new Error('Transaction failed on chain');
        }
        confirmed = true;
      }
    } catch (e) {
      if (e.message === 'Transaction failed on chain') throw e;
    }
  }
  
  return confirmed;
};

export default {
  UGPT_TOKEN_ADDRESS,
  TREASURY_WALLET,
  DEFAULT_UGPT_PRICE,
  formatTokenAmount,
  getUGPTPrice,
  calculateUGPTAmount,
  getSolBalance,
  getUGPTBalance,
  verifyTokenTransaction,
  getAssociatedTokenAddress,
  getTreasuryTokenAccount,
  prepareTokenTransaction,
  confirmTransaction,
};
