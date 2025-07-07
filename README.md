# 200Model8-Dev 🚀

An advanced AI chat interface with real-time web search capabilities and multiple AI model support.

## ✨ Features

- **Multiple AI Models**: Claude 3.5 Sonnet, Groq models (DeepSeek, Llama, etc.)
- **Real-time Web Search**: DuckDuckGo integration for current information
- **MCP Integration**: Model Context Protocol for enhanced capabilities
- **Responsive Design**: Works on desktop and mobile
- **Theme Support**: Light/dark/gradient themes
- **Message Management**: Edit, resend, copy responses
- **Code Preview**: Syntax highlighting for code blocks

## 🛠️ Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 200Model8-Dev/model8-dev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure API Keys**
   Edit `.env` and add your API keys:
   ```env
   # Required: Get from https://console.groq.com/keys
   GROQ_API_KEY=your_groq_api_key_here

   # Optional: For enhanced search capabilities
   SMITHERY_API_KEY=your_smithery_api_key_here
   SMITHERY_PROFILE=your_smithery_profile_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 API Keys

### Required
- **Groq API Key**: Free tier available at [console.groq.com](https://console.groq.com/keys)

### Optional
- **Smithery API Key**: For MCP server access at [smithery.ai](https://smithery.ai/)
- **Puter.js**: No API key needed - uses "User Pays" model for Claude access

## 🚀 Usage

1. **Select a Model**: Choose from Claude or Groq models in the dropdown
2. **Ask Questions**: Type your question and press Enter
3. **Web Search**: Ask about current events - the AI will automatically search
4. **Code Help**: Request code examples, documentation, or debugging help

## 🔧 Available Models

### Claude (via Puter.js)
- Claude 3.5 Sonnet
- Claude 3.7 Sonnet

### Groq (Free Tier)
- DeepSeek Chat V3
- Llama 3.1 8B Instant
- Llama 3.3 70B Versatile

## 📱 Mobile Support

The interface is fully responsive and optimized for mobile devices with:
- Touch-friendly controls
- Optimized input area
- Responsive layout

## 🎨 Themes

- **Default**: Blue gradient theme
- **Light**: Clean light theme
- **Dark**: Dark theme for low-light usage

## 🔍 Search Capabilities

The AI can automatically search the web when you ask about:
- Current news and events
- Recent developments
- Trending topics
- Real-time information

## 🛡️ Security

- API keys stored in environment variables
- No sensitive data in client-side code
- Secure API endpoints

## 📄 License

MIT License - feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
