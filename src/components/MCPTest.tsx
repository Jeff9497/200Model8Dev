'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, Loader } from 'lucide-react';

interface MCPTestProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MCPTest({ isOpen, onClose }: MCPTestProps) {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const testMCPServer = async (serverName: string) => {
    setIsLoading(prev => ({ ...prev, [serverName]: true }));
    
    try {
      const response = await fetch(`/api/mcp-call?test=${serverName}`);
      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [serverName]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [serverName]: { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, [serverName]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">MCP Server Test</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* DuckDuckGo Test */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <div className="font-medium text-sm">DuckDuckGo Search</div>
            <div className="text-xs text-gray-500">Privacy-focused web search MCP</div>
          </div>
          <div className="flex items-center space-x-2">
            {testResults.duckduckgo && (
              <div className="text-xs">
                {testResults.duckduckgo.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
            <button
              onClick={() => testMCPServer('duckduckgo')}
              disabled={isLoading.duckduckgo}
              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading.duckduckgo ? <Loader className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Context7 Test */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
          <div>
            <div className="font-medium text-sm">Context7 Docs</div>
            <div className="text-xs text-gray-500">Up-to-date library documentation MCP</div>
          </div>
          <div className="flex items-center space-x-2">
            {testResults.context7 && (
              <div className="text-xs">
                {testResults.context7.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            )}
            <button
              onClick={() => testMCPServer('context7')}
              disabled={isLoading.context7}
              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading.context7 ? <Loader className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Test All Button */}
        <button
          onClick={() => {
            testMCPServer('duckduckgo');
            testMCPServer('context7');
          }}
          className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
        >
          Test All Servers
        </button>

        {/* Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs">
            <div className="font-medium mb-2">Test Results:</div>
            <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-32">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
