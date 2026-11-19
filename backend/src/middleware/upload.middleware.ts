import type { NextFunction, Request, Response } from "express";
import multer from "multer";

const maxAvatarBytes = 4 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxAvatarBytes, files: 1 },
});

export function receiveAvatar(req: Request, res: Response, next: NextFunction): void {
  upload.single("avatar")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "A imagem deve ter no máximo 4 MB."
          : "Não foi possível receber a imagem.";
      res.status(400).json({ error: message });
      return;
    }
    next(error);
  });
}
