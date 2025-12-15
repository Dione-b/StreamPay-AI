/**
 * ElizaOS Agent Service
 * Integração com o agente de IA para comandos em linguagem natural
 */

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  data?: any;
}

export interface AgentResponse {
  response: string;
  success: boolean;
  data?: any;
  intent?: string;
  confidence?: number;
}

export interface ChatSession {
  id: string;
  messages: AgentMessage[];
  userAddress: string;
  createdAt: number;
  updatedAt: number;
}

class AgentService {
  private agentUrl: string;
  private webSocket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;

  constructor() {
    this.agentUrl = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:3002';
  }

  /**
   * Enviar mensagem ao agente e obter resposta
   */
  async sendMessage(message: string, userAddress: string, authToken: string): Promise<AgentResponse> {
    try {
      const response = await fetch(`${this.agentUrl}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          message,
          userAddress,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        response: data.response || 'Erro ao processar comando',
        success: data.success ?? false,
        data: data.data,
        intent: data.intent,
        confidence: data.confidence,
      };
    } catch (error: any) {
      return {
        response: `Erro ao comunicar com o agente: ${error.message}`,
        success: false,
      };
    }
  }

  /**
   * Obter lista de comandos disponíveis
   */
  async getAvailableCommands(): Promise<any[]> {
    try {
      const response = await fetch(`${this.agentUrl}/commands`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.commands || [];
    } catch (error) {
      console.error('Erro ao obter comandos:', error);
      return [];
    }
  }

  /**
   * Verificar saúde do agente
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.agentUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Conectar WebSocket para updates em tempo real
   */
  connectWebSocket(
    userAddress: string,
    authToken: string,
    onMessage: (data: any) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.agentUrl.replace(/^http/, 'ws');
        this.webSocket = new WebSocket(`${wsUrl}/ws?token=${authToken}&address=${userAddress}`);

        this.webSocket.onopen = () => {
          console.log('WebSocket conectado ao agente');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.webSocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };

        this.webSocket.onerror = (event) => {
          const error = new Error('Erro na conexão WebSocket');
          onError(error);
          reject(error);
        };

        this.webSocket.onclose = () => {
          console.log('WebSocket desconectado');
          this.attemptReconnect(userAddress, authToken, onMessage, onError);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Enviar mensagem via WebSocket
   */
  sendWebSocketMessage(data: any): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket não está conectado');
    }
  }

  /**
   * Desconectar WebSocket
   */
  disconnectWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
    }
  }

  /**
   * Tentar reconectar ao WebSocket
   */
  private attemptReconnect(
    userAddress: string,
    authToken: string,
    onMessage: (data: any) => void,
    onError: (error: Error) => void
  ): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Tentando reconectar... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connectWebSocket(userAddress, authToken, onMessage, onError).catch((error) => {
          console.error('Erro ao reconectar:', error);
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Falha ao reconectar ao WebSocket após múltiplas tentativas');
    }
  }
}

export const agentService = new AgentService();
