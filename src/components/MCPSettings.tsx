'use client';

import { useState } from 'react';
import { Plus, Trash2, Settings, Search, Globe, Database, Code, Shield, CheckCircle, XCircle } from 'lucide-react';

interface MCPTool {
  id: string;
  name: string;
  description: string;
  provider: string;
  enabled: boolean;
  alwaysAllow: boolean;
}

interface MCPSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  permissions: Record<string, any>;
  onClearPermissions: () => void;
}

export function MCPSettings({ isOpen, onClose, permissions, onClearPermissions }: MCPSettingsProps) {
  const [tools, setTools] = useState<MCPTool[]>([
    {
      id: 'exa_search',
      name: 'Exa Search',
      description: 'Search the web for development resources and documentation',
      provider: 'Exa AI',
      enabled: true,
      alwaysAllow: false
    },
    {
      id: 'web_search',
      name: 'Web Search',
      description: 'General web search for finding information',
      provider: 'Search API',
      enabled: true,
      alwaysAllow: false
    },
    {
      id: 'context7_search',
      name: 'Context7 Search',
      description: 'Advanced context-aware search for development queries',
      provider: 'Context7',
      enabled: false,
      alwaysAllow: false
    },
    {
      id: 'github_search',
      name: 'GitHub Search',
      description: 'Search GitHub repositories, issues, and code',
      provider: 'GitHub API',
      enabled: true,
      alwaysAllow: false
    }
  ]);

  const [showAddTool, setShowAddTool] = useState(false);
  const [newTool, setNewTool] = useState({
    name: '',
    description: '',
    provider: '',
    endpoint: ''
  });

  if (!isOpen) return null;

  const getToolIcon = (toolName: string) => {
    if (toolName.toLowerCase().includes('search')) {
      return <Search className="w-5 h-5 text-blue-500" />;
    }
    if (toolName.toLowerCase().includes('web')) {
      return <Globe className="w-5 h-5 text-green-500" />;
    }
    if (toolName.toLowerCase().includes('database')) {
      return <Database className="w-5 h-5 text-purple-500" />;
    }
    return <Code className="w-5 h-5 text-orange-500" />;
  };

  const toggleTool = (id: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === id ? { ...tool, enabled: !tool.enabled } : tool
    ));
  };

  const toggleAlwaysAllow = (id: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === id ? { ...tool, alwaysAllow: !tool.alwaysAllow } : tool
    ));
  };

  const removeTool = (id: string) => {
    setTools(prev => prev.filter(tool => tool.id !== id));
  };

  const addNewTool = () => {
    if (!newTool.name.trim()) return;
    
    const tool: MCPTool = {
      id: `custom_${Date.now()}`,
      name: newTool.name,
      description: newTool.description || 'Custom MCP tool',
      provider: newTool.provider || 'Custom',
      enabled: true,
      alwaysAllow: false
    };

    setTools(prev => [...prev, tool]);
    setNewTool({ name: '', description: '', provider: '', endpoint: '' });
    setShowAddTool(false);
  };

  const getPermissionStatus = (toolName: string) => {
    const permission = permissions[toolName];
    if (!permission) return null;
    
    if (permission.alwaysAllow) {
      return <CheckCircle className="w-4 h-4 text-green-500" title="Always Allowed" />;
    }
    if (permission.allowed) {
      return <Shield className="w-4 h-4 text-blue-500" title="Allowed Once" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" title="Denied" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              MCP Tools Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Model Context Protocol (MCP)</strong> allows AI models to use external tools like search engines, 
            databases, and APIs. Configure which tools are available and set permission preferences.
          </p>
        </div>

        {/* Available Tools */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Tools</h3>
            <button
              onClick={() => setShowAddTool(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tool</span>
            </button>
          </div>

          <div className="space-y-3">
            {tools.map((tool) => (
              <div key={tool.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getToolIcon(tool.name)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{tool.name}</h4>
                        {getPermissionStatus(tool.name)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Provider: {tool.provider}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tool.enabled}
                        onChange={() => toggleTool(tool.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
                    </label>
                    
                    {tool.enabled && (
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={tool.alwaysAllow}
                          onChange={() => toggleAlwaysAllow(tool.id)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Auto-allow</span>
                      </label>
                    )}
                    
                    {tool.id.startsWith('custom_') && (
                      <button
                        onClick={() => removeTool(tool.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Remove tool"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Tool Form */}
        {showAddTool && (
          <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Add Custom MCP Tool</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tool Name"
                value={newTool.name}
                onChange={(e) => setNewTool(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTool.description}
                onChange={(e) => setNewTool(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Provider"
                value={newTool.provider}
                onChange={(e) => setNewTool(prev => ({ ...prev, provider: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Endpoint URL (optional)"
                value={newTool.endpoint}
                onChange={(e) => setNewTool(prev => ({ ...prev, endpoint: e.target.value }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <div className="flex space-x-2">
                <button
                  onClick={addNewTool}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Tool
                </button>
                <button
                  onClick={() => setShowAddTool(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Management */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Permission Management</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Clear All Permissions</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reset all tool permissions to default</p>
              </div>
              <button
                onClick={onClearPermissions}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
