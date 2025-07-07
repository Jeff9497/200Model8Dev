'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Settings as SettingsIcon, Paperclip, Plus, TestTube } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { ChatMessage } from './ChatMessage';
import { CodePreview } from './CodePreview';
import { RateLimitIndicator } from './RateLimitIndicator';
import { FileUpload } from './FileUpload';
import { MCPApproval } from './MCPApproval';
import { Settings } from './Settings';
import { MCPTest } from './MCPTest';
import { useAIModels } from '@/hooks/useAIModels';
import { useChat } from '@/hooks/useChat';
import { useMCP } from '@/hooks/useMCP';

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet');
  const [showSettings, setShowSettings] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showMCPTest, setShowMCPTest] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { models, rateLimits } = useAIModels();
  const { messages, isLoading, sendMessage, codePreview, editMessage, clearChat, setMcpExecutorFunction } = useChat();
  const {
    pendingTool,
    showApproval,
    permissions,
    handleApprove,
    handleDeny,
    handleAlwaysAllow,
    clearPermissions,
    executeTool
  } = useMCP();

  // Connect MCP executor to chat
  useEffect(() => {
    console.log('🔥 ChatInterface: Connecting MCP executor', { executeTool: !!executeTool });
    setMcpExecutorFunction(executeTool);
  }, [setMcpExecutorFunction, executeTool]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    await sendMessage(message, selectedModel);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleResend = async (content: string) => {
    if (!content.trim() || isLoading) return;
    await sendMessage(content, selectedModel);
  };

  const handleFileSelect = (_file: File, content: string) => {
    setMessage(content);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };



  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };



  return (
    <div className="flex h-screen w-full flex-col lg:flex-row overflow-hidden">
      {/* Main Panel - Chat */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-gray-800 min-h-0 ${codePreview ? 'lg:border-r border-gray-200 dark:border-gray-700' : ''}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 gap-2 sm:gap-0">
          {/* Top row on mobile: Logo and title */}
          <div className="flex items-center justify-between sm:justify-start">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm lg:text-base flex-shrink-0">
                8⚡
              </div>
              <h1 className="text-sm sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                200Model8-Dev
              </h1>
            </div>

            {/* Right side buttons for mobile */}
            <div className="flex items-center space-x-1 sm:hidden">
              <RateLimitIndicator model={selectedModel} limits={rateLimits} />
              <button
                onClick={() => setShowMCPTest(!showMCPTest)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Test MCP Servers"
              >
                <TestTube className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Second row on mobile: Model selector and desktop buttons */}
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0 w-full sm:w-auto">
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
                rateLimits={rateLimits}
              />
            </div>

            {/* Desktop-only buttons */}
            <div className="hidden sm:flex items-center space-x-2 ml-4">
              <RateLimitIndicator model={selectedModel} limits={rateLimits} />
              <button
                onClick={() => setShowMCPTest(!showMCPTest)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Test MCP Servers"
              >
                <TestTube className="w-5 h-5" />
              </button>
              <button
                onClick={clearChat}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <ModelSelector
              models={models}
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
              rateLimits={rateLimits}
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4 mobile-chat-container min-h-0 pb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                8⚡
              </div>
              <h2 className="text-xl font-semibold mb-2">Welcome to 200Model8-Dev</h2>
              <p className="text-sm max-w-md mx-auto">
                Your AI-powered coding assistant with unlimited Claude access and powerful debugging capabilities. 
                Paste your code and get instant analysis, debugging help, and optimization suggestions.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} onEdit={editMessage} onResend={handleResend} />
            ))
          )}
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span>Analyzing your code...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mobile-input-fix mobile-input-container">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowFileUpload(true)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
              title="Upload file or image"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 relative min-w-0">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask any coding question or paste your code..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[48px] max-h-32 text-base"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-[48px] min-h-[48px]"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel - Code Preview (only show when there's code) */}
      {codePreview && (
        <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-full bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <CodePreview code={codePreview} />
        </div>
      )}

      {/* File Upload Modal */}
      <FileUpload
        isOpen={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileSelect={handleFileSelect}
      />

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        permissions={permissions}
        onClearPermissions={clearPermissions}
      />

      {/* MCP Tool Approval Modal */}
      {pendingTool && (
        <MCPApproval
          tool={pendingTool}
          isOpen={showApproval}
          onApprove={handleApprove}
          onDeny={handleDeny}
          onAlwaysAllow={handleAlwaysAllow}
        />
      )}

      {/* MCP Test Modal */}
      <MCPTest
        isOpen={showMCPTest}
        onClose={() => setShowMCPTest(false)}
      />
    </div>
  );
}
