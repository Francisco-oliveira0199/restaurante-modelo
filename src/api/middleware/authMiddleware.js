import { validarToken } from "../services/authService.js";

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    if (!authHeader) {
      return res.status(401).json({ erro: "Token de autorização não encontrado" });
    }

    const parts = String(authHeader).split(" ");
    if (parts.length !== 2 || String(parts[0]).toLowerCase() !== "bearer") {
      return res.status(401).json({ erro: "Formato de token inválido" });
    }

    const token = parts[1];

    let payload;
    try {
      payload = validarToken(token);
    } catch (err) {
      return res.status(401).json({ erro: "Token inválido ou expirado" });
    }

    req.usuario = {
      id: payload.id,
      email: payload.email || null,
      tipo: String(payload.tipo || "CLIENTE").toUpperCase()
    };

    return next();
  } catch (err) {
    console.error("Erro no authMiddleware:", err && err.stack ? err.stack : err);
    return res.status(500).json({ erro: "Erro ao processar autenticação" });
  }
}

export default authMiddleware;