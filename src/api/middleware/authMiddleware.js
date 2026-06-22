import jwt from "jsonwebtoken";

export function authMiddleware(
  req,
  res,
  next
) {

  try {

    const auth = req.headers.authorization;

    if (!auth) {
      console.warn(
        "Autenticação negada: Authorization header ausente",
        { ip: req.ip, path: req.path }
      );
      return res.status(401).json({
        erro: "Token ausente"
      });
    }

    if (!auth.startsWith("Bearer ")) {
      console.warn(
        "Autenticação negada: formato de Authorization inválido",
        { ip: req.ip, path: req.path, auth: auth.substring(0, 20) }
      );
      return res.status(401).json({
        erro: "Formato de Authorization inválido (use: Bearer <token>)"
      });
    }

    const token = auth.substring("Bearer ".length).trim();

    if (!token) {
      console.warn(
        "Autenticação negada: token vazio",
        { ip: req.ip, path: req.path }
      );
      return res.status(401).json({
        erro: "Token ausente"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.id) {
      console.warn(
        "Autenticação negada: token sem ID de usuário",
        { ip: req.ip, path: req.path }
      );
      return res.status(401).json({
        erro: "Token inválido (missing id)"
      });
    }

    req.usuario = {
      id: decoded.id,
      email: decoded.email || null,
      tipo: decoded.tipo || "CLIENTE"
    };

    if (process.env.DEBUG_AUTH === "true") {
      console.log(
        "Autenticação bem-sucedida",
        { usuarioId: req.usuario.id, path: req.path }
      );
    }

    next();

  } catch (error) {

    let mensagem = "Token inválido";
    let statusCode = 401;

    if (error.name === "TokenExpiredError") {
      mensagem = "Token expirado";
      console.warn(
        "Autenticação negada: token expirado",
        { ip: req.ip, path: req.path, expiradoEm: error.expiredAt }
      );
    } else if (error.name === "JsonWebTokenError") {
      mensagem = "Token inválido";
      console.warn(
        "Autenticação negada: token malformado",
        { ip: req.ip, path: req.path, erro: error.message }
      );
    } else if (error.name === "NotBeforeError") {
      mensagem = "Token ainda não é válido";
      console.warn(
        "Autenticação negada: token não ativo",
        { ip: req.ip, path: req.path }
      );
    } else {
      console.error(
        "Erro inesperado em authMiddleware:",
        error,
        { ip: req.ip, path: req.path }
      );
    }

    return res.status(statusCode).json({
      erro: mensagem
    });

  }

}