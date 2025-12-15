import { Router, Response } from "express";
import { query } from "../db";
import { authenticateJWT, AuthRequest } from "../middleware/auth";
import { asyncHandler, APIError } from "../middleware/errorHandler";
import { validateRequest, createStreamSchema, claimStreamSchema } from "../middleware/validation";

const router = Router();

/**
 * GET /api/streams
 * Listar streams do usuário autenticado
 */
router.get(
    "/",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { skip = 0, limit = 20 } = req.query;
        const offset = parseInt(String(skip)) || 0;
        const pageLimit = Math.min(parseInt(String(limit)) || 20, 100); // Max 100

        // Buscar streams como sender e recipient
        const result = await query(
            `
            SELECT id, sender, recipient, token, deposit, rate_per_second, 
                   start_time, stop_time, remaining_balance, active, created_at
            FROM streams
            WHERE sender = $1 OR recipient = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
            `,
            [req.user.address, pageLimit, offset]
        );

        const countResult = await query(
            "SELECT COUNT(*) FROM streams WHERE sender = $1 OR recipient = $1",
            [req.user.address]
        );

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].count),
                skip: offset,
                limit: pageLimit,
            },
        });
    })
);

/**
 * GET /api/streams/:id
 * Obter detalhes de um stream específico
 */
router.get(
    "/:id",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const streamId = parseInt(id);

        if (isNaN(streamId)) {
            throw new APIError(400, "Invalid stream ID", "INVALID_STREAM_ID");
        }

        const result = await query(
            `
            SELECT id, sender, recipient, token, deposit, rate_per_second,
                   start_time, stop_time, remaining_balance, active, created_at
            FROM streams
            WHERE id = $1 AND (sender = $2 OR recipient = $2)
            `,
            [streamId, req.user.address]
        );

        if (result.rows.length === 0) {
            throw new APIError(404, "Stream not found", "STREAM_NOT_FOUND");
        }

        res.json({
            success: true,
            data: result.rows[0],
        });
    })
);

/**
 * POST /api/streams
 * Criar novo stream
 */
router.post(
    "/",
    authenticateJWT,
    validateRequest(createStreamSchema),
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { recipient, token, amount, ratePerSecond, duration } = req.body;

        // Validações
        if (recipient.toLowerCase() === req.user.address.toLowerCase()) {
            throw new APIError(400, "Cannot stream to self", "STREAM_TO_SELF");
        }

        if (amount < ratePerSecond * BigInt(duration)) {
            throw new APIError(
                400,
                "Insufficient deposit for duration",
                "INSUFFICIENT_DEPOSIT"
            );
        }

        // Registrar stream no banco (pendente execução on-chain)
        const result = await query(
            `
            INSERT INTO streams (sender, recipient, token, deposit, rate_per_second,
                                 duration, status, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
            RETURNING id, sender, recipient, token, deposit, rate_per_second,
                      duration, status, created_at
            `,
            [
                req.user.address,
                recipient.toLowerCase(),
                token.toLowerCase(),
                amount.toString(),
                ratePerSecond.toString(),
                duration,
            ]
        );

        const stream = result.rows[0];

        res.status(201).json({
            success: true,
            data: stream,
            message: "Stream created. Waiting for on-chain confirmation...",
        });
    })
);

/**
 * POST /api/streams/:id/claim
 * Reivindicar tokens disponíveis
 */
router.post(
    "/:id/claim",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const streamId = parseInt(id);

        if (isNaN(streamId)) {
            throw new APIError(400, "Invalid stream ID", "INVALID_STREAM_ID");
        }

        // Verificar que o usuário é o recipient
        const streamResult = await query(
            "SELECT recipient, active FROM streams WHERE id = $1",
            [streamId]
        );

        if (streamResult.rows.length === 0) {
            throw new APIError(404, "Stream not found", "STREAM_NOT_FOUND");
        }

        const stream = streamResult.rows[0];

        if (stream.recipient.toLowerCase() !== req.user.address.toLowerCase()) {
            throw new APIError(
                403,
                "Only recipient can claim",
                "UNAUTHORIZED_CLAIM"
            );
        }

        if (!stream.active) {
            throw new APIError(
                400,
                "Stream is not active",
                "STREAM_NOT_ACTIVE"
            );
        }

        // Registrar claim pendente
        const claimResult = await query(
            `
            INSERT INTO stream_claims (stream_id, recipient, status, created_at)
            VALUES ($1, $2, 'pending', NOW())
            RETURNING id, stream_id, recipient, status, created_at
            `,
            [streamId, req.user.address]
        );

        res.status(201).json({
            success: true,
            data: claimResult.rows[0],
            message: "Claim submitted. Waiting for on-chain confirmation...",
        });
    })
);

/**
 * PATCH /api/streams/:id/pause
 * Pausar stream
 */
router.patch(
    "/:id/pause",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const streamId = parseInt(id);

        if (isNaN(streamId)) {
            throw new APIError(400, "Invalid stream ID", "INVALID_STREAM_ID");
        }

        // Verificar que o usuário é o sender
        const streamResult = await query(
            "SELECT sender FROM streams WHERE id = $1",
            [streamId]
        );

        if (streamResult.rows.length === 0) {
            throw new APIError(404, "Stream not found", "STREAM_NOT_FOUND");
        }

        const stream = streamResult.rows[0];

        if (stream.sender.toLowerCase() !== req.user.address.toLowerCase()) {
            throw new APIError(
                403,
                "Only sender can pause",
                "UNAUTHORIZED_PAUSE"
            );
        }

        // Atualizar status
        const result = await query(
            "UPDATE streams SET active = false WHERE id = $1 RETURNING *",
            [streamId]
        );

        res.json({
            success: true,
            data: result.rows[0],
            message: "Stream paused. Waiting for on-chain confirmation...",
        });
    })
);

/**
 * DELETE /api/streams/:id
 * Cancelar stream
 */
router.delete(
    "/:id",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const { id } = req.params;
        const streamId = parseInt(id);

        if (isNaN(streamId)) {
            throw new APIError(400, "Invalid stream ID", "INVALID_STREAM_ID");
        }

        // Verificar que o usuário é o sender
        const streamResult = await query(
            "SELECT sender FROM streams WHERE id = $1",
            [streamId]
        );

        if (streamResult.rows.length === 0) {
            throw new APIError(404, "Stream not found", "STREAM_NOT_FOUND");
        }

        const stream = streamResult.rows[0];

        if (stream.sender.toLowerCase() !== req.user.address.toLowerCase()) {
            throw new APIError(
                403,
                "Only sender can cancel",
                "UNAUTHORIZED_CANCEL"
            );
        }

        // Marcar como cancelado
        const result = await query(
            "UPDATE streams SET active = false, status = 'cancelled' WHERE id = $1 RETURNING *",
            [streamId]
        );

        res.json({
            success: true,
            data: result.rows[0],
            message: "Stream cancelled. Waiting for on-chain confirmation...",
        });
    })
);

export default router;
