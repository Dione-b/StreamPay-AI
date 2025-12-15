import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { query } from "../db";
import { generateToken, authenticateJWT, AuthRequest } from "../middleware/auth";
import {
    asyncHandler,
    APIError,
} from "../middleware/errorHandler";
import { validateRequest, loginSchema, registerSchema } from "../middleware/validation";

const router = Router();

/**
 * POST /api/auth/register
 * Registra um novo usuário com assinatura
 */
router.post(
    "/register",
    validateRequest(registerSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const { address, email, message, signature } = req.body;

        // Recuperar endereço da assinatura
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);

            if (
                recoveredAddress.toLowerCase() !== address.toLowerCase()
            ) {
                throw new APIError(
                    401,
                    "Invalid signature",
                    "INVALID_SIGNATURE"
                );
            }
        } catch (error) {
            throw new APIError(
                401,
                "Signature verification failed",
                "SIGNATURE_VERIFICATION_FAILED"
            );
        }

        // Verificar se usuário já existe
        const existingUser = await query(
            "SELECT id FROM users WHERE address = $1",
            [address.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            throw new APIError(
                400,
                "User already registered",
                "USER_ALREADY_EXISTS"
            );
        }

        // Criar usuário
        const result = await query(
            "INSERT INTO users (address, email, role, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, address, email, role",
            [address.toLowerCase(), email || null, "user"]
        );

        const user = result.rows[0];

        // Gerar token
        const token = generateToken({
            id: user.id,
            address: user.address,
            email: user.email,
            role: user.role,
        });

        res.status(201).json({
            success: true,
            user: {
                id: user.id,
                address: user.address,
                email: user.email,
                role: user.role,
            },
            token,
        });
    })
);

/**
 * POST /api/auth/login
 * Login de usuário com assinatura
 */
router.post(
    "/login",
    validateRequest(loginSchema),
    asyncHandler(async (req: Request, res: Response) => {
        const { address, message, signature } = req.body;

        // Recuperar endereço da assinatura
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);

            if (
                recoveredAddress.toLowerCase() !== address.toLowerCase()
            ) {
                throw new APIError(
                    401,
                    "Invalid signature",
                    "INVALID_SIGNATURE"
                );
            }
        } catch (error) {
            throw new APIError(
                401,
                "Signature verification failed",
                "SIGNATURE_VERIFICATION_FAILED"
            );
        }

        // Buscar usuário
        const result = await query(
            "SELECT id, address, email, role FROM users WHERE address = $1",
            [address.toLowerCase()]
        );

        if (result.rows.length === 0) {
            throw new APIError(404, "User not found", "USER_NOT_FOUND");
        }

        const user = result.rows[0];

        // Atualizar último acesso
        await query(
            "UPDATE users SET last_login = NOW() WHERE id = $1",
            [user.id]
        );

        // Gerar token
        const token = generateToken({
            id: user.id,
            address: user.address,
            email: user.email,
            role: user.role,
        });

        res.json({
            success: true,
            user: {
                id: user.id,
                address: user.address,
                email: user.email,
                role: user.role,
            },
            token,
        });
    })
);

/**
 * GET /api/auth/me
 * Obter informações do usuário autenticado
 */
router.get(
    "/me",
    authenticateJWT,
    asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new APIError(401, "Not authenticated", "NOT_AUTHENTICATED");
        }

        const result = await query(
            "SELECT id, address, email, role, created_at, last_login FROM users WHERE id = $1",
            [req.user.id]
        );

        if (result.rows.length === 0) {
            throw new APIError(404, "User not found", "USER_NOT_FOUND");
        }

        res.json({
            success: true,
            user: result.rows[0],
        });
    })
);

export default router;
