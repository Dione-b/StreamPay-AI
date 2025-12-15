import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { z } from "zod";
import { pool } from "./db";
import { authenticateJWT, requireRole } from "./middleware/auth";
import { errorHandler, asyncHandler } from "./middleware/errorHandler";
import { validateRequest } from "./middleware/validation";
import streamsRouter from "./routes/streams";
import poolsRouter from "./routes/pools";
import authRouter from "./routes/auth";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const ENV = process.env.NODE_ENV || "development";

// ===== MIDDLEWARE =====

// CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ===== HEALTH CHECK =====

app.get("/health", asyncHandler(async (req: Request, res: Response) => {
    try {
        const dbTest = await pool.query("SELECT NOW()");
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            environment: ENV,
            database: "connected",
            database_time: dbTest.rows[0].now,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Database connection failed",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}));

// ===== ROUTES =====

// Public routes
app.use("/api/auth", authRouter);

// Protected routes
app.use("/api/streams", authenticateJWT, streamsRouter);
app.use("/api/pools", authenticateJWT, poolsRouter);

// ===== 404 HANDLER =====

app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: "Not Found",
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
});

// ===== ERROR HANDLER =====

app.use(errorHandler);

// ===== SERVER STARTUP =====

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║      StreamPay AI Backend Started      ║
╠════════════════════════════════════════╣
║ Environment: ${ENV.padEnd(25)} ║
║ Port: ${PORT.toString().padEnd(31)} ║
║ URL: http://localhost:${PORT} ${"".padEnd(14)} ║
║ Database: PostgreSQL (" (".padEnd(19)} ║
╚════════════════════════════════════════╝
    `);
});

// ===== GRACEFUL SHUTDOWN =====

process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully...");
    server.close(async () => {
        await pool.end();
        console.log("Server closed");
        process.exit(0);
    });
});

process.on("SIGINT", async () => {
    console.log("SIGINT received, shutting down gracefully...");
    server.close(async () => {
        await pool.end();
        console.log("Server closed");
        process.exit(0);
    });
});

export default app;
