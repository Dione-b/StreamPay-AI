# Deploy do Frontend StreamPay na Vercel - Guia Completo

## 🎯 Opção 1: Deploy via Vercel Dashboard (Mais Fácil)

### Passo 1: Criar Projeto no Vercel
1. Acesse https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Procure por **"Jistriane/StreamPay-AI"** e selecione
4. Clique em **"Import"**

### Passo 2: Configurar Build
Na página de configuração do projeto:
- **Framework Preset**: Selecione **"Next.js"**
- **Root Directory**: Selecione **"frontend"**
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Passo 3: Adicionar Variáveis de Ambiente
Antes de clicar "Deploy", adicione as variáveis:

**Para Polygon Mainnet:**
```
NEXT_PUBLIC_CHAIN_ID = 137
NEXT_PUBLIC_BACKEND_URL = https://api.streampay.io
NEXT_PUBLIC_ELIZA_URL = https://agent.streampay.io
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = <seu-wallet-connect-id>
NEXT_PUBLIC_STREAM_PAY_CORE_ADDRESS = 0x8a9bDE90B28b6ec99CC0895AdB2d851A786041dD
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS = 0x585C98E899F07c22C4dF33d694aF8cb7096CCd5c
NEXT_PUBLIC_POOL_MANAGER_ADDRESS = 0xae185cA95D0b626a554b0612777350CE3DE06bB9
NEXT_PUBLIC_SWAP_ROUTER_ADDRESS = 0x07AfFa6C58999Ac0c98237d10476983A573eD368
NEXT_PUBLIC_TOKEN_ADDRESS = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

### Passo 4: Deploy
Clique em **"Deploy"** e aguarde ~3-5 minutos.

### ✅ Pronto!
Seu frontend estará em: `https://streampay-frontend-<randomid>.vercel.app`

---

## 🔄 Configurar Deploy Automático (GitHub Actions)

Depois do deploy inicial, configure para auto-deploy:

### Passo 1: Gerar Vercel Token
1. Acesse https://vercel.com/account/tokens
2. Clique em **"Create Token"**
3. Nome: `GitHub-Actions`
4. Copie o token

### Passo 2: Adicionar Token ao GitHub
1. Vá para: https://github.com/Jistriane/StreamPay-AI/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Name: `VERCEL_TOKEN`
4. Value: Cole o token copiado
5. Clique em **"Add secret"**

### Passo 3: Pegar IDs do Projeto
1. Vá para seu projeto no Vercel Dashboard
2. Vá para **Settings → General**
3. Copie:
   - **Project ID**
   - **Organization ID** (se houver)
4. Crie dois novos secrets no GitHub:
   - `VERCEL_PROJECT_ID` = Cole o Project ID
   - `VERCEL_ORG_ID` = Cole o Organization ID

### ✅ GitHub Actions Automático
Agora qualquer push em `main` com mudanças em `frontend/` fará deploy automático!

---

## 🧪 Testar Localmente Antes de Push

```bash
cd frontend

# Build de produção
npm run build

# Servir localmente
npm run start

# Acesse http://localhost:3000
```

---

## 📊 Monitorar Deploys

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Actions**: https://github.com/Jistriane/StreamPay-AI/actions

---

## 🔧 Atualizar Variáveis Depois

Se precisar mudar variáveis após o deploy:

**Via Vercel Dashboard:**
1. Projeto → Settings → Environment Variables
2. Edite a variável
3. Redeploy (automático se GitHub Actions está ativo)

**Via Vercel CLI:**
```bash
vercel env pull
# Edite .env.local
vercel env add NEXT_PUBLIC_CHAIN_ID production
# Cole o valor e confirme
```

---

## 🆘 Troubleshooting

**Build fails na Vercel:**
- Verifique `frontend/package.json` está correto
- Confirme Root Directory é `frontend`
- Check logs em Vercel Dashboard → Deployments

**Variáveis não carregam:**
- Variáveis devem começar com `NEXT_PUBLIC_` para serem públicas
- Redeploy após adicionar variáveis

**404 em rotas dinâmicas:**
- Confirme middleware em `frontend/middleware.ts` se houver
- Check rewrites em `next.config.js`

---

## 📞 Próximos Passos

1. ✅ Deploy frontend em mainnet
2. Deploy backend (Express) em Railway/Render
3. Configure domínio customizado (opcional)
4. Setup SSL e CORS (automático no Vercel)
5. Analytics e monitoring

**Documentação:** Veja [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) para mais detalhes.
