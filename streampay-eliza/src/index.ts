import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import starterPlugin from './plugin';
import { character } from './character';
export { createStreamPayAgent } from './agents/orchestrator';
import StreamPayAgentFlowTestSuite from './__tests__/e2e/agent-flow.e2e';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [starterPlugin],
};

const project: Project = {
  agents: [projectAgent],

};

export { character } from './character';

export default project;
