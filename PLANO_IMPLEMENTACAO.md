# 📋 PLANO DE IMPLEMENTAÇÃO - StreamPay AI MVP

**Data**: 14 de dezembro de 2025  
**Versão**: 1.0  
**Status**: 🔴 EM IMPLEMENTAÇÃO

---

## 🎯 OBJETIVO FINAL

Construir um **MVP funcional de streaming de pagamentos em cripto para freelancers** usando:
- ✅ Smart Contracts (Solidity)
- ✅ Backend API (Express + TypeScript)
- ✅ Frontend Dashboard (Next.js 14)
- ✅ ElizaOS Agents (IA para automação)
- ✅ Infraestrutura (Docker + CI/CD)

**Timeline**: 12-16 semanas  
**Confiança do Design**: 90%+ após conclusão do planejamento

---

## 📊 FASES DO PROJETO

### **FASE 0: FUNDAÇÕES (Semana 1-2) - 🔴 ATUAL**

#### Semana 1: Setup & Smart Contracts Base

**Objectivos:**
- [ ] Configurar estrutura do projeto
- [ ] Implementar `LiquidityPool.sol`
- [ ] Implementar `PoolManager.sol`
- [ ] Implementar `SwapRouter.sol`
- [ ] Setup Hardhat + testes básicos

**Entregas:**
- `smart-contracts/contracts/LiquidityPool.sol`
- `smart-contracts/contracts/PoolManager.sol`
- `smart-contracts/contracts/SwapRouter.sol`
- `smart-contracts/test/` com 50%+ cobertura

**Definição de Pronto:**
- Contratos compilam sem erros
- Testes passam com 80%+ cobertura
- Events emitidos corretamente
- Funcionalidades básicas validadas

---

#### Semana 2: Backend Core

**Objectivos:**
- [ ] Setup Express + TypeScript
- [ ] Configurar PostgreSQL (migrations)
- [ ] Implementar autenticação JWT + RBAC
- [ ] Endpoints core: /api/streams, /api/pools, /api/prices
- [ ] Validação de entrada + error handling

**Entregas:**
- `backend/src/server.ts` (Express setup)
- `backend/src/middleware/` (auth, validation, error)
- `backend/src/routes/` (API endpoints)
- `backend/src/db/` (migrations, schemas)
- `backend/src/services/` (blockchain interaction)

**Definição de Pronto:**
- API responde sem erros
- Autenticação funciona
- Database migra corretamente
- Tests passam (>70% cobertura)

---

### **FASE 1: INTEGRAÇÃO (Semana 3-4)**

#### Objetivo: Conectar todos os sistemas

- [ ] ElizaOS agents com Moralis + Chainlink plugins
- [ ] Webhooks para eventos on-chain
- [ ] Chainlink Automation para hedge automático
- [ ] Frontend básico funcional
- [ ] Testes de integração

**Definição de Pronto:**
- Fluxo end-to-end: Usuário → Frontend → Agent → Smart Contract
- Events emitidos e capturados corretamente
- Hedge automático executado

---

### **FASE 2: POLISH & SEGURANÇA (Semana 5-6)**

- [ ] Fuzzing com Echidna
- [ ] Análise estática com Slither
- [ ] Testes de segurança
- [ ] Logging estruturado
- [ ] Monitoring + alertas

---

### **FASE 3: DEPLOYMENT (Semana 7)**

- [ ] Docker + docker-compose
- [ ] CI/CD pipeline (.github/workflows)
- [ ] Deploy em testnet
- [ ] Documentação final

---

## 🏗️ STACK TÉCNICO FINAL

### **Blockchain**
- **Smart Contracts**: Solidity 0.8.20
- **Framework**: Hardhat
- **Rede**: Ethereum Mainnet + Layer 2s (Arbitrum, Optimism)
- **Oracles**: Chainlink Price Feeds + Automation
- **DEX**: Uniswap V3

### **Backend**
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Database**: PostgreSQL 15+
- **Autenticação**: JWT + RBAC
- **APIs externas**: Moralis, Chainlink, Etherscan
- **Logging**: Winston
- **Monitoring**: Prometheus + Grafana

### **Frontend**
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript + React 18
- **Web3**: Wagmi + RainbowKit
- **Estado**: Zustand
- **UI**: Tailwind CSS + HeadlessUI
- **Testes**: Vitest + React Testing Library

### **Agents**
- **Framework**: ElizaOS (@ai16z/eliza)
- **LLM**: Google Gemini AI (ou OpenAI GPT-4)
- **Plugins**: Moralis, Chainlink, Custom

### **Infraestrutura**
- **Containerização**: Docker + docker-compose
- **CI/CD**: GitHub Actions
- **Monitoramento**: Prometheus + Grafana
- **Secrets**: GitHub Secrets + .env files

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### **Smart Contracts**

#### LiquidityPool.sol
- [ ] Struct Pool com reservas MNEE + Stable
- [ ] Função addLiquidity()
- [ ] Função swapMNEEForStable()
- [ ] Função swapStableForMNEE()
- [ ] Eventos para todas operações
- [ ] Access control (owner only)

#### PoolManager.sol
- [ ] Integração com Uniswap V3 NonfungiblePositionManager
- [ ] Criar pools automaticamente
- [ ] Adicionar liquidez em faixas específicas
- [ ] Rebalancear pools
- [ ] Rastrear LP tokens

#### SwapRouter.sol
- [ ] Roteamento otimizado via Uniswap V3
- [ ] Multi-hop swaps (MNEE → USDC → USDT)
- [ ] Slippage protection com Chainlink prices
- [ ] Circuit breaker para preços anômalos

#### StreamPayCore.sol (melhorias)
- [ ] Integrar com SwapRouter para swaps reais
- [ ] Implementar hedge automático trigger
- [ ] Custom errors (economiza gas)
- [ ] Reentancy protection
- [ ] Events detalhados

### **Backend API**

#### Estrutura Base
- [ ] `src/config/` - Configurações (DB, env vars)
- [ ] `src/middleware/` - Autenticação, validação, error handling
- [ ] `src/routes/` - Definição de endpoints
- [ ] `src/services/` - Lógica de negócio
- [ ] `src/models/` - TypeScript interfaces/types
- [ ] `src/db/` - Migrations, seeds, queries

#### Endpoints (Tier 1)
- [ ] `POST /api/auth/register` - Registrar usuário
- [ ] `POST /api/auth/login` - Login + JWT
- [ ] `POST /api/streams` - Criar stream
- [ ] `GET /api/streams/:id` - Obter stream
- [ ] `GET /api/streams` - Listar streams do usuário
- [ ] `PATCH /api/streams/:id` - Pausar/retomar
- [ ] `DELETE /api/streams/:id` - Cancelar

#### Endpoints (Tier 2)
- [ ] `GET /api/pools` - Listar pools
- [ ] `POST /api/pools` - Criar pool
- [ ] `GET /api/prices/:token` - Obter preço Chainlink
- [ ] `GET /api/hedge-history` - Histórico de hedges

#### Integração Web3
- [ ] Wrapper Ethers.js para StreamPayCore
- [ ] Wrapper Uniswap V3 para pools
- [ ] Listener para eventos on-chain
- [ ] Rate limiter por address

### **ElizaOS Agents**

#### Main Orchestrator Agent
- [ ] Inicializar com modelo Gemini
- [ ] Intent parser (extrair recipient, token, amount, duration)
- [ ] Message handlers
- [ ] Error handling + retry logic

#### Plugins
- [ ] **Moralis Plugin**:
  - [ ] getWalletTokenBalances()
  - [ ] getPairAddress()
  - [ ] getPairReserves()
  - [ ] setupStreamMonitor() (Streams API)
- [ ] **Chainlink Plugin**:
  - [ ] getPriceFeed()
  - [ ] getMultiplePrices()
  - [ ] checkVolatility()

#### Actions
- [ ] `create_stream` - Criar stream
- [ ] `check_pool` - Verificar pool Uniswap V3
- [ ] `get_price` - Obter preço
- [ ] `claim_stream` - Coletar pagamentos
- [ ] `cancel_stream` - Cancelar stream

#### Webhooks
- [ ] `/webhook/moralis` - Eventos de stream
- [ ] `/webhook/chainlink` - Alerts de preço

### **Frontend Dashboard**

#### Componentes Core
- [ ] Conexão com Wallet (RainbowKit)
- [ ] Dashboard principal
- [ ] Tabela de streams ativos
- [ ] Formulário de criar stream
- [ ] Chat com ElizaOS agent
- [ ] Histórico de transações
- [ ] Settings/Configurações

#### Funcionalidades
- [ ] Exibir streams em tempo real
- [ ] Criar novo stream com validação
- [ ] Pausar/retomar stream
- [ ] Cancelar stream
- [ ] Coletar pagamentos acumulados
- [ ] Ver histórico de hedge
- [ ] Chat com IA para operações

#### Segurança
- [ ] Validação de entrada (frontend)
- [ ] Tratamento de rejeição de transações
- [ ] Error boundaries
- [ ] Loading states apropriados

### **Infraestrutura**

#### Docker
- [ ] `Dockerfile` para backend
- [ ] `docker-compose.yml` com:
  - [ ] PostgreSQL
  - [ ] Redis (cache)
  - [ ] Backend API
  - [ ] Frontend

#### CI/CD
- [ ] `.github/workflows/test.yml` - Testes automatizados
- [ ] `.github/workflows/build.yml` - Build de imagens Docker
- [ ] `.github/workflows/lint.yml` - Linting + type checking
- [ ] `.github/workflows/security.yml` - Análise de segurança

#### Environment
- [ ] `.env.example` completo
- [ ] Scripts de setup (./scripts/setup.sh)
- [ ] Documentação de variáveis de ambiente

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### Agora (14/12/2025):
1. ✅ Criar este plano (FEITO)
2. ⏳ Implementar LiquidityPool.sol
3. ⏳ Implementar PoolManager.sol
4. ⏳ Implementar SwapRouter.sol

### Esta semana:
5. ⏳ Setup Backend Express + PostgreSQL
6. ⏳ Endpoints core /api/streams
7. ⏳ Autenticação JWT

### Próxima semana:
8. ⏳ ElizaOS agents base
9. ⏳ Plugins Moralis + Chainlink
10. ⏳ Frontend dashboard básico

---

## 📊 MÉTRICAS DE SUCESSO

| Métrica | Target | Status |
|---------|--------|--------|
| Cobertura de testes (Smart Contracts) | >85% | ⏳ |
| Cobertura de testes (Backend) | >80% | ⏳ |
| Endpoints implementados | 12/12 | 0/12 |
| Agents funcionais | 5/5 | 0/5 |
| SLA (API) | <200ms p95 | ⏳ |
| Vulnerabilidades críticas | 0 | ⏳ |
| Build time | <5min | ⏳ |

---

## 🔄 REVISÕES DO PLANO

| Data | Mudança | Razão |
|------|---------|-------|
| 14/12/2025 | Plano inicial criado | Kick-off do projeto |
| | | |

---

**Próxima Review**: 21/12/2025 (Fim de Semana 1)
