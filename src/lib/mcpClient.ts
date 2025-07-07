'use client';

// MCP Client for calling real MCP servers via Smithery CLI
export class MCPClient {
  private servers: Map<string, any> = new Map();

  constructor() {
    // Initialize MCP servers configuration
    this.initializeServers();
  }

  private initializeServers() {
    // Context7 MCP Server configuration (working)
    const context7Config = {
      name: 'context7-mcp',
      command: 'cmd',
      args: [
        '/c',
        'npx',
        '-y',
        '@smithery/cli@latest',
        'run',
        '@upstash/context7-mcp',
        '--key',
        '630549ea-6969-49d3-b8ce-24abdba021f0'
      ],
      tools: ['code_docs']
    };

    this.servers.set('context7', context7Config);
    // Removed Exa server - using direct DuckDuckGo API instead
  }

  async callTool(toolName: string, parameters: Record<string, any>): Promise<any> {
    console.log(`Calling tool: ${toolName}`, parameters);

    switch (toolName) {
      case 'web_search':
        return await this.callDirectDuckDuckGo(parameters as { query: string });
      case 'code_docs':
        return await this.callMCPServer('context7', 'resolve-library-id', parameters);
      case 'github_search':
        return await this.callGitHubAPI(parameters as { query: string });
      // Legacy support for old tool names (redirect to new ones)
      case 'exa_search':
        console.log('Redirecting exa_search to web_search');
        return await this.callDirectDuckDuckGo(parameters as { query: string });
      case 'context7_search':
        console.log('Redirecting context7_search to code_docs');
        return await this.callMCPServer('context7', 'resolve-library-id', parameters);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private async callMCPServer(serverName: string, toolName: string, parameters: Record<string, any>): Promise<any> {
    const serverConfig = this.servers.get(serverName);
    if (!serverConfig) {
      throw new Error(`MCP server ${serverName} not configured`);
    }

    try {
      // Call the MCP server via API endpoint
      const response = await fetch('/api/mcp-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverConfig,
          toolName,
          parameters
        }),
      });

      if (!response.ok) {
        throw new Error(`MCP call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`MCP server ${serverName} error:`, error);
      throw error;
    }
  }

  private async callDirectDuckDuckGo(params: { query: string }): Promise<any> {
    try {
      // Call our direct DuckDuckGo API endpoint with the query
      const response = await fetch('/api/mcp-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          serverConfig: { name: 'duckduckgo' },
          toolName: 'search',
          parameters: { query: params.query }
        })
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Return the result directly (our API already formats it correctly)
      return data;
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      throw error;
    }
  }

  private async callGitHubAPI(params: { query: string }): Promise<any> {
    try {
      // Use GitHub's public API directly
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(params.query)}&sort=stars&order=desc&per_page=5`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': '200Model8-Dev'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        query: params.query,
        repositories: data.items?.map((repo: any) => ({
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description || 'No description available',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          url: repo.html_url,
          createdAt: repo.created_at,
          updatedAt: repo.updated_at,
          topics: repo.topics || []
        })) || [],
        totalCount: data.total_count || 0,
        source: 'github-api',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // Get available tools
  getAvailableTools(): string[] {
    return ['web_search', 'code_docs', 'github_search'];
  }

  // Check if a tool is available
  isToolAvailable(toolName: string): boolean {
    return this.getAvailableTools().includes(toolName);
  }
}

// Singleton instance
export const mcpClient = new MCPClient();
