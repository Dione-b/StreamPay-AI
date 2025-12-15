# ⚙️ Rules - Arquiteto Web3 StreamPay

**Documento**: Regras e padrões para desenvolvimento no projeto StreamPay  
**Versão**: 1.0  
**Última Atualização**: 14 de dezembro de 2025

---

## 🎯 Filosofia do Projeto

- **Type Safety First**: 100% TypeScript com strict mode
- **Security by Default**: Validação em 2 camadas (client + server)
- **Developer Experience**: Código limpo, bem documentado, fácil de entender
- **Performance**: Otimizado para velocidade sem sacrificar qualidade
- **Scalability**: Preparado para crescimento

---

## 📝 Padrões de Código

### TypeScript

```typescript
// ✅ BOM: Tipos explícitos, sem any
interface Stream {
  id: string;
  recipient: string;
  amount: bigint;
  startDate: Date;
}

const getStream = (id: string): Promise<Stream> => {
  // implementation
};

// ❌ RUIM: any type
const getStream = (id: any): any => {
  // implementation
};
```

### Naming Conventions

**Arquivos**
- Components: `PascalCase.tsx` → `CreateStreamForm.tsx`
- Services: `camelCase.ts` → `api.service.ts`
- Hooks: `usePattern.ts` → `useStreams.ts`
- Types: `types.ts` ou `index.ts`

**Variáveis**
- Constants: `SCREAMING_SNAKE_CASE` → `MAX_AMOUNT`
- Variables: `camelCase` → `streamId`
- Private: `_privateVar`

### Error Handling

```typescript
// ✅ BOM: Try-catch com tipos específicos
try {
  const data = await api.post('/streams', payload);
  toast.success('Stream criado!');
} catch (error) {
  if (error instanceof ValidationError) {
    toast.error(error.message);
  } else {
    toast.error('Erro desconhecido');
  }
}

// ❌ RUIM: Ignorar erros
const data = await api.post('/streams', payload);
```

### Comments & Documentation

```typescript
/**
 * Cria um novo stream de pagamento
 * @param recipient - Endereço do destinatário (validado)
 * @param amount - Quantidade em wei (use BigInt)
 * @param duration - Duração em segundos
 * @returns Promise com ID do stream criado
 * @throws ValidationError se dados inválidos
 * @example
 * const streamId = await createStream('0x...', BigInt('1000'), 3600);
 */
export const createStream = async (
  recipient: string,
  amount: bigint,
  duration: number
): Promise<string> => {
  // implementation
};
```

---

## 🏗️ Arquitetura de Camadas

### Frontend

```
Pages (Next.js)
  ↓
Components (React)
  ↓
Hooks (State & Logic)
  ↓
Services (API, Web3, Agent)
  ↓
Lib (Validations, Utils)
```

**Responsabilidades**:
- **Pages**: Routing, layout, proteção
- **Components**: Render UI, user interaction
- **Hooks**: State management, side effects
- **Services**: API calls, blockchain, external APIs
- **Lib**: Utilities, validators, constants

### Backend

```
Routes (Express)
  ↓
Controllers/Handlers
  ↓
Services (Business Logic)
  ↓
Database (Prisma)
```

**Responsabilidades**:
- **Routes**: Define endpoints
- **Controllers**: Handle requests
- **Services**: Business logic
- **Database**: Data persistence

---

## 🔐 Segurança

### Input Validation

```typescript
// ✅ BOM: Validação em 2 camadas
import { z } from 'zod';

const createStreamSchema = z.object({
  recipient: z.string().refine(isValidAddress, 'Endereço inválido'),
  amount: z.bigint().positive(),
  duration: z.number().int().positive()
});

// Client-side (immediate feedback)
const form = useForm({
  resolver: zodResolver(createStreamSchema)
});

// Server-side (security)
const validated = createStreamSchema.parse(req.body);
```

### Authentication

```typescript
// ✅ BOM: JWT + EIP-191 signing
const token = await generateJWT(address);
const message = `Sign this message to confirm ownership: ${address}`;
const signature = await web3.signMessage(message);
```

### Secrets Management

```typescript
// ✅ BOM: Use environment variables
const API_KEY = process.env.MORALIS_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// ❌ RUIM: Hardcoded secrets
const API_KEY = 'sk_live_xxxxx';
```

---

## 📦 Dependências

### Frontend Stack

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "zod": "^3.22",
  "react-hook-form": "^7.47",
  "axios": "^1.6",
  "ethers": "^6.x",
  "tailwindcss": "3.x"
}
```

### Backend Stack

```json
{
  "express": "^4.18",
  "typescript": "5.x",
  "prisma": "^5.x",
  "zod": "^3.22",
  "@anthropic-ai/sdk": "^0.x",
  "ethers": "^6.x"
}
```

---

## 🧪 Testes

### Unit Tests

```typescript
describe('useStreams', () => {
  it('should create a stream', async () => {
    const { result } = renderHook(() => useStreams());
    
    await act(async () => {
      await result.current.createStream({
        recipient: '0x123...',
        amount: BigInt('1000'),
        duration: 3600
      });
    });
    
    expect(result.current.streams).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
describe('POST /streams', () => {
  it('should create a stream with valid data', async () => {
    const res = await request(app)
      .post('/api/streams')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipient: '0x123...',
        amount: '1000',
        duration: 3600
      });
    
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });
});
```

---

## 📋 Git Workflow

### Commit Messages

```bash
# Feature
git commit -m "feat: adicionar CreateStreamForm com validação"

# Bug fix
git commit -m "fix: corrigir validação de endereço em RemoveLiquidityForm"

# Docs
git commit -m "docs: atualizar README com instruções de setup"

# Refactor
git commit -m "refactor: simplificar WebSocketManager"
```

### Branch Naming

```bash
feature/stream-creation
bugfix/wallet-connection
docs/api-documentation
refactor/component-extraction
```

---

## 📊 Performance Guidelines

### Frontend

- **Bundle Size**: < 300KB (gzipped)
- **Core Web Vitals**:
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1
- **Time to Interactive**: < 3s

### Backend

- **API Response Time**: < 500ms (p95)
- **Database Query Time**: < 100ms
- **Error Rate**: < 0.1%

---

## ✅ Checklist de Qualidade

Antes de fazer PR:

- [ ] Código segue TypeScript strict mode
- [ ] Validação em 2 camadas (client + server)
- [ ] Tratamento de erros completo
- [ ] JSDoc comments em funções públicas
- [ ] Testes unitários (coverage > 80%)
- [ ] Sem console.log em produção
- [ ] Responsive design testado
- [ ] Performance OK (Lighthouse > 90)
- [ ] Documentação atualizada
- [ ] README atualizado se necessário

---

## 🚀 Deploy Checklist

- [ ] Todos os testes passando
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Secrets configurados
- [ ] Environment variables corretos
- [ ] Database migrations executadas
- [ ] Monitoring configurado
- [ ] Rollback plan definido

---

## 📚 Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zod Documentation](https://zod.dev)
- [React Best Practices](https://react.dev)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Web3 Security](https://smartcontractresearch.org)

---

**Última atualização**: 14 de dezembro de 2025  
**Versão**: 1.0  
**Status**: ✅ Ativo
