import express, { Router, Request, Response } from 'express';
import { verifyMessage } from 'ethers';
import jwt from 'jsonwebtoken';

const router: Router = express.Router();

/**
 * POST /api/auth/verify
 * Verifica assinatura Web3 e gera JWT
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { address, message, signature } = req.body;

    // Validar entrada
    if (!address || !message || !signature) {
      return res.status(400).json({
        error: 'Endereço, mensagem e assinatura são obrigatórios',
      });
    }

    // Recuperar endereço da assinatura
    const recoveredAddress = verifyMessage(message, signature);

    // Validar que o endereço corresponde
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        error: 'Assinatura inválida',
      });
    }

    // Gerar JWT
    const token = jwt.sign(
      {
        id: address,
        address,
        email: `${address}@streampay.local`,
        role: 'user',
      },
      process.env.JWT_SECRET || 'dev-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      address,
      message: 'Autenticação bem-sucedida',
    });
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    res.status(500).json({
      error: 'Erro ao verificar assinatura',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', (req: any, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token não fornecido',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-secret-key'
    ) as any;

    res.json({
      id: decoded.id,
      address: decoded.address,
      email: decoded.email,
      role: decoded.role,
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(401).json({
      error: 'Token inválido ou expirado',
    });
  }
});

export default router;
