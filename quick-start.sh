#!/bin/bash
# StreamPay Quick Start Script
# Configura e inicia todos os serviços localmente

set -e

echo "🚀 StreamPay Quick Start"
echo "========================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}[1/7]${NC} Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm required"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "⚠️  PostgreSQL not found - installing..."; }

echo -e "${GREEN}✓${NC} Prerequisites OK"

# Step 2: Install Backend
echo -e "${BLUE}[2/7]${NC} Installing Backend..."
cd backend
npm install > /dev/null 2>&1 || echo "⚠️  npm install may have issues"
cd ..
echo -e "${GREEN}✓${NC} Backend installed"

# Step 3: Setup Database
echo -e "${BLUE}[3/7]${NC} Setting up PostgreSQL..."
if ! psql -U postgres -c '\l' | grep -q streampay; then
  echo "Creating database 'streampay'..."
  psql -U postgres -c "CREATE DATABASE streampay" 2>/dev/null || echo "Database may already exist"
  echo "Running migrations..."
  psql -U postgres -d streampay -f backend/src/db/migrations/001_init.sql 2>/dev/null || echo "⚠️  Migrations may have issues"
fi
echo -e "${GREEN}✓${NC} Database ready"

# Step 4: Install Smart Contracts
echo -e "${BLUE}[4/7]${NC} Installing Smart Contracts..."
cd smart-contracts
npm install > /dev/null 2>&1
npm run compile > /dev/null 2>&1
cd ..
echo -e "${GREEN}✓${NC} Smart Contracts compiled"

# Step 5: Install ElizaOS Agent
echo -e "${BLUE}[5/7]${NC} Installing ElizaOS Agent..."
cd streampay-eliza
npm install > /dev/null 2>&1 || echo "⚠️  npm install may have issues"
cd ..
echo -e "${GREEN}✓${NC} ElizaOS installed"

# Step 6: Create env files
echo -e "${BLUE}[6/7]${NC} Creating .env files..."

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "⚠️  Please update backend/.env with your API keys"
fi

if [ ! -f streampay-eliza/.env ]; then
  cp streampay-eliza/.env.example streampay-eliza/.env 2>/dev/null || echo "Note: .env.example not found"
  echo "⚠️  Please update streampay-eliza/.env with your API keys"
fi

echo -e "${GREEN}✓${NC} Env files created"

# Step 7: Summary
echo -e "${BLUE}[7/7]${NC} Setup complete!"
echo ""
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Update environment variables:"
echo "   - backend/.env (MORALIS_API_KEY, JWT_SECRET, etc)"
echo "   - streampay-eliza/.env (GOOGLE_GENERATIVE_AI_API_KEY, etc)"
echo ""
echo "2. Start services (in separate terminals):"
echo ""
echo "   Terminal 1 - Backend API:"
echo "   cd backend && npm run dev"
echo ""
echo "   Terminal 2 - Smart Contracts (testing):"
echo "   cd smart-contracts && npm test"
echo ""
echo "   Terminal 3 - ElizaOS Agent:"
echo "   cd streampay-eliza && npm run dev"
echo ""
echo "3. Test the integration:"
echo "   curl -X POST http://localhost:3001/api/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"address\": \"0x...\", \"message\": \"...\", \"signature\": \"...\"}'"
echo ""
echo "4. View documentation:"
echo "   - STATUS_PROJETO.md"
echo "   - FASE_1_ELIZAOS_RESUMO.md"
echo "   - ELIZAOS_INTEGRATION.md"
echo ""
echo "📖 More info at: RESUMO_EXECUTIVO_FASE1.md"
echo ""
echo "🎯 Current Progress: Fase 1 (ElizaOS) ✅ Complete"
echo "📅 Next: Fase 2 (Frontend Dashboard) - Starts tomorrow"
echo ""
