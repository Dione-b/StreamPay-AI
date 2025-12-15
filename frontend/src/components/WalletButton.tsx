/**
 * WalletButton Component
 * Botão para conectar/desconectar carteira
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export function WalletButton() {
  const { isAuthenticated, wallet, isLoading, error, login, logout, clearError } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
      >
        Carregando...
      </button>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-red-600">{error}</div>
        <button
          onClick={clearError}
          className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          Limpar
        </button>
      </div>
    );
  }

  if (isAuthenticated && wallet) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm font-mono bg-blue-50 px-3 py-2 rounded border border-blue-200">
          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
        </div>
        <button
          onClick={logout}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? 'Desconectando...' : 'Desconectar'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {isLoading ? 'Conectando...' : 'Conectar Carteira'}
    </button>
  );
}
