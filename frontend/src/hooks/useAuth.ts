/**
 * useAuth Hook
 * Gerenciar autenticação e carteira conectada
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { web3Service, WalletInfo, SignMessageResult } from '@/services/web3';
import { authApi } from '@/services/api';

export interface AuthState {
  isAuthenticated: boolean;
  wallet: WalletInfo | null;
  authToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    wallet: null,
    authToken: null,
    isLoading: false,
    error: null,
  });

  // Verificar se já está autenticado na inicialização
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedWallet = localStorage.getItem('wallet_address');

      if (token && savedWallet) {
        const wallet = await web3Service.getWalletInfo();
        if (wallet) {
          setState({
            isAuthenticated: true,
            wallet,
            authToken: token,
            isLoading: false,
            error: null,
          });
        }
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Conectar carteira
      const wallet = await web3Service.connectWallet();

      // Preparar mensagem para assinar
      const message = `Assinar para autenticar no StreamPay\n\nEndereço: ${wallet.address}\nTimestamp: ${Date.now()}`;

      // Assinar mensagem
      const signResult = await web3Service.signMessage(message, wallet.address);

      // Fazer login no backend
      const response = await authApi.login(wallet.address, signResult.signature);

      if (!response.success || !response.data) {
        throw new Error('Falha na autenticação');
      }

      const { token } = response.data as { token: string };

      // Salvar token e dados
      localStorage.setItem('auth_token', token);
      localStorage.setItem('wallet_address', wallet.address);

      setState({
        isAuthenticated: true,
        wallet,
        authToken: token,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao autenticar';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Fazer logout no backend
      await authApi.logout();

      // Desconectar carteira
      await web3Service.disconnectWallet();

      // Limpar dados locais
      localStorage.removeItem('auth_token');
      localStorage.removeItem('wallet_address');

      setState({
        isAuthenticated: false,
        wallet: null,
        authToken: null,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer logout';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const switchToPolygon = useCallback(async () => {
    try {
      await web3Service.switchToPolygon();
      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Erro ao mudar de rede',
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    switchToPolygon,
    clearError,
  };
}
