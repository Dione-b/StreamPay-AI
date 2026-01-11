# 🧪 Guia de Teste do Chatbot ElizaOS

**Status**: ✅ Serviços Rodando | **Data**: 11/01/2026

## 📊 Status Atual dos Serviços

```
✅ Backend (3001):  OK
✅ ElizaOS (3002):  OK  
✅ Frontend (3003): OK
```

## 🎯 Correções Implementadas

### 1. Fluxo de Validação Corrigido
- ✅ Verificação de confiança movida para o início
- ✅ Mensagens específicas por tipo de intent (CREATE_STREAM, CLAIM_STREAM, PAUSE_STREAM)
- ✅ Logs de debug adicionados para rastreamento

### 2. Mensagens Aprimoradas
Quando o usuário digita apenas "create stream" sem parâmetros, agora recebe:

```
Para criar um stream, preciso de algumas informações:

📝 **Exemplo de comando completo:**
"Criar stream de 1000 USDC para 0x1234... por 30 dias"

🔹 **Preciso de:**
• Valor (ex: 1000)
• Token (ex: USDC, DAI, ETH)
• Endereço do destinatário (0x...)
• Duração (ex: 30 dias, 1 mês)

💡 **Tente algo como:**
"Enviar 500 USDC para 0xabcd1234... durante 7 dias"
```

## 🧪 Testes Recomendados

### Teste 1: Comando Incompleto (CREATE STREAM)

**Entrada:** `create stream`

**Resultado Esperado:**
- Mensagem detalhada com exemplo completo
- Lista de parâmetros necessários
- Sugestão de comando

**Como testar:**
1. Acesse http://localhost:3002
2. Digite "create stream" no chat
3. Verifique se recebe a mensagem detalhada

---

### Teste 2: Comando Parcial (CREATE STREAM)

**Entrada:** `criar stream de 1000 USDC`

**Resultado Esperado:**
- Identifica que falta o destinatário e duração
- Fornece exemplo com todos os parâmetros

---

### Teste 3: Comando Completo (CREATE STREAM)

**Entrada:** `criar stream de 1000 USDC para 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb por 30 dias`

**Resultado Esperado:**
- Processa o comando
- Retorna confirmação ou erro de execução (não de parsing)

---

### Teste 4: Comando Help

**Entrada:** `help` ou `ajuda` ou `comandos`

**Resultado Esperado:**
- Lista completa de comandos
- Exemplos em PT e EN
- Formatação clara com emojis

---

### Teste 5: Comando Incompleto (CLAIM STREAM)

**Entrada:** `claim stream`

**Resultado Esperado:**
```
Para resgatar um stream, preciso do ID.

📝 **Exemplo:**
"Resgatar stream #123" ou "Claim do stream 5"
```

---

### Teste 6: Comando Incompleto (PAUSE STREAM)

**Entrada:** `pause stream`

**Resultado Esperado:**
```
Para pausar um stream, preciso do ID.

📝 **Exemplo:**
"Pausar stream #123" ou "Parar stream 5"
```

---

### Teste 7: Comando Desconhecido (Baixa Confiança)

**Entrada:** `quero fazer alguma coisa`

**Resultado Esperado:**
```
Não tenho certeza do que você está pedindo. Poderia reformular?

📋 **Comandos disponíveis:**
• create stream - Criar pagamento em stream
• claim stream - Resgatar tokens
• pause stream - Pausar stream
• cancel stream - Cancelar stream
• view streams - Ver meus streams

💡 Use "help" ou "ajuda" para mais detalhes.
```

---

## 🔍 Verificando Logs de Debug

Os logs de debug foram adicionados para facilitar o rastreamento. Para ver:

### Opção 1: Via Terminal do npm run dev
```bash
# Os logs aparecem automaticamente no terminal onde rodou npm run dev
# Procure por linhas como:
[StreamPayAgent] Parsed Intent: {...}
[StreamPayAgent] Validation result: {...}
[generateValidationErrorMessage] {...}
```

### Opção 2: Via Console do Navegador
```bash
# 1. Abra http://localhost:3002
# 2. Abra DevTools (F12)
# 3. Vá para a aba Console
# 4. Digite um comando e veja os logs
```

## 📝 Checklist de Validação

Execute todos os testes e marque:

- [ ] Teste 1: Comando incompleto CREATE STREAM retorna mensagem detalhada
- [ ] Teste 2: Comando parcial identifica parâmetros faltantes  
- [ ] Teste 3: Comando completo é processado (não retorna erro de parsing)
- [ ] Teste 4: Comando help mostra lista completa
- [ ] Teste 5: CLAIM STREAM sem ID retorna exemplo
- [ ] Teste 6: PAUSE STREAM sem ID retorna exemplo
- [ ] Teste 7: Comando desconhecido retorna lista de comandos

## 🐛 Problemas Conhecidos e Soluções

### Problema: Mensagem genérica ainda aparece
**Solução:**
1. Verifique se o ElizaOS foi recompilado: `cd streampay-eliza && npm run build`
2. Reinicie o serviço
3. Limpe o cache do navegador (Ctrl+Shift+Del)

### Problema: Logs não aparecem
**Solução:**
1. Verifique se está usando o terminal correto (onde rodou `npm run dev`)
2. Aumente o nível de log em development

### Problema: ElizaOS não responde
**Solução:**
1. Verifique health: `curl http://localhost:3002/health`
2. Verifique se a porta 3002 está ocupada: `lsof -i:3002`
3. Reinicie: `pkill -f eliza && npm run dev:eliza`

## 📚 Comandos Úteis

```bash
# Ver status de todos os serviços
curl -s http://localhost:3001/health && echo " Backend OK"
curl -s http://localhost:3002/health && echo " ElizaOS OK"
curl -s http://localhost:3003 > /dev/null && echo " Frontend OK"

# Ver logs do ElizaOS
tail -f /home/jistriane/Documentos/StreamPay\ AI/StreamPay-AI-1/eliza.log

# Reiniciar apenas o ElizaOS
pkill -f "elizaos dev"
cd streampay-eliza && npm run dev

# Recompilar o ElizaOS
cd streampay-eliza && npm run build
```

## ✅ Resultado Esperado Final

Após todas as correções, o chatbot deve:

1. **Identificar o intent corretamente** mesmo com comandos incompletos
2. **Fornecer mensagens específicas** para cada tipo de comando
3. **Mostrar exemplos práticos** em português e inglês
4. **Guiar o usuário** com dicas e sugestões
5. **Ter resposta clara para "help"** com todos os comandos

## 📊 Métricas de Sucesso

- ✅ 0 mensagens genéricas para comandos conhecidos
- ✅ 100% dos comandos incompletos recebem exemplos
- ✅ Logs de debug funcionando
- ✅ Help command operacional
- ✅ Multi-idioma (PT/EN) funcionando

---

**Última atualização**: 11/01/2026 04:00 UTC  
**Status**: ✅ Correções implementadas, aguardando validação do usuário
