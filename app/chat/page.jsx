"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import "remixicon/fonts/remixicon.css";
import "./page.css";
import Input from "../../components/Input/Input";
import io from "socket.io-client";
import Cookies from "js-cookie";

const sampleChatData = [
  {
    category: "Recent",
    chats: [
      "AI Ethics Discussion",
      "Python Debugging Help aaaaaaaaaaaaaa",
      "Book Recommendations",
    ],
  },
  {
    category: "Previous 7 days",
    chats: [
      "Machine Learning Project Ideas",
      "JavaScript Best Practices",
      "Quantum Computing Basics",
      "Sustainable Energy Solutions",
    ],
  },
  {
    category: "Previous 30 days",
    chats: [
      "Blockchain Technology Overview",
      "Healthy Meal Planning",
      "Space Exploration Updates",
      "Cybersecurity Tips",
      "Art History Timeline",
    ],
  },
  {
    category: "2024",
    chats: [
      "New Year Resolutions",
      "Future of Work Trends",
      "Emerging Technologies 2024",
      "Climate Change Mitigation Strategies",
      "Global Economic Outlook",
    ],
  },
];

const Page = () => {
  const models = {
    "GPT-4o": {
      display: "GPT-4o",
      value: "gpt-4o",
      providers: {
        Auto: { display: "Auto", value: "auto" },
        "Pollinations AI": { display: "Pollinations", value: "PollinationsAI" },
        "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
        "Dark AI": { display: "DarkAI", value: "DarkAI" },
        Liaobots: { display: "Liaobots", value: "Liaobots" },
      },
    },
    "Claude 3.5 Sonnet": {
      display: "Claude 3.5",
      value: "claude-3.5-sonnet",
      providers: {
        Auto: { display: "Auto", value: "auto" },
        "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
        // "Liaobots": { display: "Liaobots", value: "Liaobots" },
        "Pollinations AI": { display: "Pollinations", value: "PollinationsAI" },
      },
    },
    "Qwen 2.5 Coder": {
      display: "Qwen Coder",
      value: "qwen-2.5-coder-32b",
      providers: {
        Auto: { display: "Auto", value: "auto" },
        "DeepInfra Chat": { display: "DeepInfra", value: "DeepInfraChat" },
        PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
        // "GeminiPro": { display: "GeminiPro", value: "GeminiPro" },
      },
    },
    "Evil (Experimental)": {
      display: "Evil",
      value: "evil",
      providers: {
        Auto: { display: "Auto", value: "auto" },
        // "Airforce": { display: "Airforce", value: "Airforce" },
        PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
      },
    },
  };
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
  const [selectedModel, setSelectedModel] = useState(Object.keys(models)[0]);
  const [selectedProvider, setSelectedProvider] = useState(
    Object.keys(models[Object.keys(models)[0]].providers)[0]
  );
  const [responseTime, setResponseTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [timeMetaData, setTimeMetaData] = useState({});
  const [messageMetadata, setMessageMetadata] = useState({});
  const latestMetadataRef = useRef(messageMetadata);
  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [chatData, setChatData] = useState([]);

  const calculateResponseTime = (start, end) => {
    const timeDiff = end - start;
    return (timeDiff / 1000).toFixed(1); // Convert to seconds and round to 1 decimal place
  };

  const fetchAndCategorizeChats = async (userId) => {
    console.log(userId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fetchchats/${userId}`
      );
      const data = await response.json();

      if (data.chats) {
        setChatData(data.chats);
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
  }

  const fetchSpecificChat = async (chatId) => {
    if (!chatId) {
      console.error("No chat ID provided");
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
        setChatId(chatId);

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
    if (isGenerating) {
      setStartTime(Date.now());
    } else if (startTime) {
      const endTime = Date.now();
      const time = calculateResponseTime(startTime, endTime);
      setResponseTime(time);
      setStartTime(null);

      setTimeMetaData((prevTimeMetaData) => {
        const lastMessageIndex = messages.length - 1;
        if (lastMessageIndex >= 0) {
          return {
            ...prevTimeMetaData,
            [lastMessageIndex]: time,
          };
        }
        return prevTimeMetaData;
      });
    }
  }, [isGenerating]);

  useEffect(() => {
    console.log(selectedModel);
    console.log(selectedProvider);
  }, [selectedModel, selectedProvider]);

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
      const newSocket = io("http://localhost:3001", {
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

  const handleSendMessage = (message, selectedModel, selectedProvider) => {
    setIsGenerating(true);

    let providers;
    if (selectedProvider === "Auto") {
      // Get all providers except "Auto" for the selected model
      providers = Object.entries(models[selectedModel].providers)
        .slice(1) // Skip the first entry (Auto)
        .map(([key, value]) => value.value);
    } else {
      providers = [models[selectedModel].providers[selectedProvider].value];
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
    ]);

    let generatedContent = "";

    socket.emit("message", {
      message,
      model: models[selectedModel].value,
      provider: providers,
    });

    socket.on("chunk", (chunk) => {
      generatedContent += chunk;
      setGeneratingMessage({ role: "assistant", content: generatedContent });
      scrollToBottom();
    });

    const provider = null;
    console.log(provider);

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

    socket.on("done", async () => {
      setIsGenerating(false);
      const newMessages = [
        ...messages,
        { role: "user", content: message },
        { role: "assistant", content: generatedContent },
      ];
      setMessages(newMessages);
      setGeneratingMessage({});

      scrollToBottom();

      try {
        // Only proceed if generatedContent is not empty
        if (generatedContent.trim() !== "") {
          let currentChatId = chatId;
          if (!currentChatId) {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/chat`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title:
                    newMessages[newMessages.length - 1].content.substring(0, 20) +
                    "...",
                  user_id: userId,
                }),
              }
            );
            console.log("Created new chat:");
            const data = await response.json();
            currentChatId = data.chat_id;
            setChatId(currentChatId);
          }
          // Store messages in the backend
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/message/${currentChatId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                messages: [
                  {
                    index: newMessages.length - 1,
                    role: newMessages[newMessages.length - 2].role,
                    content: newMessages[newMessages.length - 2].content,
                    timeItTook: timeMetaData[newMessages.length - 1],
                  },
                  {
                    index: newMessages.length,
                    role: newMessages[newMessages.length - 1].role,
                    content: newMessages[newMessages.length - 1].content,
                    model:
                      latestMetadataRef.current[newMessages.length - 1]?.model,
                    provider:
                      latestMetadataRef.current[newMessages.length - 1]?.provider,
                    timeItTook: timeMetaData[newMessages.length],
                  },
                ],
              }),
            }
          );
        }
      } catch (error) {
        console.error("Error storing chat or messages:", error);
      }

      // Remove the listeners to avoid duplicates on next message
      socket.off("chunk");
      socket.off("done");
      socket.off("prov");
    });
  };

  // Add this useEffect to handle real-time updates of the generating message

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
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex w-full h-screen bg-[#121212] relative">
      {/* Sidebar */}
      <div
        className={`
          h-full bg-[#212121] w-[17.5rem] flex-shrink-0 flex flex-col
          ${mounted ? "transition-all duration-300 ease-in-out" : ""}
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
          <button onClick={() => newChat()} className="font-medium flex items-center space-x-2 w-full hover:bg-[#383838] px-2.5 py-1 rounded-lg transition-all">
            <i className="ri-chat-new-line text-[#e2e2e2] text-xl"></i>
            <span className="text-[#e2e2e2] font-semibold">New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden border-t border-[#414141]">
          <div className="h-full overflow-y-auto px-2 py-3">
            {chatData.map(({ category, chats }) => (
              <div key={category} className="mb-4">
                <h6 className="text-[#8e8e8e] text-xs font-medium mb-2 px-2.5 tracking-wider">
                  {category}
                </h6>
                {chats.map((chat) => (
                  <button
                    key={chat.id}
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
                      {chat.title}
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
                    src="https://cdn.discordapp.com/avatars/273352781442842624/438d2199d43d5989d4dcd7772f13f835.png"
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-[#e2e2e2] font-semibold text-sm">
                    Siddharth
                  </h3>
                  <h5 className="text-[#8e8e8e] text-xs">
                    siddz.dev@gmail.com
                  </h5>
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
                          GPT-4
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
                          Hello Siddharth! How can I assist you today?
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
                      <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[95%] md:max-w-[85%] rounded-lg transition-all mr-auto">
                        <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-lg shadow-lg overflow-hidden border border-[#3a3a3a]">
                          {/* Model information */}
                          <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] text-[#8e8e8e] text-xs font-medium py-2 px-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {messageMetadata[index] ? (
                                <>
                                  <i className="ri-ai-generate text-[#c69326] text-lg"></i>
                                  <div className="metadata space-x-2">
                                    <span className="text-[#a0a0a0] font-semibold">
                                      {messageMetadata[index].model}
                                    </span>
                                    <span className="text-[#8e8e8e] text-xs">
                                      with {messageMetadata[index].provider}
                                    </span>
                                  </div>
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
                                Time: {timeMetaData[index]}
                              </span>
                            </div>
                          </div>

                          {/* Response content */}
                          <div className="p-4 bg-gradient-to-b from-[#212121] to-[#1a1a1a]">
                            <div className="space-y-2 message-container">
                              <div className="text-sm font-inter md:text-base text-[#e2e2e2] leading-relaxed">
                                {message.content === "" ? (
                                  <span className="text-[#ef4444]">
                                    Error: No response received. Please try with
                                    a different model.
                                  </span>
                                ) : (
                                  message.content
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Copy button */}
                    {message.role === "assistant" && (
                      <button className="animate-in group cursor-pointer p-1.5 flex items-center w-fit -mt-4">
                        <i className="ri-file-copy-line text-[#8e8e8e] group-hover:text-[#c1c1c1] transition-all"></i>
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
                          {messageMetadata[messages.length] ? (
                            <div className="metadata space-x-2">
                              <span className="text-[#a0a0a0] font-semibold">
                                {messageMetadata[messages.length].model}
                              </span>
                              <span className="text-[#8e8e8e] text-xs">
                                with {messageMetadata[messages.length].provider}
                              </span>
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
    </div>
  );
};

export default Page;
