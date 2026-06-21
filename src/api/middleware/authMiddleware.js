import jwt from "jsonwebtoken";

export function authMiddleware(
  req,
  res,
  next
) {

  const auth =
    req.headers.authorization;

  if (!auth) {

    return res.status(401).json({
      erro: "Token ausente"
    });

  }

  const token =
    auth.split(" ")[1];

  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.usuario = decoded;

    next();

  } catch {

    return res.status(401).json({
      erro: "Token inválido"
    });

  }

}