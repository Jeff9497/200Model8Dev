'use client';

import { useState, useCallback } from 'react';
import { mcpClient } from '@/lib/mcpClient';

interface MCPTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  provider: string;
}

interface MCPPermission {
  allowed: boolean;
  alwaysAllow: boolean;
  timestamp: Date;
}

// Available working tools - simplified and clean
const availableTools: Record<string, MCPTool> = {
  'web_search': {
    name: 'Web Search',
    description: 'Search the web for current information, news, and resources using DuckDuckGo',
    parameters: {},
    provider: 'DuckDuckGo Direct API'
  },
  'code_docs': {
    name: 'Code Documentation',
    description: 'Get up-to-date library documentation to ensure current, working code',
    parameters: {},
    provider: 'Context7 MCP Server'
  }
};

export function useMCP() {
  const [pendingTool, setPendingTool] = useState<MCPTool | null>(null);
  const [showApproval, setShowApproval] = useState(false);
  const [permissions, setPermissions] = useState<Record<string, MCPPermission>>({});
  const [toolResults, setToolResults] = useState<Record<string, any>>({});

  const requestToolPermission = useCallback((toolName: string, parameters: Record<string, any>) => {
    return new Promise<boolean>((resolve) => {
      // Check if we already have permission
      const permission = permissions[toolName];
      if (permission?.alwaysAllow) {
        resolve(true);
        return;
      }

      // Get tool info
      const tool = availableTools[toolName];
      if (!tool) {
        console.error(`Unknown MCP tool: ${toolName}`);
        resolve(false);
        return;
      }

      // Set up the approval dialog
      setPendingTool({
        ...tool,
        parameters
      });
      setShowApproval(true);

      // Store the resolve function to call later
      (window as any).__mcpResolve = resolve;
    });
  }, [permissions]); // Removed availableTools since it's now a constant outside the component

  const handleApprove = useCallback(() => {
    setShowApproval(false);
    if (pendingTool) {
      setPermissions(prev => ({
        ...prev,
        [pendingTool.name]: {
          allowed: true,
          alwaysAllow: false,
          timestamp: new Date()
        }
      }));
    }
    setPendingTool(null);
    if ((window as any).__mcpResolve) {
      (window as any).__mcpResolve(true);
      delete (window as any).__mcpResolve;
    }
  }, [pendingTool]);

  const handleDeny = useCallback(() => {
    setShowApproval(false);
    if (pendingTool) {
      setPermissions(prev => ({
        ...prev,
        [pendingTool.name]: {
          allowed: false,
          alwaysAllow: false,
          timestamp: new Date()
        }
      }));
    }
    setPendingTool(null);
    if ((window as any).__mcpResolve) {
      (window as any).__mcpResolve(false);
      delete (window as any).__mcpResolve;
    }
  }, [pendingTool]);

  const handleAlwaysAllow = useCallback(() => {
    setShowApproval(false);
    if (pendingTool) {
      setPermissions(prev => ({
        ...prev,
        [pendingTool.name]: {
          allowed: true,
          alwaysAllow: true,
          timestamp: new Date()
        }
      }));
    }
    setPendingTool(null);
    if ((window as any).__mcpResolve) {
      (window as any).__mcpResolve(true);
      delete (window as any).__mcpResolve;
    }
  }, [pendingTool]);

  const executeTool = useCallback(async (toolName: string, parameters: Record<string, any>) => {
    // Request permission first
    const hasPermission = await requestToolPermission(toolName, parameters);
    if (!hasPermission) {
      throw new Error(`Permission denied for tool: ${toolName}`);
    }

    // Execute the tool using the real MCP client
    try {
      console.log(`Executing MCP tool: ${toolName}`, parameters);
      const result = await mcpClient.callTool(toolName, parameters);

      // Store result
      const resultId = `${toolName}_${Date.now()}`;
      setToolResults(prev => ({
        ...prev,
        [resultId]: result
      }));

      console.log(`MCP tool ${toolName} result:`, result);
      return result;
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      throw error;
    }
  }, [requestToolPermission]);



  const clearPermissions = useCallback(() => {
    setPermissions({});
  }, []);

  return {
    pendingTool,
    showApproval,
    permissions,
    toolResults,
    availableTools,
    executeTool,
    handleApprove,
    handleDeny,
    handleAlwaysAllow,
    clearPermissions
  };
}
