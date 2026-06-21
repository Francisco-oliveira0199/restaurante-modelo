import { pool } from "../database/db.js";

export async function criarProduto(
  produto
) {

  const result =
    await pool.query(
      `
      INSERT INTO produtos
      (
        nome,
        categoria,
        descricao,
        preco,
        imagem,
        ativo
      )
      VALUES
      ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        produto.nome,
        produto.categoria,
        produto.descricao,
        produto.preco,
        produto.imagem,
        true
      ]
    );

  return result.rows[0];

}

export async function listarProdutos() {

  const result =
    await pool.query(`
      SELECT *
      FROM produtos
      WHERE ativo = TRUE
      ORDER BY id DESC
    `);

  return result.rows;

}

export async function buscarProdutoPorId(
  id
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM produtos
      WHERE id = $1
      `,
      [id]
    );

  return result.rows[0];

}

export async function atualizarProduto(
  id,
  produto
) {

  const result =
    await pool.query(
      `
      UPDATE produtos
      SET
        nome = $1,
        categoria = $2,
        descricao = $3,
        preco = $4,
        imagem = $5,
        ativo = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        produto.nome,
        produto.categoria,
        produto.descricao,
        produto.preco,
        produto.imagem,
        produto.ativo,
        id
      ]
    );

  return result.rows[0];

}

export async function removerProduto(
  id
) {

  const result =
    await pool.query(
      `
      UPDATE produtos
      SET ativo = FALSE
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

  return result.rows[0];

}

export async function listarPorCategoria(
  categoria
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM produtos
      WHERE categoria = $1
      AND ativo = TRUE
      ORDER BY nome ASC
      `,
      [categoria]
    );

  return result.rows;

}