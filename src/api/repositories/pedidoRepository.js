import { pool } from "../database/db.js";

export async function criarPedidoRepository(
  pedido
) {

  const result =
    await pool.query(
      `
      INSERT INTO pedidos
      (
        usuario_id,
        endereco_id,
        pagamento,
        total,
        status
      )
      VALUES
      ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [
        pedido.usuario_id,
        pedido.endereco_id,
        pedido.pagamento,
        pedido.total,
        "PENDENTE"
      ]
    );

  return result.rows[0];

}

export async function buscarPedidoPorId(
  id
) {

  const result =
    await pool.query(
      `
      SELECT *
      FROM pedidos
      WHERE id = $1
      `,
      [id]
    );

  return result.rows[0];

}

export async function listarPedidos() {

  const result =
    await pool.query(`
      SELECT *
      FROM pedidos
      ORDER BY id DESC
    `);

  return result.rows;

}

export async function atualizarStatusPedido(
  id,
  status
) {

  const result =
    await pool.query(
      `
      UPDATE pedidos
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

  return result.rows[0];

}