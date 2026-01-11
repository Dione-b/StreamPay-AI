#!/bin/bash

# StreamPay Frontend - Vercel Deployment Setup Script
# This script configures and deploys the frontend to Vercel for mainnet

set -e

echo "🚀 StreamPay Frontend - Vercel Deployment Setup"
echo "================================================\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Step 1: Authentication
echo "🔑 Step 1: Vercel Authentication"
echo "Please login to your Vercel account..."
vercel login

# Step 2: Project Setup
echo "\n📁 Step 2: Vercel Project Setup"
echo "Setting up your project in Vercel..."

read -p "Is this a new project or linking to existing? (new/existing) [new]: " project_type
project_type=${project_type:-new}

if [ "$project_type" = "new" ]; then
    vercel --prod
else
    read -p "Enter your VERCEL_PROJECT_ID: " project_id
    read -p "Enter your VERCEL_ORG_ID: " org_id
    export VERCEL_PROJECT_ID=$project_id
    export VERCEL_ORG_ID=$org_id
fi

# Step 3: Environment Variables
echo "\n🔐 Step 3: Configure Environment Variables"
echo "Select network for environment:"
echo "1) Polygon Mainnet (Production)"
echo "2) Sepolia Testnet (Development)"
read -p "Choice [1]: " network_choice
network_choice=${network_choice:-1}

if [ "$network_choice" = "1" ]; then
    echo "🌐 Configuring for Polygon Mainnet..."
    CHAIN_ID=137
    BACKEND_URL="https://api.streampay.io"  # Update with your mainnet backend
    STREAM_PAY_CORE="0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD"
    LIQUIDITY_POOL="0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c"
    POOL_MANAGER="0xae185cA95D0b626a554b0612777350CE3DE06bB9"
    SWAP_ROUTER="0x07AfFa6C58999Ac0c98237d10476983A573eD368"
    TOKEN_ADDRESS="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
else
    echo "🧪 Configuring for Sepolia Testnet..."
    CHAIN_ID=11155111
    BACKEND_URL="http://localhost:3001"  # Update with your testnet backend
    STREAM_PAY_CORE="0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C"
    LIQUIDITY_POOL="0x896171C52d49Ff2e94300FF9c9B2164aC62F0Edd"
    POOL_MANAGER="0x0F71393348E7b021E64e7787956fB1e7682AB4A8"
    SWAP_ROUTER="0x9f3d42feC59d6742CC8dC096265Aa27340C1446F"
    TOKEN_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
fi

read -p "Enter WalletConnect Project ID: " wallet_connect_id

echo "\n📝 Setting environment variables in Vercel..."
vercel env add NEXT_PUBLIC_CHAIN_ID
echo $CHAIN_ID
vercel env add NEXT_PUBLIC_BACKEND_URL
echo $BACKEND_URL
vercel env add NEXT_PUBLIC_ELIZA_URL
echo "${BACKEND_URL//api/agent}"  # Replace 'api' with 'agent' if applicable
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
echo $wallet_connect_id
vercel env add NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS
echo $STREAM_PAY_CORE
vercel env add NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS
echo $LIQUIDITY_POOL
vercel env add NEXT_PUBLIC_POOL_MANAGER_ADDRESS
echo $POOL_MANAGER
vercel env add NEXT_PUBLIC_SWAP_ROUTER_ADDRESS
echo $SWAP_ROUTER
vercel env add NEXT_PUBLIC_TOKEN_ADDRESS
echo $TOKEN_ADDRESS

# Step 4: GitHub Actions Setup
echo "\n🤖 Step 4: GitHub Actions Setup"
echo "Adding deployment secrets to GitHub..."

read -p "Enter your GitHub token (for Actions): " github_token
read -p "Enter your Vercel token: " vercel_token

echo "📌 You need to add these secrets manually to GitHub:"
echo "   Repository → Settings → Secrets and variables → Actions"
echo "   Add:"
echo "   - VERCEL_TOKEN=$vercel_token"
echo "   - VERCEL_ORG_ID=<your-org-id>"
echo "   - VERCEL_PROJECT_ID=<your-project-id>"

# Step 5: Deploy
echo "\n🚀 Step 5: Initial Deploy"
read -p "Deploy to production now? (y/n) [y]: " deploy_now
deploy_now=${deploy_now:-y}

if [ "$deploy_now" = "y" ]; then
    echo "Deploying to Vercel production..."
    vercel --prod
    echo "\n✅ Deployment complete!"
    echo "🌐 Visit your deployment at: https://streampay.vercel.app (or your custom domain)"
else
    echo "Skipping initial deploy."
    echo "To deploy later, run: vercel --prod"
fi

echo "\n📚 Next steps:"
echo "1. Add GitHub secrets for automated deployments"
echo "2. Configure custom domain in Vercel (if desired)"
echo "3. Set up analytics and monitoring"
echo "4. Update backend URL in all environments"
echo "\n📖 For full guide, see: VERCEL_DEPLOYMENT.md"

echo "\n✨ Setup complete!"
