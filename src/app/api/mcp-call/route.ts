import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

// Simple HTML parser for DuckDuckGo search results
function parseSearchResults(html: string, query: string): string {
  try {
    let results = `🔍 DuckDuckGo Web Search Results for "${query}":\n\n`;
    let resultCount = 0;

    // DuckDuckGo HTML uses specific patterns for search results
    const linkRegex = /<a[^>]*class="[^"]*result[^"]*"[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
    const textContentRegex = /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>(.*?)<\/a>/gi;
    const altLinkRegex = /<a[^>]*href="\/\/duckduckgo\.com\/l\/\?uddg=([^"]*)"[^>]*>(.*?)<\/a>/gi;
    const snippetRegex = /<span[^>]*class="[^"]*result__snippet[^"]*"[^>]*>(.*?)<\/span>/gi;

    const links: Array<{url: string, title: string}> = [];
    const textContent: string[] = [];

    let match;

    // Extract all links first
    while ((match = linkRegex.exec(html)) !== null && links.length < 10) {
      const url = match[1].trim();
      const title = match[2].replace(/<[^>]*>/g, '').trim();

      // Filter for actual search result links (not DuckDuckGo internal links)
      if (url && title &&
          url.startsWith('http') &&
          !url.includes('duckduckgo.com') &&
          !url.includes('javascript:') &&
          title.length > 5 &&
          title.length < 200) {
        links.push({ url, title });
      }
    }

    // Extract text content that might be snippets
    while ((match = textContentRegex.exec(html)) !== null && textContent.length < 10) {
      const text = match[1].replace(/<[^>]*>/g, '').trim();

      // Filter for meaningful text content
      if (text &&
          text.length > 20 &&
          text.length < 500 &&
          !text.includes('DuckDuckGo') &&
          !text.includes('Settings') &&
          !text.includes('Privacy') &&
          !text.match(/^\d+\.$/) && // Not just numbers
          !text.match(/^[^a-zA-Z]*$/)) { // Contains letters
        textContent.push(text);
      }
    }

    // Try alternative link patterns if we don't have enough results
    if (links.length < 3) {
      console.log('🔥 Trying alternative link patterns...');

      // Try DuckDuckGo redirect links
      while ((match = altLinkRegex.exec(html)) !== null && links.length < 8) {
        const encodedUrl = match[1].trim();
        const title = match[2].replace(/<[^>]*>/g, '').trim();

        try {
          const url = decodeURIComponent(encodedUrl);
          if (url && title && url.startsWith('http') && !url.includes('duckduckgo.com')) {
            links.push({ url, title });
          }
        } catch (e) {
          // Skip malformed URLs
        }
      }

      // Try broader link pattern
      if (links.length < 2) {
        const broadLinkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
        while ((match = broadLinkRegex.exec(html)) !== null && links.length < 8) {
          const url = match[1].trim();
          const title = match[2].replace(/<[^>]*>/g, '').trim();

          if (url && title &&
              url.startsWith('http') &&
              !url.includes('duckduckgo.com') &&
              !url.includes('javascript:') &&
              title.length > 10 &&
              title.length < 150) {
            links.push({ url, title });
          }
        }
      }
    }

    // Try snippet extraction with alternative patterns
    if (textContent.length < 3) {
      while ((match = snippetRegex.exec(html)) !== null && textContent.length < 8) {
        const text = match[1].replace(/<[^>]*>/g, '').trim();

        if (text && text.length > 20 && text.length < 500) {
          textContent.push(text);
        }
      }
    }

    // Format results if we found good links
    if (links.length > 0) {
      const maxResults = Math.min(links.length, 6);

      for (let i = 0; i < maxResults; i++) {
        resultCount++;
        results += `${resultCount}. **${links[i].title}**\n`;
        results += `   🔗 ${links[i].url}\n`;

        // Try to find a matching snippet from text content
        const matchingSnippet = textContent.find(text =>
          text.toLowerCase().includes(query.toLowerCase().split(' ')[0]) ||
          links[i].title.toLowerCase().includes(text.toLowerCase().split(' ')[0])
        );

        if (matchingSnippet) {
          results += `   📄 ${matchingSnippet}\n`;
        }
        results += '\n';
      }
    }

    // If no good links found, show any meaningful text content
    if (resultCount === 0 && textContent.length > 0) {
      results += `📋 **Found Information**:\n`;
      const maxText = Math.min(textContent.length, 4);

      for (let i = 0; i < maxText; i++) {
        resultCount++;
        results += `${resultCount}. ${textContent[i]}\n\n`;
      }
    }

    if (resultCount > 0) {
      results += `� Search performed: ${new Date().toLocaleString()}\n`;
      results += `📊 Source: DuckDuckGo HTML Search (${resultCount} results)`;
      return results;
    } else {
      return '';
    }
  } catch (error) {
    console.error('Error parsing search results:', error);
    return '';
  }
}

// Direct search function using real DuckDuckGo API
async function directDuckDuckGoSearch(parameters: any) {
  const query = parameters.query || parameters.q || 'test search';

  console.log('🔥 Starting real DuckDuckGo search for:', query);

  try {
    // Try multiple DuckDuckGo approaches for better results
    let searchResults = '';
    let source = 'duckduckgo-direct';

    try {
      // First try: HTML scraping for actual web search results
      console.log('🔥 Trying DuckDuckGo HTML search first...');
      const htmlResult = await callDuckDuckGoHTMLSearch(query);
      if (htmlResult && htmlResult.length > 100) {
        searchResults = htmlResult;
        source = 'duckduckgo-html';
        console.log('🔥 HTML search successful, got results');
      }
    } catch (htmlError) {
      console.log('🔥 HTML scraping failed, trying instant API...', htmlError);
    }

    // Second try: DuckDuckGo Instant Answer API as fallback
    if (!searchResults || searchResults.length < 100) {
      try {
        const instantResult = await callDuckDuckGoInstantAPI(query);
        if (instantResult && instantResult.length > 50) {
          searchResults = instantResult;
          source = 'duckduckgo-instant';
          console.log('🔥 Instant API provided fallback results');
        }
      } catch (instantError) {
        console.log('🔥 Instant API also failed:', instantError);
      }
    }

    // Fallback: If both methods fail, provide a helpful message
    if (!searchResults || searchResults.length < 50) {
      searchResults = `🔍 Search attempted for "${query}" but no detailed results were found.\n\n`;
      searchResults += `This could be because:\n`;
      searchResults += `• The query is very recent or specific\n`;
      searchResults += `• DuckDuckGo's API has limited data for this topic\n`;
      searchResults += `• Network connectivity issues\n\n`;
      searchResults += `💡 Try:\n`;
      searchResults += `• Using more general search terms\n`;
      searchResults += `• Rephrasing your query\n`;
      searchResults += `• Searching for related topics\n\n`;
      searchResults += `🕒 Search performed at: ${new Date().toLocaleString()}`;
      source = 'duckduckgo-fallback';
    }

    console.log('🔥 Real search results generated:', searchResults.substring(0, 200) + '...');

    return {
      query: query,
      result: {
        content: [{
          type: 'text',
          text: searchResults
        }]
      },
      source: source,
      timestamp: new Date().toISOString(),
      success: true,
      method: 'Real DuckDuckGo Search API'
    };
  } catch (error) {
    console.error('🔥 Real search failed:', error);
    throw new Error(`DuckDuckGo search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// DuckDuckGo Instant Answer API implementation
async function callDuckDuckGoInstantAPI(query: string): Promise<string> {
  try {
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': '200Model8-Dev/1.0 (Web Search Bot)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('🔥 DuckDuckGo API raw response:', JSON.stringify(data, null, 2));

    let searchResults = `🔍 DuckDuckGo Search Results for "${query}":\n\n`;
    let hasContent = false;

    // Add abstract if available
    if (data.Abstract) {
      searchResults += `� **Summary**: ${data.Abstract}\n`;
      if (data.AbstractSource) {
        searchResults += `   📖 Source: ${data.AbstractSource}\n`;
      }
      if (data.AbstractURL) {
        searchResults += `   🔗 URL: ${data.AbstractURL}\n`;
      }
      searchResults += '\n';
      hasContent = true;
    }

    // Add direct answer if available
    if (data.Answer) {
      searchResults += `� **Direct Answer**: ${data.Answer}\n`;
      if (data.AnswerType) {
        searchResults += `   📋 Type: ${data.AnswerType}\n`;
      }
      searchResults += '\n';
      hasContent = true;
    }

    // Add definition if available
    if (data.Definition) {
      searchResults += `📖 **Definition**: ${data.Definition}\n`;
      if (data.DefinitionSource) {
        searchResults += `   📚 Source: ${data.DefinitionSource}\n`;
      }
      if (data.DefinitionURL) {
        searchResults += `   🔗 URL: ${data.DefinitionURL}\n`;
      }
      searchResults += '\n';
      hasContent = true;
    }

    // Add related topics
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      searchResults += `� **Related Topics** (${Math.min(data.RelatedTopics.length, 5)} shown):\n`;
      data.RelatedTopics.slice(0, 5).forEach((topic: any, index: number) => {
        if (topic.Text) {
          searchResults += `${index + 1}. ${topic.Text}\n`;
          if (topic.FirstURL) {
            searchResults += `   🌐 ${topic.FirstURL}\n`;
          }
        }
      });
      searchResults += '\n';
      hasContent = true;
    }

    // Add infobox data if available
    if (data.Infobox && data.Infobox.content && data.Infobox.content.length > 0) {
      searchResults += `ℹ️ **Additional Information**:\n`;
      data.Infobox.content.slice(0, 5).forEach((item: any) => {
        if (item.label && item.value) {
          searchResults += `• **${item.label}**: ${item.value}\n`;
        }
      });
      searchResults += '\n';
      hasContent = true;
    }

    // If no meaningful content found, provide a more informative message
    if (!hasContent) {
      searchResults += `📋 **Search Status**: DuckDuckGo's instant answer API did not return specific results for "${query}".\n\n`;
      searchResults += `This could mean:\n`;
      searchResults += `• The query is very specific or recent\n`;
      searchResults += `• No instant answers are available for this topic\n`;
      searchResults += `• Try rephrasing the search query\n\n`;
      searchResults += `💡 **Suggestion**: The search was performed successfully, but instant answers may be limited for this topic.\n\n`;
    }

    searchResults += `🕒 Search performed: ${new Date().toLocaleString()}\n`;
    searchResults += `📊 Source: DuckDuckGo Instant Answer API`;

    return searchResults;
  } catch (error) {
    console.error('DuckDuckGo Instant API error:', error);
    throw error;
  }
}

// HTML-based DuckDuckGo search implementation
async function callDuckDuckGoHTMLSearch(query: string): Promise<string> {
  try {
    // Use DuckDuckGo's HTML version for actual search results
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    console.log('🔥 Trying DuckDuckGo HTML search:', searchUrl);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo HTML search returned ${response.status}`);
    }

    const html = await response.text();
    console.log('🔥 HTML response length:', html.length);

    const searchResults = parseSearchResults(html, query);

    if (searchResults && searchResults.length > 50) {
      console.log('🔥 HTML parsing successful, results length:', searchResults.length);
      return searchResults;
    } else {
      console.log('🔥 Falling back to DuckDuckGo instant answer API');
      throw new Error('No meaningful results found in HTML response');
    }
  } catch (error) {
    console.error('DuckDuckGo HTML search error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  console.log('🔥 MCP API POST endpoint called!');
  try {
    const { serverConfig, toolName, parameters } = await request.json();
    console.log('🔥 POST Request data:', { serverConfig, toolName, parameters });

    if (!serverConfig || !toolName || !parameters) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    console.log(`Calling MCP server: ${serverConfig.name}, tool: ${toolName}`, parameters);

    // Different strategies for different servers
    let result;

    if (serverConfig.name === 'duckduckgo') {
      // For DuckDuckGo, use direct API since MCP server is unreliable
      console.log('🔥 Using direct DuckDuckGo API (MCP server unreliable)...');
      console.log('🔥 DuckDuckGo search parameters:', parameters);
      result = await directDuckDuckGoSearch(parameters);
      console.log('🔥 DuckDuckGo search result:', result);
    } else {
      // For other servers (like Context7), use URL approach
      try {
        console.log('Attempting URL-based MCP call...');
        result = await callMCPServerViaURL(serverConfig, toolName, parameters);
      } catch (urlError) {
        console.log('URL approach failed, falling back to CLI approach...', urlError);
        result = await callMCPServerViaCLI(serverConfig, toolName, parameters);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('MCP call error:', error);
    return NextResponse.json(
      { error: 'MCP call failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// New URL-based approach using Smithery's profile system
async function callMCPServerViaURL(config: any, _toolName: string, parameters: any): Promise<any> {
  try {
    const sessionKey = process.env.SMITHERY_API_KEY;

    // Build the URL based on the server
    let serverUrl = '';
    let profileId = '';

    if (config.name === 'duckduckgo') {
      serverUrl = 'https://server.smithery.ai/@nickclyde/duckduckgo-mcp-server/mcp';
      profileId = process.env.SMITHERY_PROFILE || 'extreme-rooster-fpuQlq'; // Profile ID for DuckDuckGo
    } else if (config.name === 'context7-mcp') {
      serverUrl = 'https://server.smithery.ai/@upstash/context7-mcp/mcp';
      profileId = process.env.SMITHERY_PROFILE || 'extreme-rooster-fpuQlq'; // Same profile ID for Context7
    } else {
      throw new Error(`Unknown MCP server: ${config.name}`);
    }

    // Construct the full URL with profile and API key
    const fullUrl = `${serverUrl}?api_key=${sessionKey}&profile=${profileId}`;

    console.log(`Calling MCP via URL: ${fullUrl}`);

    // For DuckDuckGo, let's try to initialize the server with proper session setup
    if (config.name === 'duckduckgo') {
      console.log('Initializing DuckDuckGo server with session setup...');

      // Try to initialize the server session first
      const initRequest = {
        jsonrpc: '2.0',
        id: 0,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {
            roots: {
              listChanged: true
            },
            sampling: {}
          },
          clientInfo: {
            name: '200Model8-Dev',
            version: '1.0.0'
          }
        }
      };

      try {
        console.log('Sending initialization request...');
        const initResponse = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'User-Agent': '200Model8-Dev/1.0'
          },
          body: JSON.stringify(initRequest)
        });

        if (initResponse.ok) {
          const initText = await initResponse.text();
          console.log('DuckDuckGo server initialization response:', initText);

          // Wait a moment for initialization to complete
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log('Server initialization failed:', initResponse.status, await initResponse.text());
        }
      } catch (initError) {
        console.log('Server initialization error:', initError);
      }
    }

    // Get the list of available tools
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 0,
      method: 'tools/list'
    };

    console.log('Getting available tools...');
    const toolsResponse = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'User-Agent': '200Model8-Dev/1.0'
      },
      body: JSON.stringify(listToolsRequest)
    });

    if (toolsResponse.ok) {
      const toolsText = await toolsResponse.text();
      let toolsResult;
      try {
        toolsResult = JSON.parse(toolsText);
      } catch {
        // Parse SSE format
        const lines = toolsText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            toolsResult = JSON.parse(line.substring(6));
            break;
          }
        }
      }
      console.log('Available tools:', JSON.stringify(toolsResult, null, 2));

      // For DuckDuckGo, let's verify the search tool is available
      if (config.name === 'duckduckgo' && toolsResult?.result?.tools) {
        const searchTool = toolsResult.result.tools.find((tool: any) => tool.name === 'search');
        if (searchTool) {
          console.log('DuckDuckGo search tool confirmed available');
        } else {
          console.log('Available DuckDuckGo tools:', toolsResult.result.tools.map((t: any) => t.name));
        }
      }
    } else {
      console.log('Failed to get tools list:', toolsResponse.status, await toolsResponse.text());
    }

    // Determine the correct tool name and parameters based on the server
    let actualToolName = 'search';
    let toolParameters = parameters;

    if (config.name === 'duckduckgo') {
      actualToolName = 'search';
      // Use the exact parameter format that works in playground
      toolParameters = {
        query: parameters.query || parameters.q || 'test search',
        max_results: parameters.max_results || 5
      };
    } else if (config.name === 'context7-mcp') {
      // Context7 is for up-to-date library documentation
      // For testing, let's resolve a popular library like Next.js
      actualToolName = 'resolve-library-id';
      toolParameters = {
        libraryName: parameters.query || parameters.libraryName || 'next.js' // Test with Next.js
      };
    }

    // Prepare the MCP request
    const mcpRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: actualToolName,
        arguments: toolParameters
      }
    };

    console.log('MCP URL Request:', JSON.stringify(mcpRequest, null, 2));

    // For DuckDuckGo, add a longer delay to ensure server is ready after initialization
    if (config.name === 'duckduckgo') {
      console.log('Waiting for DuckDuckGo server to be ready after initialization...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay after init
    }

    // Make the HTTP call to the Smithery URL endpoint
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'User-Agent': '200Model8-Dev/1.0'
      },
      body: JSON.stringify(mcpRequest)
    });

    console.log(`MCP URL Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MCP URL Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    // Handle both JSON and Server-Sent Events (SSE) responses
    const responseText = await response.text();
    console.log('Raw MCP URL response:', responseText);

    let result;
    try {
      // Try to parse as JSON first
      result = JSON.parse(responseText);
    } catch (jsonError) {
      // If JSON parsing fails, try to parse as SSE format
      console.log('Response is not JSON, trying SSE format...');

      // Parse SSE format: "event: message\ndata: {...}\n\n"
      const lines = responseText.split('\n');
      let jsonData = '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          jsonData = line.substring(6); // Remove "data: " prefix
          break;
        }
      }

      if (jsonData) {
        try {
          result = JSON.parse(jsonData);
          console.log('Successfully parsed SSE data:', JSON.stringify(result, null, 2));
        } catch (sseError) {
          console.error('Failed to parse SSE data:', sseError);
          throw new Error(`Failed to parse SSE response: ${jsonData}`);
        }
      } else {
        console.error('No data found in SSE response');
        throw new Error(`Invalid SSE format: ${responseText}`);
      }
    }

    console.log('Parsed MCP URL response:', JSON.stringify(result, null, 2));

    return {
      query: parameters.query || parameters.q || toolParameters.libraryName || 'search',
      result: result.result || result,
      source: config.name,
      timestamp: new Date().toISOString(),
      success: true,
      method: 'Smithery URL + Profile',
      endpoint: fullUrl,
      toolUsed: actualToolName,
      raw: result
    };

  } catch (error) {
    console.error('MCP URL call error:', error);
    throw error;
  }
}

// Fallback CLI approach
async function callMCPServerViaCLI(config: any, _toolName: string, parameters: any): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const sessionKey = process.env.SMITHERY_API_KEY || '630549ea-6969-49d3-b8ce-24abdba021f0';
      let serverName = '';

      if (config.name === 'duckduckgo') {
        serverName = '@nickclyde/duckduckgo-mcp-server';
      } else if (config.name === 'context7-mcp') {
        serverName = '@upstash/context7-mcp';
      } else {
        throw new Error(`Unknown MCP server: ${config.name}`);
      }

      console.log(`Starting Smithery CLI for server: ${serverName}`);

      // Start the CLI process with STDIN communication
      const child = spawn('cmd', [
        '/c',
        'npx',
        '-y',
        '@smithery/cli@latest',
        'run',
        serverName,
        '--key',
        sessionKey
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false
      });

      let stdout = '';
      let stderr = '';
      let connectionEstablished = false;
      let responseReceived = false;

      // Determine the correct tool name and parameters based on the server
      let actualToolName = 'search';
      let toolArguments = parameters;

      if (config.name === 'duckduckgo') {
        actualToolName = 'search';
        // Format parameters for DuckDuckGo as shown in playground
        toolArguments = {
          query: parameters.query || parameters.q || 'test search',
          max_results: parameters.max_results || 5
        };
      } else if (config.name === 'context7-mcp') {
        actualToolName = 'search';
      }

      // Prepare the MCP request
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: actualToolName,
          arguments: toolArguments
        }
      };

      // Collect stdout for MCP responses
      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        console.log('CLI stdout:', output);

        // Try to parse JSON responses from stdout
        try {
          const lines = output.split('\n');
          for (const line of lines) {
            if (line.trim() && line.includes('"jsonrpc"')) {
              const response = JSON.parse(line.trim());
              if (response.id === 1 && !responseReceived) {
                responseReceived = true;
                console.log('Received MCP response:', response);

                // Clean up the CLI process
                if (!child.killed) {
                  child.kill('SIGTERM');
                }

                resolve({
                  query: toolArguments.query || parameters.query || parameters.q || 'search',
                  result: response.result || response,
                  source: config.name,
                  timestamp: new Date().toISOString(),
                  success: true,
                  method: 'CLI STDIN/STDOUT',
                  raw: response
                });
                return;
              }
            }
          }
        } catch (parseError) {
          // Not JSON, continue collecting output
        }
      });

      // Monitor stderr for connection status
      child.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        console.log('CLI stderr:', output);

        // Check if connection is established (multiple possible indicators)
        const connectionIndicators = [
          'connection established',
          'Connected to',
          'Server connected',
          'Ready to receive requests',
          'DuckDuckGo Search Server', // Specific to DuckDuckGo
          'Streamable HTTP connection established'
        ];

        const isConnected = connectionIndicators.some(indicator =>
          output.toLowerCase().includes(indicator.toLowerCase())
        );

        if (isConnected && !connectionEstablished) {
          connectionEstablished = true;
          console.log('Connection established, sending MCP request...');

          // Wait a moment for the connection to stabilize
          setTimeout(() => {
            // Send the MCP request via STDIN
            const requestString = JSON.stringify(mcpRequest) + '\n';
            console.log('Sending MCP request:', requestString.trim());
            try {
              child.stdin.write(requestString);
            } catch (writeError) {
              console.error('Failed to write to STDIN:', writeError);
              reject(new Error('Failed to send request to CLI process'));
            }
          }, 500); // 500ms delay
        }
      });

      // Handle process completion
      child.on('close', (code) => {
        console.log(`CLI process closed with code: ${code}`);
        if (!responseReceived) {
          reject(new Error('No response received from MCP server'));
        }
      });

      // Handle process errors
      child.on('error', (error) => {
        console.error('CLI process error:', error);
        reject(new Error('CLI process error: ' + error.message));
      });

      // Set a timeout
      setTimeout(() => {
        if (!child.killed) {
          console.log('CLI process timeout, killing...');
          child.kill('SIGTERM');
          reject(new Error('CLI process timeout'));
        }
      }, 30000); // 30 second timeout

    } catch (error) {
      console.error('Error setting up CLI call:', error);
      reject(error);
    }
  });
}



// Alternative method for testing MCP servers
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const test = searchParams.get('test');
  
  if (test === 'duckduckgo') {
    try {
      // Use direct DuckDuckGo API since MCP server is unreliable
      const query = url.searchParams.get('query') || 'test search';
      console.log(`Testing DuckDuckGo with direct API for query: "${query}"`);
      const result = await directDuckDuckGoSearch({ query });

      return NextResponse.json({ success: true, result });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  if (test === 'context7') {
    try {
      // Try URL approach first, then CLI
      let result;
      try {
        console.log('Testing Context7 with URL approach...');
        result = await callMCPServerViaURL({
          name: 'context7-mcp'
        }, 'search', { query: 'test search' });
      } catch (urlError) {
        console.log('Context7 URL failed, trying CLI...', urlError);
        result = await callMCPServerViaCLI({
          name: 'context7-mcp'
        }, 'search', { query: 'test search' });
      }

      return NextResponse.json({ success: true, result });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return NextResponse.json({ 
    message: 'MCP Test Endpoint', 
    usage: 'Add ?test=exa or ?test=context7 to test MCP servers' 
  });
}
