import { pool } from "../database/db.js";

export async function criarEndereco(
  endereco
) {

  const result =
    await pool.query(
      `
      INSERT INTO enderecos
      (
        usuario_id,
        rua,
        numero,
        bairro,
        complemento,
        cidade,
        estado,
        cep
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        endereco.usuario_id,
        endereco.rua,
        endereco.numero,
        endereco.bairro,
        endereco.complemento,
        endereco.cidade,
        endereco.estado,
        endereco.cep
      ]
    );

  return result.rows[0];

}

export async function listarEnderecosUsuario(
  usuarioId
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM enderecos
      WHERE usuario_id = $1
      `,
      [usuarioId]
    );

  return result.rows;

}

export async function buscarEndereco(
  id
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM enderecos
      WHERE id = $1
      `,
      [id]
    );

  return result.rows[0];

}