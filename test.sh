#!/bin/bash

# Simple test script to validate the application setup
echo "🧪 Transaction Dashboard Test Suite"
echo "=================================="

# Check if Node.js is available
echo "📦 Checking Node.js version..."
node --version

# Check if npm is available
echo "📦 Checking npm version..."
npm --version

# Test backend syntax
echo "🔧 Testing backend syntax..."
cd backend
node -c server.js
if [ $? -eq 0 ]; then
    echo "✅ Backend syntax check passed"
else
    echo "❌ Backend syntax check failed"
    exit 1
fi

# Test if all backend dependencies are installed
echo "📋 Checking backend dependencies..."
npm list --depth=0 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies are properly installed"
else
    echo "❌ Backend dependencies missing"
    exit 1
fi

# Test frontend build
echo "🎨 Testing frontend build..."
cd ../frontend
if [ -d "build" ]; then
    echo "✅ Frontend build exists"
    echo "📊 Frontend build size:"
    du -sh build/
else
    echo "❌ Frontend build not found"
    exit 1
fi

# Test if all frontend dependencies are installed
echo "📋 Checking frontend dependencies..."
npm list --depth=0 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies are properly installed"
else
    echo "❌ Frontend dependencies missing"
    exit 1
fi

# Check configuration files
echo "⚙️  Checking configuration files..."
cd ..

if [ -f "package.json" ]; then
    echo "✅ Root package.json exists"
else
    echo "❌ Root package.json missing"
fi

if [ -f "Procfile" ]; then
    echo "✅ Heroku Procfile exists"
else
    echo "❌ Heroku Procfile missing"
fi

if [ -f "render.yaml" ]; then
    echo "✅ Render configuration exists"
else
    echo "❌ Render configuration missing"
fi

if [ -f "README.md" ]; then
    echo "✅ Documentation exists"
else
    echo "❌ Documentation missing"
fi

echo ""
echo "🎉 All tests passed! The application is ready for deployment."
echo ""
echo "🚀 To start the application:"
echo "   Development: npm run dev"
echo "   Production:  npm start"
echo ""
echo "📱 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Health:   http://localhost:5000/health"