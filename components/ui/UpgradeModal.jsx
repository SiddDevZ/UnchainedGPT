"use client";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  connectWallet,
  disconnectWallet,
  getWalletBalance,
  processSubscriptionPayment,
  formatWalletAddress,
  getAllWallets,
  getDetectedWallets,
} from "../../lib/solana";

const getAuthHeaders = () => {
  const token = Cookies.get("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const CheckIcon = ({ className }) => (
  <svg 
    className={className || "w-4 h-4 text-white/40"} 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-white/[0.08] rounded ${className}`} />
);

const UpgradeModal = ({ isOpen, onClose, userId, onUpgradeSuccess }) => {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState({ sol: 0, ugpt: 0, ugptFormatted: '0' });
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [step, setStep] = useState("plans"); 

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsVisible(true), 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const freeFeatures = [
    "Unlimited messages",
    "40+ open-source models",
    "Basic chat history",
    "Standard response speed",
  ];

  const premiumFeatures = [
    "Everything in Free",
    "GPT-5.1, Claude 4.5 etc",
    "300 premium messages",
    "Paid models access",
  ];

  useEffect(() => {
    if (isOpen && userId) {
      fetchSubscriptionStatus();
      fetchPaymentDetails();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep("plans");
        setIsProcessing(false);
      }, 300);
    }
  }, [isOpen]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/status/${userId}`,
        { headers: getAuthHeaders() }
      );
      const data = await response.json();
      if (data.plan) {
        setCurrentPlan(data.plan);
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/payment-details`
      );
      const data = await response.json();
      setPaymentDetails(data);
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  const handleConnectWallet = async (walletId) => {
    setIsLoading(true);
    try {
      const result = await connectWallet(walletId);
      if (result.connected) {
        setWalletConnected(true);
        setWalletAddress(result.publicKey);
        setConnectedWallet(result.wallet);
        
        setBalanceLoading(true);
        try {
          const balance = await getWalletBalance(result.publicKey);
          setWalletBalance(balance);
        } finally {
          setBalanceLoading(false);
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/connect-wallet`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ userId, walletAddress: result.publicKey }),
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (e) {
      console.error("Error disconnecting:", e);
    }
    
    setWalletConnected(false);
    setWalletAddress(null);
    setConnectedWallet(null);
    
    setWalletBalance({ sol: 0, ugpt: 0, ugptFormatted: '0' });
  };

  const initiatePayment = async () => {
    if (!walletConnected) {
      toast.error("Please connect a wallet first");
      return;
    }

    if (!paymentDetails) {
      toast.error("Loading payment details...");
      return;
    }

    setStep("processing");
    setIsProcessing(true);

    try {
      const priceResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/current-price`
      );
      const currentPrice = await priceResponse.json();
      
      if (currentPrice.error) {
        throw new Error("Failed to get current price");
      }

      if (walletBalance.ugpt < currentPrice.priceUGPT) {
        toast.error(`Insufficient $UGPT balance. You need ${currentPrice.priceUGPTFormatted} $UGPT`);
        setStep("payment");
        setIsProcessing(false);
        return;
      }

      const paymentResult = await processSubscriptionPayment(
        currentPrice.priceUGPT,
        currentPrice.treasuryWallet
      );

      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscription/verify-payment`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            userId,
            txnHash: paymentResult.txnHash,
            walletAddress: paymentResult.walletAddress,
            amount: paymentResult.amount,
          }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        setStep("success");
        setCurrentPlan("premium");
        setSubscriptionData(verifyData.subscription);
        if (onUpgradeSuccess) onUpgradeSuccess(verifyData.subscription);
      } else {
        throw new Error(verifyData.error || "Verification failed");
      }
    } catch (error) {
      toast.error(error.message);
      setStep("payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!shouldRender) return null;

  const detectedWallets = getDetectedWallets();
  const allWallets = getAllWallets();

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-opacity duration-200 ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={!isProcessing ? onClose : undefined}
      />
      
      <div className={`relative w-full max-w-[600px] bg-[#0a0a0a] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-200 ease-out transform ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-2"}`}>
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] z-10 bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                onClick={() => setStep('plans')}
                className="p-1 -ml-2 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h2 className="text-[15px] font-medium text-white">
              {step === 'plans' && 'Choose Your Plan'}
              {step === 'payment' && 'Complete Payment'}
              {step === 'processing' && 'Processing Transaction'}
              {step === 'success' && 'Welcome to Premium'}
            </h2>
          </div>
          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="relative overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div 
            className="flex w-[200%] transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
            style={{ 
              transform: step === 'plans' 
                ? 'translateX(0)' 
                : (step === 'payment' || step === 'processing' || step === 'success') 
                  ? 'translateX(-50%)' 
                  : 'translateX(0)'
            }}
          >
            
            <div className="w-1/2 p-6 md:p-8 space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h3>
                <p className="text-white/40 text-sm">Unlock advanced AI models and features</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-medium text-white">Free</h4>
                      <p className="text-xs text-white/40 mt-1">For getting started</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-white">$0</span>
                    <span className="text-white/30 text-sm">/mo</span>
                  </div>
                  <ul className="space-y-3 flex-1">
                    {freeFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {currentPlan === 'free' && (
                    <div className="mt-6 w-full py-2.5 rounded-xl border border-white/[0.1] text-center text-sm text-white/40">
                      Current Plan
                    </div>
                  )}
                </div>

                <div className="relative p-5 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.06] to-white/[0.02] overflow-hidden group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <h4 className="font-medium text-white">Premium</h4>
                      <p className="text-xs text-emerald-500 mt-0.5">Recommended</p>
                    </div>
                  </div>
                  <div className="mb-6 relative z-10">
                    {!paymentDetails ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-white">${paymentDetails?.features?.premium?.priceUSD}</span>
                        <span className="text-white/30 text-sm">/mo</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3 flex-1 relative z-10">
                    {premiumFeatures.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                         <div className="mt-0.5"><CheckIcon className="w-4 h-4 text-emerald-400" /></div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  
                  {currentPlan === 'premium' ? (
                    <div className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-center text-sm font-medium relative z-10">
                      Active Plan
                    </div>
                  ) : (
                    <button 
                      onClick={() => setStep('payment')}
                      className="mt-6 w-full py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] active:scale-[0.98] relative z-10"
                    >
                      Upgrade Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="w-1/2 p-6 md:p-8">
              {step === 'processing' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in duration-500">
                   <div className="relative mb-6">
                     <div className="w-16 h-16 rounded-full border-2 border-white/[0.08] border-t-purple-500 animate-spin" />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-xs font-mono text-purple-400">TX</span>
                     </div>
                   </div>
                   <h3 className="text-lg font-medium text-white mb-2">Processing Transaction</h3>
                   <p className="text-sm text-white/40 max-w-[240px]">Please approve the request in your wallet to complete the upgrade.</p>
                </div>
              ) : step === 'success' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/80 to-green-500/80 text-emerald-400 flex items-center justify-center mb-6 ring-1 ring-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                      <svg className="w-11 h-11" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <h3 className="text-2xl font-bold text-white mb-1.5">Welcome to Premium!</h3>
                   <div className=" rounded-2xl p-1 mb-8 max-w-sm">
                     <p className="text-sm text-white/50 leading-relaxed">
                       Your account has been upgraded. You now have full access to all premium models and features.
                     </p>
                   </div>
                   <button 
                     onClick={onClose} 
                     className="px-10 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 active:scale-[0.98] transition-all shadow-lg"
                   >
                     Start Creating!!
                   </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto flex flex-col h-full gap-6">
                  <div>
                    <div className="mb-6 p-5 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent backdrop-blur-xl relative overflow-hidden group hover:border-white/[0.1] transition-colors">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative flex items-end justify-between mb-4">
                        <div>
                          <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2">Total Due</p>
                          {!paymentDetails ? (
                            <Skeleton className="h-9 w-32" />
                          ) : (
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-3xl font-bold text-white tracking-tight">{paymentDetails?.priceUGPTFormatted}</span>
                              <span className="text-lg font-medium text-purple-400">$UGPT</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {!paymentDetails ? (
                            <Skeleton className="h-6 w-24 ml-auto mb-1.5" />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.05] text-[11px] font-medium text-white/60 mb-1.5">
                              ≈ ${paymentDetails?.priceUSD} USD
                            </span>
                          )}
                          <p className="text-[10px] text-white/30 text-right">Monthly subscription</p>
                        </div>
                      </div>
                      
                      <div className="relative pt-4 border-t border-white/[0.06] flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                             <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           </div>
                           <span className="text-xs text-white/60">Pay with $UGPT</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-mono text-white/30 truncate max-w-[80px]">
                              {paymentDetails?.tokenAddress?.slice(0,4)}...{paymentDetails?.tokenAddress?.slice(-4)}
                            </span>
                         </div>
                      </div>
                    </div>

                    {walletConnected ? (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Connected Wallet</span>
                          {balanceLoading ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-white/40">Balance:</span>
                              <div className="h-4 w-16 bg-white/[0.08] rounded animate-pulse" />
                            </div>
                          ) : (
                            <span className={`text-xs font-medium ${walletBalance.ugpt >= (paymentDetails?.priceUGPT || 100) ? 'text-emerald-400' : 'text-rose-400'}`}>
                              Balance: {walletBalance.ugptFormatted} $UGPT
                            </span>
                          )}
                        </div>
                        
                        <div className="p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                           <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0a0a] border border-white/[0.04]">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-white/[0.05] p-2 flex items-center justify-center">
                                    <img src={connectedWallet.icon} alt={connectedWallet.name} className="w-full h-full object-contain" />
                                 </div>
                                 <div>
                                   <p className="text-sm font-medium text-white">{connectedWallet.name}</p>
                                   <p className="text-xs text-white/30 font-mono tracking-wide">{formatWalletAddress(walletAddress)}</p>
                                 </div>
                              </div>
                              <button 
                                onClick={handleDisconnect} 
                                className="p-2 rounded-lg hover:bg-white/[0.05] text-white/20 hover:text-white/60 transition-colors group"
                                title="Disconnect Wallet"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                              </button>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Select Wallet</span>
                        </div>
                        <div className="space-y-2.5">
                          {allWallets.map((wallet) => {
                            const isDetected = detectedWallets.some(w => w.id === wallet.id);
                            return (
                              <button
                                key={wallet.id}
                                onClick={() => handleConnectWallet(wallet.id)}
                                disabled={isLoading}
                                className="w-full group flex items-center justify-between p-3 rounded-xl border border-white/[0.06] hover:border-purple-500/30 hover:bg-purple-500/[0.02] bg-white/[0.02] transition-all"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white/[0.05] p-1.5 flex items-center justify-center border border-white/[0.05] group-hover:border-purple-500/20 group-hover:bg-purple-500/10 transition-colors">
                                      <img 
                                        src={wallet.icon} 
                                        alt={wallet.name} 
                                        className="w-full h-full object-contain"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                      />
                                    </div>
                                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{wallet.name}</span>
                                 </div>
                                 {isDetected && (
                                   <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/10">
                                      <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                                      <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">Detected</span>
                                   </div>
                                 )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={initiatePayment}
                      disabled={!walletConnected || isLoading}
                      className={`
                        w-full py-4 px-6 rounded-xl text-sm font-semibold transition-all shadow-lg
                        ${!walletConnected || isLoading
                          ? 'bg-white/[0.05] text-white/20 cursor-not-allowed border border-white/[0.05]' 
                          : 'bg-white text-black hover:bg-white/90 shadow-[0_0_30px_-5px_rgba(255,255,255,0.15)] active:scale-[0.99]'}
                      `}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Connecting...
                        </span>
                      ) : walletConnected ? (
                         <span className="flex items-center justify-center text-black gap-2">
                           Pay {paymentDetails?.priceUGPTFormatted || '10K'} $UGPT
                           <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                         </span>
                      ) : (
                        "Connect Wallet to Continue"
                      )}
                    </button>
                    {!walletConnected && (
                      <p className="mt-4 text-center text-[10px] text-white/20">
                        By connecting, you agree to the terms of service
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
