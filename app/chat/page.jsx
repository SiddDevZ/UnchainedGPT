"use client";
import React, { useState, useEffect, useLayoutEffect } from "react";
import "remixicon/fonts/remixicon.css";
import "./page.css";
import Input from "../../components/Input/Input";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

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
          ${mounted ? 'transition-all duration-300 ease-in-out' : ''}
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
          <button className="font-medium flex items-center space-x-2 w-full hover:bg-[#383838] px-2.5 py-1 rounded-lg transition-all">
            <i className="ri-chat-new-line text-[#e2e2e2] text-xl"></i>
            <span className="text-[#e2e2e2] font-semibold">New Chat</span>
          </button>
        </div>
        <div className="mt-1 border-t border-[#414141] h-max overflow-y-auto">
          <div className="px-2 py-3">
            {sampleChatData.map(({ category, chats }) => (
              <div key={category} className="mb-4">
                <h6 className="text-[#8e8e8e] text-xs font-medium mb-2 px-2.5 tracking-wider">
                  {category}
                </h6>
                {chats.map((chat, index) => (
                  <button
                    key={index}
                    className="w-full mb-0.5 text-left px-2.5 py-1.5 rounded-lg 
                               hover:bg-gradient-to-r hover:from-[#383838] hover:to-[#2a2a2a] 
                               transition-all duration-300 ease-in-out 
                               group relative overflow-hidden"
                  >
                    <span
                      className="text-[#e6e6e6] group-hover:text-white text-[0.96rem] whitespace-nowrap overflow-hidden text-ellipsis block
                                      transition-colors duration-300"
                    >
                      {chat}
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
                    src="https://cdn.discordapp.com/attachments/907704242930864168/1324727244198772827/IMG_20240513_220756_841.jpg?ex=677933e3&is=6777e263&hm=16c5c62660063d3b4d85b2eed9a326bdcae507c09b0c3d01b94a5b74234a863b&"
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
          {/* Messages will go here */}
          <div className="flex-grow overflow-y-auto pb-20 md:pb-0">
            {/* Your messages content here */}
          </div>

          {/* Input Section */}
          <div className="flex-shrink-0 fixed bottom-0 left-0 right-0 md:relative bg-[#121212]">
            <Input />
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
