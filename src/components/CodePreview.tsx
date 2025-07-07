'use client';

import { useState } from 'react';
import { Copy, Check, Download, Code, FileText, Maximize2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

interface CodePreviewProps {
  code: CodeBlock | null;
}

export function CodePreview({ code }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const copyToClipboard = async () => {
    if (!code?.code) return;
    
    try {
      await navigator.clipboard.writeText(code.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  const downloadCode = () => {
    if (!code?.code) return;
    
    const extension = getFileExtension(code.language);
    const filename = code.filename || `code.${extension}`;
    const blob = new Blob([code.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      sql: 'sql',
      bash: 'sh',
      powershell: 'ps1'
    };
    return extensions[language.toLowerCase()] || 'txt';
  };

  const getLanguageIcon = (language: string) => {
    // You could expand this with more specific icons
    return <Code className="w-4 h-4" />;
  };

  if (!code) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Code Preview</h2>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div className="max-w-md">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Code to Preview
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              When you chat with the AI about code, generated or analyzed code will appear here for easy viewing and copying.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          {getLanguageIcon(code.language)}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {code.filename || `${code.language} Code`}
            </h2>
            {code.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {code.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Toggle theme"
          >
            {isDarkTheme ? '🌙' : '☀️'}
          </button>
          
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Copy code"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
          
          <button
            onClick={downloadCode}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Download code"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Toggle fullscreen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Code Display */}
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={code.language}
          style={isDarkTheme ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            height: '100%',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          showLineNumbers={true}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code.code}
        </SyntaxHighlighter>
      </div>
      
      {/* Footer with stats */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>{code.language.toUpperCase()}</span>
            <span>{code.code.split('\n').length} lines</span>
            <span>{code.code.length} characters</span>
          </div>
          {copied && (
            <span className="text-green-600 dark:text-green-400">
              ✓ Copied to clipboard
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
