import { pool } from "../database/db.js";

export async function criarItem(
  req,
  res
) {

  try {

    const {
      pedido_id,
      produto_nome,
      quantidade,
      preco_unitario,
      subtotal,
      observacoes
    } = req.body;

    const result =
      await pool.query(
        `
        INSERT INTO pedido_itens
        (
          pedido_id,
          produto_nome,
          quantidade,
          preco_unitario,
          subtotal,
          observacoes
        )
        VALUES
        ($1,$2,$3,$4,$5,$6)
        RETURNING *
        `,
        [
          pedido_id,
          produto_nome,
          quantidade,
          preco_unitario,
          subtotal,
          observacoes
        ]
      );

    res.status(201).json(
      result.rows[0]
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao criar item"
    });

  }

}

export async function listarItensPedido(
  req,
  res
) {

  try {

    const { pedidoId } =
      req.params;

    const result =
      await pool.query(
        `
        SELECT *
        FROM pedido_itens
        WHERE pedido_id = $1
        `,
        [pedidoId]
      );

    res.json(
      result.rows
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      erro:
        "Erro ao listar itens"
    });

  }

}

export async function removerItem(
  req,
  res
) {

  try {

    const { id } =
      req.params;

    await pool.query(
      `
      DELETE FROM pedido_itens
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
        "Erro ao remover item"
    });

  }

}