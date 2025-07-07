'use client';

import { useState } from 'react';
import { X, Settings as SettingsIcon, Palette, Sun, Moon, Cpu, Shield } from 'lucide-react';
import { MCPSettings } from './MCPSettings';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: Record<string, any>;
  onClearPermissions: () => void;
}

export function Settings({ isOpen, onClose, permissions, onClearPermissions }: SettingsProps) {
  const [theme, setTheme] = useState('gradient');
  const [showMCPSettings, setShowMCPSettings] = useState(false);

  if (!isOpen) return null;

  const themes = [
    { id: 'gradient', name: 'Gradient', icon: Palette, color: 'from-blue-500 to-purple-600' },
    { id: 'dark', name: 'Dark', icon: Moon, color: 'bg-gray-800' },
    { id: 'light', name: 'Light', icon: Sun, color: 'bg-white border border-gray-300' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Selection */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <button
                    key={themeOption.id}
                    onClick={() => setTheme(themeOption.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === themeOption.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-full h-8 rounded mb-2 ${
                      themeOption.id === 'gradient' 
                        ? `bg-gradient-to-r ${themeOption.color}`
                        : themeOption.color
                    }`}></div>
                    <div className="flex items-center justify-center space-x-1">
                      <Icon className="w-3 h-3" />
                      <span className="text-xs font-medium">{themeOption.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Settings */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Cpu className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Models</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Claude Models:</strong> Unlimited access via Puter.js
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Groq Models:</strong> Free tier with rate limits
                </p>
              </div>
            </div>
          </div>

          {/* MCP Settings */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">MCP Tools</h3>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Configure external tools that AI models can use for enhanced capabilities.
                </p>
                <button
                  onClick={() => setShowMCPSettings(true)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Manage MCP Tools
                </button>
              </div>
              
              {Object.keys(permissions).length > 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                    <strong>{Object.keys(permissions).length}</strong> tool permissions saved
                  </p>
                  <button
                    onClick={onClearPermissions}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    Clear all permissions
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* App Info */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p><strong>200Model8-Dev</strong> v1.0.0</p>
              <p>AI-powered coding assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* MCP Settings Modal */}
      <MCPSettings
        isOpen={showMCPSettings}
        onClose={() => setShowMCPSettings(false)}
        permissions={permissions}
        onClearPermissions={onClearPermissions}
      />
    </>
  );
}
