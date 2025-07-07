'use client';

import { useState } from 'react';
import { Brain, Zap, Cpu, Code, Copy, Check, ChevronDown, ChevronUp, Edit2, Save, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
  codeBlocks?: Array<{
    language: string;
    code: string;
    filename?: string;
  }>;
}

interface ChatMessageProps {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
  onResend?: (content: string) => void;
}

export function ChatMessage({ message, onEdit, onResend }: ChatMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const getModelIcon = (model?: string) => {
    if (!model) return <Code className="w-4 h-4" />;
    if (model.includes('claude')) return <Brain className="w-4 h-4 text-purple-500" />;
    if (model.includes('deepseek')) return <Zap className="w-4 h-4 text-orange-500" />;
    if (model.includes('llama')) return <Cpu className="w-4 h-4 text-green-500" />;
    return <Code className="w-4 h-4 text-blue-500" />;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const copyResponse = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    } catch (err) {
      console.error('Failed to copy response: ', err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleResend = () => {
    if (onResend) {
      onResend(editContent.trim());
    }
    setIsEditing(false);
  };

  const detectCodeInMessage = (content: string) => {
    // Simple detection for code blocks in markdown
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const matches = [];
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      matches.push({
        language: match[1] || 'text',
        code: match[2].trim(),
        fullMatch: match[0]
      });
    }
    
    return matches;
  };

  const renderCodePreview = (content: string) => {
    const codeBlocks = detectCodeInMessage(content);
    
    if (codeBlocks.length === 0) return null;
    
    // Show preview of first code block
    const firstBlock = codeBlocks[0];
    const previewLines = firstBlock.code.split('\n').slice(0, 3);
    const hasMore = firstBlock.code.split('\n').length > 3;
    
    return (
      <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {firstBlock.language} code
            </span>
          </div>
          <button
            onClick={() => setIsCodeExpanded(!isCodeExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 flex items-center space-x-1"
          >
            <span>{isCodeExpanded ? 'Collapse' : 'Expand'}</span>
            {isCodeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        
        {isCodeExpanded ? (
          <div className="relative">
            <SyntaxHighlighter
              language={firstBlock.language}
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              {firstBlock.code}
            </SyntaxHighlighter>
            <button
              onClick={() => copyToClipboard(firstBlock.code, `${message.id}-code`)}
              className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              {copiedCode === `${message.id}-code` ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
            {previewLines.map((line, index) => (
              <div key={index} className="truncate">
                {line || ' '}
              </div>
            ))}
            {hasMore && (
              <div className="text-xs text-gray-500 mt-1">
                ... {firstBlock.code.split('\n').length - 3} more lines
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${message.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
      <div className={`flex space-x-2 lg:space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {message.role === 'assistant' && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {getModelIcon(message.model)}
            </div>
          </div>
        )}

        <div className={`max-w-xs sm:max-w-md lg:max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
          <div className={`rounded-lg p-4 relative group ${
            message.role === 'user'
              ? 'bg-blue-600 text-white ml-auto'
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }`}>
            {/* Copy button for assistant messages */}
            {message.role === 'assistant' && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={copyResponse}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                  title="Copy response"
                >
                  {copiedResponse ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}

          {message.role === 'assistant' && message.model && (
            <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
              {getModelIcon(message.model)}
              <span>{message.model.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <span>•</span>
              <span>{message.timestamp.toLocaleTimeString()}</span>
            </div>
          )}
          
          {isEditing && message.role === 'user' ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white resize-none"
              rows={Math.max(3, editContent.split('\n').length)}
              autoFocus
            />
          ) : (
            <div className={`prose prose-sm max-w-none ${
              message.role === 'user'
                ? 'prose-invert'
                : 'dark:prose-invert'
            }`}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  
                  if (!inline && language) {
                    return (
                      <div className="relative">
                        <SyntaxHighlighter
                          language={language}
                          style={oneDark as any}
                          customStyle={{
                            margin: 0,
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                          } as React.CSSProperties}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                        <button
                          onClick={() => copyToClipboard(String(children), `${message.id}-${language}`)}
                          className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                        >
                          {copiedCode === `${message.id}-${language}` ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  }
                  
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
            </div>
          )}
          
          {message.role === 'user' && renderCodePreview(message.content)}
          </div>
        </div>

        {message.role === 'user' && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              8⚡
            </div>
          </div>
        )}
      </div>

      {/* Edit controls outside the message */}
      {message.role === 'user' && onEdit && (
        <div className="flex items-center space-x-2 text-sm">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResend}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                <Send className="w-3 h-3" />
                <span>Resend</span>
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center space-x-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
