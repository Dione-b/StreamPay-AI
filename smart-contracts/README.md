
# StreamPay Smart Contracts

## Overview

StreamPay smart contracts implement the logic for continuous payments (streaming), compliance, liquidity, and ERC20 token integration. Developed in Solidity, they are audited, tested, and ready for deployment on mainnet/testnet.

## Project Structure

- `contracts/` — Main contracts (StreamPayCore, ERC20Mock, etc)
- `migrations/` — Deployment and migration scripts
- `__tests__/` — Automated unit and integration tests
- `docs/` — Technical documentation for contracts
- `coverage/` — Test coverage reports

## Main Features

- **StreamPayCore:** Streaming payment logic, flow control, status, events
- **ERC20Mock:** Test token for payment simulation
- **Compliance:** KYC/AML validation, backend integration
- **Liquidity:** Support for swaps, pools, and Uniswap V3 integration
- **Events:** Event emission for monitoring and automation

## Automated Tests

- Unit tests for critical functions (creation, finalization, stream queries)
- Integration tests with backend and frontend
- Full branch coverage, error scenarios, and edge cases
- Coverage reports available at `coverage/lcov-report/index.html`

## Security and Auditing

- Input and output validation
- Protection against reentrancy, overflow, common attacks
- Code auditing and automated tests

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Compile contracts:
   ```bash
   npx hardhat compile
   ```
3. Run automated tests:
   ```bash
   npx hardhat test
   ```
4. Access the coverage report at `coverage/lcov-report/index.html`

## Deployment and Production

- Deployment scripts ready for mainnet/testnet
- Integration with backend and frontend
- Dockerfile for build automation

## References

- [Solidity](https://soliditylang.org/)
- [Hardhat](https://hardhat.org/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Uniswap V3](https://uniswap.org/)

## Roadmap

See the project roadmap for future steps, audits, and advanced integrations.

---

For questions, suggestions, or contributions, see the technical documentation or contact the development team.
