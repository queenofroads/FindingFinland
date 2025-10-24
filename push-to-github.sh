#!/bin/bash

echo "🚀 Finding Finland - GitHub Push Helper"
echo "======================================="
echo ""
echo "This script will help you push your code to GitHub."
echo ""

# Navigate to the project directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Check if git remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Git remote is already configured:"
    git remote get-url origin
else
    echo "❌ No git remote found. Adding origin..."
    git remote add origin https://github.com/queenofroads/FindingFinland.git
    echo "✅ Remote added!"
fi

echo ""
echo "📊 Current git status:"
git status --short

echo ""
echo "📝 Commits to push:"
git log origin/main..HEAD --oneline 2>/dev/null || git log --oneline -n 5

echo ""
echo "🔑 You'll need your GitHub credentials:"
echo "   Username: queenofroads"
echo "   Password: Use a Personal Access Token (NOT your password)"
echo ""
echo "   Get a token here: https://github.com/settings/tokens/new"
echo "   - Token name: FindingFinland"
echo "   - Expiration: 30 days (or longer)"
echo "   - Scope: Check 'repo'"
echo ""
read -p "Press ENTER when you have your token ready..."

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Your code is now on GitHub!"
    echo "🔗 View it at: https://github.com/queenofroads/FindingFinland"
    echo ""
    echo "🎉 Next steps:"
    echo "   1. Deploy to Vercel: https://vercel.com/new"
    echo "   2. Import your GitHub repo: queenofroads/FindingFinland"
    echo "   3. Add environment variables in Vercel:"
    echo "      - NEXT_PUBLIC_SUPABASE_URL"
    echo "      - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   4. Click Deploy!"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   • Wrong username or token"
    echo "   • Token doesn't have 'repo' scope"
    echo "   • Token has expired"
    echo ""
    echo "💡 Try again or create a new token at:"
    echo "   https://github.com/settings/tokens/new"
fi
