import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function gerarHash(
  senha
) {
  return await bcrypt.hash(
    senha,
    10
  );
}

export async function verificarSenha(
  senha,
  hash
) {
  return await bcrypt.compare(
    senha,
    hash
  );
}

export function gerarToken(
  usuario
) {

  return jwt.sign(
    {
      id: usuario.id,
      tipo: usuario.tipo
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );

}