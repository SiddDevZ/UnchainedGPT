import React, { useState, useRef, useEffect } from "react";

const models = [
  { columnValue: "GPT-4o", display: "GPT-4o", value: "gpt-3.5-turbo" },
  { columnValue: "Claude 3.5 Sonnet", display: "Claude 3.5", value: "gpt-4" },
  { columnValue: "Claude-2", display: "Claude-2", value: "claude-2" },
  { columnValue: "PaLM", display: "PaLM", value: "palm-2" },
];

const providers = [
  { columnValue: "Auto", display: "Auto", value: "auto" },
  { columnValue: "BlackBox AI", display: "BlackBox", value: "blackbox" },
  { columnValue: "OpenAI", display: "OpenAI", value: "openai" },
];

const ModelDropdown = ({
  selectedModel,
  setSelectedModel,
  models,
  isOpen,
  onToggle,
  what,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => onToggle(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 bg-[#212121] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#383838] hover:bg-[#2a2a2a] transition-all"
      >
        <span className="text-[#e2e2e2] text-xs sm:text-sm tracking-[0.05em] sm:tracking-[0.07em]">
          <span className="text-[#e2e2e2ea] tracking-normal hidden sm:inline-block text-xs sm:text-sm">{what}: </span>
          <span> {selectedModel}</span>
        </span>
        <i
          className={`ri-arrow-down-s-line text-[#8e8e8e] text-sm sm:text-base transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>
      {isOpen && (
        <div className="model-dropdown absolute right-0 bottom-full mb-1 sm:mb-2 w-40 sm:w-48 bg-[#212121] border border-[#383838] rounded-lg shadow-lg">
          {models.map((model) => (
            <button
              key={model.value}
              className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#e2e2e2] hover:bg-[#2a2a2a] tracking-[0.05em] sm:tracking-[0.07em] transition-all ease-out"
              onClick={() => {
                setSelectedModel(model.display);
                onToggle(false);
              }}
            >
              {model.columnValue}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]["columnValue"]);
  const [selectedVision, setSelectedVision] = useState(providers[0]["columnValue"]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const textareaRef = useRef(null);

  // ... (other existing code)

  const handleDropdownToggle = (dropdownName) => (isOpen) => {
    setOpenDropdown(isOpen ? dropdownName : null);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message, selectedModel, selectedVision);
      setMessage("");
    }
  };

  return (
    <div className="w-full p-4 bg-gradient-to-t from-[#121212] to-transparent">
      <div className="max-w-4xl mx-auto relative">
        <div className="relative flex flex-col bg-[#212121] rounded-xl shadow-lg border border-[#383838]">
          <div className="flex items-end">
            <div className="w-full relative">
              <textarea
                ref={textareaRef}
                className="w-full resize-none bg-transparent pl-4 pr-1 sm:text-base items-center text-sm py-4 min-h-[56px] max-h-[200px]
                    text-[#e2e2e2] placeholder-[#8e8e8e] focus:outline-none 
                    scrollbar-thin scrollbar-thumb-[#383838] scrollbar-track-transparent
                    overflow-y-auto"
                placeholder="Message Zenos AI..."
                rows={1}
                value={message}
                onChange={handleMessageChange}
                style={{ overflow: "auto" }}
              />
            </div>

            <button
              onClick={handleSendMessage}
              className="sm:min-w-8 sm:min-h-8 min-w-8 min-h-8 flex items-center justify-center rounded-full my-auto mr-2 
                  bg-[#dddddd] hover:bg-gray-100 transition-colors duration-200 ease-in-out 
                  disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!message.trim()}
            >
              <i className="ri-arrow-up-line text-xl text-[#000000]"></i>
            </button>
          </div>

          {/* File Upload and Web Search Toggles */}
          <div className="flex items-center px-4 py-2 border-t border-[#383838] sm:space-x-8 space-x-4">
            <div className="flex items-center sm:space-x-4 space-x-4">
              <button className="text-[#8e8e8e] transition-all duration-200">
                <i className="ri-attachment-2 sm:text-xl text-[1.3rem]"></i>
              </button>
              <button className="text-[#8e8e8e] transition-all duration-200">
                <i className="ri-global-line sm:text-xl text-[1.3rem]"></i>
              </button>
            </div>
            <div className="flex items-center sm:space-x-4 space-x-2">
              <ModelDropdown
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                models={models}
                isOpen={openDropdown === "model"}
                what="Model"
                onToggle={handleDropdownToggle("model")}
              />
              <ModelDropdown
                selectedModel={selectedVision}
                setSelectedModel={setSelectedVision}
                models={providers}
                isOpen={openDropdown === "vision"}
                what="Provider"
                onToggle={handleDropdownToggle("vision")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
