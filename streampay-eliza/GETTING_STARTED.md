# Guia de Inicialização - StreamPay Agent

Este guia explica como configurar e usar o agente de IA StreamPay para manipular funções do contrato inteligente de pagamentos em stream.

## Pré-requisitos

- Node.js 18+ ou Bun
- Conta Moralis (para dados on-chain)
- Acesso a Chainlink RPC (ou Infura/Alchemy)
- Backend StreamPay rodando
- Wallet Ethereum configurada

## Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto `streampay-eliza/`:

```bash
# API Keys
MORALIS_API_KEY=sua-chave-moralis-aqui
CHAINLINK_RPC_URL=https://sepolia.infura.io/v3/seu-projeto-id
# OU use INFURA_URL se preferir
INFURA_URL=https://sepolia.infura.io/v3/seu-projeto-id

# Backend
BACKEND_URL=http://localhost:3001

# Network
NETWORK=sepolia  # ou 'localhost' para desenvolvimento local

# LLM (opcional - escolha um)
GOOGLE_GENERATIVE_AI_API_KEY=sua-chave-google-genai
# OU
OPENAI_API_KEY=sua-chave-openai

# Plataformas (opcional)
DISCORD_API_TOKEN=seu-token-discord  # Se quiser usar Discord
TELEGRAM_BOT_TOKEN=seu-token-telegram  # Se quiser usar Telegram
```

### Obtendo as Chaves de API

1. **Moralis API Key**:
   - Acesse [Moralis](https://moralis.io/)
   - Crie uma conta e obtenha sua API key
   - Use para consultar dados on-chain

2. **Chainlink RPC / Infura**:
   - Acesse [Infura](https://infura.io/) ou [Alchemy](https://www.alchemy.com/)
   - Crie um projeto e obtenha a URL do RPC
   - Use para consultar preços via Chainlink

3. **LLM (Opcional)**:
   - **Google Generative AI**: Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **OpenAI**: Acesse [OpenAI Platform](https://platform.openai.com/api-keys)

## Instalação

```bash
# Navegue para o diretório do agente
cd streampay-eliza

# Instale as dependências
bun install
# OU
npm install

# Compile o projeto
bun run build
# OU
npm run build
```

## Iniciando o Agente

### Modo Desenvolvimento (com hot-reload)

```bash
bun run dev
# OU
npm run dev
```

### Modo Produção

```bash
bun run start
# OU
npm run start
```

## Integração com o Backend

O agente está integrado diretamente com o backend StreamPay. Certifique-se de que:

1. O backend está rodando em `http://localhost:3001` (ou configure `BACKEND_URL`)
2. O backend tem acesso às mesmas variáveis de ambiente (MORALIS_API_KEY, etc.)
3. O backend está configurado para aceitar requisições do agente

### Endpoints do Backend Utilizados

- `POST /api/eliza-message` - Processa mensagens do usuário
- `POST /api/agent/execute-contract` - Executa operações on-chain após assinatura
- `GET /api/streams` - Lista streams do usuário
- `GET /api/streams/:id` - Detalhes de um stream específico

## Fluxo de Uso

### 1. Usuário envia mensagem

O usuário envia uma mensagem em linguagem natural, por exemplo:
- "Criar um stream de 1000 USDC para 0x1234... por 30 dias"
- "Reivindicar tokens do stream #1"
- "Qual é o meu saldo?"

### 2. Agente processa a mensagem

O agente:
1. Parseia a intenção usando `IntentParser`
2. Valida os parâmetros necessários
3. Prepara uma requisição de assinatura (se necessário)
4. Retorna resposta formatada

### 3. Requisição de assinatura (quando necessário)

Para operações on-chain, o agente retorna um `SignatureRequest`:
```typescript
{
  pendingSignature: true,
  messageToSign: "StreamPay Authorization\n\n{...}",
  payload: {
    version: "1",
    requestId: "...",
    intent: "CREATE_STREAM",
    userAddress: "0x...",
    network: "sepolia",
    chainId: 11155111,
    parameters: { ... },
    issuedAt: 1234567890,
    expiresAt: 1234567890
  }
}
```

### 4. Frontend processa assinatura

O frontend:
1. Exibe modal de confirmação
2. Solicita assinatura da mensagem na wallet do usuário
3. Envia assinatura + payload para `/api/agent/execute-contract`
4. Backend valida e retorna `txRequests`
5. Frontend envia transações para a blockchain

## Comandos Disponíveis

### Criar Stream
```
"Criar stream de 1000 USDC para 0x1234... por 30 dias"
"Criar um pagamento de 500 DAI mensalmente para alice.eth"
```

### Reivindicar Stream
```
"Reivindicar tokens do stream #1"
"Claim do stream 2"
```

### Cancelar Stream
```
"Cancelar stream #1"
"Deletar meu stream de pagamento"
```

### Ver Streams
```
"Mostrar meus streams"
"Listar streams ativos"
```

### Ver Detalhes do Stream
```
"Detalhes do stream #1"
"Informações sobre o stream 2"
```

### Adicionar Liquidez
```
"Adicionar 1000 USDC de liquidez"
"Fornecer 500 DAI ao pool"
```

### Remover Liquidez
```
"Remover liquidez do pool #1"
"Sair do pool com meus tokens"
```

### Swap de Tokens
```
"Trocar 100 USDC por ETH"
"Converter 50 DAI para MATIC"
```

### Verificar Saldo
```
"Qual é o meu saldo?"
"Mostrar meu patrimônio"
"Portfolio value"
```

### Consultar Preço
```
"Qual é o preço do ETH?"
"Preço do USDC?"
"BTC/USD"
```

## Testando o Agente

### Testes Unitários

```bash
bun run test:component
# OU
npm run test:component
```

### Testes E2E

```bash
bun run test:e2e
# OU
npm run test:e2e
```

### Teste Manual via API

```bash
# Enviar mensagem para o agente
curl -X POST http://localhost:3001/api/eliza-message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Criar stream de 100 USDC para 0x1234567890123456789012345678901234567890 por 7 dias",
    "userId": "0x1234567890123456789012345678901234567890",
    "userName": "Test User",
    "userAddress": "0x1234567890123456789012345678901234567890"
  }'
```

## Troubleshooting

### Erro: "Moralis API key não encontrada"
- Verifique se `MORALIS_API_KEY` está definida no `.env`
- Certifique-se de que o arquivo `.env` está na raiz do projeto

### Erro: "Erro de conexão com o servidor"
- Verifique se o backend está rodando
- Confirme que `BACKEND_URL` está correto
- Verifique se não há problemas de firewall

### Erro: "Invalid signature"
- Certifique-se de que o usuário assinou a mensagem correta
- Verifique se o `userAddress` corresponde ao endereço que assinou
- Confirme que o payload não expirou (`expiresAt`)

### Erro: "Intent não reconhecido"
- Reformule a mensagem de forma mais clara
- Use os exemplos de comandos acima como referência
- Verifique se todos os parâmetros necessários foram fornecidos

## Estrutura do Projeto

```
streampay-eliza/
├── src/
│   ├── agents/
│   │   ├── orchestrator.ts      # Agente principal
│   │   └── eliza-integration.ts  # Plugin ElizaOS
│   ├── services/
│   │   ├── action-handler.ts     # Executa ações
│   │   ├── contract-service.ts  # Prepara requisições on-chain
│   │   ├── intent-parser.ts      # Parseia intenções
│   │   ├── moralis.ts           # Integração Moralis
│   │   └── chainlink.ts         # Integração Chainlink
│   ├── character.ts             # Configuração do personagem
│   └── index.ts                  # Ponto de entrada
├── .env                          # Variáveis de ambiente
└── GETTING_STARTED.md           # Este arquivo
```

## Próximos Passos

1. Configure todas as variáveis de ambiente
2. Inicie o backend StreamPay
3. Inicie o agente com `bun run dev`
4. Teste enviando mensagens via API ou interface
5. Integre com o frontend para experiência completa

## Suporte

Para problemas ou dúvidas:
- Verifique os logs do agente e do backend
- Consulte a documentação técnica em `/docs`
- Revise os testes para exemplos de uso
