'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
}

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [codePreview, setCodePreview] = useState<CodeBlock | null>(null);
  // Use useRef to persist MCP executor across Fast Refresh
  const mcpExecutorRef = useRef<((toolName: string, params: any) => Promise<any>) | null>(null);
  const [mcpExecutor, setMcpExecutor] = useState<((toolName: string, params: any) => Promise<any>) | null>(null);

  // Debug MCP executor changes
  useEffect(() => {
    console.log('🔥 MCP Executor state changed:', { mcpExecutor: !!mcpExecutor, ref: !!mcpExecutorRef.current });
  }, [mcpExecutor]);

  // Enhanced system prompt that tells the AI about available tools
  const createSystemPrompt = (userContent: string): string => {
    return `You are an advanced AI assistant with access to external tools for enhanced capabilities.

AVAILABLE TOOLS:
1. web_search - Fast web search for finding current information, news, trends, and developments using DuckDuckGo
2. code_docs - Get up-to-date library documentation to ensure current, working code using Context7
3. github_search - Search GitHub repositories, code examples, and open source projects

TOOL USAGE GUIDELINES:
- Use web_search for: current events, news, trends, recent developments, real-time information
- Use code_docs for: library documentation, API references, ensuring up-to-date code examples
- Use github_search for: code examples, repositories, open source projects

CRITICAL INSTRUCTIONS:
1. ALWAYS use web_search when users ask about current events, news, trends, or any time-sensitive information
2. When you receive search results from tools, ALWAYS use them to provide a comprehensive answer
3. Do NOT refuse to use search results based on date concerns - the search engine provides the most current available information
4. Present search results in a clear, organized format with proper formatting
5. If search results seem limited, still present what was found and acknowledge the limitations

If you determine that external tools would help provide a better answer, respond with:
TOOL_REQUEST: [tool_name] | [search_query]

Examples:
- "What are trending topics in Kenya?" → "TOOL_REQUEST: web_search | trending topics Kenya current"
- "Find React tutorials" → "TOOL_REQUEST: web_search | React tutorials 2024"
- "Search for TypeScript repositories" → "TOOL_REQUEST: github_search | TypeScript"
- "Get Next.js documentation" → "TOOL_REQUEST: code_docs | Next.js"

User request: ${userContent}

Respond normally, but if you need external information, start your response with the TOOL_REQUEST format above.`;
  };

  // Check if AI wants to use tools
  const checkForToolRequest = (aiResponse: string): { toolName: string; query: string } | null => {
    // Check for both formats:
    // 1. "TOOL_REQUEST: tool_name | query" (preferred format)
    // 2. "tool_name | query" (what AI is actually using)

    let toolRequestMatch = aiResponse.match(/TOOL_REQUEST:\s*([^|]+)\s*\|\s*(.+)/);
    if (toolRequestMatch) {
      return {
        toolName: toolRequestMatch[1].trim(),
        query: toolRequestMatch[2].trim()
      };
    }

    // Check for the format AI is actually using: "web_search | query"
    toolRequestMatch = aiResponse.match(/^(web_search|code_docs|github_search|exa_search|context7_search)\s*\|\s*(.+)/m);
    if (toolRequestMatch) {
      return {
        toolName: toolRequestMatch[1].trim(),
        query: toolRequestMatch[2].trim()
      };
    }

    return null;
  };

  const sendMessage = useCallback(async (content: string, modelId: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let response: string;

      // First, get AI response with tool awareness
      const systemPrompt = createSystemPrompt(content);

      if (modelId.includes('claude')) {
        response = await callPuterAPI(systemPrompt, modelId);
      } else {
        response = await callGroqAPI(systemPrompt, modelId);
      }

      // Check if AI wants to use tools
      console.log('AI Response:', response);
      const toolRequest = checkForToolRequest(response);
      console.log('Tool Request Detected:', toolRequest);

      // Use ref as fallback if state is null (due to Fast Refresh)
      const executor = mcpExecutor || mcpExecutorRef.current;
      console.log('MCP Executor Available:', !!executor, { state: !!mcpExecutor, ref: !!mcpExecutorRef.current });

      if (toolRequest && executor) {
        try {
          console.log(`AI requested tool: ${toolRequest.toolName} with query: ${toolRequest.query}`);

          // Execute the tool
          const toolResults = await executor(toolRequest.toolName, { query: toolRequest.query });
          console.log('Tool results:', toolResults);

          // Get enhanced response with tool results
          const enhancedPrompt = `${content}

SEARCH RESULTS FOUND:
${JSON.stringify(toolResults, null, 2)}

INSTRUCTIONS:
- Use the search results above to provide a comprehensive, detailed answer
- Present the information in a clear, well-organized format
- Include specific details, links, and sources from the search results
- Do not refuse to use the results based on date concerns - present what was found
- If results are limited, acknowledge this but still present available information
- Format your response with proper headings, bullet points, and structure for readability

Please provide your answer now using the search results above:`;

          console.log('🔥 Enhanced prompt created:', enhancedPrompt.substring(0, 200) + '...');
          console.log('🔥 Calling AI with enhanced prompt, model:', modelId);

          if (modelId.includes('claude')) {
            response = await callPuterAPI(enhancedPrompt, modelId);
          } else {
            response = await callGroqAPI(enhancedPrompt, modelId);
          }

          console.log('🔥 Enhanced response received:', response.substring(0, 200) + '...');
        } catch (error) {
          console.log('Tool usage cancelled or failed:', error);
          // Remove the tool request from the response if tool failed
          response = response.replace(/TOOL_REQUEST:.*?\n?/, '').trim();
        }
      } else {
        // Remove any tool request format from the response
        response = response.replace(/TOOL_REQUEST:.*?\n?/, '').trim();
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        model: modelId,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Extract code blocks for preview
      const codeBlock = extractCodeBlock(response);
      if (codeBlock) {
        setCodePreview(codeBlock);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        model: modelId,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const callPuterAPI = async (content: string, modelId: string): Promise<string> => {
    // Check if Puter.js is loaded
    if (typeof window === 'undefined' || !(window as any).puter) {
      throw new Error('Puter.js is not loaded. Please refresh the page.');
    }

    const puter = (window as any).puter;
    
    try {
      // Map our model IDs to Puter.js model names
      const puterModelMap: Record<string, string> = {
        'claude-3-5-sonnet': 'claude-3-5-sonnet',
        'claude-3-7-sonnet': 'claude-3-7-sonnet'
      };

      const puterModel = puterModelMap[modelId] || 'claude-3-5-sonnet';

      const response = await puter.ai.chat(content, {
        model: puterModel,
        stream: false
      });

      return response.message?.content?.[0]?.text || response.text || 'No response received';
    } catch (error) {
      console.error('Puter API error:', error);
      throw new Error('Failed to get response from Claude. Please try again.');
    }
  };

  const callGroqAPI = async (content: string, modelId: string): Promise<string> => {
    try {
      const response = await fetch('/api/groq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          model: modelId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || 'No response received';
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to get response from Groq. Please check your API key and try again.');
    }
  };

  const extractCodeBlock = (content: string): CodeBlock | null => {
    // Extract the first code block from the response
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/;
    const match = content.match(codeBlockRegex);
    
    if (match) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      // Try to extract filename from context
      const filenameRegex = /(?:file|filename|save as|create):\s*([^\s\n]+\.\w+)/i;
      const filenameMatch = content.match(filenameRegex);
      
      return {
        language,
        code,
        filename: filenameMatch?.[1],
        description: `Generated ${language} code`
      };
    }
    
    return null;
  };

  const clearChat = useCallback(() => {
    setMessages([]);
    setCodePreview(null);
  }, []);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    ));
  }, []);

  const setMcpExecutorFunction = useCallback((executor: (toolName: string, params: any) => Promise<any>) => {
    console.log('🔥 useChat: Setting MCP executor', { executor: !!executor });
    mcpExecutorRef.current = executor;  // Store in ref (persists across Fast Refresh)
    setMcpExecutor(() => executor);     // Store in state (for reactivity)
  }, []);

  return {
    messages,
    isLoading,
    codePreview,
    sendMessage,
    clearChat,
    editMessage,
    setMcpExecutorFunction
  };
}
