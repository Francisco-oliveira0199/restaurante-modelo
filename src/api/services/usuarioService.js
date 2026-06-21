import { pool } from "../database/db.js";

export async function buscarUsuarioPorId(id) {

  const result = await pool.query(
    `
    SELECT
      id,
      nome,
      email,
      tipo,
      criado_em
    FROM usuarios
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];

}

export async function buscarUsuarioPorEmail(email) {

  const result = await pool.query(
    `
    SELECT *
    FROM usuarios
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];

}

export async function listarUsuarios() {

  const result = await pool.query(`
    SELECT
      id,
      nome,
      email,
      tipo,
      criado_em
    FROM usuarios
    ORDER BY id DESC
  `);

  return result.rows;

}

export async function atualizarUsuario(
  id,
  nome
) {

  const result = await pool.query(
    `
    UPDATE usuarios
    SET nome = $1
    WHERE id = $2
    RETURNING *
    `,
    [
      nome,
      id
    ]
  );

  return result.rows[0];

}