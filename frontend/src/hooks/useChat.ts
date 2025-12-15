/**
 * useChat Hook
 * Gerenciar conversa com o agente ElizaOS
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { agentService, AgentMessage, AgentResponse } from '@/services/agent';

export interface ChatState {
  messages: AgentMessage[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

export function useChat(userAddress?: string, authToken?: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    isConnected: false,
  });

  const conversationIdRef = useRef<string>(Math.random().toString(36).substr(2, 9));

  // Conectar WebSocket na inicialização
  useEffect(() => {
    if (userAddress && authToken) {
      agentService
        .connectWebSocket(
          userAddress,
          authToken,
          (data) => {
            // Receber mensagem do agente
            if (data.type === 'message') {
              setState((prev) => ({
                ...prev,
                messages: [
                  ...prev.messages,
                  {
                    role: 'assistant',
                    content: data.message,
                    timestamp: Date.now(),
                    data: data.data,
                  },
                ],
              }));
            }

            // Receber atualização de status
            if (data.type === 'status') {
              console.log('Status do agente:', data.status);
            }
          },
          (error) => {
            setState((prev) => ({
              ...prev,
              error: error.message,
              isConnected: false,
            }));
          }
        )
        .then(() => {
          setState((prev) => ({
            ...prev,
            isConnected: true,
            error: null,
          }));
        })
        .catch((error) => {
          console.error('Erro ao conectar WebSocket:', error);
        });
    }

    return () => {
      agentService.disconnectWebSocket();
    };
  }, [userAddress, authToken]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!userAddress || !authToken) {
        setState((prev) => ({
          ...prev,
          error: 'Não autenticado',
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'user',
            content: message,
            timestamp: Date.now(),
          },
        ],
        isLoading: true,
        error: null,
      }));

      try {
        const response = await agentService.sendMessage(message, userAddress, authToken);

        if (!response.success) {
          throw new Error(response.response || 'Erro ao processar comando');
        }

        setState((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              role: 'assistant',
              content: response.response,
              timestamp: Date.now(),
              data: response.data,
            },
          ],
          isLoading: false,
        }));
      } catch (error: any) {
        const errorMessage = error.message || 'Erro desconhecido';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          messages: [
            ...prev.messages,
            {
              role: 'assistant',
              content: `❌ ${errorMessage}`,
              timestamp: Date.now(),
            },
          ],
        }));
      }
    },
    [userAddress, authToken]
  );

  const clearMessages = useCallback(() => {
    setState((prev) => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const loadAvailableCommands = useCallback(async () => {
    try {
      const commands = await agentService.getAvailableCommands();
      return commands;
    } catch (error) {
      console.error('Erro ao obter comandos:', error);
      return [];
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const isHealthy = await agentService.checkHealth();
      setState((prev) => ({
        ...prev,
        isConnected: isHealthy,
      }));
      return isHealthy;
    } catch (error) {
      console.error('Erro ao verificar saúde do agente:', error);
      return false;
    }
  }, []);

  return {
    ...state,
    sendMessage,
    clearMessages,
    clearError,
    loadAvailableCommands,
    checkHealth,
    conversationId: conversationIdRef.current,
  };
}
