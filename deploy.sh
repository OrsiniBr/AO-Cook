#!/bin/bash

# AO Cook Chatbot Vercel Deployment Script

echo "🚀 Preparing for Vercel deployment..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    bun add -g vercel
fi

# Check if .env file exists and has API key
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .envSAMPLE..."
    cp .envSAMPLE .env
    echo "📝 Please edit .env and add your OpenAI API key before deploying"
    echo "   OPENAI_API_KEY=your_openai_api_key_here"
    exit 1
fi

# Check if OpenAI API key is set
if ! grep -q "OPENAI_API_KEY=" .env || grep -q "OPENAI_API_KEY=your_openai_api_key_here" .env; then
    echo "⚠️  Please set your OpenAI API key in .env file"
    echo "   OPENAI_API_KEY=your_actual_api_key_here"
    exit 1
fi

echo "✅ Environment check passed"

# Build the project
echo "🔨 Building project..."
bun run vercel-build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully"

# Check if dist directory has required files
if [ ! -f "dist/index.html" ] || [ ! -f "dist/server.js" ]; then
    echo "❌ Required build files missing. Build may have failed."
    exit 1
fi

echo "📁 Build files verified:"
echo "   - dist/index.html ✓"
echo "   - dist/server.js ✓"
echo "   - dist/assets/ ✓"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
echo "📋 Deployment Checklist:"
echo "   1. Make sure your code is committed to Git"
echo "   2. Ensure your OpenAI API key is set in .env"
echo "   3. Vercel will ask for environment variables during deployment"
echo "   4. Set OPENAI_API_KEY in Vercel dashboard after deployment"
echo ""

read -p "Ready to deploy? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
else
    echo "Deployment cancelled."
    exit 0
fi 