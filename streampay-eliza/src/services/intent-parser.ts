/**
 * Intent Parser - Analyzes user messages to extract StreamPay actions
 * Uses patterns and AI to understand user intent
 */

export enum StreamPayIntent {
  CREATE_STREAM = 'CREATE_STREAM',
  CLAIM_STREAM = 'CLAIM_STREAM',
  PAUSE_STREAM = 'PAUSE_STREAM',
  CANCEL_STREAM = 'CANCEL_STREAM',
  VIEW_STREAMS = 'VIEW_STREAMS',
  VIEW_STREAM_DETAILS = 'VIEW_STREAM_DETAILS',
  ADD_LIQUIDITY = 'ADD_LIQUIDITY',
  REMOVE_LIQUIDITY = 'REMOVE_LIQUIDITY',
  VIEW_POOLS = 'VIEW_POOLS',
  SWAP_TOKENS = 'SWAP_TOKENS',
  CHECK_BALANCE = 'CHECK_BALANCE',
  GET_PRICE = 'GET_PRICE',
  UNKNOWN = 'UNKNOWN',
}

export interface ParsedIntent {
  intent: StreamPayIntent;
  confidence: number; // 0-1
  parameters: Record<string, any>;
  originalMessage: string;
  reasoning: string;
}

/**
 * Intent Parser Service
 */
export class IntentParser {
  private patterns: Map<StreamPayIntent, RegExp[]> = new Map([
    [
      StreamPayIntent.CREATE_STREAM,
      [
        /create.*stream/i,
        /send.*payment.*stream/i,
        /setup.*payment.*stream/i,
        /stream\s+(\d+)\s+(?:tokens?|of)\s+(\w+)\s+to\s+(.+)/i,
        /pay\s+(.+)\s+(\d+)\s+(\w+)\s+(?:per\s+)?(\w+)/i,
        // Português
        /criar.*stream/i,
        /enviar.*pagamento/i,
        /configurar.*pagamento/i,
        /pagar\s+(.+)\s+(\d+)\s+(\w+)/i,
        /stream\s+de\s+(\d+)\s+(\w+)\s+para\s+(.+)/i,
      ],
    ],
    [
      StreamPayIntent.CLAIM_STREAM,
      [
        /claim.*stream/i,
        /withdraw.*stream/i,
        /collect.*stream/i,
        /claim.*tokens?/i,
        // Português
        /reivindicar.*stream/i,
        /sacar.*stream/i,
        /coletar.*stream/i,
        /resgatar.*tokens?/i,
        /pedir.*pagamento/i,
      ],
    ],
    [
      StreamPayIntent.PAUSE_STREAM,
      [
        /pause.*stream/i,
        /stop.*stream/i,
        /suspend.*stream/i,
        // Português
        /pausar.*stream/i,
        /parar.*stream/i,
        /suspender.*stream/i,
        /interromper.*stream/i,
      ],
    ],
    [
      StreamPayIntent.CANCEL_STREAM,
      [
        /cancel.*stream/i,
        /delete.*stream/i,
        /terminate.*stream/i,
        /stop.*stream.*permanently/i,
        // Português
        /cancelar.*stream/i,
        /excluir.*stream/i,
        /encerrar.*stream/i,
        /parar.*definitivamente/i,
      ],
    ],
    [
      StreamPayIntent.VIEW_STREAMS,
      [
        /show.*stream/i,
        /list.*stream/i,
        /my.*stream/i,
        /view.*stream/i,
        /stream.*balance/i,
        // Português
        /mostrar.*stream/i,
        /listar.*stream/i,
        /meus.*streams/i,
        /ver.*streams/i,
        /saldo.*stream/i,
      ],
    ],
    [
      StreamPayIntent.VIEW_STREAM_DETAILS,
      [
        /details?.*stream/i,
        /stream.*info/i,
        /tell.*about.*stream/i,
        // Português
        /detalhes?.*stream/i,
        /info.*stream/i,
        /sobre.*stream/i,
      ],
    ],
    [
      StreamPayIntent.ADD_LIQUIDITY,
      [
        /add.*liquid/i,
        /deposit.*liquid/i,
        /provide.*liquid/i,
        /liquidity.*pool/i,
        // Português
        /adicionar.*liquid/i,
        /depositar.*liquid/i,
        /fornecer.*liquid/i,
        /pool\s+de\s+liquidez/i,
      ],
    ],
    [
      StreamPayIntent.REMOVE_LIQUIDITY,
      [
        /remove.*liquid/i,
        /withdraw.*liquid/i,
        /exit.*pool/i,
        // Português
        /remover.*liquid/i,
        /retirar.*liquid/i,
        /sair.*pool/i,
      ],
    ],
    [
      StreamPayIntent.VIEW_POOLS,
      [
        /show.*pool/i,
        /list.*pool/i,
        /view.*pool/i,
        /pool.*info/i,
        // Português
        /mostrar.*pools/i,
        /listar.*pools/i,
        /ver.*pools/i,
        /info.*pools/i,
      ],
    ],
    [
      StreamPayIntent.SWAP_TOKENS,
      [
        /swap\s+(.+?)\s+(?:for|to)\s+(.+)/i,
        /exchange\s+(.+?)\s+(?:for|to)\s+(.+)/i,
        /trade\s+(.+?)\s+(?:for|to)\s+(.+)/i,
        /convert\s+(.+?)\s+(?:to)\s+(.+)/i,
        // Português
        /trocar\s+(.+?)\s+(?:por|para)\s+(.+)/i,
        /permutar\s+(.+?)\s+(?:por|para)\s+(.+)/i,
        /converter\s+(.+?)\s+(?:para)\s+(.+)/i,
      ],
    ],
    [
      StreamPayIntent.CHECK_BALANCE,
      [
        /(?:my\s+)?balance/i,
        /how\s+much\s+(?:do\s+)?(?:i\s+)?(?:have|own)/i,
        /net\s+worth/i,
        /portfolio/i,
        // Português
        /saldo/i,
        /quanto.*eu.*tenho/i,
        /patrimônio/i,
        /carteira/i,
      ],
    ],
    [
      StreamPayIntent.GET_PRICE,
      [
        /(?:what\s+)?(?:is\s+)?(?:the\s+)?price\s+of\s+(.+)/i,
        /(.+)\s+price/i,
        /how\s+much\s+(?:is|costs?)\s+(.+)/i,
        // Português
        /preço.*de\s+(.+)/i,
        /quanto.*custa\s+(.+)/i,
        /cotação.*de\s+(.+)/i,
      ],
    ],
  ]);

  /**
   * Parse user message and extract intent
   */
  parseIntent(message: string): ParsedIntent {
    // Normalize message
    const normalized = message.toLowerCase().trim();

    // Try to match patterns
    let bestMatch: {
      intent: StreamPayIntent;
      confidence: number;
      matches: RegExpMatchArray | null;
    } | null = null;

    for (const [intent, regexps] of this.patterns) {
      for (const regex of regexps) {
        const matches = normalized.match(regex);
        if (matches) {
          const confidence = this.calculateConfidence(intent, normalized, matches);

          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = { intent, confidence, matches };
          }
        }
      }
    }

    if (bestMatch && bestMatch.confidence > 0.5) {
      const parameters = this.extractParameters(bestMatch.intent, bestMatch.matches as RegExpMatchArray, message);

      return {
        intent: bestMatch.intent,
        confidence: bestMatch.confidence,
        parameters,
        originalMessage: message,
        reasoning: `Pattern matched with ${(bestMatch.confidence * 100).toFixed(1)}% confidence`,
      };
    }

    return {
      intent: StreamPayIntent.UNKNOWN,
      confidence: 0,
      parameters: {},
      originalMessage: message,
      reasoning: 'No matching pattern found',
    };
  }

  /**
   * Calculate confidence score for a match
   */
  private calculateConfidence(
    intent: StreamPayIntent,
    message: string,
    matches: RegExpMatchArray
  ): number {
    let confidence = 0.6; // Base confidence for matching a pattern

    // Boost confidence for specific parameters
    const hasAddress = /0x[a-f0-9]{40}/i.test(message);
    const hasAmount = /\d+\.?\d*/.test(message);
    const hasToken = /usdc|dai|usdt|eth|matic|token|coin/i.test(message);

    if (hasAddress) confidence += 0.15;
    if (hasAmount) confidence += 0.1;
    if (hasToken) confidence += 0.1;

    // Reduce confidence if message is ambiguous
    if (message.split(' ').length > 30) {
      confidence -= 0.1;
    }

    return Math.min(confidence, 1);
  }

  /**
   * Extract parameters from matched message
   */
  private extractParameters(
    intent: StreamPayIntent,
    matches: RegExpMatchArray,
    message: string
  ): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract addresses
    const addresses = message.match(/0x[a-f0-9]{40}/gi);
    if (addresses) {
      params.addresses = addresses;
      if (addresses.length > 0) params.recipient = addresses[0];
      if (addresses.length > 1) params.token = addresses[1];
    }

    // Extract amounts
    const amounts = message.match(/\b(\d+\.?\d*)\b/g);
    if (amounts) {
      params.amounts = amounts.map(Number);
      if (amounts.length > 0) params.amount = parseFloat(amounts[0]);
      if (amounts.length > 1) params.rate = parseFloat(amounts[1]);
    }

    // Extract tokens by name
    const tokenMatch = message.match(/(?:usdc|dai|usdt|eth|matic|token)\b/gi);
    if (tokenMatch) {
      params.tokens = tokenMatch.map((t) => t.toUpperCase());
    }

    // Extract duration (English and Portuguese)
    const durationMatch = message.match(
      /(?:for|por|durante\s+)?(\d+)\s+(?:day|week|month|year|hour|second|dia|semana|mês|mes|ano|hora|segundo)s?/i
    );
    if (durationMatch) {
      params.duration = durationMatch[1];
      const unit = durationMatch[0].split(/\s+/).pop()?.toLowerCase() || 'second';
      params.durationUnit = unit;
    }

    // Extract pool information
    const poolMatch = message.match(/pool\s*#?(\d+)/i);
    if (poolMatch) {
      params.poolId = poolMatch[1];
    }

    // Extract stream ID
    const streamMatch = message.match(/stream\s*#?(\d+|0x[a-f0-9]+)/i);
    if (streamMatch) {
      params.streamId = streamMatch[1];
    }

    // Intent-specific parameter extraction
    switch (intent) {
      case StreamPayIntent.SWAP_TOKENS:
        if (matches.length > 1) {
          params.tokenIn = matches[1];
          params.tokenOut = matches[2];
        }
        break;

      case StreamPayIntent.GET_PRICE:
        if (matches.length > 1) {
          params.symbol = matches[1];
        }
        break;

      case StreamPayIntent.CREATE_STREAM:
        if (matches.length > 3) {
          params.amount = matches[1];
          params.token = matches[2];
          params.recipient = matches[3];
        }
        break;
    }

    return params;
  }

  /**
   * Validate parsed intent has required parameters
   */
  validateIntent(parsed: ParsedIntent): boolean {
    if (parsed.intent === StreamPayIntent.UNKNOWN) {
      return false;
    }

    // Define required parameters per intent
    const requirements: Record<StreamPayIntent, string[]> = {
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

    const required = requirements[parsed.intent];
    if (!required) return true; // Unknown intent

    return required.every((param) => param in parsed.parameters);
  }

  /**
   * Get user-friendly message describing the parsed intent
   */
  getIntentDescription(parsed: ParsedIntent): string {
    const descriptions: Record<StreamPayIntent, string> = {
      [StreamPayIntent.CREATE_STREAM]: 'criar um stream de pagamento',
      [StreamPayIntent.CLAIM_STREAM]: 'reivindicar tokens de um stream',
      [StreamPayIntent.PAUSE_STREAM]: 'pausar um stream',
      [StreamPayIntent.CANCEL_STREAM]: 'cancelar um stream',
      [StreamPayIntent.VIEW_STREAMS]: 'ver seus streams',
      [StreamPayIntent.VIEW_STREAM_DETAILS]: 'ver detalhes do stream',
      [StreamPayIntent.ADD_LIQUIDITY]: 'adicionar liquidez ao pool',
      [StreamPayIntent.REMOVE_LIQUIDITY]: 'remover liquidez do pool',
      [StreamPayIntent.VIEW_POOLS]: 'ver pools de liquidez',
      [StreamPayIntent.SWAP_TOKENS]: 'trocar tokens',
      [StreamPayIntent.CHECK_BALANCE]: 'verificar saldo da carteira',
      [StreamPayIntent.GET_PRICE]: 'buscar preço de token',
      [StreamPayIntent.UNKNOWN]: 'requisição desconhecida',
    };

    return descriptions[parsed.intent];
  }
}

/**
 * Create intent parser singleton
 */
export const createIntentParser = (): IntentParser => {
  return new IntentParser();
};
