# 🔑 Smithery MCP Setup Guide

## Current Status: Mock Mode ✅
The MCP integration is working with **mock data** for testing. To get **real search results**, follow the steps below.

## 🚀 Quick Test (Mock Mode)
1. Click the 🧪 TestTube icon in the header
2. Test Exa and Context7 servers
3. You'll see mock results with instructions

## 🔧 Enable Real MCP Servers

### Step 1: Create Smithery API Key
1. **Go to**: https://smithery.ai/account/api-keys
2. **Login/Register** with your account
3. **Click**: "Create API Key"
4. **Copy** the generated API key (starts with `smithery-`)

### Step 2: Add API Key to Environment
1. **Open**: `200Model8-Dev/model8-dev/.env`
2. **Add this line**:
   ```
   SMITHERY_API_KEY=your-smithery-api-key-here
   ```
3. **Replace** `your-smithery-api-key-here` with your actual API key
4. **Save** the file

### Step 3: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🎯 Test Real MCP Integration

### Test MCP Servers:
- Click 🧪 TestTube icon → Test servers
- Should now show real results instead of mock data

### Test AI Tool Usage:
Ask the AI:
- **"Search for trending topics in Kenya July 2025"**
- **"Find React tutorials"**
- **"What's happening in AI development?"**

## 🔍 Available MCP Servers

### 1. **Exa Search** 
- **Purpose**: Neural web search for current information
- **Endpoint**: `https://server.smithery.ai/exa/mcp`
- **Best for**: News, trends, recent developments

### 2. **Context7 Search**
- **Purpose**: Advanced context-aware search and analysis
- **Endpoint**: `https://server.smithery.ai/@upstash/context7-mcp/mcp`
- **Best for**: Complex analysis, research, insights

## 🛠️ How It Works

### Mock Mode (Current):
```
User Request → AI Analysis → Permission → Mock Response → Enhanced Answer
```

### Real Mode (With API Key):
```
User Request → AI Analysis → Permission → Smithery API → Real Results → Enhanced Answer
```

## 🔧 Troubleshooting

### Issue: Still getting mock responses
- **Check**: `.env` file has correct `SMITHERY_API_KEY`
- **Verify**: API key starts with `smithery-`
- **Restart**: Development server after adding key

### Issue: 401 Unauthorized
- **Check**: API key is valid and not expired
- **Verify**: Copied the full key without extra spaces
- **Try**: Creating a new API key

### Issue: Server not found
- **Check**: Server names are correct (`exa`, `@upstash/context7-mcp`)
- **Verify**: Endpoints are accessible

## 📊 Expected Results

### Mock Response Example:
```json
{
  "result": {
    "results": [
      {
        "title": "Kenya Trends July 2025 - Mock Result",
        "snippet": "This is a mock result for testing..."
      }
    ]
  },
  "mock": true,
  "note": "MOCK RESPONSE - Add SMITHERY_API_KEY to .env for real results"
}
```

### Real Response Example:
```json
{
  "result": {
    "results": [
      {
        "title": "Actual Kenya News Article",
        "url": "https://real-news-site.com/article",
        "snippet": "Real content from Exa search..."
      }
    ]
  },
  "real": true,
  "endpoint": "https://server.smithery.ai/exa/mcp"
}
```

## 🎉 Success Indicators

✅ **Mock Mode Working**: Test button shows mock results  
✅ **Real Mode Working**: Test button shows actual search results  
✅ **AI Integration**: AI can request and use MCP tools  
✅ **Permission Flow**: User approval dialog appears  
✅ **Enhanced Responses**: AI incorporates search results  

---

**Need Help?** Check the console logs for detailed error messages and authentication status.
