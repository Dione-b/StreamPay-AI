// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title StreamPayCore
 * @notice Contrato de pagamentos streaming ERC20
 * @dev Otimizado para eficiência de gas e integração ElizaOS
 */
contract StreamPayCore is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Stream {
        address sender;
        address recipient;
        address token;
        uint256 deposit;
        uint256 ratePerSecond;
        uint256 startTime;
        uint256 stopTime;
        uint256 remainingBalance;
        bool active;
    }

    event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, address token, uint256 ratePerSecond, uint256 duration);
    event StreamClaimed(uint256 indexed streamId, address indexed recipient, uint256 amount);

        uint256 public nextStreamId;
        mapping(uint256 => Stream) public streams;

        /**
         * @notice Cria um novo stream de pagamento
         */
        function createStream(
            address recipient,
            address token,
            uint256 deposit,
            uint256 ratePerSecond,
            uint256 duration
        ) external nonReentrant returns (uint256) {
            require(recipient != address(0), "Invalid recipient");
            require(token != address(0), "Invalid token");
            require(deposit > 0, "Deposit must be > 0");
            require(ratePerSecond > 0, "Rate must be > 0");
            require(duration > 0, "Duration must be > 0");

            uint256 stopTime = block.timestamp + duration;
            require(deposit == ratePerSecond * duration, "Deposit incompatible with rate/duration");

            // Transfere tokens do sender para o contrato
            IERC20(token).safeTransferFrom(msg.sender, address(this), deposit);

            streams[nextStreamId] = Stream({
                sender: msg.sender,
                recipient: recipient,
                token: token,
                deposit: deposit,
                ratePerSecond: ratePerSecond,
                startTime: block.timestamp,
                stopTime: stopTime,
                remainingBalance: deposit,
                active: true
            });

            emit StreamCreated(nextStreamId, msg.sender, recipient, token, ratePerSecond, duration);
            nextStreamId++;
            return nextStreamId - 1;
        }

        /**
         * @notice Permite ao destinatário reivindicar tokens acumulados
         */
        function claim(uint256 streamId) external nonReentrant {
            Stream storage stream = streams[streamId];
            require(stream.active, "Inactive stream");
            require(msg.sender == stream.recipient, "Only recipient can claim");

            uint256 elapsed = block.timestamp > stream.stopTime
                ? stream.stopTime - stream.startTime
                : block.timestamp - stream.startTime;
            uint256 totalClaimable = stream.ratePerSecond * elapsed;
            uint256 alreadyClaimed = stream.deposit - stream.remainingBalance;
            uint256 claimable = totalClaimable > alreadyClaimed
                ? totalClaimable - alreadyClaimed
                : 0;

            require(claimable > 0, "Nothing to claim");
            require(claimable <= stream.remainingBalance, "Insufficient balance");

            stream.remainingBalance -= claimable;
            IERC20(stream.token).safeTransfer(stream.recipient, claimable);
            emit StreamClaimed(streamId, stream.recipient, claimable);

            // Finaliza stream se todo saldo foi reivindicado
            if (stream.remainingBalance == 0 || block.timestamp >= stream.stopTime) {
                stream.active = false;
            }
        }

        /**
         * @notice Consulta saldo disponível para claim
         */
        function availableToClaim(uint256 streamId) external view returns (uint256) {
            Stream storage stream = streams[streamId];
            if (!stream.active) return 0;
            uint256 elapsed = block.timestamp > stream.stopTime
                ? stream.stopTime - stream.startTime
                : block.timestamp - stream.startTime;
            uint256 totalClaimable = stream.ratePerSecond * elapsed;
            uint256 alreadyClaimed = stream.deposit - stream.remainingBalance;
            uint256 claimable = totalClaimable > alreadyClaimed
                ? totalClaimable - alreadyClaimed
                : 0;
            return claimable <= stream.remainingBalance ? claimable : stream.remainingBalance;
        }

        /**
         * @notice Cancela stream e devolve saldo remanescente ao sender
         */
        function cancelStream(uint256 streamId) external nonReentrant {
            Stream storage stream = streams[streamId];
            require(stream.active, "Inactive stream");
            require(msg.sender == stream.sender, "Only sender can cancel");

            stream.active = false;
            if (stream.remainingBalance > 0) {
                IERC20(stream.token).safeTransfer(stream.sender, stream.remainingBalance);
                stream.remainingBalance = 0;
            }
        }
}
