import { pool } from "../database/db.js";

export async function criarProduto(
  req,
  res
) {

  try {

    const {
      nome,
      categoria,
      descricao,
      preco,
      imagem
    } = req.body;

    const result =
      await pool.query(
        `
        INSERT INTO produtos
        (
          nome,
          categoria,
          descricao,
          preco,
          imagem
        )
        VALUES
        ($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [
          nome,
          categoria,
          descricao,
          preco,
          imagem
        ]
      );

    res.status(201).json(
      result.rows[0]
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao criar produto"
    });

  }

}

export async function listarProdutos(
  req,
  res
) {

  try {

    const result =
      await pool.query(`
        SELECT *
        FROM produtos
        WHERE ativo = TRUE
        ORDER BY id DESC
      `);

    res.json(
      result.rows
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao listar produtos"
    });

  }

}

export async function buscarProduto(
  req,
  res
) {

  try {

    const { id } =
      req.params;

    const result =
      await pool.query(
        `
        SELECT *
        FROM produtos
        WHERE id = $1
        `,
        [id]
      );

    if (
      !result.rows.length
    ) {

      return res.status(404).json({
        erro:
          "Produto não encontrado"
      });

    }

    res.json(
      result.rows[0]
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao buscar produto"
    });

  }

}

export async function atualizarProduto(
  req,
  res
) {

  try {

    const { id } =
      req.params;

    const {
      nome,
      categoria,
      descricao,
      preco,
      imagem,
      ativo
    } = req.body;

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
          nome,
          categoria,
          descricao,
          preco,
          imagem,
          ativo,
          id
        ]
      );

    res.json(
      result.rows[0]
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao atualizar produto"
    });

  }

}

export async function removerProduto(
  req,
  res
) {

  try {

    const { id } =
      req.params;

    await pool.query(
      `
      UPDATE produtos
      SET ativo = FALSE
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      sucesso: true
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao remover produto"
    });

  }

}