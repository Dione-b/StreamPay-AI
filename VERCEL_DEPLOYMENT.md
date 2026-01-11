# Frontend Vercel Deployment Guide

## Configuração para Deploy Automático do Frontend na Vercel (Mainnet)

Este guia mostra como configurar o deploy automático do frontend StreamPay AI na Vercel para a rede Polygon Mainnet.

## 📋 Pré-requisitos

1. **Conta Vercel**
   - Crie uma conta em https://vercel.com
   - Conecte seu repositório GitHub

2. **Tokens de Acesso**
   - `VERCEL_TOKEN`: Gere em https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: Encontre em Project Settings > General
   - `VERCEL_PROJECT_ID`: Encontre em Project Settings > General

3. **Variáveis de Ambiente para Mainnet**
   - Chain ID: `137` (Polygon Mainnet)
   - Backend URL: URL do seu backend (ex.: https://api.streampay.io)
   - Contratos Mainnet: Endereços dos contratos deployados no Polygon Mainnet

## 🔧 Configuração no Vercel

### 1. Criar Projeto no Vercel

```bash
# Instale o Vercel CLI globalmente
npm install -g vercel

# Autentique-se
vercel login

# Configure o projeto (na raiz do repo)
vercel --prod
```

Responda os prompts:
- **Set up and deploy?** `Y`
- **Which scope do you want to deploy to?** Selecione seu escopo
- **Link to existing project?** `N` (primeira vez) ou `Y` (se já existe)
- **What's your project's name?** `streampay-frontend`
- **In which directory is your code located?** `frontend`

### 2. Configurar Variáveis de Ambiente

No Vercel Dashboard → Project Settings → Environment Variables, adicione:

#### Para Mainnet:
```
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_BACKEND_URL=https://api.streampay.io
NEXT_PUBLIC_ELIZA_URL=https://agent.streampay.io
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-walletconnect-id
NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS=0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c
NEXT_PUBLIC_POOL_MANAGER_ADDRESS=0xae185cA95D0b626a554b0612777350CE3DE06bB9
NEXT_PUBLIC_SWAP_ROUTER_ADDRESS=0x07AfFa6C58999Ac0c98237d10476983A573eD368
NEXT_PUBLIC_TOKEN_ADDRESS=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

#### Para Preview (Sepolia Testnet):
```
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_ELIZA_URL=http://localhost:3000
NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS=0x74ef273eCdc2BBA1Ddf69a2106122d43424F3c0C
...
```

### 3. Adicionar Secrets ao GitHub

No GitHub → Repository Settings → Secrets and variables → Actions, adicione:

```
VERCEL_TOKEN=<seu-token-vercel>
VERCEL_ORG_ID=<seu-org-id>
VERCEL_PROJECT_ID=<seu-project-id>
```

## 🚀 Deploy Automático

### Git Push (Automático)
```bash
git add .
git commit -m "feat: update contract addresses for mainnet"
git push origin main
```

O GitHub Actions dispara automaticamente o workflow `.github/workflows/deploy-vercel.yml`, que:
1. ✅ Faz checkout do código
2. ✅ Instala dependências
3. ✅ Puxa config de produção do Vercel
4. ✅ Faz build otimizado do Next.js
5. ✅ Deploy para produção

### Deploy Manual via CLI
```bash
cd /home/jistriane/Documentos/StreamPay\ AI/StreamPay-AI-1

# Deploy em preview (staging)
vercel

# Deploy em produção
vercel --prod
```

## 📊 Monitoramento

### Ver Logs de Deploy
```bash
vercel logs <deployment-url>
```

### Analytics no Vercel Dashboard
- Vercel Dashboard → Project → Deployments
- Ver logs, performance, errores em tempo real

### GitHub Actions
- GitHub → Actions → Deploy Frontend to Vercel (Mainnet)
- Veja status de cada deployment automático

## 🔄 Estratégia de Branches

| Branch | Ambiente | Auto Deploy |
|--------|----------|-------------|
| `main` | Production (Mainnet) | ✅ Sim |
| `develop` | Preview (Testnet) | ⚠️ Opcional |

### Configurar Deploy Condicional para Testnet

Edite `.github/workflows/deploy-vercel.yml`:
```yaml
on:
  push:
    branches:
      - main      # Production
      - develop   # Preview
```

## 🧪 Testar Localmente Antes de Push

```bash
cd frontend

# Build local
npm run build

# Serve local
npm run start

# Acesse http://localhost:3000
```

## 🔐 Segurança

- ✅ Tokens salvos como GitHub Secrets (nunca hardcode)
- ✅ Variáveis públicas (NEXT_PUBLIC_*) são visíveis no código
- ✅ Use CORS restritivo no backend
- ✅ Atualize Wallet Connect ID regularmente

## 📝 Troubleshooting

### Build falha no Vercel
```bash
# Limpe cache no Vercel
vercel env pull   # Puxa vars do Vercel
npm run build     # Testa build local
```

### Timeout durante build
- Aumente timeout em `vercel.json` (máx 3600s para plano pro)
- Otimize imports e lazy-load componentes

### CORS/API errors em produção
- Verifique `NEXT_PUBLIC_BACKEND_URL` está correto
- Confirme backend permite CORS para domínio Vercel

## 📖 Referências

- [Vercel Next.js Docs](https://vercel.com/docs/frameworks/nextjs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel CLI Docs](https://vercel.com/cli/docs)

---

**Last Updated**: January 11, 2026  
**Status**: ✅ Pronto para deploy automático em mainnet
