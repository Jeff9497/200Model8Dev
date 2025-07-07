# 200Model8-Dev Setup Script for Windows
# This script helps set up the development environment

Write-Host "🚀 Setting up 200Model8-Dev..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is available
Write-Host "📦 Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please ensure npm is installed with Node.js" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
Write-Host ""
Write-Host "🔧 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.local" ".env.local.backup" -ErrorAction SilentlyContinue
    Write-Host "📝 Please add your Groq API key to .env.local:" -ForegroundColor Cyan
    Write-Host "   GROQ_API_KEY=your_groq_api_key_here" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Get your free Groq API key at: https://console.groq.com" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Add your Groq API key to .env.local" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "💡 Features:" -ForegroundColor Cyan
Write-Host "   • Unlimited Claude access via Puter.js" -ForegroundColor White
Write-Host "   • Multiple Groq models for variety" -ForegroundColor White
Write-Host "   • Smart rate limiting with fallbacks" -ForegroundColor White
Write-Host "   • Split-pane coding interface" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🚀⚡" -ForegroundColor Green
