import { pool } from "../database/db.js";

export async function criarCupom(dados) {

  const result = await pool.query(
    `
    INSERT INTO cupons
    (
      codigo,
      desconto,
      tipo,
      valor_minimo,
      validade
    )
    VALUES
    ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      dados.codigo,
      dados.desconto,
      dados.tipo,
      dados.valor_minimo,
      dados.validade
    ]
  );

  return result.rows[0];

}

export async function listarCupons() {

  const result = await pool.query(`
    SELECT *
    FROM cupons
    ORDER BY id DESC
  `);

  return result.rows;

}

export async function buscarCupomPorCodigo(
  codigo
) {

  const result = await pool.query(
    `
    SELECT *
    FROM cupons
    WHERE codigo = $1
    LIMIT 1
    `,
    [codigo]
  );

  return result.rows[0];

}

export async function buscarCupomPorId(
  id
) {

  const result = await pool.query(
    `
    SELECT *
    FROM cupons
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];

}

export async function atualizarCupom(
  id,
  dados
) {

  const result = await pool.query(
    `
    UPDATE cupons
    SET
      codigo = $1,
      desconto = $2,
      tipo = $3,
      valor_minimo = $4,
      validade = $5,
      ativo = $6
    WHERE id = $7
    RETURNING *
    `,
    [
      dados.codigo,
      dados.desconto,
      dados.tipo,
      dados.valor_minimo,
      dados.validade,
      dados.ativo,
      id
    ]
  );

  return result.rows[0];

}

export async function desativarCupom(
  id
) {

  await pool.query(
    `
    UPDATE cupons
    SET ativo = FALSE
    WHERE id = $1
    `,
    [id]
  );

}