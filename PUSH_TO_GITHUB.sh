#!/bin/bash

# digit-opus-hub - Push to GitHub Script
# Usage: bash PUSH_TO_GITHUB.sh

echo "🚀 Pushing digit-opus-hub to GitHub..."
echo ""

# 添加远程仓库
echo "📍 Adding remote repository..."
git remote add origin https://github.com/kinpoe_ray/digit-opus-hub.git

# 检查远程仓库
echo "✓ Remote repository added"
git remote -v

echo ""
echo "📤 Pushing to GitHub..."

# 推送到 main 分支
git push -u origin main

echo ""
echo "✅ Done! Your repository is now live at:"
echo "👉 https://github.com/kinpoe_ray/digit-opus-hub"
echo ""
