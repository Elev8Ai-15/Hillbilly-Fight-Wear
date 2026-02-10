#!/bin/bash
echo "Enter your GitHub credentials to push to Elev8Ai-15/Hillbilly-Fight-Wear"
read -p "GitHub username: " username
read -sp "GitHub password/token: " password
echo

# Set credentials for this push
git config --global credential.helper store
echo "https://${username}:${password}@github.com" > ~/.git-credentials

echo "Pushing to GitHub..."
git push -u origin main

# Clear stored credentials for security
rm ~/.git-credentials 2>/dev/null
git config --global --unset credential.helper 2>/dev/null

echo "Push complete!"
