#!/bin/bash
# Render Build Script for igv-site
# Force clean build to deploy latest version

echo "🔨 Starting clean build..."
echo "📁 Working directory: $(pwd)"

# Clean previous build artifacts
echo "🗑️  Removing old build cache..."
rm -rf node_modules
rm -rf build
rm -rf .cache

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit

# Build React app
echo "🏗️  Building React application..."
npm run build

# Verify build output
if [ -f "build/index.html" ]; then
    echo "✅ Build successful! build/index.html exists"
    BUILD_HASH=$(grep -oP 'main\.\K\w+(?=\.js)' build/index.html | head -1)
    echo "📦 Build hash: $BUILD_HASH"
else
    echo "❌ Build failed! build/index.html not found"
    exit 1
fi

echo "🎉 Build completed successfully!"
