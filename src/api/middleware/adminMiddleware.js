export function adminMiddleware(
  req,
  res,
  next
) {

  if (!req.usuario) {
    console.warn(
      "Acesso admin negado: req.usuario não encontrado",
      { ip: req.ip, path: req.path }
    );
    return res.status(401).json({
      erro: "Autenticação necessária"
    });
  }

  if (!req.usuario.id) {
    console.warn(
      "Acesso admin negado: usuário sem ID",
      { ip: req.ip, path: req.path }
    );
    return res.status(401).json({
      erro: "Autenticação necessária"
    });
  }

  const userType = String(req.usuario.tipo || "").trim().toUpperCase();

  if (userType !== "ADMIN") {
    console.warn(
      "Acesso admin negado: privilégios insuficientes",
      { usuarioId: req.usuario.id, tipo: userType, ip: req.ip, path: req.path }
    );
    return res.status(403).json({
      erro: "Acesso negado - privilégios de administrador necessários"
    });
  }

  if (process.env.DEBUG_ADMIN_ACCESS === "true") {
    console.log(
      "Acesso admin concedido",
      { usuarioId: req.usuario.id, path: req.path }
    );
  }

  next();

}