import React, { useState, useRef, useEffect } from "react";

const ModelDropdown = ({
  selectedModel,
  setSelectedModel,
  models,
  isOpen,
  onToggle,
  what,
}) => {
  const dropdownRef = useRef(null);
3
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

  const handleModelSelect = (event, key) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedModel(key);
    onToggle(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button" // Add this to explicitly make it a button, not a submit
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle(!isOpen);
        }}
        className="flex items-center space-x-1 sm:space-x-2 bg-[#212121] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#383838] hover:bg-[#2a2a2a] transition-all"
      >
        <span className="text-[#e2e2e2] text-xs sm:text-sm tracking-[0.05em] sm:tracking-[0.07em]">
          <span className="text-[#e2e2e2ea] tracking-normal hidden sm:inline-block text-xs sm:text-sm">{what}: </span>
          <span> {models[selectedModel]?.display || selectedModel}</span>
        </span>
        <i
          className={`ri-arrow-down-s-line text-[#8e8e8e] text-sm sm:text-base transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        ></i>
      </button>
      {isOpen && (
        <div className="model-dropdown absolute right-0 bottom-full mb-1 sm:mb-2 w-40 sm:w-48 bg-[#212121] border border-[#383838] rounded-lg shadow-lg">
          {Object.entries(models).map(([key, model], index, array) => (
            <button
              key={key}
              type="button"
              className={`block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-[#e2e2e2] hover:bg-[#2a2a2a] tracking-[0.05em] sm:tracking-[0.07em] transition-all ease-out ${
                index !== array.length - 1 ? 'border-b border-[#38383845]' : ''
              }`}
              onClick={(e) => handleModelSelect(e, key)}
            >
              {key}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Input = ({
  handleSendMessage,
  selectedModel,
  selectedProvider,
  setSelectedModel,
  setSelectedProvider,
  models,
  isGenerating,
  isWebActive,
  handleSetWebActive,
}) => {
  const [message, setMessage] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const textareaRef = useRef(null);
  const formRef = useRef(null);

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  useEffect(() => {
    const providers = models[selectedModel]?.providers;
    if (providers) {
      const firstProviderKey = Object.keys(providers)[0];
      setSelectedProvider(firstProviderKey);
    }
  }, [selectedModel]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isGenerating) {
      handleSendMessage(message, selectedModel, selectedProvider);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleDropdownToggle = (dropdownName) => (isOpen) => {
    setOpenDropdown(isOpen ? dropdownName : null);
  };

  useEffect(() => {
    adjustTextareaHeight();
    // Focus the textarea after component mounts
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [message]);

  return (
    <div className="w-full px-4 pb-4 shadow-lg bg-gradient-to-t from-[#121212] to-transparent">
      <div className="max-w-4xl mx-auto relative">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative flex flex-col bg-[#212121] rounded-xl shadow-lg border border-[#383838]"
        >
          <div className="flex items-end">
            <textarea
              ref={textareaRef}
              className="w-full resize-none bg-transparent pl-4 pr-1 sm:text-base text-sm py-4 min-h-[56px] max-h-[200px]
                  text-[#e2e2e2] placeholder-[#8e8e8e] focus:outline-none 
                  scrollbar-thin scrollbar-thumb-[#383838] scrollbar-track-transparent
                  overflow-y-auto"
              placeholder="Message Zenos AI..."
              rows={1}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
            />
            <button
              type="submit"
              className="sm:min-w-8 sm:min-h-8 min-w-8 min-h-8 flex items-center justify-center rounded-full my-auto mr-2 
                bg-[#dddddd] hover:bg-gray-100 transition-colors duration-200 ease-in-out 
                disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!message.trim() || isGenerating}
            >
              <i className="ri-arrow-up-line text-xl text-[#000000]"></i>
            </button>
          </div>

          <div className="flex items-center px-4 py-2 border-t border-[#383838] sm:space-x-8 space-x-4">
            <div className="flex items-center sm:space-x-4 space-x-4 z-10">
              <button
                type="button"
                onClick={() => handleSetWebActive()}
                className="text-[#8e8e8e] transition-all duration-200"
              >
                <i className={`ri-attachment-2 text-[1.4rem]`}></i>
              </button>
              <button
                type="button"
                onClick={() => handleSetWebActive()}
                className="text-[#8e8e8e] transition-all duration-200"
              >
                <i className={`ri-global-line ${isWebActive ? "text-blue-500" : ""} transition-all ease-in-out text-[1.4rem]`}></i>
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
                selectedModel={selectedProvider}
                setSelectedModel={setSelectedProvider}
                models={models[selectedModel]?.providers || {}}
                isOpen={openDropdown === "provider"}
                what="Provider"
                onToggle={handleDropdownToggle("provider")}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Input;