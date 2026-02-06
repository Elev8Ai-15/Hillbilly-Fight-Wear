#!/bin/bash
echo "=== GitHub Manual Push Helper ==="
echo ""
echo "To push your code to GitHub, you need a Personal Access Token (PAT)."
echo ""
echo "Steps:"
echo "1. Go to: https://github.com/settings/tokens/new"
echo "2. Create a token with 'repo' scope"
echo "3. Copy the token (starts with ghp_)"
echo ""
read -p "Enter your GitHub username: " username
read -sp "Enter your GitHub Personal Access Token: " token
echo ""
read -p "Enter repository name (default: hillbilly-fight-wear): " reponame
reponame=${reponame:-hillbilly-fight-wear}

echo ""
echo "Adding remote origin..."
git remote remove origin 2>/dev/null
git remote add origin https://${username}:${token}@github.com/${username}/${reponame}.git

echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "If successful, your repository will be at:"
echo "https://github.com/${username}/${reponame}"

