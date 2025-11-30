
# StreamPay Technical Documentation

![StreamPay Dashboard](../assets/streampay_dashboard.png)

## 1. Project Overview
StreamPay is a streaming payment system for freelancers, using ERC20, Uniswap V3, Moralis, Chainlink, and a modular architecture ready for compliance (KYC/LGPD).

### Project Structure
- `frontend/`: Next.js 14 + TypeScript, Web3 integration, dashboard, AI interface.
- `backend/`: Node.js + TypeScript, RESTful API, orchestration, Moralis/Chainlink/KYC integrations.
- `smart-contracts/`: Solidity 0.8.20, StreamPayCore, PoolManager, SwapRouter contracts.
- `infra/`: Infrastructure (docker, cloud, database, Redis, CI/CD).
- `docs/`: Technical documentation, diagrams, requirements, compliance.
- `scripts/`: Automation, deployment, and test scripts.

## Initial Setup
1. Install dependencies in each module (`frontend`, `backend`, `smart-contracts`).
2. Configure environment variables using the `.env.example` files.
3. Follow the sprint roadmap in `docs/roadmap.md`.

## Technical Acceptance Criteria
- Functional MVP on testnet.
- Operational Moralis, Chainlink, Uniswap V3 integrations.
- Automated tests (backend and smart contracts).
- Minimum compliance (KYC/LGPD).
- Updated documentation.

## Roadmap
See `docs/roadmap.md` for detailed development steps.

## 2. Architecture
- **Frontend:** Next.js 14 + TypeScript, React 18, wagmi, viem, glassmorphism UI, wallet integration, English interface, responsive design.
- **Backend:** Node.js + TypeScript, RESTful API, JWT authentication, event orchestration, compliance, notifications, monitoring, JSON persistence fallback.
- **Smart Contracts:** Solidity 0.8.20, StreamPayCore (streaming logic), ERC20Mock (test token), Uniswap V3 integration, event emission, security patterns.
- **Infrastructure:** Docker, docker-compose, CI/CD, cloud-ready, Redis, PostgreSQL.

## 3. Main Features
- **Streaming Payments:** Real-time payment flows, contract event querying, mainnet integration.
- **Wallet Integration:** Connect/disconnect, real wallet data, contract interaction via wagmi/viem.
- **Compliance:** KYC/AML validation, provider integration, status feedback.
- **Monitoring & Automation:** Service status, scheduled jobs, event monitoring, notifications (email, webhooks).
- **User Management:** Registration/login APIs, secure authentication, real persistence.
- **UI/UX:** Glassmorphism, neon effects, logo, responsive layout, accessibility, English language.

## 4. API Endpoints
- `/api/auth/register` — User registration (JSON persistence fallback)
- `/api/auth/login` — User login
- `/api/streams` — List streams from mainnet contract (no mock data)
- `/api/compliance` — KYC/AML status and validation
- `/api/monitoring` — Service status, metrics, alerts

## 5. Smart Contracts
- **StreamPayCore.sol:**
  - Streaming payment logic
  - Event emission for monitoring
  - Compliance hooks
  - Security: reentrancy guard, input validation
- **ERC20Mock.sol:**
  - Test token for development
- **Integration:**
  - Uniswap V3 for liquidity/swaps
  - Chainlink for price feeds

## 6. Testing & Coverage
- **Frontend:** Jest, Babel, ESModules, jest-axe for accessibility, coverage reports
- **Backend:** Jest, integration/unit tests, coverage reports
- **Smart Contracts:** Hardhat, unit/integration tests, coverage reports

## 7. Deployment & Environment
- **Docker:** Ready for build/deploy (frontend, backend, contracts)
- **CI/CD:** Automated pipelines for test, build, deploy
- **Environment Variables:**
  - Web3 providers (Infura, Moralis, Etherscan)
  - SMTP (notifications)
  - Database (Postgres)
  - JWT keys
  - Compliance providers

## 8. Compliance & Security
- KYC/AML validation
- JWT authentication
- Input/output validation
- Protection against common attacks (reentrancy, overflow)
- Operation logs and auditing

## 9. References
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [Solidity](https://soliditylang.org/)
- [Hardhat](https://hardhat.org/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Uniswap V3](https://uniswap.org/)
- [Moralis](https://moralis.io/)
- [Chainlink](https://chain.link/)

## 10. Roadmap & Contribution
See `docs/roadmap.md` for development steps, future features, audits, and advanced integrations. For questions or contributions, contact the development team or open an issue.

---

This documentation is up-to-date as of November 29, 2025. For further details, consult the module READMEs and source code.