import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import { prisma } from "./db.js";
import authRoutes from "./auth-routes.js";
import billRoutes from "./bills.js";
import dashboardRoutes from "./dashboard.js";
import profileRoutes from "./profile.js";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Tente novamente em alguns minutos." },
});

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(503).json({ status: "error", error: "Banco de dados indisponível." });
  }
});
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/profile/password", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada." }));
app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P1000"
  ) {
    console.error("PostgreSQL authentication failed. Verify DATABASE_URL in backend/.env.");
    res.status(503).json({
      error: "Falha de autenticação no PostgreSQL. Confira DATABASE_URL em backend/.env.",
    });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Erro interno do servidor." });
});

export default app;

if (process.env.VERCEL !== "1") {
  const server = app.listen(config.PORT, () => {
    console.log(`Monevo API listening on http://localhost:${config.PORT}`);
  });

  async function shutdown(): Promise<void> {
    server.close();
    await prisma.$disconnect();
  }

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}
