import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Rota não encontrada." });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P1000") {
    console.error("PostgreSQL authentication failed. Verify DATABASE_URL in backend/.env.");
    res.status(503).json({
      error: "Falha de autenticação no PostgreSQL. Confira DATABASE_URL em backend/.env.",
    });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "Erro interno do servidor." });
}
