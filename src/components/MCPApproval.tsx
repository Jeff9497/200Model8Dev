'use client';

import { useState } from 'react';
import { Check, X, AlertTriangle, Search, Globe, Database, Code } from 'lucide-react';

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  provider: string;
}

interface MCPApprovalProps {
  tool: MCPTool;
  isOpen: boolean;
  onApprove: () => void;
  onDeny: () => void;
  onAlwaysAllow: () => void;
}

export function MCPApproval({ tool, isOpen, onApprove, onDeny, onAlwaysAllow }: MCPApprovalProps) {
  const [rememberChoice, setRememberChoice] = useState(false);

  if (!isOpen) return null;

  const getToolIcon = (toolName: string) => {
    if (toolName.includes('search') || toolName.includes('exa')) {
      return <Search className="w-6 h-6 text-blue-500" />;
    }
    if (toolName.includes('web') || toolName.includes('browser')) {
      return <Globe className="w-6 h-6 text-green-500" />;
    }
    if (toolName.includes('database') || toolName.includes('sql')) {
      return <Database className="w-6 h-6 text-purple-500" />;
    }
    return <Code className="w-6 h-6 text-orange-500" />;
  };

  const getToolCategory = (toolName: string) => {
    if (toolName.includes('search')) return 'Web Search';
    if (toolName.includes('web')) return 'Web Access';
    if (toolName.includes('database')) return 'Database';
    if (toolName.includes('file')) return 'File System';
    return 'Development Tool';
  };

  const formatParameters = (params: Record<string, any>) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tool Permission Request
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI wants to use an external tool
            </p>
          </div>
        </div>

        {/* Tool Info */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            {getToolIcon(tool.name)}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {tool.name}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                {getToolCategory(tool.name)}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {tool.description}
          </p>

          {Object.keys(tool.parameters).length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Parameters:
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-600 p-2 rounded">
                {formatParameters(tool.parameters)}
              </p>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <strong>Provider:</strong> {tool.provider}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Privacy:</strong> This tool may access external services. 
            Your data will be processed according to the tool provider's privacy policy.
          </p>
        </div>

        {/* Remember Choice */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="remember"
            checked={rememberChoice}
            onChange={(e) => setRememberChoice(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
            Remember my choice for this tool
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onDeny}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Deny</span>
          </button>
          
          <button
            onClick={rememberChoice ? onAlwaysAllow : onApprove}
            className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{rememberChoice ? 'Always Allow' : 'Allow Once'}</span>
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
          You can change these permissions in Settings later
        </p>
      </div>
    </div>
  );
}
