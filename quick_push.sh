#!/bin/bash
echo "=== Quick Push to Hillbilly Repository ==="
echo ""
echo "This will push your code to the Hillbilly repository you just created."
echo ""
read -p "Enter your GitHub username: " username
echo ""
echo "Repository will be: https://github.com/${username}/Hillbilly"
echo ""
echo "You need a Personal Access Token (PAT) to push."
echo "If you don't have one:"
echo "1. Go to: https://github.com/settings/tokens/new"
echo "2. Name it: 'Hillbilly Push'"
echo "3. Select scope: 'repo'"
echo "4. Click 'Generate token' and copy it"
echo ""
read -sp "Enter your GitHub token (hidden): " token
echo ""
echo ""
echo "Setting up remote..."
git remote remove origin 2>/dev/null
git remote add origin https://${username}:${token}@github.com/${username}/Hillbilly.git
echo "Pushing all commits to GitHub..."
git push -u origin main --force
echo ""
echo "✅ If successful, view your repository at:"
echo "https://github.com/${username}/Hillbilly"
