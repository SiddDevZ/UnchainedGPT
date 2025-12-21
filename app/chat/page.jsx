"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import "remixicon/fonts/remixicon.css";
import "./page.css";
import { CodeBlock } from "../../components/ui/code-block";
import Cookies from "js-cookie";
import { useParams, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Toaster, toast } from "sonner";

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

const Page = () => {
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
  const latestChatIdRef = useRef(null);
  const [userData, setUserData] = useState({});
  const [copyIndex, setCopyIndex] = useState(null);
  const pathname = usePathname();
  const params = useParams();
  const [isToggling, setIsToggling] = useState(false);
  const [isWebActive, setIsWebActive] = useState(false);
  const abortControllerRef = useRef(null);
  const titlePollingRef = useRef(null);

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
              // Use saved model if it exists in the list - don't save again
              setSelectedModel(savedModel);
            } else {
              // No saved model, try to use meta-llama as default
              if (formattedModels['meta-llama/llama-3.3-70b-instruct:free']) {
                setSelectedModel('meta-llama/llama-3.3-70b-instruct:free');
                localStorage.setItem('selectedModel', 'meta-llama/llama-3.3-70b-instruct:free');
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
        console.log(data.messages);
        setChatId(chatId);
        latestChatIdRef.current = chatId;

        // Update URL without full page reload
        window.history.pushState({}, "", `/chat/${chatId}`);

        if (data.metaData) {
          setMessageMetadata(data.metaData);
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

            await fetchAndCategorizeChats(data.userId, true);
          } else {
            Cookies.remove("token");
            window.location.href = "/login";
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          Cookies.remove("token");
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    };

    verifyTokenAndFetchChats();
  }, []);

  useEffect(() => {
    if (chatData.length > 0 && chatData[0].chats.length > 0) {
      const firstChatTitle = chatData[0].chats[0].title;
      let index = 0;

      setAnimatedTitle(""); // Reset the animated title

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

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop === clientHeight;
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, generatingMessage]);

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
    // Ensure we have a valid model - use llama as fallback
    let modelToUse = selectedModel;
    if (!modelToUse || !availableModels[modelToUse]) {
      modelToUse = 'meta-llama/llama-3.3-70b-instruct:free';
      if (!availableModels[modelToUse]) {
        // Fall back to first available model
        modelToUse = Object.keys(availableModels)[0];
      }
      if (modelToUse) {
        setSelectedModel(modelToUse);
        localStorage.setItem('selectedModel', modelToUse);
      }
    }
    
    if (!modelToUse || !availableModels[modelToUse]) {
      toast.error("No model available. Please try again.", { position: "top-right" });
      return;
    }

    setIsGenerating(true);
    startTimer();

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    let currentChatId = latestChatIdRef.current;

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
    ]);

    if (!currentChatId) {
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

    try {
      // Save user message to database
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/message/${currentChatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            index: messages.length + 1,
            role: "user",
            content: message,
          },
        }),
      });

      // Send message to API and wait for complete response
      const response = await fetch(
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setIsGenerating(false);
      const time = stopTimer();

      // Handle image response
      if (data.type === "image") {
        const newMessages = [
          ...messages,
          { role: "user", content: message },
          { role: "assistant", content: data.content },
        ];
        
        // The assistant message will be at index newMessages.length - 1
        const assistantIndex = newMessages.length - 1;
        
        setMessages(newMessages);
        
        // Update metadata for the assistant message using the actual array index
        setMessageMetadata((prevMetadata) => {
          const newMetadata = {
            ...prevMetadata,
            [assistantIndex]: { 
              model: data.model || selectedModel, 
              provider: data.provider || selectedProvider 
            },
          };
          latestMetadataRef.current = newMetadata;
          return newMetadata;
        });
        
        scrollToBottom();

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/message/${currentChatId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                index: newMessages.length,
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
        return;
      }

      // Handle text response
      if (data.type === "text" && data.content) {
        const fullResponse = data.content.trimEnd();
        const newMessages = [
          ...messages,
          { role: "user", content: message },
          { role: "assistant", content: fullResponse },
        ];
        
        // The assistant message will be at index newMessages.length - 1
        const assistantIndex = newMessages.length - 1;
        
        setMessages(newMessages);
        
        // Update metadata for the assistant message using the actual array index
        setMessageMetadata((prevMetadata) => {
          const newMetadata = {
            ...prevMetadata,
            [assistantIndex]: { 
              model: data.model || selectedModel, 
              provider: data.provider || selectedProvider 
            },
          };
          latestMetadataRef.current = newMetadata;
          return newMetadata;
        });
        
        scrollToBottom();

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/message/${currentChatId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: {
                index: newMessages.length,
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

  // Model dropdown component
  const ModelDropdown = ({ isOpen, onToggle }) => {
    const dropdownRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isClosing, setIsClosing] = useState(false);

    const filteredModels = Object.entries(availableModels).filter(([key]) =>
      key.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
          <div className={`absolute left-0 bottom-full mb-2 w-80 bg-[#1a1a1a] rounded-xl border border-white/[0.1] shadow-2xl z-[100] overflow-hidden transition-all duration-200 ${
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
                  className="w-full bg-white/[0.05] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white/80 placeholder-white/30 focus:outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
              {filteredModels.length > 0 ? (
                <div className="p-2 space-y-[1px">
                  {filteredModels.map(([key]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleModelSelect(key)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ease-out truncate ${
                        selectedModel === key 
                          ? "text-amber-400/60 bg-amber-500/5 font-medium" 
                          : "text-white/60 hover:text-white/90 hover:bg-white/[0.05]"
                      }`}
                    >
                      {key}
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
  };

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
      {/* Desktop Sidebar - Static, takes up space */}
      <aside className="hidden md:flex h-full w-[280px] flex-shrink-0 flex-col bg-[#171717] border-r border-white/[0.06]">
        {isChatsLoading ? (
          <SidebarSkeleton />
        ) : (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/[0.06]">
              <h1 className="text-yellow-500/60 text-lg font-bold tracking-tight mb-4 font-mono">UnchainedGPT</h1>
              <button
                onClick={newChat}
                className="w-full flex items-center gap-2.5 opacity-75 px-0 py-2 rounded-lg text-white/60 hover:text-white/90 hover:opacity-90 transition-all text-sm"
              >
                <i className="ri-quill-pen-ai-line text-lg"></i>
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
              {chatData.map(({ category, chats }, categoryIndex) => (
                <div key={category} className="mb-4">
                  <p className="text-white/30 text-[11px] uppercase tracking-widest px-2 mb-2 font-medium">{category}</p>
                  {chats.map((chat, chatIndex) => (
                    <button
                      key={chat.id}
                      onClick={() => fetchSpecificChat(chat.id)}
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

            {/* User Profile */}
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                <img src={userData.avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-white/[0.1]" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-medium truncate">{userData.username}</p>
                  <p className="text-white/40 text-xs truncate">{userData.email}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Mobile Sidebar - Floating overlay */}
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
            {/* Sidebar Header */}
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

            {/* Chat History */}
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

            {/* User Profile */}
            <div className="p-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
                <img src={userData.avatar} alt="" className="w-8 h-8 rounded-full ring-2 ring-white/[0.1]" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-medium truncate">{userData.username}</p>
                  <p className="text-white/40 text-xs truncate">{userData.email}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      <main className="flex-1 flex flex-col h-full relative">
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
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          {isMessagesLoading ? (
            <MessagesSkeleton />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
              {/* Welcome Message */}
              {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h2 className="text-[1.7rem] font-medium text-white/90 mb-8">
                  Hey, How can I help?
                </h2>
                {/* <p className="text-white/40 mb-10">How can I help you today?</p> */}
                
                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl px-4">
                  <button className="group px-5 cursor-default select-text py-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* <span className="text-xl">💡</span> */}
                      <span className="text-blue-400/70 text-xs font-semibold font-inter tracking-wider">Creative</span>
                    </div>
                    <div className="text-white/60 text-sm leading-relaxed">
                      Generate creative content, stories, and ideas
                    </div>
                  </button>
                  
                  <button className="group px-5 cursor-default select-text py-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* <span className="text-xl">🧠</span> */}
                      <span className="text-purple-400/70 text-xs font-semibold font-inter tracking-wider">Learn</span>
                    </div>
                    <div className="text-white/60 text-sm leading-relaxed">
                      Explain concepts, answer questions, and teach
                    </div>
                  </button>
                  
                  <button className="group px-5 cursor-default select-text py-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                      {/* <span className="text-xl">⚡</span> */}
                      <span className="text-emerald-400/70 text-xs font-semibold font-inter tracking-wider">Code</span>
                    </div>
                    <div className="text-white/60 text-sm leading-relaxed">
                      Write, debug, and explain code efficiently
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
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
                            <span className="text-white/40 text-sm">Failed to generate</span>
                          </div>
                        </div>
                      ) : (
                      <div className="px-5 pt-2.5 pb-4 rounded-3xl bg-[#1a1a1a]">
                        {/* Message Header */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.04]">
                          <div className="flex items-center gap-2">
                            <i className="ri-cpu-line text-amber-400/50 text-sm"></i>
                            <span className="text-white/35 text-xs">
                              {messageMetadata[index]?.model ? getModelDisplay(messageMetadata[index].model) : "AI"}
                            </span>
                          </div>
                          {timeMetaData[index] && (
                            <span className="text-white/30 text-xs">{timeMetaData[index]}s</span>
                          )}
                        </div>
                        {/* Message Content */}
                        <div className="text-white/55 opacity-90 leading-relaxed">
                          {message.content?.trim().length === 0 ? (
                            <span className="text-red-400/80 text-sm">Error: No response received.</span>
                          ) : isValidImageUrl(message.content) ? (
                            <img src={message.content} alt="" className="max-w-md rounded-xl" />
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
                      {/* Message Actions - Outside card */}
                      {!message.error && (
                      <div className="flex items-center gap-3 mt-2 px-2">
                        <button
                          onClick={() => handleCopy(index)}
                          className="flex items-center gap-1.5 text-white/20 opacity-80 hover:text-white/40 transition-colors text-xs"
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

              {/* Generating State */}
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

        {/* Input Area */}
        <div className=" bg-[#0f0f0f00]">
          <div className="max-w-3xl mx-auto px-4 pb-4">
            <form onSubmit={handleInputSubmit}>
              <div className="bg-[#1a1a1a] rounded-2xl border border-white/[0.08]">
                <div className="flex items-end gap-2 px-5 py-4">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleInputSubmit(e); } }}
                    placeholder="Message UnchainedGPT..."
                    className="flex-1 bg-transparent text-white/90 placeholder-white/30 resize-none focus:outline-none overflow-y-auto scrollbar-thin"
                    style={{ height: '48px', lineHeight: '24px' }}
                  />
                  {isGenerating ? (
                    <button
                      type="button"
                      onClick={handleStopGeneration}
                      className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <i className="ri-stop-fill text-white/70 text-base"></i>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500/80 to-amber-600/80 hover:from-amber-400/80 hover:to-amber-500/80 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <i className="ri-arrow-up-line text-black text-lg font-bold"></i>
                    </button>
                  )}
                </div>
                <div className="px-4 pb-3 border-t border-white/[0.04] pt-3">
                  <ModelDropdown isOpen={modelDropdownOpen} onToggle={setModelDropdownOpen} />
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={toggleSidebar} />
      )}

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
