# ⏭️ Próximos Passos - Imediatos (Fase 2.1)

**Preparado para**: 15 de dezembro de 2025  
**Prioridade**: ALTA  
**Tempo Estimado**: 2-3 dias

---

## 🎯 O que fazer agora

### 1️⃣ Validar Setup Local (30 min)

```bash
# Terminal 1: Backend
cd backend && npm run dev
# Deve exibir: "Server listening on port 3001"

# Terminal 2: ElizaOS
cd streampay-eliza && npm run dev
# Deve exibir: "Agent ready on port 3002"

# Terminal 3: Frontend
cd frontend
npm install swr axios
npm run dev
# Deve exibir: "Ready in ..."
```

Depois acessar:
```
http://localhost:3000/dashboard
```

Teste checklist:
- [ ] Página carrega
- [ ] WalletButton aparece
- [ ] Botão de conectar funciona
- [ ] MetaMask abre corretamente
- [ ] Assinar mensagem funciona
- [ ] Dashboard carrega após login

### 2️⃣ Instalar Dependências para Forms (10 min)

```bash
cd frontend
npm install zod                    # Validação
npm install react-hook-form        # Forms
npm install --save-dev @hookform/resolvers
```

### 3️⃣ Criar Form para Criar Stream (Fase 2.1)

**Arquivo**: `frontend/src/components/CreateStreamForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStreams } from '@/hooks/useStreams';

// Zod Schema para validação
const createStreamSchema = z.object({
  recipient: z.string()
    .min(42, 'Endereço deve ter 42 caracteres')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Endereço inválido'),
  amount: z.string()
    .refine(val => !isNaN(parseFloat(val)), 'Deve ser um número')
    .refine(val => parseFloat(val) > 0, 'Deve ser maior que 0'),
  token: z.enum(['USDC', 'DAI', 'USDT', 'ETH', 'MATIC']),
  duration: z.string()
    .refine(val => !isNaN(parseInt(val)), 'Deve ser um número')
    .refine(val => parseInt(val) > 0 && parseInt(val) <= 365, 'Entre 1 e 365'),
  durationUnit: z.enum(['hours', 'days', 'weeks', 'months']),
});

type FormData = z.infer<typeof createStreamSchema>;

export function CreateStreamForm() {
  const { createStream, isLoading, error } = useStreams();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(createStreamSchema),
    defaultValues: {
      token: 'USDC',
      durationUnit: 'days',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createStream({
        recipient: data.recipient,
        token: data.token,
        amount: data.amount,
        duration: parseInt(data.duration),
        durationUnit: data.durationUnit,
      });
      reset();
    } catch (err) {
      console.error('Erro ao criar stream:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Criar Stream</h3>

      {/* Recipient */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Endereço do Destinatário
        </label>
        <input
          {...register('recipient')}
          placeholder="0x..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.recipient && (
          <p className="text-xs text-red-600 mt-1">{errors.recipient.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Quantidade
        </label>
        <input
          {...register('amount')}
          placeholder="1000"
          type="number"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.amount && (
          <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>
        )}
      </div>

      {/* Token */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Token
        </label>
        <select
          {...register('token')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="USDC">USDC</option>
          <option value="DAI">DAI</option>
          <option value="USDT">USDT</option>
          <option value="ETH">ETH</option>
          <option value="MATIC">MATIC</option>
        </select>
        {errors.token && (
          <p className="text-xs text-red-600 mt-1">{errors.token.message}</p>
        )}
      </div>

      {/* Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Duração
          </label>
          <input
            {...register('duration')}
            placeholder="30"
            type="number"
            min="1"
            max="365"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.duration && (
            <p className="text-xs text-red-600 mt-1">{errors.duration.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Unidade
          </label>
          <select
            {...register('durationUnit')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hours">Horas</option>
            <option value="days">Dias</option>
            <option value="weeks">Semanas</option>
            <option value="months">Meses</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
      >
        {isLoading ? 'Criando...' : 'Criar Stream'}
      </button>
    </form>
  );
}
```

### 4️⃣ Adicionar Form ao Dashboard

**Editar**: `frontend/app/dashboard.tsx`

```tsx
// Adicionar import
import { CreateStreamForm } from '@/components/CreateStreamForm';

// Dentro do layout principal, adicionar abaixo do ChatBox:
<div className="bg-white rounded-lg shadow-md p-4">
  <CreateStreamForm />
</div>
```

### 5️⃣ Criar Form para Reivindicar (Alternativa ao Chat)

**Arquivo**: `frontend/src/components/ClaimStreamForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useStreams } from '@/hooks/useStreams';

export function ClaimStreamForm({ streamId, onSuccess }: { streamId: string; onSuccess?: () => void }) {
  const { claimStream, isLoading } = useStreams();
  const [error, setError] = useState<string | null>(null);

  const handleClaim = async () => {
    try {
      await claimStream(streamId);
      setError(null);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao reivindicar');
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      <button
        onClick={handleClaim}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
      >
        {isLoading ? 'Reclamando...' : 'Reivindicar Tokens'}
      </button>
    </div>
  );
}
```

---

## 🧪 Teste de Ponta a Ponta

### Scenario 1: Criar Stream via Form
1. Dashboard carregado
2. Preencher CreateStreamForm
3. Clicar "Criar Stream"
4. Confirmar em MetaMask
5. Ver novo stream na lista

### Scenario 2: Reivindicar via Chat
1. Digitar "Reivindicar do stream 1"
2. Agente retorna resposta
3. Ver stream atualizado com novos tokens

### Scenario 3: Criar via Chat
1. Digitar "Criar stream de 1000 USDC para 0x... por 30 dias"
2. Agente processa e cria
3. Ver novo stream na lista

---

## 📊 Testing Checklist

Antes de começar Fase 2.2:

- [ ] Form valida recipient (0x...)
- [ ] Form valida amount (> 0)
- [ ] Form valida duration (1-365)
- [ ] Criar stream funciona
- [ ] Novo stream aparece na lista
- [ ] Reivindicar via form funciona
- [ ] Reivindicar via chat funciona
- [ ] Pause funciona
- [ ] Cancel funciona
- [ ] Erros exibem mensagens úteis
- [ ] Loading states aparecem
- [ ] Toast notifications funcionam

---

## 🚀 Git Workflow

```bash
# Criar branch
git checkout -b feature/forms

# Commit
git add frontend/src/components/CreateStreamForm.tsx
git commit -m "feat: add CreateStreamForm with Zod validation"

# Push
git push origin feature/forms

# Pull request
# → Review → Merge
```

---

## 📚 Referências

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Tailwind Forms](https://tailwindui.com/components/application-ui/forms)
- [Next.js Best Practices](https://nextjs.org/docs)

---

## ⚡ Prioridade de Tasks

| # | Task | Prioridade | Tempo | Status |
|---|------|-----------|-------|--------|
| 1 | Validar Setup | 🔴 CRÍTICA | 30 min | ⏳ |
| 2 | Instalar Zod + RHF | 🔴 CRÍTICA | 10 min | ⏳ |
| 3 | CreateStreamForm | 🟠 ALTA | 1h | ⏳ |
| 4 | Integrar ao Dashboard | 🟠 ALTA | 30 min | ⏳ |
| 5 | Testes E2E | 🟠 ALTA | 1h | ⏳ |
| 6 | Polimentos UI | 🟡 MÉDIA | 1h | ⏳ |

---

## 🎯 ETA

- **Setup validado**: 15 de dez (hoje)
- **Forms implementados**: 16 de dez
- **Testes passando**: 17 de dez
- **Fase 2 completa**: 21 de dez

---

**Desenvolvido com ❤️ pelo StreamPay Team**
