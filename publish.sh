#!/bin/bash

# MySQL MCP Server - Publication Script
# This script automates the process of publishing to npm

set -e

echo "🚀 MySQL MCP Server - Publication Process"
echo "=========================================="

# Check if we're logged into npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not logged into npm. Please run: npm login"
    exit 1
fi

echo "✅ NPM authentication verified"

# Clean and build
echo "🧹 Cleaning previous builds..."
npm run clean

echo "🔨 Building project..."
npm run build

# Run tests
echo "🧪 Running tests..."
npm test

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build and tests completed successfully"

# Show current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

# Ask for version bump type
echo ""
echo "Select version bump type:"
echo "1) patch (1.0.0 -> 1.0.1)"
echo "2) minor (1.0.0 -> 1.1.0)"
echo "3) major (1.0.0 -> 2.0.0)"
echo "4) custom version"
echo "5) skip version bump"

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "🔢 Bumping patch version..."
        npm version patch
        ;;
    2)
        echo "🔢 Bumping minor version..."
        npm version minor
        ;;
    3)
        echo "🔢 Bumping major version..."
        npm version major
        ;;
    4)
        read -p "Enter custom version: " custom_version
        echo "🔢 Setting version to $custom_version..."
        npm version $custom_version
        ;;
    5)
        echo "⏭️ Skipping version bump..."
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo "📦 New version: $NEW_VERSION"

# Show what will be published
echo ""
echo "📋 Files to be published:"
npm pack --dry-run

# Confirm publication
echo ""
read -p "🚀 Ready to publish to npm? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "🚀 Publishing to npm..."
    npm publish --access public
    
    echo ""
    echo "🎉 Successfully published @rolandohuber/mysql-mcp-server@$NEW_VERSION"
    echo ""
    echo "📖 Installation instructions:"
    echo "npm install @rolandohuber/mysql-mcp-server"
    echo ""
    echo "🔗 Package URL:"
    echo "https://www.npmjs.com/package/@rolandohuber/mysql-mcp-server"
    
    # Create git tag if version was bumped
    if [[ $choice != 5 ]]; then
        echo "🏷️ Creating git tag..."
        git tag "v$NEW_VERSION"
        echo "💾 Push tags with: git push origin --tags"
    fi
    
else
    echo "❌ Publication cancelled"
    exit 1
fi

echo ""
echo "✅ Publication process completed!"
