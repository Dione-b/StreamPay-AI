/**
 * StreamPay Agent Orchestrator
 * Main agent that coordinates between Moralis, Chainlink, and Backend API
 * Processes natural language commands and executes actions
 */

import { Character, IAgentRuntime, Memory, State, HandlerCallback, Content } from '@elizaos/core';
import {
  ServiceFactory,
  ServiceConfig,
  IntentParser,
  StreamPayIntent,
  ActionHandler,
  ParsedIntent,
} from '../services';

interface StreamPayAgentConfig extends ServiceConfig {
  characterId?: string;
}

/**
 * StreamPay Agent - Processes user messages and executes StreamPay operations
 */
export class StreamPayAgent {
  private serviceFactory: ServiceFactory;
  private intentParser: IntentParser;
  private actionHandler?: ActionHandler;
  private config: StreamPayAgentConfig;

  constructor(config: StreamPayAgentConfig) {
    this.config = config;
    this.serviceFactory = new ServiceFactory(config);
    this.intentParser = this.serviceFactory.getIntentParser();
  }

  /**
   * Process user message and execute corresponding action
   */
  async processMessage(
    userMessage: string,
    userAddress: string,
    authToken?: string
  ): Promise<{ response: string; data?: any; success: boolean }> {
    try {
      // Verificar se é comando de ajuda
      const lowerMessage = userMessage.toLowerCase().trim();
      if (lowerMessage === 'help' || lowerMessage === 'ajuda' || lowerMessage === 'comandos') {
        return {
          success: true,
          response: this.getHelpMessage(),
        };
      }

      // Atualizar config com userAddress e authToken do contexto atual
      this.config.userAddress = userAddress;
      this.config.authToken = authToken;

      // Parse user intent
      const parsedIntent = this.intentParser.parseIntent(userMessage);

      console.log('[StreamPayAgent] Parsed Intent:', {
        intent: parsedIntent.intent,
        confidence: parsedIntent.confidence,
        parameters: parsedIntent.parameters,
        originalMessage: parsedIntent.originalMessage,
      });

      // Validate intent has required parameters
      const isValid = this.intentParser.validateIntent(parsedIntent);
      
      console.log('[StreamPayAgent] Validation result:', {
        isValid,
        intent: parsedIntent.intent,
        hasParameters: Object.keys(parsedIntent.parameters).length > 0,
      });

      if (!isValid) {
        const errorMessage = this.generateValidationErrorMessage(parsedIntent);
        console.log('[StreamPayAgent] Returning validation error:', errorMessage.substring(0, 100) + '...');
        return {
          success: false,
          response: errorMessage,
        };
      }

      // Create action handler with user context (agora com userAddress e authToken atualizados)
      const handler = this.serviceFactory.getActionHandler();
      this.actionHandler = handler;

      // Execute action
      const actionResult = await handler.execute(parsedIntent);

      return {
        success: actionResult.success,
        response: actionResult.message,
        data: actionResult.data,
      };
    } catch (error) {
      console.error('[StreamPayAgent] Error processing message:', error);
      const errorMessage = error instanceof Error ? error.message : 'erro desconhecido';
      
      // Log detalhado para debugging
      console.error('[StreamPayAgent] Error details:', {
        message: userMessage,
        userAddress,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Mensagens de erro mais específicas
      if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
        return {
          success: false,
          response: 'Erro de conexão. Verifique se os serviços estão disponíveis e tente novamente.',
        };
      }

      if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        return {
          success: false,
          response: 'Erro de validação. Por favor, verifique os parâmetros fornecidos e tente novamente.',
        };
      }

      return {
        success: false,
        response: `Encontrei um erro ao processar sua solicitação: ${errorMessage}. Por favor, tente novamente ou reformule sua mensagem.`,
      };
    }
  }

  /**
   * Get agent status and health
   */
  async getHealth(): Promise<{
    healthy: boolean;
    moralis: boolean;
    chainlink: boolean;
    backend: boolean;
  }> {
    try {
      const moralisService = this.serviceFactory.getMoralisService();
      const chainlinkService = this.serviceFactory.getChainlinkService();

      const [moralisHealthy, chainlinkHealthy] = await Promise.all([
        moralisService.isHealthy(),
        chainlinkService.isHealthy(),
      ]);

      // Backend health would require HTTP call
      const backendHealthy = true; // Placeholder

      return {
        healthy: moralisHealthy && chainlinkHealthy && backendHealthy,
        moralis: moralisHealthy,
        chainlink: chainlinkHealthy,
        backend: backendHealthy,
      };
    } catch (error) {
      console.error('[StreamPayAgent] Health check failed:', error);
      return {
        healthy: false,
        moralis: false,
        chainlink: false,
        backend: false,
      };
    }
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): Array<{
    intent: StreamPayIntent;
    description: string;
    examples: string[];
  }> {
    return [
      {
        intent: StreamPayIntent.CREATE_STREAM,
        description: 'Create a new payment stream',
        examples: [
          'Create a stream of 1000 USDC to 0x1234... per second for 30 days',
          'Stream 100 DAI to alice.eth monthly',
        ],
      },
      {
        intent: StreamPayIntent.CLAIM_STREAM,
        description: 'Claim tokens from an active stream',
        examples: ['Claim my stream #1', 'Collect tokens from stream'],
      },
      {
        intent: StreamPayIntent.PAUSE_STREAM,
        description: 'Temporarily pause a stream',
        examples: ['Pause stream #2', 'Stop stream temporarily'],
      },
      {
        intent: StreamPayIntent.CANCEL_STREAM,
        description: 'Permanently cancel a stream',
        examples: ['Cancel stream #1', 'Delete my payment stream'],
      },
      {
        intent: StreamPayIntent.VIEW_STREAMS,
        description: 'View all your streams',
        examples: ['Show my streams', 'List active streams'],
      },
      {
        intent: StreamPayIntent.VIEW_STREAM_DETAILS,
        description: 'Get details about a specific stream',
        examples: ['Details on stream #1', 'Stream info for #2'],
      },
      {
        intent: StreamPayIntent.ADD_LIQUIDITY,
        description: 'Add liquidity to a pool',
        examples: [
          'Add 1000 USDC liquidity to pool',
          'Provide 500 DAI to liquidity pool',
        ],
      },
      {
        intent: StreamPayIntent.REMOVE_LIQUIDITY,
        description: 'Remove liquidity from a pool',
        examples: ['Remove liquidity from pool #1', 'Exit pool with my tokens'],
      },
      {
        intent: StreamPayIntent.VIEW_POOLS,
        description: 'View available liquidity pools',
        examples: ['Show pools', 'List all liquidity pools'],
      },
      {
        intent: StreamPayIntent.SWAP_TOKENS,
        description: 'Swap one token for another',
        examples: ['Swap 100 USDC for ETH', 'Convert 50 DAI to MATIC'],
      },
      {
        intent: StreamPayIntent.CHECK_BALANCE,
        description: 'Check your wallet balance',
        examples: [
          'What is my balance?',
          'Show my net worth',
          'Portfolio value',
        ],
      },
      {
        intent: StreamPayIntent.GET_PRICE,
        description: 'Get current token price',
        examples: ['What is the price of ETH?', 'USDC price?', 'BTC/USD'],
      },
    ];
  }

  /**
   * Generate validation error message
   */
  private generateValidationErrorMessage(parsed: ParsedIntent): string {
    const intentDescription = this.intentParser.getIntentDescription(parsed);
    const missingParams = this.getMissingParameters(parsed);

    console.log('[generateValidationErrorMessage]', {
      intent: parsed.intent,
      confidence: parsed.confidence,
      missingParams,
      parameters: parsed.parameters,
    });

    // Se o intent foi identificado mas está com baixa confiança
    if (parsed.confidence < 0.5) {
      return `Não tenho certeza do que você está pedindo. Poderia reformular?\n\n` +
        `📋 **Comandos disponíveis:**\n` +
        `• create stream - Criar pagamento em stream\n` +
        `• claim stream - Resgatar tokens\n` +
        `• pause stream - Pausar stream\n` +
        `• cancel stream - Cancelar stream\n` +
        `• view streams - Ver meus streams\n\n` +
        `💡 Use "help" ou "ajuda" para mais detalhes.`;
    }

    // Se o usuário apenas mencionou o comando sem parâmetros, fornecer exemplo
    if (parsed.intent === StreamPayIntent.CREATE_STREAM) {
      if (missingParams.length > 0) {
        return `Para criar um stream, preciso de algumas informações:\n\n` +
          `📝 **Exemplo de comando completo:**\n` +
          `"Criar stream de 1000 USDC para 0x1234... por 30 dias"\n\n` +
          `🔹 **Preciso de:**\n` +
          `• Valor (ex: 1000)\n` +
          `• Token (ex: USDC, DAI, ETH)\n` +
          `• Endereço do destinatário (0x...)\n` +
          `• Duração (ex: 30 dias, 1 mês)\n\n` +
          `💡 **Tente algo como:**\n` +
          `"Enviar 500 USDC para 0xabcd1234... durante 7 dias"`;
      }
    }

    if (parsed.intent === StreamPayIntent.CLAIM_STREAM) {
      if (missingParams.length > 0) {
        return `Para resgatar um stream, preciso do ID.\n\n` +
          `📝 **Exemplo:**\n` +
          `"Resgatar stream #123" ou "Claim do stream 5"`;
      }
    }

    if (parsed.intent === StreamPayIntent.PAUSE_STREAM) {
      if (missingParams.length > 0) {
        return `Para pausar um stream, preciso do ID.\n\n` +
          `📝 **Exemplo:**\n` +
          `"Pausar stream #123" ou "Parar stream 5"`;
      }
    }

    if (missingParams.length > 0) {
      return `Para ${intentDescription}, preciso de: ${missingParams.join(', ')}.\n\n` +
        `💡 **Dica:** Forneça todos os detalhes necessários em uma única mensagem.`;
    }

    return `Não consegui entender sua solicitação. Por favor, tente novamente ou digite "help" para ver os comandos disponíveis.`;
  }

  /**
   * Get missing required parameters
   */
  private getMissingParameters(parsed: ParsedIntent): string[] {
    // Define requirements using parameter KEYS, then map to human labels for display
    const requirementsByIntent: Record<StreamPayIntent, string[]> = {
      [StreamPayIntent.CREATE_STREAM]: ['recipient', 'amount', 'token'],
      [StreamPayIntent.CLAIM_STREAM]: ['streamId'],
      [StreamPayIntent.PAUSE_STREAM]: ['streamId'],
      [StreamPayIntent.CANCEL_STREAM]: ['streamId'],
      [StreamPayIntent.VIEW_STREAMS]: [],
      [StreamPayIntent.VIEW_STREAM_DETAILS]: ['streamId'],
      [StreamPayIntent.ADD_LIQUIDITY]: ['token', 'amount'],
      [StreamPayIntent.REMOVE_LIQUIDITY]: ['poolId'],
      [StreamPayIntent.VIEW_POOLS]: [],
      [StreamPayIntent.SWAP_TOKENS]: ['tokenIn', 'tokenOut', 'amount'],
      [StreamPayIntent.CHECK_BALANCE]: [],
      [StreamPayIntent.GET_PRICE]: ['symbol'],
      [StreamPayIntent.UNKNOWN]: [],
    };

    const paramLabels: Record<string, string> = {
      recipient: 'endereço do destinatário',
      amount: 'valor',
      token: 'token',
      streamId: 'ID do stream',
      poolId: 'ID do pool',
      tokenIn: 'token de entrada',
      tokenOut: 'token de saída',
      symbol: 'símbolo',
    };

    const requiredKeys = requirementsByIntent[parsed.intent] || [];
    const missing: string[] = [];

    for (const key of requiredKeys) {
      if (!(key in parsed.parameters)) {
        missing.push(paramLabels[key] || key);
      }
    }

    return missing;
  }

  /**
   * Get commands list
   */
  private getCommandsList(): string {
    return [
      'create stream',
      'claim stream',
      'pause stream',
      'cancel stream',
      'view streams',
      'add liquidity',
      'swap tokens',
      'check balance',
      'get price',
    ]
      .slice(0, 5)
      .join(', ');
  }

  /**
   * Get comprehensive help message with all available commands
   */
  private getHelpMessage(): string {
    return `
🤖 **StreamPay AI - Comandos Disponíveis**

📊 **STREAMS DE PAGAMENTO**

1️⃣ **Criar Stream**
   • Português: "Criar stream de [VALOR] [TOKEN] para [ENDEREÇO] por [DURAÇÃO]"
   • English: "Create stream of [AMOUNT] [TOKEN] to [ADDRESS] for [DURATION]"
   • Exemplo: "Criar stream de 1000 USDC para 0x1234...5678 por 30 dias"
   • Exemplo: "Create stream of 500 DAI to 0xabcd...ef00 for 7 days"

2️⃣ **Resgatar Stream**
   • Português: "Resgatar stream [STREAM_ID]"
   • English: "Claim stream [STREAM_ID]"
   • Exemplo: "Resgatar stream 0x7890...abcd"

3️⃣ **Pausar Stream**
   • Português: "Pausar stream [STREAM_ID]"
   • English: "Pause stream [STREAM_ID]"
   • Exemplo: "Pausar stream 0x7890...abcd"

4️⃣ **Cancelar Stream**
   • Português: "Cancelar stream [STREAM_ID]"
   • English: "Cancel stream [STREAM_ID]"
   • Exemplo: "Cancelar stream 0x7890...abcd"

5️⃣ **Ver Streams**
   • Português: "Ver meus streams" ou "Listar streams"
   • English: "View my streams" ou "List streams"

💧 **LIQUIDEZ & DEFI**

6️⃣ **Adicionar Liquidez**
   • Português: "Adicionar [VALOR] [TOKEN_IN] e [VALOR] [TOKEN_OUT] no pool"
   • English: "Add [AMOUNT] [TOKEN_IN] and [AMOUNT] [TOKEN_OUT] to pool"
   • Exemplo: "Adicionar 1000 USDC e 500 DAI no pool"

7️⃣ **Trocar Tokens**
   • Português: "Trocar [VALOR] [TOKEN_IN] por [TOKEN_OUT]"
   • English: "Swap [AMOUNT] [TOKEN_IN] for [TOKEN_OUT]"
   • Exemplo: "Trocar 100 USDC por DAI"

📈 **INFORMAÇÕES**

8️⃣ **Ver Saldo**
   • Português: "Qual meu saldo de [TOKEN]?" ou "Saldo [TOKEN]"
   • English: "What's my [TOKEN] balance?" ou "Balance [TOKEN]"
   • Exemplo: "Qual meu saldo de USDC?"

9️⃣ **Ver Preço**
   • Português: "Qual o preço de [TOKEN]?" ou "Preço [TOKEN]"
   • English: "What's the price of [TOKEN]?" ou "Price [TOKEN]"
   • Exemplo: "Qual o preço de ETH?"

🔧 **Tokens Suportados:** USDC, DAI, USDT, WETH, ETH
⏱️ **Durações:** dias/days, semanas/weeks, meses/months

💡 **Dica:** Use o comando completo com todos os parâmetros para melhor resultado!
    `.trim();
  }
}

/**
 * Create StreamPay agent factory
 */
export const createStreamPayAgent = (config: StreamPayAgentConfig): StreamPayAgent => {
  return new StreamPayAgent(config);
};

/**
 * Export for ElizaOS integration
 */
export const streamPayAgentPlugin = {
  name: 'streamPay',
  description: 'StreamPay DeFi agent for payment streams and liquidity management',
  version: '1.0.0',

  // ElizaOS actions would be registered here
  actions: [],

  // ElizaOS evaluators would be registered here
  evaluators: [],

  // ElizaOS providers would be registered here
  providers: [],
};
