/**
 * @param {object} req - Request do Express (deve ter req.usuario preenchido)
 * @param {object} res - Response do Express
 * @param {function} next - Função next do Express
 */
export function adminMiddleware(req, res, next) {
  try {
    
    if (!req.usuario) {
      console.warn("Acesso admin negado: req.usuario não encontrado", {
        ip: req.ip,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({
        erro: "Autenticação necessária",
        detalhes: "Usuário não autenticado"
      });
    }

    if (!req.usuario.id) {
      console.warn("Acesso admin negado: usuário sem ID", {
        ip: req.ip,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(401).json({
        erro: "Autenticação necessária",
        detalhes: "ID de usuário inválido"
      });
    }

    const userType = String(req.usuario.tipo || "").trim().toUpperCase();

    if (userType !== "ADMIN") {
      console.warn("Acesso admin negado: privilégios insuficientes", {
        usuarioId: req.usuario.id,
        email: req.usuario.email,
        tipo: userType,
        ip: req.ip,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      return res.status(403).json({
        erro: "Acesso negado",
        detalhes: "Privilégios de administrador necessários",
        tipoUsuario: userType
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não configurado no ambiente");
      return res.status(500).json({
        erro: "Erro de configuração do servidor"
      });
    }

    if (process.env.DEBUG_ADMIN_ACCESS === "true") {
      console.log("Acesso admin concedido", {
        usuarioId: req.usuario.id,
        email: req.usuario.email,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    }

    req.isAdmin = true;

    next();
  } catch (error) {
    
    console.error("Erro inesperado em adminMiddleware:", {
      erro: error.message,
      stack: error.stack,
      usuarioId: req.usuario?.id || "desconhecido",
      ip: req.ip,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      erro: "Erro ao processar autorização"
    });
  }
}

/**
 * Middleware combinado: verifica autenticação E autorização admin
 * Uso: app.post('/admin/rota', authAndAdminMiddleware, controller)
 *
 * @param {object} req - Request do Express
 * @param {object} res - Response do Express
 * @param {function} next - Função next do Express
 */
export function authAndAdminMiddleware(req, res, next) {
  
  if (!req.usuario) {
    return res.status(401).json({
      erro: "Autenticação necessária"
    });
  }

  adminMiddleware(req, res, next);
}

export default adminMiddleware;