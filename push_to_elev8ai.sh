#!/bin/bash
echo "=== Push to Elev8Ai-15/Hillbilly-Fight-Wear ==="
echo ""
echo "Repository: https://github.com/Elev8Ai-15/Hillbilly-Fight-Wear"
echo ""
echo "You need authentication to push to this repository."
echo ""
echo "Option 1: Personal Access Token (Recommended)"
echo "  1. Go to: https://github.com/settings/tokens/new"
echo "  2. Name: 'Hillbilly Fight Wear Deploy'"
echo "  3. Expiration: Your choice"
echo "  4. Scopes: Check 'repo' (full control)"
echo "  5. Click 'Generate token'"
echo "  6. Copy the token (starts with ghp_)"
echo ""
echo "Option 2: Use your GitHub password (less secure)"
echo ""
read -p "Enter your GitHub username (likely 'Elev8Ai-15' or your personal account): " username
read -sp "Enter your GitHub token or password: " credential
echo ""
echo ""

# Remove old origin and add new one with credentials
git remote remove origin 2>/dev/null
git remote add origin https://${username}:${credential}@github.com/Elev8Ai-15/Hillbilly-Fight-Wear.git

echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Code pushed to:"
    echo "https://github.com/Elev8Ai-15/Hillbilly-Fight-Wear"
    echo ""
    echo "Your repository now contains:"
    echo "- Complete Hillbilly Fight Wear application"
    echo "- Build Your Own Fighter system"
    echo "- All 145+ graphics"
    echo "- Full git history"
else
    echo ""
    echo "❌ Push failed. Please check your credentials and try again."
    echo "Make sure you have push access to the Elev8Ai-15 organization."
fi
