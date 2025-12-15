# 🎯 Próximos Passos - StreamPay AI

**Data**: 15 de Dezembro de 2025  
**Status**: Stack 100% Operacional ✅

## 📌 Tarefas Imediatas (Próximas 2-4 horas)

### 1. **Validar Integração Completa** ⭐ CRÍTICO
- [ ] Abrir browser em `http://localhost:3003`
- [ ] Conectar wallet (MetaMask/WalletConnect)
- [ ] Testar criação de stream via API
- [ ] Validar que backend recebe request
- [ ] Validar que contrato Sepolia é chamado
- [ ] Verificar resposta na UI

**Comandos de teste:**
```bash
# Test Backend health
curl http://localhost:3001/health

# Test ElizaOS 
curl http://localhost:3002/health

# Test stream creation (substitua WALLET_ADDRESS)
curl -X POST http://localhost:3001/api/streams \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "token": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "amount": "1000000000000000000",
    "duration": 86400,
    "ratePerSecond": "1000000000000000000"
  }'
```

### 2. **Renovar API Key Gemini** (Opcional)
- [ ] Ir para https://aistudio.google.com/apikey
- [ ] Gerar nova API key
- [ ] Atualizar `GOOGLE_GENERATIVE_AI_API_KEY` em `streampay-eliza/.env`
- [ ] Restart ElizaOS

### 3. **Verificar Logs de Erro**
```bash
# Frontend errors
cat /tmp/frontend.log | grep -i error | tail -20

# Backend errors
cat /tmp/backend.log | grep -i error | tail -20

# ElizaOS errors
cat /tmp/eliza.log | grep -i error | tail -20
```

---

## 📅 Tarefas Curto Prazo (Esta Semana)

### **Dia 1-2: Deploy Backend**

1. **Preparar para produção**
   ```bash
   # Build backend
   cd backend
   npm run build
   
   # Test build
   npm run start
   ```

2. **Deploy para Railway** (recomendado)
   - [ ] Sign up em https://railway.app
   - [ ] Conectar repositório GitHub
   - [ ] Configurar environment variables
   - [ ] Deploy automático

   **Ou Deploy para Render**
   - [ ] Sign up em https://render.com
   - [ ] Criar novo Web Service
   - [ ] Conectar repositório
   - [ ] Configurar build command: `npm run build`
   - [ ] Configurar start command: `npm start`

### **Dia 2-3: Deploy Frontend**

1. **Build e teste**
   ```bash
   cd frontend
   npm run build
   npm run start
   ```

2. **Deploy para Vercel** (recomendado)
   - [ ] Sign up com GitHub em https://vercel.com
   - [ ] Importar repositório
   - [ ] Configurar environment variables
   - [ ] Deploy automático

### **Dia 3-4: Validar Produção**
- [ ] Testar frontend em produção
- [ ] Testar backend API em produção
- [ ] Verificar conexão com Sepolia
- [ ] Monitorar logs com Sentry

---

## 🔗 Deploy Environment Variables

### Backend (Railway/Render)
```
ENVIRONMENT=production
NODE_ENV=production
PORT=3001
DB_USER=postgres
DB_PASSWORD=[SECURE]
DB_HOST=[RDS_HOST]
DB_PORT=5432
DB_NAME=streampay_prod
JWT_SECRET=[GENERATE_RANDOM]
POSTGRES_URL=postgresql://[USER]:[PASS]@[HOST]:5432/streampay_prod
MORALIS_API_KEY=[YOUR_KEY]
CHAINLINK_API_KEY=[YOUR_KEY]
GEMINI_API_KEY=[YOUR_KEY]
ETHERSCAN_API_KEY=[YOUR_KEY]
SENTRY_DSN=[YOUR_DSN]
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://api.streampay.com
NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS=0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=0x896171C52d49Ff2e94300FF9c9B2164ac62F0Edd
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/[KEY]
NEXT_PUBLIC_SENTRY_DSN=[YOUR_DSN]
```

---

## 🧪 Testes Recomendados Antes de Deploy

### Frontend
```bash
# Coverage test
npm run test:frontend -- --coverage

# Build production
npm run build
```

### Backend
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# Build
npm run build
```

### Smart Contracts
```bash
# Run all tests
npm run test

# Deploy test (Sepolia)
npm run deploy:sepolia:test
```

---

## 🔐 Checklist de Segurança

- [ ] Todas as variáveis de ambiente usando valores seguros
- [ ] Nenhum secret no código-fonte
- [ ] HTTPS habilitado em produção
- [ ] CORS configurado corretamente
- [ ] Rate limiting em APIs
- [ ] JWT com expiration configurado
- [ ] Sentry para monitoramento de erros
- [ ] Backup de database configurado
- [ ] Logs centralizados
- [ ] SSL certificado valido

---

## 📊 Monitoramento Pós-Deploy

### Configurar Sentry
```bash
npm install @sentry/next @sentry/node

# Frontend
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Backend
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Configurar Logs
- [ ] Cloud Logging (Firebase/AWS CloudWatch)
- [ ] Alertas para erros críticos
- [ ] Dashboard de performance

### Configurar Webhooks
```bash
# Moralis webhooks para eventos blockchain
# Configure em: https://admin.moralis.io/web3-events

# Eventos a monitorar:
- Stream created
- Stream claimed
- Pool created
- Swap executed
```

---

## 🐛 Troubleshooting Comum

### Frontend não conecta ao Backend
```bash
# Verificar CORS
curl -i -X OPTIONS http://localhost:3001/api \
  -H "Origin: http://localhost:3003"

# Deve retornar Access-Control-Allow-Origin
```

### Database connection error
```bash
# Verificar conexão PostgreSQL
psql -U postgres -h localhost -p 5432 -d streampay -c "SELECT 1"

# Se falhar, verificar se PostgreSQL está rodando
docker ps | grep postgres
```

### Wallet não conecta
```bash
# Verificar RPC URL
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Deve retornar: "0xaa36a7" (Sepolia)
```

### ElizaOS não responde
```bash
# Verificar se está rodando
ps aux | grep elizaos

# Verificar logs
tail -100 /tmp/eliza.log

# Reiniciar
npm run dev:eliza
```

---

## 📞 Recursos Úteis

### Documentação
- Hardhat: https://hardhat.org/docs
- Next.js: https://nextjs.org/docs
- Express: https://expressjs.com
- Wagmi: https://wagmi.sh
- ElizaOS: https://docs.elizaos.ai

### Ferramentas
- Sepolia Faucet: https://www.sepoliafaucet.com
- Etherscan Sepolia: https://sepolia.etherscan.io
- Tenderly: https://tenderly.co (debugging)

### Comunidades
- Discord StreamPay: [Link]
- GitHub Discussions: [Link]

---

## ✅ Próximo Milestone

**Objetivo**: Deploy em produção até **17 de Dezembro**

1. ✅ Backend Deploy (Railway) - 16/dez
2. ✅ Frontend Deploy (Vercel) - 16/dez
3. ✅ Validação E2E - 17/dez
4. ✅ Monitoramento ativo - 17/dez

---

**Última Atualização**: 2025-12-15 06:45 UTC  
**Responsável**: Jistriane  
**Status**: 🟢 Todas as tarefas em track
