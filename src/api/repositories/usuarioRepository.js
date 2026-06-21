import { pool } from "../database/db.js";

export async function criarUsuario(
  usuario
) {

  const result =
    await pool.query(
      `
      INSERT INTO usuarios
      (
        nome,
        email,
        senha,
        tipo
      )
      VALUES
      ($1,$2,$3,$4)
      RETURNING *
      `,
      [
        usuario.nome,
        usuario.email,
        usuario.senha,
        usuario.tipo || "CLIENTE"
      ]
    );

  return result.rows[0];

}

export async function buscarUsuarioPorEmail(
  email
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM usuarios
      WHERE email = $1
      `,
      [email]
    );

  return result.rows[0];

}

export async function buscarUsuarioPorId(
  id
) {

  const result =
    await pool.query(
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

export async function listarUsuarios() {

  const result =
    await pool.query(`
      SELECT
      id,
      nome,
      email,
      tipo
      FROM usuarios
      ORDER BY id DESC
    `);

  return result.rows;

}