"use client";
import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, memo } from "react";
import "remixicon/fonts/remixicon.css";
import "./page.css";
import { CodeBlock } from "../../components/ui/code-block";
import Cookies from "js-cookie";
import { useParams, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import UpgradeModal from "../../components/ui/UpgradeModal";

const DAILY_MESSAGE_LIMIT = 30;
const GUEST_TOKEN_KEY = "guest_token";
const GUEST_MESSAGES_KEY = "guest_messages";
const GUEST_MESSAGES_DATE_KEY = "guest_messages_date";

const generateGuestToken = () => {
  return 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

const DemoWelcomeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[420px] mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.08] shadow-2xl">
          <div className="px-6 pt-6 pb-4">
            <h2 className="text-lg font-semibold text-white mb-1">Try UnchainedGPT</h2>
            <p className="text-white/50 text-sm">Experience AI without limits</p>
          </div>

          <div className="px-6 pb-5">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-chat-3-line text-white/40 text-xs"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm">30 messages daily as guest</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-infinity-line text-white/40 text-xs"></i>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Unlimited with free account signup</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-2.5">
            <Link 
              href="/register"
              className="w-full py-2.5 px-4 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/95 transition-all text-center"
            >
              Sign up for free
            </Link>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 text-white/60 text-sm font-medium rounded-lg hover:text-white/80 transition-colors"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Guest Mode Banner Component
const GuestModeBanner = ({ messagesRemaining, totalMessages }) => {
  return (
    <div className="bg-white/[0.02] border-b border-white/[0.06]">
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <i className="ri-user-line text-white/30 text-sm"></i>
            <span className="text-white/50 text-sm">Guest</span>
          </div>
          <div className="w-px h-3.5 bg-white/[0.08]"></div>
          <div className="flex items-center gap-1">
            <span className="text-white/70 text-sm font-medium">{messagesRemaining}</span>
            <span className="text-white/40 text-sm">/ {totalMessages} left</span>
          </div>
        </div>
        <Link 
          href="/register"
          className="text-white/60 hover:text-white/90 text-sm transition-colors"
        >
          Sign up free →
        </Link>
      </div>
    </div>
  );
};

const SidebarSkeleton = () => (
  <div className="animate-pulse flex flex-col h-full">
    <div className="p-4 border-b border-white/[0.06]">
      <div className="h-6 w-24 bg-white/[0.02] rounded mb-4"></div>
      <div className="h-10 w-full bg-white/[0.02] rounded-xl"></div>
    </div>
    <div className="flex-1 p-3 space-y-6 overflow-hidden">
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-3 w-16 bg-white/[0.02] rounded mb-3 mx-2"></div>
          <div className="space-y-2">
            <div className="h-9 w-full bg-white/[0.02] rounded-lg"></div>
            <div className="h-9 w-full bg-white/[0.02] rounded-lg"></div>
            <div className="h-9 w-full bg-white/[0.02] rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="p-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-3 p-2">
        <div className="w-8 h-8 rounded-full bg-white/[0.02]"></div>
        <div className="h-4 w-24 bg-white/[0.02] rounded"></div>
      </div>
    </div>
  </div>
);

const MessagesSkeleton = () => (
  <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-pulse">
    {[1, 2].map((i) => (
      <div key={i} className="space-y-6">
        <div className="flex justify-end">
          <div className="w-1/3 h-12 bg-white/[0.03] rounded-3xl rounded-tr-sm"></div>
        </div>
        <div className="flex justify-start w-full">
          <div className="w-3/4 h-32 bg-white/[0.02] rounded-3xl rounded-tl-sm border border-white/[0.02]"></div>
        </div>
      </div>
    ))}
  </div>
);

const TypewriterMessage = ({ content, onComplete, onUpdate }) => {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!content) {
      setIsTyping(false);
      if (onComplete) onComplete();
      return;
    }

    const minDuration = 250;
    const baseSpeed = 12; // ms per char - slightly faster for smoother feel
    // Allow slightly longer duration for very long texts to maintain smoothness
    const calculatedDuration = Math.min(Math.max(content.length * baseSpeed, minDuration), 4000);
    
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress >= calculatedDuration) {
        setDisplayedContent(content);
        setIsTyping(false);
        if (onComplete) onComplete();
        return;
      }

      const ratio = progress / calculatedDuration;
      const charCount = Math.floor(ratio * content.length);
      
      setDisplayedContent((prev) => {
        if (prev.length !== charCount) {
            return content.slice(0, charCount);
        }
        return prev;
      });
      
      if (onUpdate) onUpdate();
      
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const components = useMemo(() => ({
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <CodeBlock
          language={match[1]}
          filename={`${match[1].charAt(0).toUpperCase() + match[1].slice(1)}`}
          code={String(children).replace(/\n$/, "")}
        />
      ) : (
        <code className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/70 text-sm" {...props}>
          {children}
        </code>
      );
    },
  }), []);

  const plugins = useMemo(() => [remarkGfm], []);

  return (
    <ReactMarkdown
      remarkPlugins={plugins}
      components={components}
      className="prose-modern text-white/40"
    >
      {displayedContent + (isTyping ? "" : "")}
    </ReactMarkdown>
  );
};

const Page = () => {
  const suggestionCards = [
    { icon: "ri-quill-pen-line", color: "blue-400", title: "Creative writing", description: "Draft a story or poem" },
    { icon: "ri-code-s-slash-line", color: "emerald-400", title: "Code assistant", description: "Debug or write code" },
    { icon: "ri-lightbulb-line", color: "amber-400", title: "Explain concepts", description: "Learn something new" },
    { icon: "ri-brain-line", color: "purple-400", title: "Brainstorming", description: "Generate new ideas" },
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isChatsLoading, setIsChatsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef();
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollRef = useRef(true);
  const messagesEndRef = useRef(null);
  const [availableModels, setAvailableModels] = useState({});
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("OpenRouter");
  const startTimeRef = useRef(null);
  const [timeMetaData, setTimeMetaData] = useState({});
  const [messageMetadata, setMessageMetadata] = useState({});
  const latestMetadataRef = useRef(messageMetadata);
  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [animatedTitle, setAnimatedTitle] = useState("");
  const hasAnimatedTitleRef = useRef(false);
  const latestChatIdRef = useRef(null);
  const [userData, setUserData] = useState({});
  const [copyIndex, setCopyIndex] = useState(null);
  const pathname = usePathname();
  const params = useParams();
  const [isToggling, setIsToggling] = useState(false);
  const [isWebActive, setIsWebActive] = useState(false);
  const abortControllerRef = useRef(null);
  const titlePollingRef = useRef(null);

  // Guest mode states
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [guestMessagesRemaining, setGuestMessagesRemaining] = useState(DAILY_MESSAGE_LIMIT);
  const [guestToken, setGuestToken] = useState(null);

  // Subscription states
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumModels, setPremiumModels] = useState({});

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!userId || isGuestMode) return;
      
      try {
        const token = Cookies.get("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subscription/status/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        const data = await response.json();
        if (data.plan) {
          setSubscriptionData(data);
          setIsPremium(data.plan === 'premium');
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchSubscriptionStatus();
  }, [userId, isGuestMode]);

  useEffect(() => {
    const fetchPremiumModels = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/premiummessage/models`);
        const data = await response.json();
        
        if (data.models) {
          const formattedModels = {};
          data.models.forEach(model => {
            formattedModels[model.name] = {
              display: model.name,
              value: model.id,
              premium: true,
              providers: {
                [model.provider]: { display: model.provider, value: model.provider }
              }
            };
          });
          setPremiumModels(formattedModels);
        }
      } catch (error) {
        console.error("Error fetching premium models:", error);
      }
    };

    fetchPremiumModels();
  }, []);

  const handleUpgradeSuccess = (newSubscription) => {
    setSubscriptionData(newSubscription);
    setIsPremium(true);
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetchmodels`);
        const data = await response.json();
        
        if (data.models) {
          const formattedModels = {};
          data.models.forEach(model => {
            formattedModels[model.name] = {
              display: model.name,
              value: model.id,
              providers: {
                OpenRouter: { display: "OpenRouter", value: "OpenRouter" }
              }
            };
          });
          
          setAvailableModels(formattedModels);
          
          // Set model after fetching from API
          if (Object.keys(formattedModels).length > 0) {
            // Check localStorage first
            const savedModel = localStorage.getItem('selectedModel');
            
            if (savedModel && formattedModels[savedModel]) {
              // Use saved model if it exists in the list
              setSelectedModel(savedModel);
            } else {
              // No saved model, find "Google: Gemma 3 27B"
              const gemmaModel = Object.keys(formattedModels).find(key => 
                key.toLowerCase().includes('gemma') && key.includes('27')
              );
              
              if (gemmaModel) {
                setSelectedModel(gemmaModel);
                localStorage.setItem('selectedModel', gemmaModel);
              } else {
                // Fall back to first model
                const firstModel = Object.keys(formattedModels)[0];
                setSelectedModel(firstModel);
                localStorage.setItem('selectedModel', firstModel);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        toast.error("Failed to fetch models");
      }
    };

    fetchModels();
  }, []);

  useEffect(() => {
    const chatIdFromUrl = params?.chatId || pathname.split("/").pop();
    if (chatIdFromUrl && chatIdFromUrl !== "chat") {
      setChatId(chatIdFromUrl);
      fetchSpecificChat(chatIdFromUrl);
    }
  }, []);

  const handleSetWebActive = () => {
    // setIsWebActive(!isWebActive);
    toast.warning("This feature is not available currently.", {position: "top-right"}); 
  }

  useEffect(() => {
    latestChatIdRef.current = chatId;
  }, [chatId]);
  
  const calculateResponseTime = (start, end) => {
    const timeDiff = end - start;
    return (timeDiff / 1000).toFixed(1);
  };
  const getModelDisplay = (modelValue) => {
    for (const [key, model] of Object.entries(availableModels)) {
      if (model.value === modelValue) {
        return model.display;
      }
    }
    return modelValue; // fallback
  };

  const getProviderKey = (providerDisplay) => {
    for (const model of Object.values(availableModels)) {
      for (const [key, provider] of Object.entries(model.providers)) {
        if (provider.display === providerDisplay) {
          return key;
        }
      }
    }
    return providerDisplay; // fallback
  };

  const fetchAndCategorizeChats = async (userId, showLoading = false) => {
    if (showLoading) {
      setIsChatsLoading(true);
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fetchchats/${userId}`
      );
      const data = await response.json();

      if (data.chats) {
        let updatedChats = [...data.chats];

        if (!mounted) {
          const newChatEntry = {
            id: `temp`,
            title: "New chat",
          };

          const recentCategoryIndex = updatedChats.findIndex(
            (category) => category.category === "Recent"
          );

          if (recentCategoryIndex !== -1) {
            updatedChats[recentCategoryIndex].chats.unshift(newChatEntry);
          } else {
            updatedChats.unshift({
              category: "Recent",
              chats: [newChatEntry],
            });
          }
        }

        setChatData(updatedChats);
        // console.log("Fetched and categorized chats:", data);
      } else {
        console.error("No chats data received from the server");
        setChatData([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChatData([]);
    } finally {
      if (showLoading) {
        setIsChatsLoading(false);
      }
    }
  };

  const newChat = async () => {
    // Stop any ongoing generation and abort the request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    
    setChatId(null);
    setMessages([]);
    setMessageMetadata({});
    setTimeMetaData({});
    latestMetadataRef.current = {};
    window.history.pushState({}, "", `/chat`);

    const newChatEntry = {
      id: "temp",
      title: "New chat",
    };

    // Update the chatData state
    setChatData((prevChatData) => {
      let updatedChats = [...prevChatData];
      const recentCategoryIndex = updatedChats.findIndex(
        (category) => category.category === "Recent"
      );

      if (recentCategoryIndex !== -1) {
        const newChatExists = updatedChats[recentCategoryIndex].chats.some(
          (chat) => chat.id === "temp" && chat.title === "New chat"
        );

        if (!newChatExists) {
          updatedChats[recentCategoryIndex].chats.unshift(newChatEntry);
        }
      } else {
        updatedChats.unshift({
          category: "Recent",
          chats: [newChatEntry],
        });
      }

      console.log(updatedChats);
      return updatedChats;
    });

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleStopGeneration = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  const fetchSpecificChat = async (chatId) => {
    if (chatId === latestChatIdRef.current) {
      return; // Don't fetch if it's the same chat
    }

    if (chatId === "temp") {
      newChat();
      if (isMobile) {
        setIsSidebarOpen(false);
      }
      window.history.pushState({}, "", `/chat`);
      return;
    }

    // Stop any ongoing generation and abort the request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    
    // For guest mode with guest chats, just switch to the chat
    if (isGuestMode && chatId.startsWith('guest_')) {
      setChatId(chatId);
      latestChatIdRef.current = chatId;
      setMessages([]); // Guest chats don't persist messages between page loads
      window.history.pushState({}, "", `/chat/${chatId}`);
      return;
    }
    
    setIsMessagesLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fetchchat/${chatId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chat");
      }
      const data = await response.json();

      if (data) {
        setMessages(data.messages || []);
        console.log('Fetched messages:', data.messages);
        setChatId(chatId);
        latestChatIdRef.current = chatId;

        // Update URL without full page reload
        window.history.pushState({}, "", `/chat/${chatId}`);

        if (data.metaData) {
          setMessageMetadata(data.metaData);
          latestMetadataRef.current = data.metaData;
        }
        if (data.timeData) {
          setTimeMetaData(data.timeData);
        }
      } else {
        console.error("No chat data received from the server");
      }
    } catch (error) {
      console.error("Error fetching specific chat:", error);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    latestMetadataRef.current = messageMetadata;
  }, [messageMetadata]);

  // Initialize guest mode from localStorage
  const initializeGuestMode = () => {
    let token = localStorage.getItem(GUEST_TOKEN_KEY);
    if (!token) {
      token = generateGuestToken();
      localStorage.setItem(GUEST_TOKEN_KEY, token);
    }
    setGuestToken(token);
    
    // Check and reset daily message count
    const storedDate = localStorage.getItem(GUEST_MESSAGES_DATE_KEY);
    const today = getTodayDateString();
    
    if (storedDate !== today) {
      // New day, reset message count
      localStorage.setItem(GUEST_MESSAGES_DATE_KEY, today);
      localStorage.setItem(GUEST_MESSAGES_KEY, '0');
      setGuestMessagesRemaining(DAILY_MESSAGE_LIMIT);
    } else {
      const usedMessages = parseInt(localStorage.getItem(GUEST_MESSAGES_KEY) || '0', 10);
      setGuestMessagesRemaining(Math.max(0, DAILY_MESSAGE_LIMIT - usedMessages));
    }
    
    // Initialize empty chat data for guest
    setChatData([]);
    
    setIsGuestMode(true);
    setIsChatsLoading(false);
    setUserId(token);
    setUserData({
      avatar: null,
      email: 'guest@demo',
      username: 'Guest',
    });
  };

  // Update guest message count
  const decrementGuestMessages = () => {
    const usedMessages = parseInt(localStorage.getItem(GUEST_MESSAGES_KEY) || '0', 10);
    const newUsed = usedMessages + 1;
    localStorage.setItem(GUEST_MESSAGES_KEY, newUsed.toString());
    setGuestMessagesRemaining(Math.max(0, DAILY_MESSAGE_LIMIT - newUsed));
  };

  useEffect(() => {
    const verifyTokenAndFetchChats = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            }
          );
          const data = await response.json();
          if (data.valid) {
            setUserId(data.userId);
            setUserData({
              avatar: data.avatar,
              email: data.email,
              username: data.username,
            });
            setIsGuestMode(false);
            await fetchAndCategorizeChats(data.userId, true);
          } else {
            Cookies.remove("token");
            // Instead of redirecting, enable guest mode
            initializeGuestMode();
            setShowWelcomeModal(true);
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          Cookies.remove("token");
          // Instead of redirecting, enable guest mode
          initializeGuestMode();
          setShowWelcomeModal(true);
        }
      } else {
        // No token - enable guest mode
        initializeGuestMode();
        setShowWelcomeModal(true);
      }
    };

    verifyTokenAndFetchChats();
  }, []);

  useEffect(() => {
    if (hasAnimatedTitleRef.current) return;

    if (chatData.length > 0 && chatData[0].chats.length > 0) {
      const firstChatTitle = chatData[0].chats[0].title;
      let index = 0;

      setAnimatedTitle(""); // Reset the animated title
      hasAnimatedTitleRef.current = true;

      const animateTitle = () => {
        if (index < firstChatTitle.length) {
          setAnimatedTitle(firstChatTitle.slice(0, index + 1));
          index++;
          setTimeout(animateTitle, 50);
        }
      };

      animateTitle();

      return () => {
        // No need to clear interval as we're using setTimeout
      };
    }
  }, [chatData]);

  const pollForTitleUpdate = async (chatId) => {
    let attempts = 0;
    const maxAttempts = 20; // Poll for up to 20 seconds
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        clearInterval(titlePollingRef.current);
        return;
      }
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/fetchchat/${chatId}`
        );
        const data = await response.json();
        
        if (data && data.title && data.title !== 'New Chat') {
          // Update the chat data with animated title
          setChatData((prevChatData) => {
            const updatedChats = prevChatData.map((category) => ({
              ...category,
              chats: category.chats.map((chat) =>
                chat.id === chatId ? { ...chat, title: data.title } : chat
              ),
            }));
            return updatedChats;
          });
          
          clearInterval(titlePollingRef.current);
        }
      } catch (error) {
        console.error('Error polling for title:', error);
      }
      
      attempts++;
    };
    
    titlePollingRef.current = setInterval(poll, 1000);
  };

  const startTimer = () => {
    startTimeRef.current = Date.now();
  };

  function isValidImageUrl(url) {
    if (typeof url !== "string") return false;

    if (url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) !== null) return true;

    if (url.includes("image.pollinations.ai/prompt/")) return true;

    return false;
  }

  const stopTimer = () => {
    if (startTimeRef.current) {
      const endTime = Date.now();
      const time = calculateResponseTime(startTimeRef.current, endTime);
      startTimeRef.current = null;

      setTimeMetaData((prevTimeMetaData) => {
        const newMessageIndex = messages.length + 1;
        return {
          ...prevTimeMetaData,
          [newMessageIndex]: time,
        };
      });

      return time;
    }
    return null;
  };

  const scrollToBottom = (behavior = "smooth") => {
    if (autoScrollRef.current && messagesRef.current) {
      if (behavior === "auto") {
        messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      } else if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior });
      }
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const bottomTolerance = 50; // Tolerance in pixels
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= bottomTolerance;
    
    if (autoScrollRef.current !== isAtBottom) {
      setAutoScroll(isAtBottom);
      autoScrollRef.current = isAtBottom;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, generatingMessage]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if modifier keys are pressed (Ctrl, Alt, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      // Ignore if focus is already on an input or textarea
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

      // Check if it's a printable character (length 1)
      if (e.key.length === 1) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatId, isMobile]);

  const handleCopy = async (messageId) => {
    const messageToCopy = messages[messageId];

    if (messageToCopy) {
      try {
        await navigator.clipboard.writeText(messageToCopy.content);
        setCopyIndex(messageId);

        setTimeout(() => {
          setCopyIndex(null);
        }, 2000);
      } catch (err) {
        console.error("Failed to copy message: ", err);
      }
    } else {
      console.error("Message not found");
    }
  };

  const handleSendMessage = async (
    message,
    selectedModel,
    selectedProvider
  ) => {
    // Check guest mode message limit
    if (isGuestMode && guestMessagesRemaining <= 0) {
      toast.error("Daily limit reached. Sign up for free to continue.", { 
        position: "top-right",
        action: {
          label: "Sign up",
          onClick: () => window.location.href = "/register"
        }
      });
      return;
    }

    let modelToUse = selectedModel;
    const allModels = { ...premiumModels, ...availableModels };
    
    if (!modelToUse || !allModels[modelToUse]) {
      modelToUse = 'meta-llama/llama-3.3-70b-instruct:free';
      if (!availableModels[modelToUse]) {
        modelToUse = Object.keys(availableModels)[0];
      }
      if (modelToUse) {
        setSelectedModel(modelToUse);
        localStorage.setItem('selectedModel', modelToUse);
      }
    }
    
    if (!modelToUse || !allModels[modelToUse]) {
      toast.error("No model available. Please try again.", { position: "top-right" });
      return;
    }

    if (premiumModels[modelToUse] && !isPremium) {
      toast.error("Premium subscription required for this model.", { position: "top-right" });
      setShowUpgradeModal(true);
      return;
    }

    const remainingPremiumCredits = subscriptionData?.remainingCredits ?? 
      ((subscriptionData?.premiumCredits || 0) - (subscriptionData?.premiumCreditsUsed || 0));
    
    if (premiumModels[modelToUse] && remainingPremiumCredits <= 0) {
      toast.error("No premium credits remaining. Your credits will reset next month.", { position: "top-right" });
      return;
    }

    if (isGuestMode) {
      decrementGuestMessages();
    }

    setIsGenerating(true);
    startTimer();

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    let currentChatId = latestChatIdRef.current;

    let userMessageIndex = null; // zero-based index for the new user message
    setMessages((prevMessages) => {
      userMessageIndex = prevMessages.length;
      return [
        ...prevMessages,
        { role: "user", content: message },
      ];
    });

    if (!currentChatId) {
      // For guest mode, create a local chat ID
      if (isGuestMode) {
        currentChatId = 'guest_' + Date.now();
        setChatId(currentChatId);
        latestChatIdRef.current = currentChatId;
        
        // Create new chat entry in local state
        const newGuestChat = {
          id: currentChatId,
          title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
          messages: []
        };
        
        setChatData((prevChatData) => {
          let updatedChats = [...prevChatData];
          const recentCategoryIndex = updatedChats.findIndex(
            (category) => category.category === "Recent"
          );
          
          if (recentCategoryIndex !== -1) {
            // Remove temp chat if exists
            updatedChats[recentCategoryIndex].chats = updatedChats[recentCategoryIndex].chats.filter(
              chat => chat.id !== 'temp'
            );
            // Only add if not already in the list
            if (!updatedChats[recentCategoryIndex].chats.find(chat => chat.id === currentChatId)) {
              updatedChats[recentCategoryIndex].chats.unshift(newGuestChat);
            }
          } else {
            updatedChats.push({
              category: "Recent",
              chats: [newGuestChat],
            });
          }
          
          return updatedChats;
        });
      } else {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/chat`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: message,
                user_id: userId,
              }),
            }
          );
          const data = await response.json();
          currentChatId = data.chat_id;
          setChatId(currentChatId);
          latestChatIdRef.current = currentChatId;

          fetchAndCategorizeChats(userId, false);
          
          // Start polling for title update
          pollForTitleUpdate(currentChatId);
        } catch (error) {
          console.error("Error creating new chat:", error);
          setIsGenerating(false);
          toast.error("Failed to create chat. Please try again.", { position: "top-right" });
          return;
        }
      }
    }

    try {
      // Save user message to database (skip for guest mode)
      if (!isGuestMode) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/message/${currentChatId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: {
              index: (userMessageIndex !== null ? userMessageIndex + 1 : messages.length + 1),
              role: "user",
              content: message,
            },
          }),
        });
      }

      const isPremiumModel = premiumModels[modelToUse] !== undefined;
      let response;

      if (isPremiumModel) {
        const token = Cookies.get("token");
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/premiummessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
              message,
              model: premiumModels[modelToUse].value,
              chatId: currentChatId,
              userId: userId,
            }),
            signal: abortControllerRef.current?.signal,
          }
        );
      } else {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/streammessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
              model: availableModels[modelToUse].value,
              provider: selectedProvider === "Auto" 
                ? Object.entries(availableModels[modelToUse].providers)
                    .slice(1)
                    .map(([key, value]) => value.value)
                : [availableModels[modelToUse].providers[selectedProvider].value],
              chatId: currentChatId,
              username: userData.username,
            }),
            signal: abortControllerRef.current?.signal,
          }
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Backend response:', data);

      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.model) {
        console.error('Warning: Backend did not return model information');
      }

      if (isPremiumModel && data.premiumCreditsRemaining !== undefined) {
        setSubscriptionData(prev => ({
          ...prev,
          remainingCredits: data.premiumCreditsRemaining,
          premiumCreditsUsed: (prev?.premiumCredits || 0) - data.premiumCreditsRemaining
        }));
      }

      setIsGenerating(false);
      const time = stopTimer();

      const getModelValue = () => {
        if (isPremiumModel) {
          return data.model || premiumModels[modelToUse]?.value || modelToUse;
        }
        return data.model || availableModels[modelToUse]?.value || modelToUse;
      };

      if (data.type === "image") {
        const modelValue = getModelValue();
        const providerValue = data.provider || selectedProvider;
        
        setMessages((prev) => {
          const newIndex = prev.length;
          
          // Update metadata refs synchronously inside the callback
          const newMetadata = {
            ...latestMetadataRef.current,
            [newIndex]: { model: modelValue, provider: providerValue },
          };
          latestMetadataRef.current = newMetadata;
          
          // Also update time metadata
          if (time) {
            setTimeMetaData((prevTimeMeta) => ({
              ...prevTimeMeta,
              [newIndex]: time
            }));
          }
          
          // Schedule metadata state update
          setTimeout(() => {
            setMessageMetadata(newMetadata);
          }, 0);
          
          return [
            ...prev,
            { 
              role: "assistant", 
              content: data.content, 
              animate: true,
              metadata: { model: modelValue, provider: providerValue }
            },
          ];
        });

        scrollToBottom();

        // Save to database (skip for guest mode)
        if (!isGuestMode) {
          // Calculate index based on current messages + 1 for user message
          const saveIndex = messages.length + 2; // +1 for user msg, +1 for 1-indexed
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/message/${currentChatId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: {
                  index: saveIndex,
                  role: "assistant",
                  content: data.content,
                  model: data.model,
                  provider: data.provider,
                  timeItTook: time,
                },
              }),
            }
          );

          // Refresh chat list
          fetchAndCategorizeChats(userId, false);
        }
        return;
      }

      if (data.type === "text" && data.content) {
        const fullResponse = data.content.trimEnd();
        
        const modelValue = getModelValue();
        const providerValue = data.provider || selectedProvider;

        setMessages((prev) => {
          const newIndex = prev.length;
          
          // Update metadata refs synchronously inside the callback
          const newMetadata = {
            ...latestMetadataRef.current,
            [newIndex]: { model: modelValue, provider: providerValue },
          };
          latestMetadataRef.current = newMetadata;
          
          // Also update time metadata
          if (time) {
            setTimeMetaData((prevTimeMeta) => ({
              ...prevTimeMeta,
              [newIndex]: time
            }));
          }
          
          // Schedule metadata state update
          setTimeout(() => {
            setMessageMetadata(newMetadata);
          }, 0);
          
          return [
            ...prev,
            { 
              role: "assistant", 
              content: fullResponse, 
              animate: true,
              metadata: { model: modelValue, provider: providerValue }
            },
          ];
        });

        scrollToBottom();

        // Save to database (skip for guest mode)
        if (!isGuestMode) {
          const saveIndex = messages.length + 2; // +1 for user msg, +1 for 1-indexed
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/message/${currentChatId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: {
                  index: saveIndex,
                  role: "assistant",
                  content: fullResponse,
                  model: data.model,
                  provider: data.provider,
                  timeItTook: time,
                },
              }),
            }
          );

          // Refresh chat list to get updated title
          fetchAndCategorizeChats(userId, false);
        }
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setIsGenerating(false);
      
      // Don't show error message if request was aborted (user stopped it)
      if (error.name === 'AbortError') {
        return;
      }
      
      // Add error message to show failure state
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: "", error: true, errorMessage: error.message || "Failed to generate response" }
      ]);
    } finally {
      abortControllerRef.current = null;
    }
  };

  useLayoutEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setIsSidebarOpen(!mobile);
    setMounted(true);
    
    return () => {
      if (titlePollingRef.current) {
        clearInterval(titlePollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsToggling(true);
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Model dropdown component - memoized to prevent re-renders
  const ModelDropdown = useMemo(() => memo(({ isOpen, onToggle }) => {
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isClosing, setIsClosing] = useState(false);

    // const allModels = { ...premiumModels, ...availableModels };
    const allModels = { ...availableModels };
    
    const filteredModels = Object.entries(allModels).filter(([key]) =>
      key.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort(([a], [b]) => {
      const aIsRouter = a.toLowerCase().includes('free models router');
      const bIsRouter = b.toLowerCase().includes('free models router');
      if (aIsRouter && !bIsRouter) return 1;
      if (!aIsRouter && bIsRouter) return -1;
      return 0;
    });

    const handleClose = () => {
      setIsClosing(true);
      setTimeout(() => {
        onToggle(false);
        setSearchQuery("");
        setIsClosing(false);
      }, 50);
    };

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          handleClose();
        }
      };
      if (isOpen) document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleModelSelect = (key) => {
      const modelData = allModels[key];
      if (modelData?.premium && !isPremium) {
        setShowUpgradeModal(true);
        handleClose();
        return;
      }
      setSelectedModel(key);
      localStorage.setItem('selectedModel', key);
      handleClose();
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); isOpen ? handleClose() : onToggle(!isOpen); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] transition-all text-xs group"
        >
          <i className="ri-cpu-line text-amber-400/50 group-hover:text-amber-400/60 transition-colors"></i>
          <span className="text-white/60 group-hover:text-white/80 max-w-[150px] truncate transition-colors">{selectedModel || "Select Model"}</span>
          <i className={`ri-arrow-down-s-line text-white/40 group-hover:text-white/60 transition-all ${isOpen ? "rotate-180" : "rotate-0"}`}></i>
        </button>
        {isOpen && (
          <div className={`absolute left-0 bottom-full mb-2 w-80 bg-[#141414] rounded-xl border border-white/[0.1] shadow-2xl z-[100] overflow-hidden transition-all duration-200 ${
            isClosing ? "animate-out fade-out slide-out-to-bottom-2" : "animate-in fade-in slide-in-from-bottom-2"
          }`}>
            <div className="p-3 border-b border-white/[0.06]">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search models..."
                  className="w-full bg-white/[0.04] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white/80 placeholder-white/30 focus:outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>
            <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20">Free Models</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/60 font-medium border border-amber-500/10">✦ Paid models coming soon</span>
            </div>
            <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
              {filteredModels.length > 0 ? (
                <div className="p-2 space-y-[1px">
                  {filteredModels.map(([key, modelData]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleModelSelect(key)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ease-out flex items-center justify-between gap-2 ${
                        selectedModel === key 
                          ? "text-amber-400/60 bg-amber-500/5 font-medium" 
                          : "text-white/60 hover:text-white/90 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="truncate">{key}</span>
                      {modelData?.premium && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${isPremium ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {isPremium ? 'PRO' : '🔒'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <i className="ri-search-line text-white/20 text-2xl mb-2"></i>
                  <p className="text-white/30 text-sm">No models found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }), [availableModels, premiumModels, selectedModel, isPremium, subscriptionData]);

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const thinkingDotsRef = useRef("");
  const [thinkingDotsDisplay, setThinkingDotsDisplay] = useState("");

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        thinkingDotsRef.current = thinkingDotsRef.current === "" ? "." 
          : thinkingDotsRef.current === "." ? ".." 
          : thinkingDotsRef.current === ".." ? "..." 
          : "";
        setThinkingDotsDisplay(thinkingDotsRef.current);
      }, 280);
      return () => clearInterval(interval);
    } else {
      thinkingDotsRef.current = "";
      setThinkingDotsDisplay("");
    }
  }, [isGenerating]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      const lineHeight = 24; // approximate line height
      const minHeight = lineHeight * 2; // 2 lines
      const maxHeight = lineHeight * 4; // 4 lines
      
      if (scrollHeight <= maxHeight) {
        inputRef.current.style.height = Math.max(scrollHeight, minHeight) + 'px';
      } else {
        inputRef.current.style.height = maxHeight + 'px';
      }
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isGenerating) {
      handleSendMessage(inputValue, selectedModel, selectedProvider);
      setInputValue("");
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = '48px'; // 2 lines default
      }
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#0f0f0f] relative overflow-hidden">
      {/* Demo Welcome Modal */}
      <DemoWelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
      
      <aside className="hidden md:flex h-full w-[280px] flex-shrink-0 flex-col bg-[#171717] border-r border-white/[0.06]">
        {isChatsLoading ? (
          <SidebarSkeleton />
        ) : (
          <>
            <div className="p-4 border-b border-white/[0.06]">
              <a href="/" className="text-yellow-500/60 text-lg font-bold tracking-tight mb-4 font-mono">UnchainedGPT</a>
              <button
                onClick={newChat}
                className="w-full flex items-center gap-2.5 opacity-75 px-0 py-2 mt-6 rounded-lg text-white/60 hover:text-white/90 hover:opacity-90 transition-all text-sm"
              >
                <i className="ri-quill-pen-ai-line text-lg"></i>
                <span>New Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
              {chatData.map(({ category, chats }, categoryIndex) => (
                <div key={category} className="mb-4">
                  <p className="text-white/30 text-[11px] uppercase tracking-widest px-2 mb-2 font-medium">{category}</p>
                  {chats.map((chat, chatIndex) => (
                    <button
                      key={chat.id}
                      onClick={() => fetchSpecificChat(chat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-all ease-out
                        ${chatId === chat.id ? "bg-white/[0.08] text-white/90" : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"}
                      `}
                    >
                      {categoryIndex === 0 && chatIndex === 0 ? animatedTitle : chat.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/[0.06]">
              {isGuestMode ? (
                <Link href="/register" className="flex items-center mb-2 justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <i className="ri-user-add-line text-white/40 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Sign up free</p>
                      <p className="text-white/40 text-xs">Unlimited messages</p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/30"></i>
                </Link>
              ) : (
                <>
                  {/* Upgrade Button - Desktop - commented out
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full flex items-center justify-between p-2.5 mb-2 rounded-lg transition-all cursor-pointer border bg-gradient-to-r from-orange-500/5 to-amber-500/5 border-orange-500/10 hover:border-orange-500/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-500/10">
                        <i className={`ri-vip-crown-2-${isPremium ? "fill" : "line"} text-orange-300 text-sm`}></i>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-orange-300">
                          {isPremium ? "Premium" : "Upgrade"}
                        </p>
                        <p className="text-white/40 text-xs">
                          {isPremium 
                            ? `${subscriptionData?.remainingCredits || 0} credits left` 
                            : "Unlock top models"}
                        </p>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-orange-300/50"></i>
                  </button>
                  */}
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full ring-2 ring-white/[0.08] bg-white/[0.05] flex items-center justify-center">
                        <i className="ri-user-3-line text-white/40 text-sm"></i>
                      </div>
                      {userData.avatar && (
                        <img
                          src={userData.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full ring-2 ring-white/[0.1] absolute inset-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm font-medium truncate">{userData.username}</p>
                      <p className="text-white/40 text-xs truncate">{userData.email}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </aside>

      <aside className={`
        md:hidden fixed left-0 top-0 h-full w-[280px] flex-shrink-0 flex flex-col
        bg-[#171717] border-r border-white/[0.06] z-50
        transition-transform duration-300 ease-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {isChatsLoading ? (
          <SidebarSkeleton />
        ) : (
          <>
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-yellow-500/60 text-lg font-bold tracking-tight font-mono">UnchainedGPT</h1>
                <button onClick={toggleSidebar} className="text-white/40 hover:text-white/70 transition-colors">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
              <button
                onClick={newChat}
                className="w-full flex items-center gap-2.5 opacity-75 px-0 py-2 rounded-lg text-white/60 hover:text-white/90 hover:opacity-90 transition-all text-sm"
              >
                <i className="ri-quill-pen-ai-line text-lg"></i>
                <span>New Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
              {chatData.map(({ category, chats }, categoryIndex) => (
                <div key={category} className="mb-4">
                  <p className="text-white/30 text-[11px] uppercase tracking-widest px-2 mb-2 font-medium">{category}</p>
                  {chats.map((chat, chatIndex) => (
                    <button
                      key={chat.id}
                      onClick={() => { fetchSpecificChat(chat.id); toggleSidebar(); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-all
                        ${chatId === chat.id ? "bg-white/[0.08] text-white/90" : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"}
                      `}
                    >
                      {categoryIndex === 0 && chatIndex === 0 ? animatedTitle : chat.title}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/[0.06]">
              {isGuestMode ? (
                <Link href="/register" className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer border border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                      <i className="ri-user-add-line text-white/40 text-sm"></i>
                    </div>
                    <div>
                      <p className="text-white/80 text-sm font-medium">Sign up free</p>
                      <p className="text-white/40 text-xs">Unlimited messages</p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/30"></i>
                </Link>
              ) : (
                <>
                  {/* Upgrade Button - Mobile - commented out
                  <button
                    onClick={() => { setShowUpgradeModal(true); toggleSidebar(); }}
                    className="w-full flex items-center justify-between p-2.5 mb-2 rounded-lg transition-all cursor-pointer border bg-gradient-to-r from-orange-500/5 to-amber-500/5 border-orange-500/10 hover:border-orange-500/20"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-orange-500/10">
                        <i className={`ri-vip-crown-2-${isPremium ? "fill" : "line"} text-orange-300 text-sm`}></i>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-orange-300">
                          {isPremium ? "Premium" : "Upgrade"}
                        </p>
                        <p className="text-white/40 text-xs">
                          {isPremium 
                            ? `${subscriptionData?.remainingCredits || 0} credits left` 
                            : "Unlock top models"}
                        </p>
                      </div>
                    </div>
                    <i className="ri-arrow-right-s-line text-orange-300/50"></i>
                  </button>
                  */}
                  
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className="relative w-8 h-8 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full ring-2 ring-white/[0.08] bg-white/[0.05] flex items-center justify-center">
                        <i className="ri-user-3-line text-white/40 text-sm"></i>
                      </div>
                      {userData.avatar && (
                        <img
                          src={userData.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full ring-2 ring-white/[0.1] absolute inset-0"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 text-sm font-medium truncate">{userData.username}</p>
                      <p className="text-white/40 text-xs truncate">{userData.email}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </aside>

      <main className="flex-1 flex flex-col h-full relative">
        {/* Guest Mode Banner */}
        {isGuestMode && (
          <GuestModeBanner 
            messagesRemaining={guestMessagesRemaining} 
            totalMessages={DAILY_MESSAGE_LIMIT} 
          />
        )}
        
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/[0.06] bg-[#171717]">
          <button onClick={toggleSidebar} className="text-white/60 hover:text-white/80">
            <i className="ri-menu-line text-xl"></i>
          </button>
          <span className="text-yellow-500/60 text-lg font-bold tracking-tight font-mono">UnchainedGPT</span>
          <button onClick={newChat} className="text-white/60 hover:text-white/80">
            <i className="ri-quill-pen-ai-line opacity-80 text-xl"></i>
          </button>
        </header>

        <div
          ref={messagesRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {isMessagesLoading ? (
            <MessagesSkeleton />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
              {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-2xl font-medium text-white/90 mb-3">
                  How can I help you today?
                </h2>
                
                {isGuestMode && (
                  <p className="text-white/40 text-sm mb-8">
                    {guestMessagesRemaining} messages remaining · <Link href="/register" className="text-white/70 hover:text-white/90 transition-colors">Sign up free</Link>
                  </p>
                )}
                {!isGuestMode && <div className="mb-5"></div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                  {suggestionCards.map((card, index) => (
                    <button 
                      key={index} 
                      onClick={() => {
                        setInputValue(card.description);
                        inputRef.current?.focus();
                      }}
                      className="text-left p-4 rounded-xl border border-white/[0.06] bg-white/[0.005] hover:bg-white/[0.03] transition-colors ease-out group flex items-center gap-3"
                    >
                      <i className={`${card.icon} text-xl flex-shrink-0 ${
                        card.color === 'blue-400' ? 'text-blue-400' :
                        card.color === 'emerald-400' ? 'text-emerald-400' :
                        card.color === 'amber-400' ? 'text-amber-400' :
                        card.color === 'purple-400' ? 'text-purple-400' : ''
                      }`}></i>
                      <div className="flex-1">
                        <div className="text-white/80 text-sm font-medium mb-1">{card.title}</div>
                        <div className="text-white/40 text-xs">{card.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "user" ? (
                    <div className="max-w-[85%]">
                      <div className="px-5 py-3 rounded-3xl bg-white/[0.08]">
                        <p className="text-white/90 leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className={message.error ? "" : "max-w-full w-full"}>
                      {message.error ? (
                        <div className="px-5 py-3 rounded-3xl bg-[#1a1a1a]">
                          <div className="flex items-center gap-2">
                            <i className="ri-error-warning-line text-red-400/60 text-sm"></i>
                            <span className="text-white/40 text-sm">Failed to generate, try another model</span>
                          </div>
                        </div>
                      ) : (
                      <div className="px-5 pt-2.5 pb-4 rounded-3xl bg-[#1a1a1a]">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.04]">
                          <div className="flex items-center gap-2">
                            <i className="ri-cpu-line text-amber-400/50 text-sm"></i>
                            <span className="text-white/35 text-xs">
                              {message.metadata?.model 
                                ? getModelDisplay(message.metadata.model)
                                : messageMetadata[index]?.model 
                                  ? getModelDisplay(messageMetadata[index].model) 
                                  : latestMetadataRef.current[index]?.model 
                                    ? getModelDisplay(latestMetadataRef.current[index].model)
                                    : "AI"}
                            </span>
                          </div>
                          {(timeMetaData[index] || message.timeItTook) && (
                            <span className="text-white/30 text-xs">{timeMetaData[index] || message.timeItTook}s</span>
                          )}
                        </div>
                        <div className="text-white/55 opacity-90 leading-relaxed">
                          {message.content?.trim().length === 0 ? (
                            <span className="text-red-400/80 text-sm">Error: No response received.</span>
                          ) : isValidImageUrl(message.content) ? (
                            <img src={message.content} alt="" className="max-w-md rounded-xl" />
                          ) : message.animate ? (
                            <TypewriterMessage 
                              content={message.content}
                              onComplete={() => {
                                setMessages(prev => prev.map((m, i) => i === index ? { ...m, animate: false } : m));
                              }}
                              onUpdate={() => scrollToBottom("auto")}
                            />
                          ) : (
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || "");
                                  return !inline && match ? (
                                    <CodeBlock
                                      language={match[1]}
                                      filename={`${match[1].charAt(0).toUpperCase() + match[1].slice(1)}`}
                                      code={String(children).replace(/\n$/, "")}
                                    />
                                  ) : (
                                    <code className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-white/70 text-sm" {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                              className="prose-modern text-white/40"
                            >
                              {message.content}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                      )}
                      {!message.error && (
                      <div className="flex items-center gap-3 mt-2 px-2">
                        <button
                          onClick={() => handleCopy(index)}
                          className="flex items-center gap-1.5 text-white/20 opacity-60 hover:text-white/40 transition-colors text-xs"
                        >
                          <i className={`${copyIndex === index ? "ri-check-line text-emerald-400" : "ri-file-copy-line"}`}></i>
                          <span>{copyIndex === index ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="px-5 py-3 rounded-3xl bg-[#1a1a1a]">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-amber-400/60 rounded-full animate-spin"></div>
                      <span className="text-white/50 text-sm">Thinking{thinkingDotsDisplay}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
          )}
        </div>

        <div className=" bg-[#0f0f0f00]">
          <div className="max-w-3xl mx-auto px-4 pb-3">
            <form onSubmit={handleInputSubmit}>
              <div className={`bg-white/[0.02] backdrop-blur-sm rounded-2xl border shadow-lg ${isGuestMode && guestMessagesRemaining <= 0 ? 'border-red-500/20' : 'border-white/[0.12]'}`}>
                <div className="flex items-end gap-2 px-5 py-4">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleInputSubmit(e); } }}
                    placeholder={isGuestMode && guestMessagesRemaining <= 0 ? "Daily limit reached. Sign up for free..." : "Message UnchainedGPT..."}
                    disabled={isGuestMode && guestMessagesRemaining <= 0}
                    className="flex-1 bg-transparent text-white/90 placeholder-white/30 resize-none focus:outline-none overflow-y-auto scrollbar-thin disabled:cursor-not-allowed"
                    style={{ height: '48px', lineHeight: '24px' }}
                  />
                  {isGenerating ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="h-9 w-9 rounded-full bg-white/[0.12] hover:bg-white/[0.18] flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <i className="ri-stop-fill text-white/70 text-base"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || (isGuestMode && guestMessagesRemaining <= 0)}
                      className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500/80 to-amber-600/80 hover:from-amber-400/80 hover:to-amber-500/80 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <i className="ri-arrow-up-line text-black text-lg font-bold"></i>
                    </button>
                  )}
                </div>
                <div className="px-4 pb-3 border-t border-white/[0.06] pt-3 flex items-center justify-between">
                  <ModelDropdown isOpen={modelDropdownOpen} onToggle={setModelDropdownOpen} />
                  {isGuestMode ? (
                    <div className="flex items-center gap-2 text-xs">
                      {guestMessagesRemaining <= 0 ? (
                        <Link href="/register" className="text-white/60 hover:text-white/90 font-medium transition-colors">
                          Sign up free →
                        </Link>
                      ) : (
                        <span className="text-white/40">{guestMessagesRemaining} left today</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-white/30">Unlimited Messages</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center mt-1.5">
                <p className="text-[11px] text-white/30">AI can make mistakes. Check important info.</p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={toggleSidebar} />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        userId={userId}
        onUpgradeSuccess={handleUpgradeSuccess}
      />

      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: "#171717", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: "14px" },
        }}
      />
    </div>
  );
};

export default Page;
