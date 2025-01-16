"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import "remixicon/fonts/remixicon.css";
import "./page.css";
import Input from "../../components/Input/Input";
import { CodeBlock } from "../../components/ui/code-block"
import io from "socket.io-client";
import Cookies from "js-cookie";
import models from "./models";
import { useRouter } from "next/navigation";
import { useParams, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Toaster, toast } from "sonner";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [generatingMessage, setGeneratingMessage] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesRef = useRef();
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(Object.keys(models)[1]);
  const [selectedProvider, setSelectedProvider] = useState(
    Object.keys(models[Object.keys(models)[0]].providers)[0]
  );
  const [responseTime, setResponseTime] = useState(null);
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
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isToggling, setIsToggling] = useState(false);
  const [isWebActive, setIsWebActive] = useState(false);

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
    return (timeDiff / 1000).toFixed(1); // Convert to seconds and round to 1 decimal place
  };

  const fetchAndCategorizeChats = async (userId) => {
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
    }
  };

  const newChat = async () => {
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
      toggleSidebar();
    }
  };

  const handleStopGeneration = async () => {
    setIsGenerating(false);
  };

  const fetchSpecificChat = async (chatId) => {
    if (chatId === latestChatIdRef.current) {
      return; // Don't fetch if it's the same chat
    }

    if (chatId === "temp") {
      newChat();
      if (isMobile) {
        toggleSidebar();
      }
      window.history.pushState({}, "", `/chat`);
      return;
    }

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

            await fetchAndCategorizeChats(data.userId);
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

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window !== "undefined") {
      const newSocket = io("https://siddz-ai.onrender.com", {
        // const newSocket = io("http://localhost:3001", {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to Socket.IO server on port 3001");
        setSocket(newSocket);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
      });

      return () => {
        if (newSocket) newSocket.close();
      };
    }
  }, []);

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
    setIsGenerating(true);
    startTimer();

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

        fetchAndCategorizeChats(userId);
      } catch (error) {
        console.error("Error creating new chat:", error);
        setIsGenerating(false);
        return;
      }
    }

    let providers;
    if (selectedProvider === "Auto") {
      // Get all providers except "Auto" for the selected model
      providers = Object.entries(models[selectedModel].providers)
        .slice(1) // Skip the first entry (Auto)
        .map(([key, value]) => value.value);
    } else {
      providers = [models[selectedModel].providers[selectedProvider].value];
    }

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

    let generatedContent = "";
    console.log(message, models[selectedModel].value, providers);
    socket.emit("message", {
      message,
      model: models[selectedModel].value,
      provider: providers,
      chatId: latestChatIdRef.current || "none",
    });

    socket.on("requestHistory", (chatIde) => {
      const filteredMessages = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      socket.emit("provideHistory", { history: filteredMessages });
    });

    socket.on("requestChatId", () => {
      console.log("chatid: ", latestChatIdRef.current);
      socket.emit("provideChatId", { chatId: latestChatIdRef.current });
    });

    socket.on("chunk", (chunk) => {
      generatedContent += chunk;
      setGeneratingMessage({ role: "assistant", content: generatedContent });
      scrollToBottom();
    });

    socket.on("chatTitleUpdated", () => {
      fetchAndCategorizeChats(userId);
    });

    socket.on("prov", (provider) => {
      const newMessageIndex = messages.length + 1;
      setMessageMetadata((prevMetadata) => {
        const newMetadata = {
          ...prevMetadata,
          [newMessageIndex]: { model: selectedModel, provider },
        };
        latestMetadataRef.current = newMetadata;
        return newMetadata;
      });
    });

    socket.on("done", async (fullResponse) => {
      setIsGenerating(false);
      // console.log("Generated content:", fullResponse);
      if (fullResponse == null) {
        fullResponse = "";
      }

      if (fullResponse) {
        fullResponse = fullResponse.trimEnd();
      }

      const newMessages = [
        ...messages,
        { role: "user", content: message },
        { role: "assistant", content: fullResponse },
      ];
      setMessages(newMessages);
      setGeneratingMessage({});

      scrollToBottom();

      try {
        let currentChatId = latestChatIdRef.current;
        let content = newMessages[newMessages.length - 1].content;
        if (content == undefined || content.trim() === "") {
          content = "";
        }

        const time = stopTimer();

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
                role: newMessages[newMessages.length - 1].role,
                content: newMessages[newMessages.length - 1].content,
                model: latestMetadataRef.current[newMessages.length - 1]?.model,
                provider:
                  latestMetadataRef.current[newMessages.length - 1]?.provider,
                timeItTook: time,
              },
            }),
          }
        );
      } catch (error) {
        console.error("Error storing chat or messages:", error);
      }

      socket.off("chunk");
      socket.off("done");
      socket.off("prov");
      socket.off("requestHistory");
      socket.off("requestChatId");
      socket.off("chatTitleUpdated");
    });
  };

  useLayoutEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkScreenSize();
    setMounted(true);
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

  return (
    <div className="flex w-full h-screen bg-[#121212] relative">
      <div
        className={`
          h-full bg-[#212121] w-[17.5rem] flex-shrink-0 flex flex-col
          ${isToggling ? "transition-all duration-300 ease-in-out" : ""}
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isMobile ? "fixed left-0 top-0 z-40" : ""}
        `}
      >
        <div className="px-2 py-3">
          <div className="flex items-center justify-between sm:mb-6 mb-2">
            <button
              className="md:hidden text-white p-2"
              onClick={toggleSidebar}
            >
              <i
                className={`ri-${
                  isSidebarOpen ? "close" : "menu"
                }-line text-2xl`}
              ></i>
            </button>
            <h1
              className={`font-semibold hidden md:block text-[#c69326] px-2.5 font-mono text-xl`}
            >
              Zenos AI
            </h1>
          </div>
          <button
            onClick={() => newChat()}
            className="font-medium flex items-center space-x-2 w-full hover:bg-[#383838] px-2.5 py-1 rounded-lg transition-all"
          >
            <i className="ri-chat-new-line text-[#e2e2e2] text-xl"></i>
            <span className="text-[#e2e2e2] font-medium">New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden border-t border-[#414141]">
          <div className="h-full overflow-y-auto px-2 py-3">
            {chatData.map(({ category, chats }, categoryIndex) => (
              <div key={category} className="mb-4">
                <h6 className="text-[#8e8e8e] text-xs font-medium mb-2 px-2.5 tracking-wider">
                  {category}
                </h6>
                {chats.map((chat, chatIndex) => (
                  <button
                    key={chat.id}
                    // href={`/chat/${chat.id}`}
                    onClick={() => fetchSpecificChat(chat.id)}
                    className="w-full mb-0.5 text-left px-2.5 py-1.5 rounded-lg 
                         hover:bg-gradient-to-r hover:from-[#383838] hover:to-[#2a2a2a] 
                         transition-all duration-300 ease-in-out 
                         group relative overflow-hidden"
                  >
                    <span
                      className="text-[#e6e6e6] group-hover:text-white text-[0.96rem] whitespace-nowrap overflow-hidden text-ellipsis block
                           transition-colors duration-300"
                    >
                      {categoryIndex === 0 && chatIndex === 0
                        ? animatedTitle
                        : chat.title}
                    </span>
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#212121] group-hover:from-[#2a2a2a] to-transparent"></div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="h-[6rem] flex items-center justify-between px-2 py-1.5 border-t border-[#414141]">
          <div className="flex-1 px-2 py-1.5 rounded-xl hover:bg-[#2c2c2c] transition-all cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-[#e2e2e2] font-semibold text-sm">
                    {userData.username}
                  </h3>
                  <h5 className="text-[#8e8e8e] text-xs">{userData.email}</h5>
                </div>
              </div>
              <button className="text-[#8e8e8e] hover:text-[#e2e2e2] transition-colors">
                <i className="ri-settings-3-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-[#121212] flex flex-col h-full">
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between bg-[#121212] h-16 px-4">
          <button className="text-white p-2" onClick={toggleSidebar}>
            <i className="ri-menu-line text-2xl"></i>
          </button>
          <h1 className="font-semibold text-[#c69326] font-mono text-xl">
            Zenos AI
          </h1>
          <button className="text-white p-2">
            <i className="ri-chat-new-line text-2xl"></i>
          </button>
        </div>

        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Messages or Welcome section */}
          <div
            ref={messagesRef}
            onScroll={handleScroll}
            className="flex-grow overflow-y-auto pb-20 md:pb-0 px-4 md:px-8"
          >
            <div className="flex flex-col h-max pt-20 w-full rounded-lg pb-20">
              <section className="flex max-w-4xl mx-auto flex-col w-full gap-6">
                {/* User message */}
                <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[95%] md:max-w-[85%] rounded-lg transition-all mr-auto">
                  <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-lg shadow-lg overflow-hidden border border-[#3a3a3a]">
                    {/* Model information */}
                    <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] text-[#8e8e8e] text-xs font-medium py-2 px-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <i className="ri-ai-generate text-[#c69326] text-lg"></i>
                        <span className="text-[#a0a0a0] font-semibold">
                          GPT-4o
                        </span>
                        <span className="text-[#8e8e8e] text-xs">
                          with Pollinations AI
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* <span className="text-[#8e8e8e] text-xs sm:block hidden">
                          Tokens: 9
                        </span> */}
                        <span className="text-[#8e8e8e] text-xs">
                          Time: 0.7s
                        </span>
                      </div>
                    </div>

                    {/* Response content */}
                    <div className="p-4 bg-gradient-to-b from-[#212121] to-[#1a1a1a]">
                      <div className="space-y-2 message-container">
                        <div className="text-sm font-inter md:text-base text-[#e2e2e2] leading-relaxed">
                          Hello{" "}
                          {userData && userData.username
                            ? userData.username
                                .split(" ")[0]
                                .charAt(0)
                                .toUpperCase() +
                              userData.username.split(" ")[0].slice(1)
                            : "there"}
                          ! How can I assist you today?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {messages.map((message, index) => (
                  <React.Fragment key={index}>
                    {message.role === "user" ? (
                      <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[95%] md:max-w-[85%] border border-[#414141] rounded-lg p-4 transition-all ml-auto bg-[#1e1e1e] shadow-lg">
                        <div className="space-y-2">
                          <p className="text-sm font-inter md:text-base text-[#e6e6e6]">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[92vw] md:max-w-[85%] rounded-lg transition-all mr-auto sm:min-w-[350px]">
                        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-lg shadow-lg overflow-hidden border border-[#3a3a3a]">
                          {/* Model information */}
                          <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] text-[#8e8e8e] text-xs font-medium py-2 px-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {messageMetadata[index] ? (
                                <>
                                  <i className="ri-ai-generate text-[#c69326] text-lg"></i>
                                  {messageMetadata[index] &&
                                    (messageMetadata[index].model ||
                                      messageMetadata[index].provider) && (
                                      <div className="metadata space-x-2">
                                        {messageMetadata[index].model && (
                                          <span className="text-[#a0a0a0] font-semibold">
                                            {messageMetadata[index].model}
                                          </span>
                                        )}
                                        {messageMetadata[index].provider && (
                                          <span className="text-[#8e8e8e] text-xs">
                                            with{" "}
                                            {messageMetadata[index].provider}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                </>
                              ) : (
                                <>
                                  <i className="ri-error-warning-line text-yellow-500 text-lg"></i>
                                  <span className="text-[#a0a0a0]  font-semibold">
                                    Error
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {/* <span className="text-[#8e8e8e] text-xs sm:block hidden">
                                Tokens: 150
                              </span> */}
                              <span className="text-[#8e8e8e] text-xs">
                                Time: {timeMetaData[index]}s
                              </span>
                            </div>
                          </div>

                          {/* Response content */}
                          <div className="p-4 bg-gradient-to-b from-[#212121] to-[#1a1a1a]">
                            <div className="space-y-2 message-container">
                              <div className="text-sm font-inter md:text-base text-[#e2e2e2] leading-relaxed">
                                {message.content.trim().length === 0 ||
                                message.content == undefined ? (
                                  <span className="text-[#ef4444]">
                                    Error: No response received. Please try with
                                    a different model.
                                  </span>
                                ) : isValidImageUrl(message.content) ? (
                                  <img
                                    src={message.content}
                                    alt="Generated Image"
                                    className="w-full md:max-w-[24rem] rounded-lg"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/placeholder-image.png";
                                    }}
                                  />
                                ) : (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      code({
                                        node,
                                        inline,
                                        className,
                                        children,
                                        ...props
                                      }) {
                                        const match = /language-(\w+)/.exec(
                                          className || ""
                                        );
                                        return !inline && match ? (
                                          <CodeBlock
                                            language={match[1]}
                                            filename={`${match[1].charAt(0).toUpperCase() + match[1].slice(1)} Code`}
                                            code={String(children).replace(/\n$/, "")}
                                          />
                                        ) : (
                                          <code
                                            className={className}
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        );
                                      },
                                    }}
                                    className="zenos-markdown-content"
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Copy button */}
                    {message.role === "assistant" && (
                      <button
                        onClick={() => handleCopy(index)}
                        className="animate-in group cursor-pointer p-1.5 flex items-center w-fit -mt-4"
                      >
                        <i
                          className={`${
                            index == copyIndex
                              ? "ri-check-fill"
                              : "ri-file-copy-line"
                          } text-[#8e8e8e] group-hover:text-[#c1c1c1] transition-all`}
                        ></i>
                        <span className="text-xs md:text-sm ml-1.5 text-[#8e8e8e] group-hover:text-[#c1c1c1] transition-all">
                          Copy
                        </span>
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {isGenerating && (
                  <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[95%] md:max-w-[85%] rounded-lg transition-all mr-auto">
                    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-lg shadow-lg overflow-hidden border border-[#3a3a3a]">
                      {/* Model information */}
                      <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] text-[#8e8e8e] text-xs font-medium py-2 px-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <i className="ri-ai-generate text-[#c69326] text-lg"></i>
                          {messageMetadata[messages.length] &&
                          (messageMetadata[messages.length].model ||
                            messageMetadata[messages.length].provider) ? (
                            <div className="metadata space-x-2">
                              {messageMetadata[messages.length].model && (
                                <span className="text-[#a0a0a0] font-semibold">
                                  {messageMetadata[messages.length].model}
                                </span>
                              )}
                              {messageMetadata[messages.length].provider && (
                                <span className="text-[#8e8e8e] text-xs">
                                  with{" "}
                                  {messageMetadata[messages.length].provider}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#8e8e8e] font-semibold">
                              Generating...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Response content */}
                      <div className="p-4 bg-gradient-to-b from-[#212121] to-[#1a1a1a]">
                        <div className="space-y-2 message-container">
                          <div className="text-sm font-inter md:text-base text-[#e2e2e2] leading-relaxed">
                            {Object.keys(generatingMessage).length === 0 ||
                            generatingMessage.content === "" ? (
                              <div className="blinking-cursor">|</div>
                            ) : (
                              generatingMessage.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </section>
            </div>
          </div>

          {/* Input Section */}
          <div className="flex-shrink-0 fixed bottom-0 left-0 right-0 md:relative bg-[#121212]">
            <Input
              handleSendMessage={handleSendMessage}
              models={models}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              isGenerating={isGenerating}
              handleStopGeneration={handleStopGeneration}
              isWebActive={isWebActive}
              handleSetWebActive={handleSetWebActive}
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
      <Toaster richColors theme="dark" />
    </div>
  );
};

export default Page;
