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
      // Atualizar config com userAddress e authToken do contexto atual
      this.config.userAddress = userAddress;
      this.config.authToken = authToken;

      // Parse user intent
      const parsedIntent = this.intentParser.parseIntent(userMessage);

      console.log('[StreamPayAgent] Parsed Intent:', {
        intent: parsedIntent.intent,
        confidence: parsedIntent.confidence,
        parameters: parsedIntent.parameters,
      });

      // Validate intent has required parameters
      if (!this.intentParser.validateIntent(parsedIntent)) {
        return {
          success: false,
          response: this.generateValidationErrorMessage(parsedIntent),
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

    if (missingParams.length > 0) {
      return `Para ${intentDescription}, preciso de: ${missingParams.join(', ')}.\n\nPoderia fornecer esses detalhes?`;
    }

    if (parsed.confidence < 0.5) {
      return `Não tenho certeza do que você está pedindo. Poderia reformular? Comandos disponíveis: ${this.getCommandsList()}`;
    }

    return `Não consegui entender sua solicitação. Por favor, tente novamente.`;
  }

  /**
   * Get missing required parameters
   */
  private getMissingParameters(parsed: ParsedIntent): string[] {
    const requirements: Record<StreamPayIntent, string[]> = {
      [StreamPayIntent.CREATE_STREAM]: ['recipient address', 'amount', 'token type'],
      [StreamPayIntent.CLAIM_STREAM]: ['stream ID'],
      [StreamPayIntent.PAUSE_STREAM]: ['stream ID'],
      [StreamPayIntent.CANCEL_STREAM]: ['stream ID'],
      [StreamPayIntent.VIEW_STREAMS]: [],
      [StreamPayIntent.VIEW_STREAM_DETAILS]: ['stream ID'],
      [StreamPayIntent.ADD_LIQUIDITY]: ['token', 'amount'],
      [StreamPayIntent.REMOVE_LIQUIDITY]: ['pool ID'],
      [StreamPayIntent.VIEW_POOLS]: [],
      [StreamPayIntent.SWAP_TOKENS]: ['input token', 'output token', 'amount'],
      [StreamPayIntent.CHECK_BALANCE]: [],
      [StreamPayIntent.GET_PRICE]: ['token symbol'],
      [StreamPayIntent.UNKNOWN]: [],
    };

    const required = requirements[parsed.intent] || [];
    const missing: string[] = [];

    const paramMap: Record<string, string> = {
      recipient: 'endereço do destinatário',
      amount: 'valor',
      token: 'token',
      streamId: 'ID do stream',
      poolId: 'ID do pool',
      tokenIn: 'token de entrada',
      tokenOut: 'token de saída',
      symbol: 'símbolo',
    };

    for (const req of required) {
      const paramKey = Object.keys(paramMap).find((k) => paramMap[k] === req);
      if (paramKey && !(paramKey in parsed.parameters)) {
        missing.push(req);
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
