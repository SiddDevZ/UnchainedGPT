"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines = [],
  tabs = []
}) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);

  const tabsExist = tabs.length > 0;

  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeCode = tabsExist ? tabs[activeTab].code : code;
  const activeLanguage = tabsExist
    ? tabs[activeTab].language || language
    : language;
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || []
    : highlightLines;

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        {tabsExist && (
          <div className="code-block-tabs">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`code-block-tab ${activeTab === index ? 'active' : ''}`}>
                {tab.name}
              </button>
            ))}
          </div>
        )}
        {!tabsExist && filename && (
          <div className="code-block-filename">
            <div className="filename">{filename}</div>
            <button
              onClick={copyToClipboard}
              className="copy-button">
              {/* {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )} */}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>
      <SyntaxHighlighter
        language={activeLanguage}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontSize: "0.875rem",
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineProps={(lineNumber) => ({
          style: {
            backgroundColor: activeHighlightLines.includes(lineNumber)
              ? "rgba(255,255,255,0.1)"
              : "transparent",
            display: "block",
            width: "100%",
          },
        })}
        PreTag="div">
        {String(activeCode)}
      </SyntaxHighlighter>
    </div>
  );
};

// Converted CSS styles
const styles = `
  <style>
    .code-block-container {
      position: relative !important;
      width: 100% !important;
      border-radius: 0.5rem !important;
      background-color: #2a2a2a !important;
      padding: 1rem !important;
      font-family: monospace !important;
      font-size: 0.875rem !important;
    }

    .code-block-header {
      display: flex !important;
      flex-direction: column !important;
      gap: 0.5rem !important;
    }

    .code-block-tabs {
      display: flex !important;
      overflow-x: auto !important;
    }

    .code-block-tab {
      padding: 0.5rem 0.75rem !important;
      font-size: 0.75rem !important;
      transition: color 0.3s !important;
      font-family: sans-serif !important;
    }

    .code-block-tab:not(.active) {
      color: #a1a1aa !important;
    }

    .code-block-tab:not(.active):hover {
      color: #e4e4e7 !important;
    }

    .code-block-tab.active {
      color: white !important;
    }

    .code-block-filename {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      padding: 0.5rem 0 !important;
    }

    .filename {
      font-size: 0.75rem !important;
      color: #a1a1aa !important;
    }

    .copy-button {
      display: flex !important;
      align-items: center !important;
      gap: 0.25rem !important;
      font-size: 0.75rem !important;
      color: #a1a1aa !important;
      transition: color 0.3s !important;
      font-family: sans-serif !important;
      background: none !important;
      border: none !important;
      cursor: pointer !important;
    }

    .copy-button:hover {
      color: #e4e4e7 !important;
    }
  </style>
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}