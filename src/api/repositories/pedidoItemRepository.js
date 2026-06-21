import { pool } from "../database/db.js";

export async function criarItemPedido(
  item
) {

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
        item.pedido_id,
        item.produto_nome,
        item.quantidade,
        item.preco_unitario,
        item.subtotal,
        item.observacoes
      ]
    );

  return result.rows[0];

}

export async function listarItensPedido(
  pedidoId
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM pedido_itens
      WHERE pedido_id = $1
      `,
      [pedidoId]
    );

  return result.rows;

}

export async function removerItemPedido(
  id
) {

  await pool.query(
    `
    DELETE FROM pedido_itens
    WHERE id = $1
    `,
    [id]
  );

}