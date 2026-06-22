import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Gera hash de senha com bcrypt (salt rounds: 10)
 * @param {string} senha - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
export async function gerarHash(
  senha
) {

  try {
    return await bcrypt.hash(
      senha,
      10
    );
  } catch (error) {
    console.error("Erro ao gerar hash de senha:", error);
    throw new Error("Erro ao processar senha");
  }

}

/**
 * Verifica se uma senha em texto plano corresponde a um hash
 * @param {string} senha - Senha em texto plano
 * @param {string} hash - Hash armazenado
 * @returns {Promise<boolean>} true se senha válida, false caso contrário
 */
export async function validarSenha(
  senha,
  hash
) {

  try {
    return await bcrypt.compare(
      senha,
      hash
    );
  } catch (error) {
    console.error("Erro ao validar senha:", error);
    throw new Error("Erro ao processar senha");
  }

}

/**
 * Gera token JWT com dados do usuário
 * @param {object} usuario - Objeto usuário com id, email, tipo
 * @returns {string} Token JWT assinado
 */
export function gerarToken(
  usuario
) {

  if (!usuario || !usuario.id) {
    throw new Error("Usuário inválido para geração de token");
  }

  try {
    return jwt.sign(
      {
        id: usuario.id,
        email: usuario.email || null,
        tipo: String(usuario.tipo || "CLIENTE").toUpperCase()
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );
  } catch (error) {
    console.error("Erro ao gerar token:", error);
    throw new Error("Erro ao gerar token");
  }

}

/**
 * Valida e decodifica um token JWT
 * @param {string} token - Token JWT
 * @returns {object} Dados decodificados do token
 * @throws {Error} Se token inválido ou expirado
 */
export function validarToken(
  token
) {

  try {
    return jwt.verify(
      token,
      process.env.JWT_SECRET
    );
  } catch (error) {
    console.error("Erro ao validar token:", error.message);
    throw error;
  }

}