import {
  type IAgentRuntime,
  type Plugin,
} from '@elizaos/core';
import { z } from 'zod';
import { checkBalanceAction } from './actions/checkBalance';
import { getPriceAction } from './actions/getPrice';
import { createStreamAction } from './actions/createStream';
import { claimStreamAction } from './actions/claimStream';
import { cancelStreamAction } from './actions/cancelStream';
import { swapTokensAction } from './actions/swapTokens';

// Configuration schema for the plugin
const configSchema = z.object({
  BACKEND_URL: z.string().url().default('http://localhost:3000'),
  MORALIS_API_KEY: z.string().optional(),
  CHAINLINK_RPC_URL: z.string().optional(),
});

const plugin: Plugin = {
  name: 'streampay',
  description: 'StreamPay AI Agent Plugin for ElizaOS. Handles payment streams, token prices, and wallet balances.',
  actions: [
    checkBalanceAction,
    getPriceAction,
    createStreamAction,
    claimStreamAction,
    cancelStreamAction,
    swapTokensAction
  ],
  providers: [], 
};

export default plugin;
