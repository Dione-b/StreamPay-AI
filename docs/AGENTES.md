
# StreamPay Agents Documentation (ElizaOS)

## Overview

StreamPay agents, integrated via ElizaOS, automate monitoring, compliance, liquidity, notifications, and Web3 flow execution. They operate autonomously, interacting with the backend, smart contracts, and external providers.

## Agent Structure

- `monitoring`: Checks service status, streams, liquidity, and critical events
- `compliance`: Validates KYC/AML, queries providers, updates user status
- `notifications`: Sends alerts, emails, webhooks, and automatic feedback
- `liquidity`: Monitors pools, swaps, rates, and conversion opportunities
- `execution`: Automates actions in smart contracts, backend, and external integrations

## Automated Flows

- Continuous monitoring of streams and liquidity
- Periodic compliance and KYC status validation
- Automatic notifications for relevant events
- Execution of corrective and preventive actions
- Auditing and logging of all operations

## Operation Examples


### Monitoring

- Agent checks service status every minute
- Issues alert if failure or degradation is detected
- Updates monitoring dashboard on the frontend


### Compliance

- Agent queries KYC/AML providers
- Updates user status and logs rejection reasons
- Notifies user in case of pending or rejected status


### Notifications

- Sends automatic email for critical events
- Triggers webhook for external systems
- Updates user's notification history


### Liquidity

- Monitors Uniswap pools, rates, and opportunities
- Executes automatic swaps according to rules
- Updates liquidity status on the dashboard

## Security and Auditing

- Detailed logs of all agent actions
- Periodic auditing of automated flows
- Protection against improper execution and failures

## How to Configure

1. Set provider credentials and endpoints in `.env`
2. Adjust monitoring and automation parameters as needed
3. See integration scripts in `backend/scripts/` and ElizaOS documentation

## References

- [ElizaOS](https://elizaos.com/)
- [StreamPay Changelog](../CHANGELOG.md)
- [Monitoring API](../backend/docs/MONITORAMENTO_API.md)
- [Compliance API](../backend/docs/ELIZAOS_API.md)

---

For questions, suggestions, or contributions, see the technical documentation or contact the development team.
