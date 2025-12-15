# 🔐 Guia: Implementar Autenticação Web3 com MetaMask

## Objetivo
Permitir que usuários façam login com MetaMask, assinem uma mensagem e recebam um JWT válido para acessar a API.

## Fluxo de Autenticação

```
Usuário → Clica "Connect MetaMask"
   ↓
Frontend → Solicita signature via ethers.js
   ↓
MetaMask → Abre popup para assinar mensagem
   ↓
Usuário → Confirma assinatura
   ↓
Frontend → Envia assinatura + endereço para backend
   ↓
Backend → Verifica signature com ethers.js
   ↓
Backend → Gera JWT com endereço do usuário
   ↓
Frontend → Armazena JWT no localStorage
   ↓
Frontend → Usa JWT em requisições futuras (Authorization header)
```

## Passo 1: Criar Componente Web3Auth

**Arquivo**: `frontend/app/components/Web3Auth.tsx`

```typescript
'use client';

import { useState } from 'react';
import { BrowserProvider } from 'ethers';

interface Web3AuthProps {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
}

export function Web3Auth({ onSuccess, onError }: Web3AuthProps) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setLoading(true);

      // Verificar se MetaMask está instalado
      if (!window.ethereum) {
        throw new Error('MetaMask não encontrado. Instale a extensão!');
      }

      // Solicitar conexão com MetaMask
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const userAddress = accounts[0];

      setAddress(userAddress);
      setConnected(true);

      // Solicitar assinatura de mensagem
      const signer = await provider.getSigner();
      const message = `
StreamPay AI Authentication
Address: ${userAddress}
Timestamp: ${Date.now()}

Assinando esta mensagem para confirmar sua identidade.
      `.trim();

      const signature = await signer.signMessage(message);

      // Enviar para backend para verificação
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: userAddress,
          message,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao verificar assinatura');
      }

      const data = await response.json();
      const token = data.token;

      // Armazenar token
      localStorage.setItem('authToken', token);
      localStorage.setItem('userAddress', userAddress);

      onSuccess?.(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Erro de autenticação:', errorMessage);
      onError?.(errorMessage);
      setConnected(false);
      setAddress(null);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAddress');
    setConnected(false);
    setAddress(null);
  };

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Conectando...' : 'Conectar MetaMask'}
    </button>
  );
}
```

## Passo 2: Criar Endpoint de Verificação no Backend

**Arquivo**: `backend/src/routes/auth.ts`

```typescript
import express from 'express';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/verify', async (req, res) => {
  try {
    const { address, message, signature } = req.body;

    if (!address || !message || !signature) {
      return res.status(400).json({
        error: 'Endereço, mensagem e assinatura são obrigatórios',
      });
    }

    // Recuperar endereço da assinatura
    const recoveredAddress = verifyMessage(message, signature);

    // Validar que o endereço corresponde
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        error: 'Assinatura inválida',
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        id: address,
        address,
        email: `${address}@streampay.local`,
        role: 'user',
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      address,
      message: 'Autenticação bem-sucedida',
    });
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    res.status(500).json({
      error: 'Erro ao verificar assinatura',
    });
  }
});

export default router;
```

## Passo 3: Integrar no Backend Principal

**Arquivo**: `backend/src/index.ts`

```typescript
import authRouter from './routes/auth';

// ... outros imports ...

const app = express();

// ... outros middlewares ...

// Adicionar rotas de autenticação
app.use('/api/auth', authRouter);

// ... resto do código ...
```

## Passo 4: Criar Hook para Usar no Frontend

**Arquivo**: `frontend/app/hooks/useAuth.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar token e endereço do localStorage
    const savedToken = localStorage.getItem('authToken');
    const savedAddress = localStorage.getItem('userAddress');

    if (savedToken && savedAddress) {
      setToken(savedToken);
      setAddress(savedAddress);
    }

    setLoading(false);
  }, []);

  return {
    token,
    address,
    isAuthenticated: !!token,
    loading,
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userAddress');
      setToken(null);
      setAddress(null);
    },
  };
}
```

## Passo 5: Atualizar Requisições da API

**Exemplo**: `frontend/app/lib/api.ts`

```typescript
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(
    `http://localhost:3001/api${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    // Token inválido - limpar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAddress');
    // Redirecionar para login
    window.location.href = '/login';
  }

  return response;
}
```

## Passo 6: Usar no Componente de Login

**Arquivo**: `frontend/app/login/page.tsx`

```typescript
'use client';

import { Web3Auth } from '@/app/components/Web3Auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6">StreamPay AI</h1>
        <p className="text-gray-600 mb-8">
          Conecte com sua wallet MetaMask para continuar
        </p>

        <Web3Auth
          onSuccess={() => {
            router.push('/dashboard');
          }}
          onError={(error) => {
            alert(`Erro: ${error}`);
          }}
        />

        <p className="text-sm text-gray-500 mt-4">
          ℹ️ Certifique-se de que MetaMask está na rede Sepolia testnet
        </p>
      </div>
    </div>
  );
}
```

## Passo 7: Instalar Dependências Necessárias

```bash
# No backend
npm install ethers jsonwebtoken
npm install --save-dev @types/jsonwebtoken

# No frontend (já devem estar instaladas)
npm install ethers viem wagmi
```

## Testes Após Implementação

### 1. Teste no Navegador
```bash
# Terminal 1: Iniciar stack
./start-stack.sh

# Terminal 2: Abrir navegador
open http://localhost:3003/login
```

### 2. Teste Automático E2E
```bash
# Atualizar test-e2e.sh para usar nova rota de auth
./test-e2e.sh
```

### 3. Verificar JWT Gerado
```bash
# Decodificar token em https://jwt.io
# Deve conter: { id, address, email, role }
```

## Verificação de Segurança

- ✅ Verificação de assinatura criptográfica
- ✅ JWT com expiração de 24h
- ✅ Endereço validado na mensagem
- ✅ Token armazenado em localStorage (⚠️ considerar httpOnly em produção)
- ✅ CORS configurado para frontend

## Próximos Passos

1. **Implementar refresh tokens** - Para renovar sessão sem re-login
2. **Adicionar 2FA** - Autenticação de dois fatores
3. **Database de usuários** - Armazenar histórico de login
4. **Rate limiting** - Prevenir abuso de autenticação
5. **Social login** - Adicionar Google/Discord como opções

---

## Troubleshooting

### Erro: "MetaMask não encontrado"
- Instale a extensão: https://metamask.io

### Erro: "Assinatura inválida"
- Verifique se está na rede Sepolia
- Confirme o endereço está correto

### Erro: "Token inválido"
- Verifique JWT_SECRET no backend
- Confirme token não expirou

### Erro: CORS
- Verifique origin na configuração CORS do backend
- Deve permitir http://localhost:3003

---

**Status**: ✅ Pronto para implementar  
**Tempo estimado**: 1-2 horas  
**Complexidade**: Médio
